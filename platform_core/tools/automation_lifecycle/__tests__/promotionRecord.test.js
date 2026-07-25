const test = require('node:test');
const assert = require('node:assert/strict');
const { renderPromotionRecord } = require('../promotionRecord');

test('renderPromotionRecord includes every required field from pipeline.md §12', () => {
  const md = renderPromotionRecord({
    promotionStatus: 'Merged',
    mergeDate: '2026-07-24T12:00:00.000Z',
    approvedBy: 'Aymoon',
    sourceRun: 'RUN-20260712-001',
    workspaceDestination: 'platform_core_data/workspace/automation/shaft/tests_SHAFT/',
    filesAdded: ['New.java'],
    filesModified: ['Existing.java'],
    filesDeleted: [],
    filesRenamed: [{ from: 'Old.java', to: 'New2.java' }],
    discardedUntracked: ['target/Build.class'],
    conflictsDetected: [],
    conflictsResolved: [],
    mergeResult: 'Success',
    notes: 'First real merge for this package.',
  });

  for (const needle of [
    'Promotion Status:** Merged',
    'Merge Date:** 2026-07-24T12:00:00.000Z',
    'Approved By:** Aymoon',
    'Source Run:** RUN-20260712-001',
    'Workspace Destination:** platform_core_data/workspace/automation/shaft/tests_SHAFT/',
    '- New.java',
    '- Existing.java',
    'Old.java → New2.java',
    '- target/Build.class',
    'First real merge for this package.',
  ]) {
    assert.ok(md.includes(needle), `expected output to include: ${needle}`);
  }
});

test('renderPromotionRecord renders "(none)" for every empty list rather than an empty section', () => {
  const md = renderPromotionRecord({
    promotionStatus: 'Bootstrap Migration',
    mergeDate: '2026-07-24T12:00:00.000Z',
    approvedBy: 'N/A — Bootstrap Migration',
    sourceRun: 'RUN-20260712-001',
    workspaceDestination: 'platform_core_data/workspace/automation/shaft/tests_SHAFT/',
    filesAdded: [],
    filesModified: [],
    filesDeleted: [],
    filesRenamed: [],
    discardedUntracked: [],
    conflictsDetected: [],
    conflictsResolved: [],
    mergeResult: 'Success',
  });

  // Added/Modified/Deleted/Renamed/Discarded/ConflictsDetected/ConflictsResolved = 7 empty sections.
  const noneCount = (md.match(/- \(none\)/g) || []).length;
  assert.equal(noneCount, 7);
  assert.ok(/\n\(none\)\n/.test(md)); // Notes falls back too, without the list-item dash
});
