// Project Detection — one call that answers everything a stage needs to know about a Target
// Project before generating automation into it.
//
// Composes the two detectors, in the order their information flows:
//   1. detectStack(root)      -> ecosystems, frameworks, pinned dependency versions
//   2. detectTestDirs(root)   -> where tests live and the conventions they are written with,
//                               narrowed by the ecosystems step 1 found
//
// The composition matters: passing detectStack's ecosystems into detectTestDirs is what stops a
// `tests/` directory from being read as a pytest suite in a pure-Node repository.
//
// This is a READ-ONLY technical fact-finder. Per pipeline.md §6 Rule 9 its output describes what
// the project IS — stack, layout, conventions — never what it SHOULD DO. Requirements come only
// from the approved Project Context.

const { detectStack } = require('./detectStack');
const { detectTestDirs } = require('./detectTestDirs');
const { planQueries } = require('./planQueries');

// A whole application repository is deeper than an automation package, so both detectors get a
// depth that reaches a Maven/SHAFT `src/test/java/com/company/pages` tree.
const PROJECT_MAX_DEPTH = 8;

/**
 * @param {string} root Absolute or cwd-relative path of the target project.
 * @param {{materialOnly?: boolean, maxDepth?: number, includeQueryPlan?: boolean, fs?: object,
 *          exclude?: string[]}} [options]
 *   `exclude` lists root-relative directory names to skip. The installed tool folder belongs here:
 *   it contains the platform's own `__tests__` directories, and without excluding it a re-detection
 *   would report the platform's tests as the host project's own test suite.
 * @returns {{root: string, greenfield: boolean, stack: object, testDirs: object,
 *   automationRoot: string|null, recommended: object, plan: object|null, warnings: string[]}}
 */
function detectProject(root, options = {}) {
  const maxDepth = Number.isInteger(options.maxDepth) ? options.maxDepth : PROJECT_MAX_DEPTH;
  const exclude = Array.isArray(options.exclude) ? options.exclude : [];

  const stack = detectStack(root, {
    materialOnly: options.materialOnly !== false,
    maxDepth,
  });

  const testDirs = detectTestDirs(root, {
    maxDepth,
    exclude,
    // Fall back to undefined (consider every ecosystem) when the stack scan found nothing — a
    // project can hold tests with no material dependency pinned yet.
    ecosystems: stack.ecosystems.length ? stack.ecosystems : undefined,
    fs: options.fs,
  });

  // Greenfield for the platform's purposes means "no test suite to extend" — a project can have a
  // full application stack and still be greenfield with respect to automation.
  const greenfield = testDirs.greenfield;

  const automationRoot = testDirs.primary
    ? testDirs.primary.path
    : (testDirs.suggestions[0] && testDirs.suggestions[0].path) || null;

  return {
    root: stack.root.split('\\').join('/'),
    greenfield,
    stack,
    testDirs,
    automationRoot,
    recommended: buildRecommendation(stack, testDirs, automationRoot),
    plan: options.includeQueryPlan ? planQueries(stack) : null,
    warnings: testDirs.warnings,
  };
}

/**
 * The concrete config values `agentic-testing init` proposes to a human. Advisory: init presents
 * these for confirmation and never applies them silently (pipeline.md §13.1).
 */
function buildRecommendation(stack, testDirs, automationRoot) {
  const testDirsByKind = {};
  for (const dir of testDirs.dirs) {
    const kind = dir.kind === 'unknown' ? 'tests' : dir.kind;
    if (!testDirsByKind[kind]) testDirsByKind[kind] = dir.path;
  }

  const writeAllowlist = automationRoot ? [`${automationRoot.replace(/\/$/, '')}/**`] : [];

  // A framework config file the platform may need to create or extend belongs in the allowlist too,
  // but only the one belonging to the resolved framework — never a blanket root-file permission.
  const configFile = frameworkConfigFile(stack, testDirs);
  if (configFile) writeAllowlist.push(configFile);

  return {
    mode: 'installed',
    automationRoot,
    testDirs: testDirsByKind,
    writeAllowlist,
    framework: resolveFramework(stack, testDirs),
    ecosystems: stack.ecosystems,
    language: testDirs.conventions.language,
    conventions: testDirs.conventions,
    scaffoldTestInfra: testDirs.greenfield,
  };
}

/**
 * Test-framework dependency names, mapped to the framework label the rest of the platform uses.
 * Needed because detectStack derives `frameworks` from CONFIG FILES only: a project that depends on
 * @playwright/test but has not written a playwright.config.ts yet reports no framework at all,
 * which is exactly the greenfield-test-infra case (pipeline.md §13.6).
 */
const FRAMEWORK_BY_DEPENDENCY = [
  { match: /(?:^|[/@-])playwright/i, framework: 'Playwright' },
  { match: /(?:^|[/@-])cypress/i, framework: 'Cypress' },
  { match: /shaft/i, framework: 'SHAFT' },
  { match: /webdriverio|(?:^|[/@-])wdio/i, framework: 'WebdriverIO' },
  { match: /testng/i, framework: 'TestNG' },
  { match: /pytest/i, framework: 'pytest' },
  { match: /(?:^|[/@-])selenium/i, framework: 'Selenium' },
  { match: /codeception/i, framework: 'Codeception' },
  { match: /(?:^|[/@-])karate/i, framework: 'Karate' },
  { match: /robotframework/i, framework: 'RobotFramework' },
  { match: /(?:^|[/@-])junit/i, framework: 'JUnit' },
  { match: /(?:^|[/@-])vitest/i, framework: 'Vitest' },
  { match: /(?:^|[/@-])jest/i, framework: 'Jest' },
];

/**
 * The framework to generate against, strongest signal first: the resolved test directory's own
 * framework, then any other detected directory's, then a repo-wide config file, then — last — a
 * declared dependency.
 */
function resolveFramework(stack, testDirs) {
  if (testDirs.primary && testDirs.primary.framework) return testDirs.primary.framework;
  const withFramework = testDirs.dirs.find((d) => d.framework);
  if (withFramework) return withFramework.framework;
  if (stack.frameworks.length) return stack.frameworks[0];

  for (const spec of FRAMEWORK_BY_DEPENDENCY) {
    if (stack.dependencies.some((d) => spec.match.test(d.library))) return spec.framework;
  }
  return null;
}

const FRAMEWORK_CONFIG_FILES = {
  Playwright: 'playwright.config.ts',
  Cypress: 'cypress.config.ts',
  WebdriverIO: 'wdio.conf.ts',
  pytest: 'pytest.ini',
  TestNG: 'testng.xml',
};

/**
 * The config file for the resolved framework, but ONLY when the project does not already have one:
 * an existing config is the team's file, and modifying it needs its own per-run approval
 * (pipeline.md §13.3 item 3), not a standing allowlist entry.
 */
function frameworkConfigFile(stack, testDirs) {
  const framework = resolveFramework(stack, testDirs);
  const candidate = FRAMEWORK_CONFIG_FILES[framework];
  if (!candidate) return null;
  const alreadyPresent = stack.configs.some((c) => c.framework === framework);
  return alreadyPresent ? null : candidate;
}

module.exports = {
  detectProject,
  PROJECT_MAX_DEPTH,
  FRAMEWORK_CONFIG_FILES,
  FRAMEWORK_BY_DEPENDENCY,
  _internals: { buildRecommendation, resolveFramework, frameworkConfigFile },
};
