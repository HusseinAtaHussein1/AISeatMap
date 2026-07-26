// Documentation Query Planning — turns a detected stack into the concrete list of Context7 lookups
// Stage 5 should perform before generating automation.
//
// This module plans; it never fetches. It has no network access and no MCP dependency: the Skill
// takes this plan and issues `resolve-library-id` / `query-docs` calls itself, per
// platform_core/tools/mcp/README.md §2.3. Keeping the plan deterministic and inspectable means the
// Stack Documentation Context artifact can record exactly what was asked before anything is asked.
//
// One concept per query is deliberate — the global Context7 rule is that combined multi-concept
// questions dilute ranking and return shallow results for each concept.

// Concepts worth asking about per library role. Ordered most- to least-important so a caller
// trimming the plan for cost drops the least valuable questions first.
const CONCEPTS_BY_ROLE = {
  'browser-automation': [
    'recommended locator strategies and accessibility-first selectors',
    'auto-waiting and web-first assertions, and which explicit waits are discouraged',
    'test fixtures, setup/teardown, and browser context isolation',
    'network interception and request mocking',
    'screenshots, tracing, and failure artifacts',
  ],
  'test-runner': [
    'test declaration, grouping, and parameterized/data-driven tests',
    'setup/teardown lifecycle hooks and their execution order',
    'parallel execution and test isolation configuration',
    'tagging/filtering tests and skip/conditional execution',
  ],
  assertion: [
    'assertion API surface and soft vs. hard assertion behavior',
    'asserting on asynchronous or eventually-consistent values',
  ],
  reporting: [
    'configuration and wiring into the test runner',
    'attaching evidence (screenshots, logs, steps) to a report',
  ],
  'api-client': [
    'request construction, authentication, and response assertions',
    'JSON schema and response body validation',
  ],
  'test-data': [
    'reading structured test data and data-driven parameterization',
  ],
  utility: [
    'core API surface and idiomatic usage',
  ],
};

// Maps a dependency name onto its role and canonical documentation name. Matching is
// substring-based and first-match-wins, so order matters: more specific patterns come first.
const ROLE_RULES = [
  [/allure/i, 'reporting', 'Allure'],
  [/extentreports/i, 'reporting', 'ExtentReports'],
  [/reportportal/i, 'reporting', 'ReportPortal'],
  [/axe/i, 'utility', 'axe-core'],
  [/shaft/i, 'browser-automation', 'SHAFT Engine'],
  [/playwright/i, 'browser-automation', 'Playwright'],
  [/selenium/i, 'browser-automation', 'Selenium'],
  [/cypress/i, 'browser-automation', 'Cypress'],
  [/puppeteer/i, 'browser-automation', 'Puppeteer'],
  [/webdriverio|^wdio/i, 'browser-automation', 'WebdriverIO'],
  [/appium/i, 'browser-automation', 'Appium'],
  [/rest-?assured/i, 'api-client', 'REST Assured'],
  [/supertest/i, 'api-client', 'SuperTest'],
  [/httpx|^requests$/i, 'api-client', 'HTTPX'],
  [/axios/i, 'api-client', 'Axios'],
  [/okhttp/i, 'api-client', 'OkHttp'],
  [/testng/i, 'test-runner', 'TestNG'],
  [/junit/i, 'test-runner', 'JUnit'],
  [/pytest/i, 'test-runner', 'pytest'],
  [/cucumber|specflow/i, 'test-runner', 'Cucumber'],
  [/karate/i, 'test-runner', 'Karate'],
  [/robotframework/i, 'test-runner', 'Robot Framework'],
  [/nunit/i, 'test-runner', 'NUnit'],
  [/xunit/i, 'test-runner', 'xUnit'],
  [/jest/i, 'test-runner', 'Jest'],
  [/vitest/i, 'test-runner', 'Vitest'],
  [/mocha/i, 'test-runner', 'Mocha'],
  [/jasmine/i, 'test-runner', 'Jasmine'],
  [/assertj/i, 'assertion', 'AssertJ'],
  [/hamcrest/i, 'assertion', 'Hamcrest'],
  [/^chai/i, 'assertion', 'Chai'],
  [/faker|chance/i, 'test-data', 'Faker'],
  [/openpyxl|exceljs|\bpoi\b/i, 'test-data', 'Excel library'],
  [/csv-parse|papaparse/i, 'test-data', 'CSV parser'],
  [/dayjs|luxon|date-fns|moment/i, 'utility', 'date library'],
  [/testcontainers/i, 'utility', 'Testcontainers'],
  [/zod|ajv|jsonschema/i, 'utility', 'schema validation'],
];

// Roles that justify their full concept list; everything else gets its single most useful question
// unless the caller raises maxConceptsPerLibrary.
const PRIMARY_ROLES = new Set(['browser-automation', 'test-runner']);

/**
 * Classifies a dependency into a documentation role.
 * @param {string} library
 * @returns {{role: string, docName: string}}
 */
function classify(library) {
  for (const [pattern, role, docName] of ROLE_RULES) {
    if (pattern.test(library)) return { role, docName };
  }
  return { role: 'utility', docName: library };
}

/**
 * Builds the Context7 query plan for a detected stack.
 *
 * Each planned query carries the version explicitly, because a version-specific library ID is the
 * entire reason the stack was extracted (README.md §2.3 step 2). Unpinned dependencies are still
 * planned, but flagged so the artifact can say the version was a range rather than a fact.
 *
 * @param {object} stack Result of `detectStack()`.
 * @param {{maxConceptsPerLibrary?: number, maxLibraries?: number}} [options]
 * @returns {{libraries: Array<object>, queries: Array<object>, skipped: Array<object>, notes: string[]}}
 */
function planQueries(stack, options = {}) {
  const { maxConceptsPerLibrary, maxLibraries } = options;
  const dependencies = (stack && stack.dependencies) || [];

  const libraries = dependencies.map((dep) => {
    const { role, docName } = classify(dep.library);
    return { ...dep, role, docName };
  });

  // Primary roles first so a maxLibraries cap keeps the framework and runner over a date helper.
  libraries.sort((a, b) => {
    const aPrimary = PRIMARY_ROLES.has(a.role) ? 0 : 1;
    const bPrimary = PRIMARY_ROLES.has(b.role) ? 0 : 1;
    return aPrimary - bPrimary || a.library.localeCompare(b.library);
  });

  const kept = typeof maxLibraries === 'number' ? libraries.slice(0, maxLibraries) : libraries;
  const skipped = typeof maxLibraries === 'number'
    ? libraries.slice(maxLibraries).map((lib) => ({
      library: lib.library,
      reason: `beyond maxLibraries=${maxLibraries}`,
    }))
    : [];

  const queries = [];
  // Sibling packages routinely resolve to the same documentation (playwright / playwright-core,
  // allure-testng / allure-java-commons). Keyed by docName+version+concept so the same question is
  // asked once, with every dependency that motivated it recorded on the query.
  const seen = new Map();
  for (const lib of kept) {
    const all = CONCEPTS_BY_ROLE[lib.role] || CONCEPTS_BY_ROLE.utility;
    const defaultLimit = PRIMARY_ROLES.has(lib.role) ? all.length : 1;
    const limit = typeof maxConceptsPerLibrary === 'number' ? maxConceptsPerLibrary : defaultLimit;
    for (const concept of all.slice(0, limit)) {
      const key = `${lib.docName}@${lib.version}::${concept}`;
      const existing = seen.get(key);
      if (existing) {
        if (!existing.libraries.includes(lib.library)) existing.libraries.push(lib.library);
        continue;
      }
      const query = {
        library: lib.library,
        libraries: [lib.library],
        docName: lib.docName,
        role: lib.role,
        version: lib.version,
        pinned: lib.pinned,
        // `resolveQuery` goes to resolve-library-id (name + the question, never the name alone).
        resolveQuery: `${lib.docName} ${lib.version !== 'unknown' ? `v${lib.version} ` : ''}— ${concept}`,
        // `question` goes to query-docs once an ID is selected.
        question: `In ${lib.docName}${lib.version !== 'unknown' ? ` version ${lib.version}` : ''}, what are the current recommended practices for ${concept}?`,
        concept,
      };
      seen.set(key, query);
      queries.push(query);
    }
  }

  const notes = [];
  const unpinned = kept.filter((lib) => !lib.pinned).map((lib) => lib.library);
  if (unpinned.length) {
    notes.push(`Unpinned (range-only) versions — record as unpinned in the artifact, do not present the range as a resolved version: ${unpinned.join(', ')}`);
  }
  if (!kept.length) {
    notes.push('No material dependencies detected — record a documentation gap rather than proceeding as if the stack were verified.');
  }
  if (skipped.length) {
    notes.push(`${skipped.length} library/libraries dropped by maxLibraries — log the omission per README.md "no silent caps".`);
  }

  return { libraries: kept, queries, skipped, notes };
}

module.exports = {
  planQueries,
  classify,
  CONCEPTS_BY_ROLE,
  ROLE_RULES,
};
