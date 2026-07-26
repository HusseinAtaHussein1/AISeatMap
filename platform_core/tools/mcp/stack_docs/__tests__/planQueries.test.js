const test = require('node:test');
const assert = require('node:assert');

const { planQueries, classify } = require('../planQueries');

function stackOf(dependencies) {
  return { dependencies, ecosystems: [], frameworks: [], sources: [], unpinned: [] };
}

test('classify maps libraries onto documentation roles', () => {
  assert.strictEqual(classify('@playwright/test').role, 'browser-automation');
  assert.strictEqual(classify('SHAFT_ENGINE').role, 'browser-automation');
  assert.strictEqual(classify('testng').role, 'test-runner');
  assert.strictEqual(classify('allure-testng').role, 'reporting');
  assert.strictEqual(classify('rest-assured').role, 'api-client');
  assert.strictEqual(classify('dayjs').role, 'utility');
});

test('allure classifies as reporting, not as its runner suffix', () => {
  // 'allure-testng' contains "testng"; the reporting rule must win via rule ordering.
  const { role, docName } = classify('allure-testng');
  assert.strictEqual(role, 'reporting');
  assert.strictEqual(docName, 'Allure');
});

test('every planned query carries the resolved version and one concept', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: '@playwright/test', version: '1.61.1', pinned: true, source: 'package-lock.json' },
  ]));

  assert.ok(plan.queries.length > 1, 'a primary role gets its full concept list');
  for (const q of plan.queries) {
    assert.strictEqual(q.version, '1.61.1');
    assert.match(q.question, /version 1\.61\.1/);
    assert.match(q.resolveQuery, /v1\.61\.1/);
    assert.ok(q.concept && q.concept.length > 0);
  }
  // One concept per query — no combined multi-concept question.
  const concepts = plan.queries.map((q) => q.concept);
  assert.strictEqual(new Set(concepts).size, concepts.length);
});

test('secondary roles get one question, primary roles get several', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: 'playwright', version: '1.61.1', pinned: true, source: 'p' },
    { ecosystem: 'node', library: 'dayjs', version: '1.11.10', pinned: true, source: 'p' },
  ]));

  const playwrightQueries = plan.queries.filter((q) => q.library === 'playwright');
  const dayjsQueries = plan.queries.filter((q) => q.library === 'dayjs');

  assert.ok(playwrightQueries.length >= 4);
  assert.strictEqual(dayjsQueries.length, 1);
});

test('sibling packages resolving to the same docs are asked once', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: 'playwright', version: '1.61.1', pinned: true, source: 'p' },
    { ecosystem: 'node', library: 'playwright-core', version: '1.61.1', pinned: true, source: 'p' },
  ]));

  const concepts = plan.queries.map((q) => q.concept);
  assert.strictEqual(new Set(concepts).size, concepts.length, 'no duplicate concept questions');

  // Both dependencies are still recorded as motivating the shared query.
  const first = plan.queries[0];
  assert.deepStrictEqual([...first.libraries].sort(), ['playwright', 'playwright-core']);
});

test('the same library at two different versions is asked separately', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: 'playwright', version: '1.61.1', pinned: true, source: 'a' },
    { ecosystem: 'maven', library: 'playwright-java', version: '1.44.0', pinned: true, source: 'b' },
  ]));

  const versions = new Set(plan.queries.map((q) => q.version));
  assert.deepStrictEqual([...versions].sort(), ['1.44.0', '1.61.1']);
});

test('unpinned dependencies produce an explicit note', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: 'playwright', version: '1.61.1', pinned: false, source: 'package.json' },
  ]));

  assert.ok(plan.notes.some((n) => /Unpinned/.test(n) && /playwright/.test(n)));
});

test('an empty stack notes a documentation gap rather than planning nothing silently', () => {
  const plan = planQueries(stackOf([]));

  assert.deepStrictEqual(plan.queries, []);
  assert.ok(plan.notes.some((n) => /documentation gap/.test(n)));
});

test('maxLibraries keeps primary roles and logs what it dropped', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: 'dayjs', version: '1.11.10', pinned: true, source: 'p' },
    { ecosystem: 'node', library: 'faker', version: '9.0.0', pinned: true, source: 'p' },
    { ecosystem: 'node', library: 'playwright', version: '1.61.1', pinned: true, source: 'p' },
  ]), { maxLibraries: 1 });

  assert.strictEqual(plan.libraries.length, 1);
  assert.strictEqual(plan.libraries[0].library, 'playwright');
  assert.strictEqual(plan.skipped.length, 2);
  assert.ok(plan.notes.some((n) => /dropped by maxLibraries/.test(n)));
});

test('maxConceptsPerLibrary caps the per-library question count', () => {
  const plan = planQueries(stackOf([
    { ecosystem: 'node', library: 'playwright', version: '1.61.1', pinned: true, source: 'p' },
  ]), { maxConceptsPerLibrary: 2 });

  assert.strictEqual(plan.queries.length, 2);
});
