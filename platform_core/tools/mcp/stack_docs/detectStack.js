// Stack Detection — extracts an application/automation project's technology stack and its pinned
// dependency versions from the project's own manifests and lockfiles.
//
// Purpose (see platform_core/tools/mcp/README.md §2.2): Stage 5 must look up version-accurate
// documentation for the dependencies the generated automation actually imports. That requires
// knowing which libraries are in play and — critically — which *resolved* version each one is at.
// A manifest range ("^1.61.1") is a constraint; a lockfile's resolved version is the fact. This
// module always prefers the lockfile, and flags anything it could only read from a range as
// unpinned so the caller can say so out loud rather than querying docs for the wrong version.
//
// Zero project-specific data lives here: every path is resolved from the `root` argument at call
// time, exactly as browser_driver/driver.js resolves its own paths.

const fs = require('fs');
const path = require('path');

// Directories never worth walking — vendored trees and build output would swamp the result with
// transitive dependencies the generated code never imports (README.md §2.4).
const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'target', 'build', 'dist', 'out', 'bin', 'obj',
  '.venv', 'venv', '__pycache__', '.gradle', '.idea', '.vscode', 'vendor',
  'allure-results', 'allure-report', 'test-results', 'playwright-report',
]);

const MAX_DEPTH = 4;

/**
 * Manifest/lockfile recognizers. `kind` is 'manifest' (declares ranges) or 'lock' (pins versions);
 * `ecosystem` groups them so a lockfile can override its sibling manifest's ranges.
 */
const MANIFESTS = [
  { file: 'package.json', ecosystem: 'node', kind: 'manifest', parse: parsePackageJson },
  { file: 'package-lock.json', ecosystem: 'node', kind: 'lock', parse: parsePackageLock },
  { file: 'yarn.lock', ecosystem: 'node', kind: 'lock', parse: parseYarnLock },
  { file: 'pnpm-lock.yaml', ecosystem: 'node', kind: 'lock', parse: parsePnpmLock },
  { file: 'pom.xml', ecosystem: 'maven', kind: 'manifest', parse: parsePomXml },
  { file: 'build.gradle', ecosystem: 'gradle', kind: 'manifest', parse: parseGradle },
  { file: 'build.gradle.kts', ecosystem: 'gradle', kind: 'manifest', parse: parseGradle },
  { file: 'requirements.txt', ecosystem: 'python', kind: 'manifest', parse: parseRequirementsTxt },
  { file: 'pyproject.toml', ecosystem: 'python', kind: 'manifest', parse: parsePyprojectToml },
  { file: 'poetry.lock', ecosystem: 'python', kind: 'lock', parse: parsePoetryLock },
  { file: 'Pipfile.lock', ecosystem: 'python', kind: 'lock', parse: parsePipfileLock },
  { file: 'Gemfile.lock', ecosystem: 'ruby', kind: 'lock', parse: parseGemfileLock },
  { file: 'go.mod', ecosystem: 'go', kind: 'manifest', parse: parseGoMod },
  { file: 'composer.lock', ecosystem: 'php', kind: 'lock', parse: parseComposerLock },
];

const CSPROJ_RE = /\.csproj$/i;

// Framework config files — presence alone identifies the test framework, independent of manifests
// (a SHAFT project's properties folder, a playwright.config.ts, a testng.xml).
const CONFIG_SIGNALS = [
  { match: /^playwright\.config\.[cm]?[jt]s$/i, framework: 'Playwright' },
  { match: /^cypress\.config\.[cm]?[jt]s$/i, framework: 'Cypress' },
  { match: /^testng\.xml$/i, framework: 'TestNG' },
  { match: /^pytest\.ini$/i, framework: 'pytest' },
  { match: /^tox\.ini$/i, framework: 'pytest' },
  { match: /^wdio\.conf\.[cm]?[jt]s$/i, framework: 'WebdriverIO' },
  { match: /^codeception\.ya?ml$/i, framework: 'Codeception' },
  { match: /^karate-config\.js$/i, framework: 'Karate' },
];

// Libraries whose API surface generated automation actually touches (README.md §2.4). Matching is
// substring-based against the dependency name so scoped/suffixed variants still resolve
// (@playwright/test, playwright-core, pytest-bdd, allure-testng).
const MATERIAL_PATTERNS = [
  'playwright', 'selenium', 'shaft', 'cypress', 'puppeteer', 'webdriverio', 'appium',
  'testng', 'junit', 'pytest', 'unittest', 'mocha', 'jasmine', 'jest', 'vitest', 'cucumber',
  'karate', 'codeception', 'nunit', 'xunit', 'specflow', 'robotframework',
  'rest-assured', 'restassured', 'supertest', 'requests', 'httpx', 'axios', 'okhttp', 'superagent',
  'allure', 'chai', 'expect', 'assertj', 'hamcrest', 'truth', 'reportportal', 'extentreports',
  'faker', 'chance', 'testcontainers', 'axe-core', 'axe-playwright', 'pixelmatch',
  'poi', 'openpyxl', 'exceljs', 'csv-parse', 'papaparse',
  'dayjs', 'moment', 'luxon', 'date-fns',
  'dotenv', 'zod', 'ajv', 'jsonschema', 'jsonpath', 'jackson', 'gson',
];

/**
 * True if `name` looks like a dependency whose documentation matters for code generation.
 * @param {string} name
 * @returns {boolean}
 */
function isMaterial(name) {
  const lower = String(name).toLowerCase();
  return MATERIAL_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Normalizes a version string to the bare resolved version where possible, and reports whether the
 * original was an exact pin or a range.
 *
 * "1.61.1" -> pinned; "^1.61.1" / "~1.6" / ">=2,<3" / "LATEST" -> not pinned.
 *
 * @param {*} raw
 * @returns {{version: string, pinned: boolean}}
 */
function normalizeVersion(raw) {
  if (raw === null || raw === undefined) return { version: 'unknown', pinned: false };
  const str = String(raw).trim();
  if (!str) return { version: 'unknown', pinned: false };
  if (/^\d+(\.\d+)*(-[0-9A-Za-z.+-]+)?$/.test(str)) return { version: str, pinned: true };
  const firstConcrete = str.match(/\d+(\.\d+)*(-[0-9A-Za-z.+-]+)?/);
  return { version: firstConcrete ? firstConcrete[0] : str, pinned: false };
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function readJson(file) {
  const text = readText(file);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// --- Parsers. Each returns [{ name, version }] with versions exactly as written in the file. ---

function parsePackageJson(file) {
  const json = readJson(file);
  if (!json) return [];
  const deps = { ...(json.dependencies || {}), ...(json.devDependencies || {}) };
  return Object.entries(deps).map(([name, version]) => ({ name, version }));
}

function parsePackageLock(file) {
  const json = readJson(file);
  if (!json) return [];
  const out = [];
  // lockfileVersion 2/3 use `packages` keyed by path; v1 uses `dependencies`.
  if (json.packages && typeof json.packages === 'object') {
    for (const [key, meta] of Object.entries(json.packages)) {
      if (!key || !meta || !meta.version) continue;
      const name = key.replace(/^.*node_modules\//, '');
      if (name) out.push({ name, version: meta.version });
    }
  }
  if (json.dependencies && typeof json.dependencies === 'object') {
    for (const [name, meta] of Object.entries(json.dependencies)) {
      if (meta && meta.version) out.push({ name, version: meta.version });
    }
  }
  return out;
}

function parseYarnLock(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  // Entries look like `"@playwright/test@^1.61.1":\n  version "1.61.1"` (v1) or the same shape
  // with `version: 1.61.1` (berry). Capture the header's package name and the resolved version.
  const blocks = text.split(/\n(?=\S)/);
  for (const block of blocks) {
    const header = block.match(/^"?((?:@[^/@\s]+\/)?[^@\s"]+)@/m);
    const version = block.match(/^\s+version:?\s+"?([^"\s]+)"?/m);
    if (header && version) out.push({ name: header[1], version: version[1] });
  }
  return out;
}

function parsePnpmLock(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  // pnpm keys resolved packages as `/@playwright/test@1.61.1:` or `'@playwright/test@1.61.1':`.
  const re = /^\s*'?\/?((?:@[^/@\s]+\/)?[^@\s':]+)@(\d[^\s':(]*)'?:/gm;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ name: m[1], version: m[2] });
  return out;
}

function parsePomXml(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  // Resolve <properties> first so a version like ${shaft.version} reports a real number.
  const props = {};
  const propsBlock = text.match(/<properties>([\s\S]*?)<\/properties>/);
  if (propsBlock) {
    const propRe = /<([^\s/>]+)>([^<]*)<\/\1>/g;
    let p;
    while ((p = propRe.exec(propsBlock[1])) !== null) props[p[1]] = p[2].trim();
  }
  const depRe = /<dependency>([\s\S]*?)<\/dependency>/g;
  let m;
  while ((m = depRe.exec(text)) !== null) {
    const body = m[1];
    const artifact = body.match(/<artifactId>([^<]+)<\/artifactId>/);
    const group = body.match(/<groupId>([^<]+)<\/groupId>/);
    const versionTag = body.match(/<version>([^<]+)<\/version>/);
    if (!artifact) continue;
    let version = versionTag ? versionTag[1].trim() : 'unknown';
    const placeholder = version.match(/^\$\{(.+)\}$/);
    if (placeholder) version = props[placeholder[1]] || version;
    out.push({
      name: artifact[1].trim(),
      version,
      group: group ? group[1].trim() : undefined,
    });
  }
  return out;
}

function parseGradle(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  // Matches both `implementation 'g:a:1.2.3'` and `testImplementation("g:a:1.2.3")`.
  const re = /['"]([\w.\-]+):([\w.\-]+):([^'"\s]+)['"]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ name: m[2], version: m[3], group: m[1] });
  return out;
}

function parseRequirementsTxt(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;
    const m = trimmed.match(/^([A-Za-z0-9._-]+)\s*(?:\[[^\]]*\])?\s*(?:([=<>~!]=?)\s*([^\s;#]+))?/);
    if (m) out.push({ name: m[1], version: m[2] === '==' ? m[3] : (m[3] ? `${m[2]}${m[3]}` : 'unknown') });
  }
  return out;
}

function parsePyprojectToml(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  // Covers PEP 621 `dependencies = ["pytest>=8"]` and Poetry's `pytest = "^8.0"` table form.
  const arrayBlock = text.match(/dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (arrayBlock) {
    const itemRe = /['"]([A-Za-z0-9._-]+)\s*(?:\[[^\]]*\])?\s*([=<>~!]=?[^'"\s,]+)?['"]/g;
    let m;
    while ((m = itemRe.exec(arrayBlock[1])) !== null) {
      out.push({ name: m[1], version: m[2] ? m[2].replace(/^[=<>~!]+/, (op) => (op === '==' ? '' : op)) : 'unknown' });
    }
  }
  const poetryBlock = text.match(/\[tool\.poetry\.(?:dev-)?dependencies\]([\s\S]*?)(?:\n\[|$)/g);
  for (const block of poetryBlock || []) {
    const lineRe = /^\s*([A-Za-z0-9._-]+)\s*=\s*['"]([^'"]+)['"]/gm;
    let m;
    while ((m = lineRe.exec(block)) !== null) {
      if (m[1].toLowerCase() === 'python') continue;
      out.push({ name: m[1], version: m[2] });
    }
  }
  return out;
}

function parsePoetryLock(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  const re = /\[\[package\]\][\s\S]*?name\s*=\s*"([^"]+)"[\s\S]*?version\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ name: m[1], version: m[2] });
  return out;
}

function parsePipfileLock(file) {
  const json = readJson(file);
  if (!json) return [];
  const out = [];
  for (const section of ['default', 'develop']) {
    for (const [name, meta] of Object.entries(json[section] || {})) {
      if (meta && meta.version) out.push({ name, version: String(meta.version).replace(/^==/, '') });
    }
  }
  return out;
}

function parseGemfileLock(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  const re = /^\s{4}([A-Za-z0-9._-]+)\s+\(([^)]+)\)/gm;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ name: m[1], version: m[2] });
  return out;
}

function parseGoMod(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  const re = /^\s*([\w.\-/]+)\s+v(\S+)/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] === 'module' || m[1] === 'go' || m[1] === 'require') continue;
    out.push({ name: m[1], version: m[2] });
  }
  return out;
}

function parseComposerLock(file) {
  const json = readJson(file);
  if (!json) return [];
  const out = [];
  for (const section of ['packages', 'packages-dev']) {
    for (const pkg of json[section] || []) {
      if (pkg && pkg.name && pkg.version) out.push({ name: pkg.name, version: String(pkg.version).replace(/^v/, '') });
    }
  }
  return out;
}

function parseCsproj(file) {
  const text = readText(file);
  if (!text) return [];
  const out = [];
  const re = /<PackageReference\s+[^>]*Include="([^"]+)"[^>]*?(?:Version="([^"]+)")?[^>]*\/?>/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ name: m[1], version: m[2] || 'unknown' });
  return out;
}

/**
 * Walks `root` (bounded depth, ignoring vendored/build trees) collecting recognized manifest,
 * lockfile, and framework-config paths.
 *
 * @param {string} root
 * @param {{maxDepth?: number}} [options] Defaults to MAX_DEPTH. A Maven/SHAFT tree keeps its test
 *   sources at `src/test/java/com/company/pages` — deeper than the default — so a caller scanning a
 *   whole application repository raises this rather than silently missing them.
 * @returns {{manifests: Array<object>, configs: Array<object>}}
 */
function findManifestFiles(root, options = {}) {
  const maxDepth = Number.isInteger(options.maxDepth) ? options.maxDepth : MAX_DEPTH;
  const manifests = [];
  const configs = [];

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        walk(full, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;

      const spec = MANIFESTS.find((candidate) => candidate.file === entry.name);
      if (spec) {
        manifests.push({ ...spec, path: full });
      } else if (CSPROJ_RE.test(entry.name)) {
        manifests.push({
          file: entry.name, ecosystem: 'dotnet', kind: 'manifest', parse: parseCsproj, path: full,
        });
      }

      const signal = CONFIG_SIGNALS.find((candidate) => candidate.match.test(entry.name));
      if (signal) configs.push({ path: full, framework: signal.framework, file: entry.name });
    }
  }

  walk(root, 0);

  // SHAFT identifies itself by its properties folder rather than a config file.
  const shaftProps = path.join(root, 'src', 'main', 'resources', 'properties');
  if (fs.existsSync(shaftProps)) {
    configs.push({ path: shaftProps, framework: 'SHAFT', file: 'properties/' });
  }

  return { manifests, configs };
}

/**
 * Detects the technology stack and dependency set beneath `root`.
 *
 * Lockfile entries override manifest ranges for the same (ecosystem, library) pair, so the returned
 * `version` is the version the suite will actually run against wherever one could be resolved.
 *
 * @param {string} root Absolute or cwd-relative path to walk.
 * @param {{materialOnly?: boolean, maxDepth?: number}} [options] `materialOnly` (default true)
 *   restricts the result to dependencies whose API surface generated automation touches — see
 *   README.md §2.4. `maxDepth` (default MAX_DEPTH) bounds the walk; raise it for a deep source tree
 *   such as Maven's `src/test/java/com/company/pages`, which sits below the default.
 * @returns {{root: string, ecosystems: string[], frameworks: string[], dependencies: Array<object>,
 *   sources: string[], configs: Array<object>, unpinned: string[]}}
 */
function detectStack(root, options = {}) {
  const { materialOnly = true, maxDepth } = options;
  const resolvedRoot = path.resolve(root);
  const { manifests, configs } = findManifestFiles(resolvedRoot, { maxDepth });

  // Keyed by `${ecosystem}::${lowercased name}`; a 'lock' source replaces a 'manifest' one.
  const byKey = new Map();
  const sources = [];

  for (const spec of manifests) {
    const entries = spec.parse(spec.path) || [];
    const relative = path.relative(resolvedRoot, spec.path).split(path.sep).join('/');
    if (entries.length) sources.push(relative);
    for (const entry of entries) {
      if (!entry || !entry.name) continue;
      if (materialOnly && !isMaterial(entry.name)) continue;
      const key = `${spec.ecosystem}::${entry.name.toLowerCase()}`;
      const existing = byKey.get(key);
      if (existing && existing.kind === 'lock' && spec.kind !== 'lock') continue;
      const { version, pinned } = normalizeVersion(entry.version);
      byKey.set(key, {
        ecosystem: spec.ecosystem,
        library: entry.name,
        group: entry.group,
        version,
        pinned,
        source: relative,
        kind: spec.kind,
      });
    }
  }

  const dependencies = [...byKey.values()]
    .map(({ kind, ...rest }) => rest)
    .sort((a, b) => a.ecosystem.localeCompare(b.ecosystem) || a.library.localeCompare(b.library));

  const frameworks = [...new Set(configs.map((c) => c.framework))].sort();
  const ecosystems = [...new Set(dependencies.map((d) => d.ecosystem))].sort();

  return {
    root: resolvedRoot,
    ecosystems,
    frameworks,
    dependencies,
    sources: [...new Set(sources)].sort(),
    configs: configs.map((c) => ({
      framework: c.framework,
      file: c.file,
      path: path.relative(resolvedRoot, c.path).split(path.sep).join('/'),
    })),
    unpinned: dependencies.filter((d) => !d.pinned).map((d) => d.library),
  };
}

module.exports = {
  detectStack,
  findManifestFiles,
  isMaterial,
  normalizeVersion,
  MATERIAL_PATTERNS,
  IGNORED_DIRS,
  MAX_DEPTH,
};
