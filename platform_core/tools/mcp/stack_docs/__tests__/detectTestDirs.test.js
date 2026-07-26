const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { detectTestDirs, DEFAULT_MAX_DEPTH, _internals } = require('../detectTestDirs');
const { detectProject } = require('../detectProject');

/** Materializes a fixture tree from a {relPath: contents} map. */
function makeTree(files, prefix = 'dtd-') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  for (const [rel, contents] of Object.entries(files)) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contents === null ? '' : contents);
  }
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const PLAYWRIGHT_CONFIG = `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'https://example.com' },
});
`;

const PLAYWRIGHT_SPEC = `import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can sign in', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await expect(page).toHaveTitle(/Dashboard/);
});
`;

// -------------------------------------------------------------------------------------------------
// Node / Playwright — config-declared test dir
// -------------------------------------------------------------------------------------------------

test('a playwright.config.ts testDir is detected with high confidence', () => {
  const f = makeTree({
    'package.json': JSON.stringify({ devDependencies: { '@playwright/test': '1.61.1' } }),
    'playwright.config.ts': PLAYWRIGHT_CONFIG,
    'tests/e2e/login.spec.ts': PLAYWRIGHT_SPEC,
    'tests/e2e/checkout.spec.ts': PLAYWRIGHT_SPEC,
    'tests/e2e/pages/LoginPage.ts': 'export class LoginPage {}\n',
    'src/app.ts': 'export const app = 1;\n',
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['node'] });

    assert.equal(result.greenfield, false);
    assert.equal(result.primary.path, 'tests/e2e');
    assert.equal(result.primary.kind, 'e2e');
    assert.equal(result.primary.framework, 'Playwright');
    assert.equal(result.primary.confidence, 'high');
    assert.equal(result.primary.source, 'config');
    assert.ok(result.primary.evidence.some((e) => e.includes('playwright.config.ts')));
    assert.equal(result.suggestions.length, 0, 'a real hit must never carry suggestions');
  } finally {
    f.cleanup();
  }
});

test('conventions describe naming, role dirs, language and formatting', () => {
  const f = makeTree({
    'package.json': '{}',
    'playwright.config.ts': PLAYWRIGHT_CONFIG,
    'tests/e2e/user-login.spec.ts': PLAYWRIGHT_SPEC,
    'tests/e2e/pages/LoginPage.ts': 'export class LoginPage {}\n',
    'tests/e2e/fixtures/auth.ts': 'export const auth = 1;\n',
    'tests/e2e/helpers/wait.ts': 'export const wait = 1;\n',
  });
  try {
    const { conventions, primary } = detectTestDirs(f.root, { ecosystems: ['node'] });

    assert.equal(primary.path, 'tests/e2e');
    assert.equal(conventions.language, 'typescript');
    assert.equal(conventions.fileNaming, '{kebab-feature}.spec.ts');
    assert.deepEqual(conventions.fileNamingSamples, ['user-login.spec.ts']);
    assert.equal(conventions.pageObjectDir, 'tests/e2e/pages');
    assert.equal(conventions.fixtureDir, 'tests/e2e/fixtures');
    assert.equal(conventions.helperDir, 'tests/e2e/helpers');
    assert.equal(conventions.indentation, '2-space');
    assert.equal(conventions.quoteStyle, 'single');
    assert.equal(conventions.importStyle, 'esm');
  } finally {
    f.cleanup();
  }
});

test('a config path is resolved relative to the config file, and a glob tail is trimmed', () => {
  const f = makeTree({
    'package.json': '{}',
    'cypress.config.js': "module.exports = { e2e: { specPattern: 'cypress/e2e/**/*.cy.js' } };\n",
    'cypress/e2e/spec.cy.js': "describe('x', () => { it('y', () => {}); });\n",
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['node'] });
    const hit = result.dirs.find((d) => d.path === 'cypress/e2e');
    assert.ok(hit, 'cypress/e2e should be detected');
    assert.equal(hit.framework, 'Cypress');
    assert.equal(result.primary.path, 'cypress/e2e');
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Convention and content detection
// -------------------------------------------------------------------------------------------------

test('a conventional directory with no config is detected at medium confidence', () => {
  const f = makeTree({
    'package.json': '{}',
    'tests/e2e/login.spec.js': "const { test } = require('@playwright/test');\ntest('a', () => {});\n",
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['node'] });
    assert.equal(result.primary.path, 'tests/e2e');
    assert.equal(result.primary.confidence, 'medium');
    assert.ok(['convention', 'content'].includes(result.primary.source));
    assert.equal(result.conventions.importStyle, 'commonjs');
  } finally {
    f.cleanup();
  }
});

test('an unconventionally named directory is found by its test file contents', () => {
  const f = makeTree({
    'package.json': '{}',
    'qa/browser-checks/smoke.spec.ts': PLAYWRIGHT_SPEC,
    'qa/browser-checks/regression.spec.ts': PLAYWRIGHT_SPEC,
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['node'] });
    const hit = result.dirs.find((d) => d.path === 'qa/browser-checks');
    assert.ok(hit, 'content detection should find an unconventional directory');
    assert.equal(hit.source, 'content');
    assert.equal(hit.testFileGlob, '**/*.spec.{ts,js}');
    assert.ok(hit.evidence.some((e) => e.includes('2 file(s) match')));
  } finally {
    f.cleanup();
  }
});

test('evidence accumulates from every source that agreed on a directory', () => {
  const f = makeTree({
    'package.json': '{}',
    'playwright.config.ts': PLAYWRIGHT_CONFIG,
    'tests/e2e/a.spec.ts': PLAYWRIGHT_SPEC,
  });
  try {
    const { primary } = detectTestDirs(f.root, { ecosystems: ['node'] });
    // config declared it, the name is conventional, and it holds matching files.
    assert.ok(primary.evidence.length >= 2, `expected multiple evidence lines, got ${primary.evidence.length}`);
    assert.equal(primary.source, 'config', 'the strongest source wins');
    assert.equal(primary.confidence, 'high');
  } finally {
    f.cleanup();
  }
});

test('a conventional directory that is completely empty is not reported as a suite', () => {
  const f = makeTree({ 'package.json': '{}', 'src/app.ts': 'export const a = 1;\n' });
  try {
    fs.mkdirSync(path.join(f.root, 'tests', 'e2e'), { recursive: true });
    const result = detectTestDirs(f.root, { ecosystems: ['node'] });
    assert.equal(result.greenfield, true, 'an empty stub dir is not an existing suite');
    assert.equal(result.dirs.length, 0);
  } finally {
    f.cleanup();
  }
});

test('a weaker parent directory is dropped in favor of its stronger child', () => {
  const f = makeTree({
    'package.json': '{}',
    'playwright.config.ts': PLAYWRIGHT_CONFIG,
    'tests/e2e/a.spec.ts': PLAYWRIGHT_SPEC,
    'tests/helper.ts': 'export const h = 1;\n',
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['node'] });
    const paths = result.dirs.map((d) => d.path);
    assert.ok(paths.includes('tests/e2e'));
    assert.ok(!paths.includes('tests'), 'the bare parent must not shadow the config-declared child');
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Maven / SHAFT — the depth case the stack detector's MAX_DEPTH=4 misses
// -------------------------------------------------------------------------------------------------

test('a Maven test tree is found below the stack detector default depth of 4', () => {
  const f = makeTree({
    'pom.xml': '<project><dependencies><dependency><groupId>io.github.shafthq</groupId>' +
      '<artifactId>SHAFT_ENGINE</artifactId><version>9.1.20240310</version></dependency>' +
      '</dependencies></project>',
    'testng.xml': '<suite name="s"><test name="t"><classes/></test></suite>',
    'src/main/resources/properties/path.properties': 'x=1\n',
    // depth 6 — deeper than detectStack's MAX_DEPTH of 4
    'src/test/java/com/company/tests/LoginTest.java':
      'package com.company.tests;\n\nimport org.testng.annotations.Test;\n\n' +
      'public class LoginTest {\n    @Test\n    public void login() {\n    }\n}\n',
    'src/test/java/com/company/pages/LoginPage.java':
      'package com.company.pages;\n\npublic class LoginPage {\n}\n',
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['maven'] });

    assert.equal(result.greenfield, false);
    const paths = result.dirs.map((d) => d.path);
    assert.ok(
      paths.some((p) => p.startsWith('src/test/java')),
      `expected a src/test/java hit, got ${JSON.stringify(paths)}`,
    );
    assert.ok(result.scanned.maxDepthReached >= 5, 'the walk must go deeper than 4');
    assert.equal(result.conventions.language, 'java');
    assert.equal(result.conventions.fileNaming, '{PascalFeature}Test.java');
  } finally {
    f.cleanup();
  }
});

test('detectTestDirs default maxDepth is 8, and a lower value truncates the walk', () => {
  assert.equal(DEFAULT_MAX_DEPTH, 8);
  const f = makeTree({
    'pom.xml': '<project/>',
    'src/test/java/com/company/tests/LoginTest.java': 'public class LoginTest {}\n',
  });
  try {
    const deep = detectTestDirs(f.root, { ecosystems: ['maven'] });
    const shallow = detectTestDirs(f.root, { ecosystems: ['maven'], maxDepth: 2 });
    assert.ok(deep.dirs.length > 0);
    assert.equal(shallow.dirs.length, 0, 'a shallow walk must not reach the deep test tree');
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Python
// -------------------------------------------------------------------------------------------------

test('a pytest.ini testpaths entry is detected', () => {
  const f = makeTree({
    'requirements.txt': 'pytest==8.1.1\nplaywright==1.61.1\n',
    'pytest.ini': '[pytest]\ntestpaths = tests\n',
    'tests/test_login.py': 'def test_login():\n    assert True\n',
    'tests/conftest.py': 'import pytest\n',
  });
  try {
    const result = detectTestDirs(f.root, { ecosystems: ['python'] });
    assert.equal(result.greenfield, false);
    assert.equal(result.primary.path, 'tests');
    assert.equal(result.primary.framework, 'pytest');
    assert.equal(result.conventions.language, 'python');
    assert.equal(result.conventions.fileNaming, 'test_{snake_feature}.py');
    assert.equal(result.conventions.indentation, '4-space');
  } finally {
    f.cleanup();
  }
});

test('ecosystem hints suppress a foreign convention', () => {
  const f = makeTree({
    'package.json': '{}',
    'tests/test_thing.py': 'def test_thing():\n    assert True\n',
  });
  try {
    const asNode = detectTestDirs(f.root, { ecosystems: ['node'] });
    assert.equal(asNode.greenfield, true, 'a python test file is not a node suite');

    const asPython = detectTestDirs(f.root, { ecosystems: ['python'] });
    assert.equal(asPython.greenfield, false);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Greenfield
// -------------------------------------------------------------------------------------------------

test('an empty project is greenfield and offers a suggestion, never a dir', () => {
  const f = makeTree({ 'README.md': '# empty\n' });
  try {
    const result = detectTestDirs(f.root);
    assert.equal(result.greenfield, true);
    assert.deepEqual(result.dirs, []);
    assert.equal(result.primary, null);
    assert.equal(result.suggestions.length, 1);
    assert.equal(result.suggestions[0].path, 'tests/e2e');
    assert.deepEqual(result.conventions.fileNamingSamples, []);
    assert.equal(result.conventions.language, null);
  } finally {
    f.cleanup();
  }
});

test('greenfield suggestions follow the detected ecosystem', () => {
  const cases = [
    [['node'], 'tests/e2e'],
    [['maven'], 'src/test/java'],
    [['python'], 'tests'],
    [['ruby'], 'spec'],
  ];
  const f = makeTree({ 'README.md': '# app\n' });
  try {
    for (const [ecosystems, expected] of cases) {
      const result = detectTestDirs(f.root, { ecosystems });
      assert.equal(result.suggestions[0].path, expected, `${ecosystems[0]} should suggest ${expected}`);
      assert.ok(result.suggestions[0].reason.includes(ecosystems[0]));
    }
  } finally {
    f.cleanup();
  }
});

test('a non-existent root is greenfield with a warning rather than a throw', () => {
  const result = detectTestDirs(path.join(os.tmpdir(), 'definitely-not-here-12345'));
  assert.equal(result.greenfield, true);
  assert.equal(result.dirs.length, 0);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /does not exist/);
});

// -------------------------------------------------------------------------------------------------
// Walk hygiene
// -------------------------------------------------------------------------------------------------

test('vendored, build and dot directories are never walked', () => {
  const f = makeTree({
    'package.json': '{}',
    'tests/e2e/real.spec.ts': PLAYWRIGHT_SPEC,
    'node_modules/pkg/tests/e2e/fake.spec.ts': PLAYWRIGHT_SPEC,
    'dist/tests/e2e/built.spec.ts': PLAYWRIGHT_SPEC,
    'target/tests/e2e/compiled.spec.ts': PLAYWRIGHT_SPEC,
    '.cache/tests/e2e/cached.spec.ts': PLAYWRIGHT_SPEC,
  });
  try {
    const paths = detectTestDirs(f.root, { ecosystems: ['node'] }).dirs.map((d) => d.path);
    assert.deepEqual(paths, ['tests/e2e']);
  } finally {
    f.cleanup();
  }
});

test('every emitted path is root-relative POSIX, and sampleFiles is capped at 5', () => {
  const files = { 'package.json': '{}', 'playwright.config.ts': PLAYWRIGHT_CONFIG };
  for (let i = 0; i < 9; i += 1) files[`tests/e2e/s${i}.spec.ts`] = PLAYWRIGHT_SPEC;
  const f = makeTree(files);
  try {
    const { primary } = detectTestDirs(f.root, { ecosystems: ['node'] });
    assert.equal(primary.path, 'tests/e2e');
    assert.equal(primary.fileCount, 9);
    assert.equal(primary.sampleFiles.length, 5);
    for (const s of primary.sampleFiles) {
      assert.ok(!s.includes('\\'), 'sample paths must be POSIX');
      assert.ok(!path.isAbsolute(s), 'sample paths must be root-relative');
    }
  } finally {
    f.cleanup();
  }
});

test('scanned reports the walk and does not report truncation for a small tree', () => {
  const f = makeTree({ 'package.json': '{}', 'tests/e2e/a.spec.ts': PLAYWRIGHT_SPEC });
  try {
    const { scanned } = detectTestDirs(f.root, { ecosystems: ['node'] });
    assert.ok(scanned.dirsVisited >= 3);
    assert.equal(scanned.truncated, false);
    assert.ok(scanned.maxDepthReached >= 2);
  } finally {
    f.cleanup();
  }
});

// -------------------------------------------------------------------------------------------------
// Convention-derivation internals
// -------------------------------------------------------------------------------------------------

test('normalizeConfigDir strips ./ prefixes, trailing slashes and glob tails', () => {
  const { normalizeConfigDir } = _internals;
  assert.equal(normalizeConfigDir('./tests/e2e'), 'tests/e2e');
  assert.equal(normalizeConfigDir('tests/e2e/'), 'tests/e2e');
  assert.equal(normalizeConfigDir('tests/e2e/**/*.spec.ts'), 'tests/e2e');
  assert.equal(normalizeConfigDir('cypress\\e2e'), 'cypress/e2e');
  assert.equal(normalizeConfigDir('  tests/e2e  '), 'tests/e2e');
  assert.equal(normalizeConfigDir('tests unit'), 'tests', 'space-separated list takes the first');
  assert.equal(normalizeConfigDir('.'), null);
  assert.equal(normalizeConfigDir(''), null);
  assert.equal(normalizeConfigDir(null), null);
});

test('indentation, quote style and import style are detected from real source text', () => {
  const { detectIndentation, detectQuoteStyle, detectImportStyle } = _internals;

  assert.equal(detectIndentation('function a() {\n  const x = 1;\n}\n'), '2-space');
  assert.equal(detectIndentation('def a():\n    return 1\n'), '4-space');
  assert.equal(detectIndentation('function a() {\n\tconst x = 1;\n}\n'), 'tab');
  assert.equal(detectIndentation('const a = 1;\n'), null);

  assert.equal(detectQuoteStyle("import x from 'y';\n"), 'single');
  assert.equal(detectQuoteStyle('import x from "y";\n'), 'double');
  assert.equal(detectQuoteStyle('const a = 1;\n'), null);

  assert.equal(detectImportStyle("import { test } from '@playwright/test';\n"), 'esm');
  assert.equal(detectImportStyle("const { test } = require('x');\n"), 'commonjs');
  assert.equal(detectImportStyle('from pytest import fixture\n'), 'python');
  assert.equal(detectImportStyle('import org.testng.annotations.Test;\n'), 'java');
});

test('describeNaming recognizes each ecosystem naming convention', () => {
  const { describeNaming } = _internals;
  assert.equal(describeNaming(['user-login.spec.ts']), '{kebab-feature}.spec.ts');
  assert.equal(describeNaming(['login.spec.ts']), '{feature}.spec.ts');
  assert.equal(describeNaming(['login.test.js']), '{feature}.test.js');
  assert.equal(describeNaming(['spec.cy.js']), '{feature}.cy.js');
  assert.equal(describeNaming(['test_login.py']), 'test_{snake_feature}.py');
  assert.equal(describeNaming(['login_test.py']), '{snake_feature}_test.py');
  assert.equal(describeNaming(['LoginTest.java']), '{PascalFeature}Test.java');
  assert.equal(describeNaming(['login_spec.rb']), '{snake_feature}_spec.rb');
  assert.equal(describeNaming(['login.feature']), '{kebab-feature}.feature');
});

// -------------------------------------------------------------------------------------------------
// detectProject composition
// -------------------------------------------------------------------------------------------------

test('detectProject composes stack and test dirs into an init recommendation', () => {
  const f = makeTree({
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '1.61.1' },
    }),
    'package-lock.json': JSON.stringify({
      lockfileVersion: 3,
      packages: { 'node_modules/@playwright/test': { version: '1.61.1' } },
    }),
    'playwright.config.ts': PLAYWRIGHT_CONFIG,
    'tests/e2e/login.spec.ts': PLAYWRIGHT_SPEC,
    'tests/e2e/pages/LoginPage.ts': 'export class LoginPage {}\n',
  });
  try {
    const result = detectProject(f.root);

    assert.equal(result.greenfield, false);
    assert.deepEqual(result.stack.ecosystems, ['node']);
    assert.ok(result.stack.frameworks.includes('Playwright'));
    assert.equal(result.automationRoot, 'tests/e2e');

    const rec = result.recommended;
    assert.equal(rec.framework, 'Playwright');
    assert.equal(rec.language, 'typescript');
    assert.equal(rec.scaffoldTestInfra, false);
    assert.deepEqual(rec.writeAllowlist, ['tests/e2e/**']);
    assert.equal(rec.testDirs.e2e, 'tests/e2e');
    assert.equal(rec.conventions.pageObjectDir, 'tests/e2e/pages');
  } finally {
    f.cleanup();
  }
});

test('detectProject omits an existing framework config from the write allowlist', () => {
  // The team already owns playwright.config.ts; modifying it needs per-run approval
  // (pipeline.md §13.3 item 3), never a standing allowlist entry.
  const withConfig = makeTree({
    'package.json': '{}',
    'playwright.config.ts': PLAYWRIGHT_CONFIG,
    'tests/e2e/a.spec.ts': PLAYWRIGHT_SPEC,
  });
  try {
    const rec = detectProject(withConfig.root).recommended;
    assert.deepEqual(rec.writeAllowlist, ['tests/e2e/**']);
    assert.ok(!rec.writeAllowlist.includes('playwright.config.ts'));
  } finally {
    withConfig.cleanup();
  }
});

test('detectProject includes the framework config file when the project has none', () => {
  const noConfig = makeTree({
    'package.json': JSON.stringify({ devDependencies: { '@playwright/test': '1.61.1' } }),
    'tests/e2e/a.spec.ts': PLAYWRIGHT_SPEC,
  });
  try {
    const result = detectProject(noConfig.root);
    assert.equal(result.recommended.framework, 'Playwright');
    assert.ok(
      result.recommended.writeAllowlist.includes('playwright.config.ts'),
      `expected the config file in the allowlist, got ${JSON.stringify(result.recommended.writeAllowlist)}`,
    );
  } finally {
    noConfig.cleanup();
  }
});

test('detectProject flags a greenfield project for test-infra scaffolding', () => {
  const f = makeTree({
    'package.json': JSON.stringify({ dependencies: { react: '18.2.0' } }),
    'src/App.tsx': 'export const App = () => null;\n',
  });
  try {
    const result = detectProject(f.root);
    assert.equal(result.greenfield, true);
    assert.equal(result.recommended.scaffoldTestInfra, true);
    assert.equal(result.automationRoot, 'tests/e2e', 'falls back to the suggestion');
    assert.equal(result.testDirs.primary, null);
  } finally {
    f.cleanup();
  }
});

test('detectProject can attach a Context7 query plan on request', () => {
  const f = makeTree({
    'package.json': JSON.stringify({ devDependencies: { '@playwright/test': '1.61.1' } }),
    'tests/e2e/a.spec.ts': PLAYWRIGHT_SPEC,
  });
  try {
    assert.equal(detectProject(f.root).plan, null);
    const withPlan = detectProject(f.root, { includeQueryPlan: true });
    assert.ok(withPlan.plan);
    assert.ok(Array.isArray(withPlan.plan.queries));
  } finally {
    f.cleanup();
  }
});
