const test = require('node:test');
const assert = require('node:assert/strict');

const { ReportModelError, normalizeModel } = require('../model');

function baseModel(overrides = {}) {
  return {
    title: 'QA Execution Report',
    testCases: {
      categories: [
        {
          key: 'positive',
          cases: [
            { title: 'A passing case', status: 'PASS' },
            { title: 'A failing case', status: 'FAIL' },
          ],
        },
      ],
    },
    ...overrides,
  };
}

test('normalizeModel requires a title', () => {
  assert.throws(() => normalizeModel({}), ReportModelError);
  assert.throws(() => normalizeModel({ title: '   ' }), /title: must be a non-empty string/);
});

test('normalizeModel rejects a non-object model', () => {
  assert.throws(() => normalizeModel('report'), /model: must be an object/);
  assert.throws(() => normalizeModel([]), /model: must be an object/);
});

test('normalizeModel defaults the status vocabulary to PASS/FAIL/BLOCKED', () => {
  const model = normalizeModel(baseModel());
  assert.deepEqual(model.statuses.map((s) => s.key), ['PASS', 'FAIL', 'BLOCKED']);
  assert.deepEqual(model.statuses.map((s) => s.tone), ['pass', 'fail', 'blocked']);
});

test('normalizeModel accepts a custom status vocabulary', () => {
  const model = normalizeModel(baseModel({
    statuses: [
      { key: 'PASSED', label: 'Passed', tone: 'pass' },
      { key: 'ERROR', label: 'Errored', tone: 'fail' },
      { key: 'SKIPPED', label: 'Skipped', tone: 'neutral' },
    ],
    testCases: {
      categories: [{ key: 'flow', cases: [{ title: 'X', status: 'SKIPPED' }] }],
    },
  }));
  assert.deepEqual(model.statuses.map((s) => s.key), ['PASSED', 'ERROR', 'SKIPPED']);
});

test('normalizeModel rejects a test case whose status is not declared', () => {
  assert.throws(
    () => normalizeModel(baseModel({
      testCases: { categories: [{ key: 'positive', cases: [{ title: 'X', status: 'PARTIAL' }] }] },
    })),
    /is not declared in statuses\[\]/,
  );
});

test('normalizeModel rejects duplicate status and category keys', () => {
  assert.throws(
    () => normalizeModel(baseModel({ statuses: [{ key: 'PASS' }, { key: 'PASS' }] })),
    /duplicate status key "PASS"/,
  );
  assert.throws(
    () => normalizeModel(baseModel({
      testCases: {
        categories: [
          { key: 'positive', cases: [{ title: 'A', status: 'PASS' }] },
          { key: 'positive', cases: [{ title: 'B', status: 'PASS' }] },
        ],
      },
    })),
    /duplicate category key "positive"/,
  );
});

test('normalizeModel rejects an unknown tone by name', () => {
  assert.throws(
    () => normalizeModel(baseModel({ statuses: [{ key: 'PASS', tone: 'chartreuse' }] })),
    /unknown tone "chartreuse"/,
  );
});

test('normalizeModel derives summary counts, total, and donut from the test cases', () => {
  const model = normalizeModel(baseModel());
  assert.equal(model.summary.total, 2);
  assert.deepEqual(
    model.summary.counts.map((c) => [c.status, c.value]),
    [['PASS', 1], ['FAIL', 1], ['BLOCKED', 0]],
  );
  assert.equal(model.summary.donut.percent, 50);
  assert.equal(model.summary.donut.label, 'pass rate');
  assert.equal(model.summary.donut.base, 2);
});

test('normalizeModel lets an explicit total override the derived one', () => {
  // A run can execute a subset of a larger declared suite; the card should say so.
  const model = normalizeModel(baseModel({ summary: { total: 60 } }));
  assert.equal(model.summary.total, 60);
  assert.equal(model.summary.donut.base, 2);
});

test('normalizeModel honours an explicit donut focus and percent', () => {
  const model = normalizeModel(baseModel({
    summary: { donut: { focus: 'FAIL', percent: 12, label: 'defect rate' } },
  }));
  assert.equal(model.summary.donut.percent, 12);
  assert.equal(model.summary.donut.label, 'defect rate');
});

test('normalizeModel drops the donut when nothing has been counted', () => {
  const model = normalizeModel({
    title: 'Empty run',
    summary: { counts: [{ status: 'PASS', value: 0 }, { status: 'FAIL', value: 0 }] },
  });
  assert.equal(model.summary.donut, null);
});

test('normalizeModel requires explicit counts when there are no test cases', () => {
  assert.throws(
    () => normalizeModel({ title: 'No cases' }),
    /summary\.counts: is required when the report has no test cases/,
  );
});

test('normalizeModel accepts summary:null for a report with no summary block', () => {
  const model = normalizeModel({ title: 'Notes only', summary: null, sections: [] });
  assert.equal(model.summary, null);
});

test('normalizeModel keeps meta field order, treating an array entry as one row', () => {
  const model = normalizeModel(baseModel({
    meta: {
      fields: [
        { label: 'Scope', value: 'S' },
        [{ label: 'A', value: '1' }, { label: 'B', value: '2' }],
      ],
    },
  }));
  assert.deepEqual(model.meta.fields.map((f) => f.kind), ['field', 'row']);
  assert.equal(model.meta.fields[1].fields.length, 2);
});

test('normalizeModel rejects a rich value that sets both text and html', () => {
  assert.throws(
    () => normalizeModel(baseModel({ meta: { fields: [{ label: 'X', value: { text: 'a', html: '<b>a</b>' } }] } })),
    /must set either "text" or "html", not both/,
  );
});

test('normalizeModel normalizes a string evidence into a titled block', () => {
  const model = normalizeModel(baseModel({
    testCases: {
      categories: [{ key: 'positive', cases: [{ title: 'X', status: 'PASS', evidence: 'screenshot.png' }] }],
    },
  }));
  const evidence = model.testCases.categories[0].cases[0].evidence;
  assert.equal(evidence.summary, 'Evidence');
  assert.equal(evidence.body.text, 'screenshot.png');
});

test('normalizeModel requires a header value unless the header is redacted', () => {
  const build = (header) => normalizeModel(baseModel({
    testCases: {
      categories: [{
        key: 'positive',
        cases: [{
          title: 'X',
          status: 'PASS',
          exchanges: [{ request: { headers: [header] } }],
        }],
      }],
    },
  }));

  assert.throws(() => build({ name: 'Authorization' }), /is required unless the header is marked redacted/);
  const model = build({ name: 'Authorization', redacted: true });
  assert.equal(model.testCases.categories[0].cases[0].exchanges[0].request.headers[0].value, null);
});

test('normalizeModel rejects an exchange carrying neither request nor response', () => {
  assert.throws(
    () => normalizeModel(baseModel({
      testCases: {
        categories: [{ key: 'positive', cases: [{ title: 'X', status: 'PASS', exchanges: [{ label: 'only a label' }] }] }],
      },
    })),
    /must carry a request, a response, or both/,
  );
});

test('normalizeModel orders the test-case detail blocks the suite reads in', () => {
  const model = normalizeModel(baseModel({
    testCases: {
      categories: [{
        key: 'positive',
        cases: [{
          title: 'X',
          status: 'PASS',
          detail: {
            expected: 'It works',
            preconditions: 'Logged in',
            steps: ['Open', 'Click'],
            tags: ['smoke', 'p1'],
          },
        }],
      }],
    },
  }));
  const detail = model.testCases.categories[0].cases[0].detail;
  assert.deepEqual(detail.blocks.map((b) => b.heading), ['Preconditions', 'Steps', 'Expected Result', 'Tags']);
  assert.equal(detail.blocks[1].steps.length, 2);
  assert.equal(detail.blocks[3].value.text, 'smoke, p1');
});

test('normalizeModel returns null detail when nothing was supplied', () => {
  const model = normalizeModel(baseModel({
    testCases: { categories: [{ key: 'positive', cases: [{ title: 'X', status: 'PASS', detail: {} }] }] },
  }));
  assert.equal(model.testCases.categories[0].cases[0].detail, null);
});

test('normalizeModel rejects an unknown section type', () => {
  assert.throws(
    () => normalizeModel(baseModel({ sections: [{ type: 'timeline', title: 'Timeline' }] })),
    /unknown section type "timeline"/,
  );
});

test('normalizeModel normalizes each supported section type', () => {
  const model = normalizeModel(baseModel({
    sections: [
      { type: 'findings', title: 'Findings', items: [{ kind: 'Defect', tone: 'blocked', body: 'Broken' }] },
      { type: 'cleanup', title: 'Cleanup', items: [{ body: 'Revert AGENCY-1' }] },
      { type: 'notes', title: 'Notes', blocks: ['Plain', { kind: 'ul', items: ['One'] }] },
    ],
  }));
  assert.deepEqual(model.sections.map((s) => s.type), ['findings', 'cleanup', 'notes']);
  assert.equal(model.sections[0].items[0].tone, 'blocked');
  assert.deepEqual(model.sections[2].blocks.map((b) => b.kind), ['p', 'ul']);
});

test('normalizeModel defaults a findings badge tone to accent', () => {
  const model = normalizeModel(baseModel({
    sections: [{ type: 'findings', title: 'Findings', badges: [{ value: 3, label: 'Defects' }], items: [] }],
  }));
  assert.equal(model.sections[0].badges[0].tone, 'accent');
});

test('normalizeModel assigns a default icon per known category key', () => {
  const model = normalizeModel(baseModel({
    testCases: {
      categories: [
        { key: 'security', cases: [{ title: 'X', status: 'PASS' }] },
        { key: 'made-up-key', cases: [{ title: 'Y', status: 'PASS' }] },
      ],
    },
  }));
  assert.equal(model.testCases.categories[0].icon, '\u{1F512}');
  assert.equal(model.testCases.categories[1].icon, '•');
});
