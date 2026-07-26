// Test Directory Detection — finds WHERE a Target Project keeps its tests, and HOW it writes them.
//
// detectStack.js answers "which frameworks and versions are in play". That is not enough to write
// code into somebody else's repository: generated automation has to land in the directory the team
// actually uses, named the way they name files, importing the way they import. A suite dropped in
// the wrong folder with foreign conventions is not a deliverable (pipeline.md §13.2 item 3).
//
// Three independent detection sources, strongest first:
//   config      a framework config file declares its test dir (playwright.config.ts testDir, etc.)
//   convention  the directory name matches a well-known layout (tests/e2e, src/test/java, ...)
//   content     the directory holds files matching a framework's test-file pattern
//
// A directory found by more than one source keeps the strongest, and every source that agreed is
// listed in `evidence` — so a human reviewing an init plan can see why the tool chose a folder.
//
// Zero project-specific data lives here: every path is resolved from the `root` argument at call
// time, exactly as detectStack.js does.

const fs = require('fs');
const path = require('path');

const { IGNORED_DIRS } = require('./detectStack');

// A Maven/SHAFT tree keeps page objects at src/test/java/com/company/pages — depth 6 — so the
// stack detector's depth of 4 is too shallow here. 8 covers the deep-package case without turning
// a scan of a large monorepo into a full-tree walk.
const DEFAULT_MAX_DEPTH = 8;

// Bounds a pathological scan (a generated or vendored tree that slipped past IGNORED_DIRS).
const MAX_DIRS_VISITED = 5000;

/**
 * Conventional test-directory layouts. `pattern` matches a root-relative POSIX path in full.
 * Ordered most-specific first: `tests/e2e` must win over the bare `tests` that contains it.
 */
const CONVENTIONS = [
  // --- JS/TS: end-to-end -------------------------------------------------------------------------
  { pattern: /^(?:tests?|e2e)\/e2e$/i, kind: 'e2e', ecosystem: 'node' },
  { pattern: /^cypress\/e2e$/i, kind: 'e2e', ecosystem: 'node', framework: 'Cypress' },
  { pattern: /^cypress\/integration$/i, kind: 'e2e', ecosystem: 'node', framework: 'Cypress' },
  { pattern: /^(?:tests?)\/(?:playwright|browser|ui|functional|acceptance)$/i, kind: 'e2e', ecosystem: 'node' },
  { pattern: /^e2e$/i, kind: 'e2e', ecosystem: 'node' },
  { pattern: /^(?:tests?)\/specs?$/i, kind: 'e2e', ecosystem: 'node' },
  { pattern: /^specs?$/i, kind: 'e2e', ecosystem: 'node' },
  { pattern: /^playwright$/i, kind: 'e2e', ecosystem: 'node', framework: 'Playwright' },

  // --- JS/TS: other kinds ------------------------------------------------------------------------
  { pattern: /^(?:tests?)\/(?:integration|api)$/i, kind: 'integration', ecosystem: 'node' },
  { pattern: /^(?:tests?)\/(?:unit)$/i, kind: 'unit', ecosystem: 'node' },
  { pattern: /^(?:tests?)\/(?:component)$/i, kind: 'component', ecosystem: 'node' },
  { pattern: /^__tests__$/i, kind: 'unit', ecosystem: 'node' },
  { pattern: /^src\/__tests__$/i, kind: 'unit', ecosystem: 'node' },
  { pattern: /^features$/i, kind: 'bdd', ecosystem: 'node' },

  // --- JVM ---------------------------------------------------------------------------------------
  { pattern: /^src\/test\/java$/i, kind: 'unknown', ecosystem: 'maven' },
  { pattern: /^src\/test\/kotlin$/i, kind: 'unknown', ecosystem: 'maven' },
  { pattern: /^src\/test\/groovy$/i, kind: 'unknown', ecosystem: 'maven' },
  { pattern: /^src\/test\/resources$/i, kind: 'resources', ecosystem: 'maven' },
  { pattern: /^src\/test\/java\/.*\/(?:tests?|e2e|ui|web)$/i, kind: 'e2e', ecosystem: 'maven' },
  { pattern: /^src\/test\/resources\/features$/i, kind: 'bdd', ecosystem: 'maven' },

  // --- Python ------------------------------------------------------------------------------------
  { pattern: /^tests?$/i, kind: 'unknown', ecosystem: 'python' },
  { pattern: /^tests?\/functional$/i, kind: 'e2e', ecosystem: 'python' },

  // --- Other ecosystems --------------------------------------------------------------------------
  { pattern: /^spec$/i, kind: 'unit', ecosystem: 'ruby' },
  { pattern: /^spec\/features$/i, kind: 'e2e', ecosystem: 'ruby' },
  { pattern: /^tests?\/Feature$/i, kind: 'e2e', ecosystem: 'php' },
  { pattern: /^tests?\/Unit$/i, kind: 'unit', ecosystem: 'php' },

  // --- Generic fallback, weakest ------------------------------------------------------------------
  { pattern: /^tests?$/i, kind: 'unknown', ecosystem: null },
];

/**
 * Test-file recognizers. A directory containing these is a test directory even when its name is
 * unconventional. `kind` is a hint only — a config or convention match outranks it.
 */
const TEST_FILE_PATTERNS = [
  { match: /\.spec\.[cm]?[jt]sx?$/i, glob: '**/*.spec.{ts,js}', ecosystem: 'node', kind: 'e2e' },
  { match: /\.test\.[cm]?[jt]sx?$/i, glob: '**/*.test.{ts,js}', ecosystem: 'node', kind: 'unit' },
  { match: /\.cy\.[cm]?[jt]sx?$/i, glob: '**/*.cy.{ts,js}', ecosystem: 'node', kind: 'e2e', framework: 'Cypress' },
  { match: /\.e2e-spec\.[cm]?[jt]s$/i, glob: '**/*.e2e-spec.ts', ecosystem: 'node', kind: 'e2e' },
  { match: /^test_.*\.py$/i, glob: '**/test_*.py', ecosystem: 'python', kind: 'unknown' },
  { match: /_test\.py$/i, glob: '**/*_test.py', ecosystem: 'python', kind: 'unknown' },
  { match: /(?:Test|Tests|IT|ITCase)\.java$/, glob: '**/*Test.java', ecosystem: 'maven', kind: 'unknown' },
  { match: /(?:Test|Tests)\.kt$/, glob: '**/*Test.kt', ecosystem: 'maven', kind: 'unknown' },
  { match: /_spec\.rb$/i, glob: '**/*_spec.rb', ecosystem: 'ruby', kind: 'unit' },
  { match: /_test\.go$/i, glob: '**/*_test.go', ecosystem: 'go', kind: 'unknown' },
  { match: /(?:Test|Tests)\.cs$/, glob: '**/*Tests.cs', ecosystem: 'dotnet', kind: 'unknown' },
  { match: /\.feature$/i, glob: '**/*.feature', ecosystem: null, kind: 'bdd' },
];

/** Config files that declare a test directory, and how to extract it. */
const CONFIG_TEST_DIR = [
  {
    match: /^playwright\.config\.[cm]?[jt]s$/i,
    framework: 'Playwright',
    ecosystem: 'node',
    kind: 'e2e',
    extract: (text) => matchFirst(text, [
      /testDir\s*:\s*['"`]([^'"`]+)['"`]/,
    ]),
  },
  {
    match: /^cypress\.config\.[cm]?[jt]s$/i,
    framework: 'Cypress',
    ecosystem: 'node',
    kind: 'e2e',
    extract: (text) => matchFirst(text, [
      /specPattern\s*:\s*['"`]([^'"`*]+)/,
      /integrationFolder\s*:\s*['"`]([^'"`]+)['"`]/,
    ]),
  },
  {
    match: /^wdio\.conf\.[cm]?[jt]s$/i,
    framework: 'WebdriverIO',
    ecosystem: 'node',
    kind: 'e2e',
    extract: (text) => matchFirst(text, [/specs\s*:\s*\[\s*['"`]\.?\/?([^'"`*]+)/]),
  },
  {
    match: /^(?:pytest\.ini|tox\.ini|setup\.cfg)$/i,
    framework: 'pytest',
    ecosystem: 'python',
    kind: 'unknown',
    extract: (text) => matchFirst(text, [/^\s*testpaths\s*=\s*(.+)$/m]),
  },
  {
    match: /^pyproject\.toml$/i,
    framework: 'pytest',
    ecosystem: 'python',
    kind: 'unknown',
    extract: (text) => matchFirst(text, [/testpaths\s*=\s*\[\s*['"]([^'"]+)['"]/]),
  },
  {
    match: /^testng\.xml$/i,
    framework: 'TestNG',
    ecosystem: 'maven',
    kind: 'e2e',
    // testng.xml names classes, not directories; the JVM convention is authoritative instead.
    extract: () => null,
  },
];

/** Directory names that are page-object / fixture / helper / data conventions, not test dirs. */
const ROLE_DIRS = {
  pageObjectDir: /^(?:pages?|pageobjects?|page_objects?|po|screens?|views?)$/i,
  fixtureDir: /^(?:fixtures?|conftest|setup)$/i,
  helperDir: /^(?:helpers?|utils?|utilities|support|common|lib)$/i,
  testDataDir: /^(?:data|testdata|test_data|test-data|resources|payloads)$/i,
};

const LANGUAGE_BY_EXT = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.kt': 'kotlin',
  '.rb': 'ruby',
  '.go': 'go',
  '.cs': 'csharp',
  '.php': 'php',
  '.feature': 'gherkin',
};

const CONFIDENCE_RANK = { high: 3, medium: 2, low: 1 };
const SOURCE_RANK = { config: 3, convention: 2, content: 1 };

/** Greenfield suggestions, by ecosystem — where a suite SHOULD go when none exists yet. */
const GREENFIELD_SUGGESTIONS = {
  node: { path: 'tests/e2e', kind: 'e2e', reason: 'conventional Playwright/Node e2e location' },
  maven: { path: 'src/test/java', kind: 'unknown', reason: 'standard Maven test source root' },
  gradle: { path: 'src/test/java', kind: 'unknown', reason: 'standard Gradle test source root' },
  python: { path: 'tests', kind: 'unknown', reason: 'conventional pytest location' },
  ruby: { path: 'spec', kind: 'unit', reason: 'conventional RSpec location' },
  go: { path: '.', kind: 'unknown', reason: 'Go keeps *_test.go beside the code under test' },
  php: { path: 'tests', kind: 'unknown', reason: 'conventional PHPUnit/Codeception location' },
  dotnet: { path: 'tests', kind: 'unknown', reason: 'conventional .NET test project location' },
};

function matchFirst(text, patterns) {
  for (const re of patterns) {
    const m = re.exec(text);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** Normalizes an extracted config path ("./tests/e2e", "tests/e2e/**", "tests/e2e/") to "tests/e2e". */
function normalizeConfigDir(raw) {
  if (!raw) return null;
  let value = String(raw).trim().split(/[\s,]+/)[0];
  value = value.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
  // Drop a trailing glob tail: "tests/e2e/**/*.spec.ts" -> "tests/e2e".
  const globAt = value.search(/[*?]/);
  if (globAt !== -1) value = value.slice(0, globAt).replace(/\/+$/, '');
  if (!value || value === '.') return null;
  return value;
}

/**
 * Detects where a project keeps its tests and the conventions it writes them with.
 *
 * @param {string} root Absolute or cwd-relative path of the target project.
 * @param {{maxDepth?: number, ecosystems?: string[], fs?: object}} [options]
 *   `maxDepth` (default 8) bounds the walk. `ecosystems` — normally `detectStack(root).ecosystems` —
 *   attributes hits and picks greenfield suggestions; omitted means "consider every ecosystem".
 * @returns {{root: string, greenfield: boolean, dirs: Array<object>, primary: object|null,
 *   conventions: object, suggestions: Array<object>, scanned: object, warnings: string[]}}
 */
function detectTestDirs(root, options = {}) {
  const fsImpl = options.fs || fs;
  const maxDepth = Number.isInteger(options.maxDepth) ? options.maxDepth : DEFAULT_MAX_DEPTH;
  const hintedEcosystems = Array.isArray(options.ecosystems) ? options.ecosystems : null;
  const resolvedRoot = path.resolve(root);
  const warnings = [];

  if (!fsImpl.existsSync(resolvedRoot)) {
    return emptyResult(resolvedRoot, hintedEcosystems, [`Root does not exist: ${toPosix(resolvedRoot)}`]);
  }

  // --- Walk ---------------------------------------------------------------------------------------
  /** @type {Map<string, {files: string[], dirs: string[], depth: number}>} */
  const tree = new Map();
  const scanned = { dirsVisited: 0, maxDepthReached: 0, truncated: false };

  const walk = (absDir, rel, depth) => {
    if (depth > maxDepth) return;
    if (scanned.dirsVisited >= MAX_DIRS_VISITED) {
      scanned.truncated = true;
      return;
    }
    let entries;
    try {
      entries = fsImpl.readdirSync(absDir, { withFileTypes: true });
    } catch {
      return; // unreadable dir — a permission boundary is not an error worth failing the scan for
    }
    scanned.dirsVisited += 1;
    scanned.maxDepthReached = Math.max(scanned.maxDepthReached, depth);

    const files = [];
    const dirs = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        dirs.push(entry.name);
        walk(path.join(absDir, entry.name), rel ? `${rel}/${entry.name}` : entry.name, depth + 1);
      } else if (entry.isFile()) {
        files.push(entry.name);
      }
    }
    tree.set(rel, { files, dirs, depth });
  };

  walk(resolvedRoot, '', 0);
  if (scanned.truncated) {
    warnings.push(
      `Scan stopped after ${MAX_DIRS_VISITED} directories — results may be incomplete. Narrow the ` +
        'root, or declare target.testDirs explicitly in platform.config.json.',
    );
  }

  // --- Source 1: config-declared test dirs (strongest) --------------------------------------------
  /** @type {Map<string, object>} */
  const candidates = new Map();

  const addCandidate = (relPath, data) => {
    if (relPath === null || relPath === undefined) return;
    const existing = candidates.get(relPath);
    if (!existing) {
      candidates.set(relPath, { path: relPath, evidence: [], ...data });
      candidates.get(relPath).evidence = [...(data.evidence || [])];
      return;
    }
    // Keep the strongest source/confidence; accumulate evidence from every source that agreed.
    existing.evidence.push(...(data.evidence || []));
    if (SOURCE_RANK[data.source] > SOURCE_RANK[existing.source]) {
      existing.source = data.source;
      existing.kind = data.kind || existing.kind;
    }
    if (CONFIDENCE_RANK[data.confidence] > CONFIDENCE_RANK[existing.confidence]) {
      existing.confidence = data.confidence;
    }
    existing.framework = existing.framework || data.framework || null;
    existing.ecosystem = existing.ecosystem || data.ecosystem || null;
    if (existing.kind === 'unknown' && data.kind && data.kind !== 'unknown') existing.kind = data.kind;
  };

  for (const [rel, node] of tree) {
    for (const filename of node.files) {
      const spec = CONFIG_TEST_DIR.find((c) => c.match.test(filename));
      if (!spec) continue;

      const abs = path.join(resolvedRoot, rel, filename);
      let declared = null;
      try {
        declared = normalizeConfigDir(spec.extract(fsImpl.readFileSync(abs, 'utf8')));
      } catch {
        warnings.push(`Could not read ${rel ? `${rel}/` : ''}${filename} to extract its test directory.`);
      }
      if (!declared) continue;

      // A config path is relative to the config file's own directory.
      const resolvedRel = toPosix(path.normalize(path.join(rel, declared)));
      if (resolvedRel.startsWith('..')) continue; // declared outside the project — ignore

      addCandidate(resolvedRel, {
        kind: spec.kind,
        ecosystem: spec.ecosystem,
        framework: spec.framework,
        confidence: 'high',
        source: 'config',
        evidence: [`${rel ? `${rel}/` : ''}${filename} declares its test directory as "${declared}"`],
      });
    }
  }

  // --- Source 2: conventional directory names -----------------------------------------------------
  for (const [rel, node] of tree) {
    if (!rel) continue;
    const convention = CONVENTIONS.find((c) => c.pattern.test(rel));
    if (!convention) continue;
    if (hintedEcosystems && convention.ecosystem && !hintedEcosystems.includes(convention.ecosystem)) {
      continue; // a python `tests/` convention is noise in a pure-node repo
    }
    // A conventional name with nothing in it (no files anywhere beneath) is a stub, not a suite.
    if (!hasFilesBeneath(tree, rel)) continue;

    addCandidate(rel, {
      kind: convention.kind,
      ecosystem: convention.ecosystem,
      framework: convention.framework || null,
      confidence: 'medium',
      source: 'convention',
      evidence: [`directory name matched conventional layout "${rel}"`],
    });
  }

  // --- Source 3: directories containing recognizable test files -----------------------------------
  for (const [rel, node] of tree) {
    if (!rel) continue;
    const hits = new Map();
    for (const filename of node.files) {
      const spec = TEST_FILE_PATTERNS.find((p) => p.match.test(filename));
      if (!spec) continue;
      if (hintedEcosystems && spec.ecosystem && !hintedEcosystems.includes(spec.ecosystem)) continue;
      if (!hits.has(spec.glob)) hits.set(spec.glob, { spec, count: 0 });
      hits.get(spec.glob).count += 1;
    }
    if (!hits.size) continue;

    const [glob, { spec, count }] = [...hits.entries()].sort((a, b) => b[1].count - a[1].count)[0];
    addCandidate(rel, {
      kind: spec.kind,
      ecosystem: spec.ecosystem,
      framework: spec.framework || null,
      confidence: 'medium',
      source: 'content',
      testFileGlob: glob,
      evidence: [`${count} file(s) match ${glob}`],
    });
  }

  // --- Enrich, prune, rank ------------------------------------------------------------------------
  let dirs = [...candidates.values()].map((c) => enrich(c, tree, resolvedRoot, fsImpl));

  // Drop a parent that only qualified because a stronger child did: keep `tests/e2e`, not `tests`.
  dirs = dirs.filter((d) => !isRedundantParent(d, dirs));

  dirs.sort(
    (a, b) =>
      CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence] ||
      SOURCE_RANK[b.source] - SOURCE_RANK[a.source] ||
      b.fileCount - a.fileCount ||
      a.path.localeCompare(b.path),
  );

  const greenfield = dirs.length === 0;
  const primary = greenfield ? null : pickPrimary(dirs);

  return {
    root: toPosix(resolvedRoot),
    greenfield,
    dirs,
    primary,
    conventions: primary ? deriveConventions(primary, tree, resolvedRoot, fsImpl) : emptyConventions(),
    // Suggestions are ONLY produced for a greenfield project, never mixed with real hits — a
    // suggestion beside a real directory would read as a second existing suite.
    suggestions: greenfield ? buildSuggestions(hintedEcosystems) : [],
    scanned,
    warnings,
  };
}

function hasFilesBeneath(tree, rel) {
  const node = tree.get(rel);
  if (node && node.files.length) return true;
  const prefix = `${rel}/`;
  for (const [key, value] of tree) {
    if (key.startsWith(prefix) && value.files.length) return true;
  }
  return false;
}

/** True when `dir` is only a weaker ancestor of another candidate that already covers it. */
function isRedundantParent(dir, all) {
  return all.some(
    (other) =>
      other !== dir &&
      other.path.startsWith(`${dir.path}/`) &&
      SOURCE_RANK[other.source] >= SOURCE_RANK[dir.source] &&
      CONFIDENCE_RANK[other.source === dir.source ? other.confidence : 'high'] >=
        CONFIDENCE_RANK[dir.confidence] &&
      dir.source !== 'config',
  );
}

function enrich(candidate, tree, resolvedRoot, fsImpl) {
  const files = collectFilesBeneath(tree, candidate.path);
  const testFiles = files.filter((f) => TEST_FILE_PATTERNS.some((p) => p.match.test(path.basename(f))));
  const relevant = testFiles.length ? testFiles : files;

  let glob = candidate.testFileGlob || null;
  if (!glob && testFiles.length) {
    const spec = TEST_FILE_PATTERNS.find((p) => p.match.test(path.basename(testFiles[0])));
    glob = spec ? spec.glob : null;
  }

  return {
    path: candidate.path,
    kind: candidate.kind || 'unknown',
    ecosystem: candidate.ecosystem || null,
    framework: candidate.framework || null,
    confidence: candidate.confidence,
    evidence: [...new Set(candidate.evidence)],
    fileCount: relevant.length,
    sampleFiles: relevant.slice(0, 5),
    testFileGlob: glob,
    source: candidate.source,
  };
}

function collectFilesBeneath(tree, rel) {
  const out = [];
  const node = tree.get(rel);
  if (node) out.push(...node.files.map((f) => (rel ? `${rel}/${f}` : f)));
  const prefix = `${rel}/`;
  for (const [key, value] of tree) {
    if (!key.startsWith(prefix)) continue;
    out.push(...value.files.map((f) => `${key}/${f}`));
  }
  return out.sort();
}

/** The e2e candidate a generator should target: prefer kind 'e2e', then confidence, then size. */
function pickPrimary(dirs) {
  const e2e = dirs.filter((d) => d.kind === 'e2e');
  return (e2e.length ? e2e : dirs)[0];
}

function emptyConventions() {
  return {
    fileNaming: null,
    fileNamingSamples: [],
    pageObjectDir: null,
    fixtureDir: null,
    helperDir: null,
    testDataDir: null,
    language: null,
    indentation: null,
    quoteStyle: null,
    importStyle: null,
  };
}

/**
 * Derives the conventions generated code must match: naming, sibling role directories, language,
 * indentation, quote style, import style. This is what makes generated automation read like the
 * team wrote it (pipeline.md §13.2 item 3).
 */
function deriveConventions(primary, tree, resolvedRoot, fsImpl) {
  const out = emptyConventions();
  const files = collectFilesBeneath(tree, primary.path);
  const testFiles = files.filter((f) => TEST_FILE_PATTERNS.some((p) => p.match.test(path.basename(f))));

  // --- Naming ------------------------------------------------------------------------------------
  out.fileNamingSamples = testFiles.slice(0, 5).map((f) => path.basename(f));
  if (out.fileNamingSamples.length) out.fileNaming = describeNaming(out.fileNamingSamples);

  // --- Role directories, searched within the primary dir and its parent --------------------------
  const searchRoots = [primary.path];
  const parent = primary.path.includes('/') ? primary.path.slice(0, primary.path.lastIndexOf('/')) : '';
  if (tree.has(parent)) searchRoots.push(parent);

  for (const [key, re] of Object.entries(ROLE_DIRS)) {
    for (const base of searchRoots) {
      const node = tree.get(base);
      if (!node) continue;
      const hit = node.dirs.find((d) => re.test(d));
      if (hit) {
        out[key] = base ? `${base}/${hit}` : hit;
        break;
      }
    }
  }

  // --- Language ----------------------------------------------------------------------------------
  const extCounts = new Map();
  for (const f of testFiles.length ? testFiles : files) {
    const lang = LANGUAGE_BY_EXT[path.extname(f).toLowerCase()];
    if (lang) extCounts.set(lang, (extCounts.get(lang) || 0) + 1);
  }
  if (extCounts.size) {
    out.language = [...extCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // --- Formatting, sampled from real files -------------------------------------------------------
  const sample = readSample(testFiles.length ? testFiles : files, resolvedRoot, fsImpl);
  if (sample) {
    out.indentation = detectIndentation(sample);
    out.quoteStyle = detectQuoteStyle(sample);
    out.importStyle = detectImportStyle(sample);
  }

  return out;
}

function readSample(files, resolvedRoot, fsImpl, limit = 3) {
  const chunks = [];
  for (const rel of files.slice(0, limit)) {
    try {
      chunks.push(fsImpl.readFileSync(path.join(resolvedRoot, rel), 'utf8'));
    } catch {
      // Unreadable sample — conventions stay null rather than guessed.
    }
  }
  return chunks.length ? chunks.join('\n') : null;
}

function describeNaming(samples) {
  const first = samples[0];
  const suffix = /(\.spec|\.test|\.cy|\.e2e-spec)\.[cm]?[jt]sx?$/i.exec(first);
  if (suffix) {
    const ext = path.extname(first);
    const style = /[a-z0-9]+-[a-z0-9]/.test(first) ? '{kebab-feature}' : '{feature}';
    return `${style}${suffix[1]}${ext}`;
  }
  if (/^test_/i.test(first)) return 'test_{snake_feature}.py';
  if (/_test\.py$/i.test(first)) return '{snake_feature}_test.py';
  if (/(?:Test|Tests)\.java$/.test(first)) return '{PascalFeature}Test.java';
  if (/_spec\.rb$/i.test(first)) return '{snake_feature}_spec.rb';
  if (/_test\.go$/i.test(first)) return '{snake_feature}_test.go';
  if (/\.feature$/i.test(first)) return '{kebab-feature}.feature';
  return path.basename(first);
}

function detectIndentation(text) {
  const lines = text.split(/\r?\n/);
  let tabs = 0;
  const spaceWidths = new Map();
  for (const line of lines) {
    const m = /^([ \t]+)\S/.exec(line);
    if (!m) continue;
    if (m[1].includes('\t')) {
      tabs += 1;
    } else {
      const w = m[1].length;
      // Count the smallest plausible unit, so a nested 4-space line doesn't read as 4-space indent.
      if (w > 0) spaceWidths.set(w, (spaceWidths.get(w) || 0) + 1);
    }
  }
  if (!spaceWidths.size) return tabs ? 'tab' : null;
  const widths = [...spaceWidths.keys()].sort((a, b) => a - b);
  const unit = widths[0];
  const spaceLines = [...spaceWidths.values()].reduce((a, b) => a + b, 0);
  if (tabs > spaceLines) return 'tab';
  return `${unit}-space`;
}

function detectQuoteStyle(text) {
  const single = (text.match(/'/g) || []).length;
  const double = (text.match(/"/g) || []).length;
  const backtick = (text.match(/`/g) || []).length;
  if (single === 0 && double === 0 && backtick === 0) return null;
  if (backtick > single && backtick > double) return 'backtick';
  return single >= double ? 'single' : 'double';
}

function detectImportStyle(text) {
  const esm = /^\s*import\s.+from\s/m.test(text) || /^\s*export\s/m.test(text);
  const cjs = /\brequire\s*\(/.test(text);
  if (esm && !cjs) return 'esm';
  if (cjs && !esm) return 'commonjs';
  if (esm && cjs) return 'mixed';
  // Java before Python: a bare `import org.testng.annotations.Test;` also satisfies Python's
  // optional-`from` form, so the more specific (semicolon-terminated, dotted) pattern goes first.
  if (/^\s*import\s+(?:static\s+)?[\w.]+(?:\.\*)?\s*;/m.test(text)) return 'java';
  if (/^\s*(?:from\s+\S+\s+)?import\s/m.test(text)) return 'python';
  return null;
}

function buildSuggestions(hintedEcosystems) {
  const ecosystems = hintedEcosystems && hintedEcosystems.length ? hintedEcosystems : ['node'];
  const out = [];
  for (const ecosystem of ecosystems) {
    const suggestion = GREENFIELD_SUGGESTIONS[ecosystem];
    if (!suggestion) continue;
    out.push({
      path: suggestion.path,
      kind: suggestion.kind,
      ecosystem,
      reason: `${ecosystem} project with no existing test directory — ${suggestion.reason}`,
    });
  }
  if (!out.length) {
    out.push({
      path: 'tests/e2e',
      kind: 'e2e',
      ecosystem: null,
      reason: 'no ecosystem detected — defaulting to a conventional e2e location',
    });
  }
  return out;
}

function emptyResult(resolvedRoot, hintedEcosystems, warnings) {
  return {
    root: toPosix(resolvedRoot),
    greenfield: true,
    dirs: [],
    primary: null,
    conventions: emptyConventions(),
    suggestions: buildSuggestions(hintedEcosystems),
    scanned: { dirsVisited: 0, maxDepthReached: 0, truncated: false },
    warnings,
  };
}

module.exports = {
  detectTestDirs,
  DEFAULT_MAX_DEPTH,
  CONVENTIONS,
  TEST_FILE_PATTERNS,
  CONFIG_TEST_DIR,
  GREENFIELD_SUGGESTIONS,
  _internals: {
    normalizeConfigDir,
    describeNaming,
    detectIndentation,
    detectQuoteStyle,
    detectImportStyle,
    deriveConventions,
    isRedundantParent,
  },
};
