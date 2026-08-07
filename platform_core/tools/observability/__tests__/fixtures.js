// Shared fixtures for the observability tests.
//
// NOT a test file (the runner globs `*.test.js`), and deliberately so: every test that needs a
// synthetic run needs the SAME synthetic run, or the exact-number assertions in aggregator.test.js
// stop meaning anything.
//
// Everything here is fixture data. No value in this file came from a real run, and nothing in it is
// ever written into platform_core_data/.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const RUN = 'run-999__2026-08-07_09-00-00__UserStory__FIXTURE';

/**
 * A throwaway data root shaped like platform_core_data/.
 *
 * The data root is nested one level inside the temp directory, so its PARENT is a private fixture
 * project rather than the system temp directory itself. That matters: a test that writes a
 * `platform.config.json` beside its data root would otherwise drop an installation marker straight
 * into `os.tmpdir()`, where `platform_paths.findToolRoot` — which walks upward looking for exactly
 * that marker — would find it from every other suite's temp directory.
 */
function makeDataRoot() {
  const projectRoot = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'obs-test-')), 'project');
  const root = path.join(projectRoot, 'platform_core_data');
  fs.mkdirSync(path.join(root, 'runs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'modules'), { recursive: true });
  return root;
}

function makeRun(dataRoot, folder = RUN, runJson = {}) {
  const dir = path.join(dataRoot, 'runs', folder, 'metadata');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    folderName: folder,
    index: 999,
    scope: 'UserStory',
    target: 'FIXTURE',
    workflow: 'user_story_run',
    createdBy: 'Run Manager',
    startedTime: '2026-08-07T09:00:00.000Z',
    status: 'Preparing',
    ...runJson,
  }, null, 2));
  return path.join(dataRoot, 'runs', folder);
}

/** A minimal but valid `TestCases_{Module}.md` with a known Review/Automation distribution. */
function makeTestSuite(dataRoot, module, rows) {
  const dir = path.join(dataRoot, 'modules', module, 'test_design');
  fs.mkdirSync(dir, { recursive: true });
  const index = rows.map((r) => `| ${r.id} | ${r.title} | Atomic | P1 | Atomic | ${r.review} | ${r.automation} |`);
  // The `**Field:** value` shape the real suites use and `parseTestCases` expects — deliberately
  // copied from platform_core_data/modules/branch/test_design/TestCases_Branch.md rather than
  // invented, so a parser change breaks this fixture instead of silently bypassing it.
  const bodies = rows.map((r) => [
    '', `### ${r.id} — ${r.title}`, '',
    '**Objective:** Fixture objective.', '',
    '**Preconditions:** None.', '',
    '**Test Data:** None.', '',
    '**Steps:**', '', '1. Do the thing.', '',
    '**Expected Result:** The thing happens.',
    '**Priority:** P1',
    '**Tags:** Atomic',
    `**Review:** ${r.review}`,
    `**Automation:** ${r.automation}`,
  ].join('\n'));

  fs.writeFileSync(path.join(dir, `TestCases_${module}.md`), [
    `# Manual Test Suite — ${module}`, '',
    '## Case Index', '',
    '| Test Case ID | Title | Tier | Priority | Tags | Review | Automation |',
    '|---|---|---|---|---|---|---|',
    ...index, '',
    '## Test Cases',
    ...bodies, '',
  ].join('\n'));
}

/**
 * The canonical fixture event stream: one complete run, with known counts.
 *
 * Deliberately includes a FAILED tool call, a retry, a validation failure, an unresolved human
 * decision, a first-attempt failure that is later repaired, and a Safety block — so the tests
 * exercise the interesting paths rather than a happy run where every counter is zero.
 */
function fixtureEvents(runId = RUN) {
  const t = (n) => new Date(Date.UTC(2026, 7, 7, 9, 0, 0) + n * 1000).toISOString();
  const e = [];
  let seq = 0;
  const push = (o) => {
    seq += 1;
    e.push({ eventId: `evt-${String(seq).padStart(6, '0')}-fixture0`, schemaVersion: 1, seq, runId, ...o });
  };

  push({ timestamp: t(0), type: 'RUN_STARTED', source: 'skill', spanId: 'spn-run-000001' });

  // Stage 3 — Test Design: 100s, one skill, one tool call, one validation, 6 test cases
  push({ timestamp: t(10), type: 'STAGE_STARTED', source: 'skill', stage: '3', spanId: 'spn-stage-3', parentSpanId: 'spn-run-000001' });
  push({ timestamp: t(12), type: 'SKILL_STARTED', source: 'skill', stage: '3', skill: 'test-design-skill', spanId: 'spn-skill-3', parentSpanId: 'spn-stage-3' });
  push({ timestamp: t(20), type: 'TOOL_STARTED', source: 'platform-tool', stage: '3', tool: 'test_suite_export', spanId: 'spn-tool-1', parentSpanId: 'spn-skill-3' });
  push({ timestamp: t(25), type: 'TOOL_COMPLETED', source: 'platform-tool', tool: 'test_suite_export', spanId: 'spn-tool-1' });
  push({ timestamp: t(30), type: 'VALIDATION_PASSED', source: 'platform-tool', stage: '3', kind: 'export-check' });
  push({ timestamp: t(40), type: 'TEST_CASES_GENERATED', source: 'skill', stage: '3', count: 6, module: 'fixture' });
  push({ timestamp: t(45), type: 'ARTIFACT_CREATED', source: 'skill', stage: '3', artifact: 'test_design/TestCases_fixture.md', artifactClass: 'test-design' });
  push({ timestamp: t(50), type: 'HUMAN_DECISION_REQUESTED', source: 'skill', stage: '3', decisionId: 'HD-1', category: 'Review' });
  push({ timestamp: t(80), type: 'HUMAN_DECISION_RESOLVED', source: 'skill', stage: '3', decisionId: 'HD-1', status: 'Approved' });
  push({ timestamp: t(100), type: 'SKILL_COMPLETED', source: 'skill', skill: 'test-design-skill', spanId: 'spn-skill-3' });
  push({ timestamp: t(110), type: 'STAGE_COMPLETED', source: 'skill', stage: '3', spanId: 'spn-stage-3' });

  // Stage 4A — Automation: 90s, a failing tool call with a retry, a compile
  push({ timestamp: t(120), type: 'STAGE_STARTED', source: 'skill', stage: '4A', spanId: 'spn-stage-4a', parentSpanId: 'spn-run-000001' });
  push({ timestamp: t(125), type: 'TOOL_STARTED', source: 'platform-tool', stage: '4A', tool: 'module_manager', spanId: 'spn-tool-2', parentSpanId: 'spn-stage-4a' });
  push({ timestamp: t(130), type: 'TOOL_FAILED', source: 'platform-tool', tool: 'module_manager', spanId: 'spn-tool-2', errorType: 'VALIDATION_ERROR', retryable: true });
  push({ timestamp: t(131), type: 'RETRY_OCCURRED', source: 'platform-tool', stage: '4A', tool: 'module_manager' });
  push({ timestamp: t(135), type: 'TOOL_STARTED', source: 'platform-tool', stage: '4A', tool: 'module_manager', spanId: 'spn-tool-3', parentSpanId: 'spn-stage-4a' });
  push({ timestamp: t(140), type: 'TOOL_COMPLETED', source: 'platform-tool', tool: 'module_manager', spanId: 'spn-tool-3' });
  push({ timestamp: t(150), type: 'AUTOMATION_GENERATED', source: 'skill', stage: '4A', status: 'Selected', count: 3 });
  push({ timestamp: t(151), type: 'AUTOMATION_GENERATED', source: 'skill', stage: '4A', status: 'Generated', count: 2 });
  push({ timestamp: t(152), type: 'AUTOMATION_GENERATED', source: 'skill', stage: '4A', status: 'Reused', count: 1 });
  push({ timestamp: t(160), type: 'AUTOMATION_BUILD_RESULT', source: 'platform-tool', stage: '4A', status: 'Failed' });
  push({ timestamp: t(180), type: 'VALIDATION_FAILED', source: 'platform-tool', stage: '4A', kind: 'compile' });
  push({ timestamp: t(200), type: 'AUTOMATION_BUILD_RESULT', source: 'platform-tool', stage: '4A', status: 'Passed' });
  push({ timestamp: t(210), type: 'STAGE_COMPLETED', source: 'skill', stage: '4A', spanId: 'spn-stage-4a' });

  // Stage 5A — Automation Execution: preflight, a Safety block, 3 first-attempt results, a repair
  push({ timestamp: t(220), type: 'STAGE_STARTED', source: 'skill', stage: '5A', spanId: 'spn-stage-5a', parentSpanId: 'spn-run-000001' });
  push({
    timestamp: t(225),
    type: 'SAFETY_PREFLIGHT_COMPLETED',
    source: 'skill',
    stage: '5A',
    metadata: {
      policyId: 'fixture-policy', policyVersion: 1, policyHash: 'sha256:fixture', environment: 'Staging',
      totals: { operations: 10, allowed: 6, approvalRequired: 2, forbidden: 2, preAuthorized: 1, cleanupRequired: 2 },
      cleanupCompleted: 2,
    },
  });
  push({ timestamp: t(230), type: 'SAFETY_BLOCKED', source: 'skill', stage: '5A', count: 2, testCaseId: 'TC-F-006' });
  push({ timestamp: t(240), type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-001', status: 'Passed', attempt: 1, cycle: 1 });
  push({ timestamp: t(241), type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-002', status: 'Passed', attempt: 1, cycle: 1 });
  push({ timestamp: t(242), type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-003', status: 'Failed', attempt: 1, cycle: 1, errorType: 'Automation Failure' });
  push({ timestamp: t(243), type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5A', testCaseId: 'TC-F-006', status: 'Skipped', attempt: 1, cycle: 1, errorType: 'Execution Safety Policy' });
  push({ timestamp: t(250), type: 'STAGE_COMPLETED', source: 'skill', stage: '5A', spanId: 'spn-stage-5a' });

  // Stage 5H — Self-Healing: one repair cycle that succeeds
  push({ timestamp: t(260), type: 'STAGE_STARTED', source: 'skill', stage: '5H', spanId: 'spn-stage-5h', parentSpanId: 'spn-run-000001' });
  push({ timestamp: t(265), type: 'REPAIR_STARTED', source: 'skill', stage: '5H', spanId: 'spn-repair-1', parentSpanId: 'spn-stage-5h' });
  push({ timestamp: t(320), type: 'REPAIR_COMPLETED', source: 'skill', stage: '5H', spanId: 'spn-repair-1', status: 'Passed', count: 1 });
  push({ timestamp: t(325), type: 'ARTIFACT_UPDATED', source: 'skill', stage: '5H', artifact: 'automation/tests/Fixture.java', artifactClass: 'automation' });
  push({ timestamp: t(330), type: 'TEST_EXECUTION_RESULT', source: 'platform-tool', stage: '5H', testCaseId: 'TC-F-003', status: 'Passed', attempt: 2, cycle: 2 });
  push({ timestamp: t(340), type: 'STAGE_COMPLETED', source: 'skill', stage: '5H', spanId: 'spn-stage-5h' });

  // An unresolved decision, so `pending` is exercised rather than always zero
  push({ timestamp: t(350), type: 'HUMAN_DECISION_REQUESTED', source: 'skill', stage: '6A', decisionId: 'HD-2', category: 'Safety' });

  push({ timestamp: t(400), type: 'RUN_COMPLETED', source: 'skill', spanId: 'spn-run-000001' });
  return e;
}

function writeEvents(dataRoot, runFolder, events) {
  const dir = path.join(dataRoot, 'runs', runFolder, 'metadata', 'observability');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ObservabilityEvents.jsonl'),
    `${events.map((e) => JSON.stringify(e)).join('\n')}\n`, 'utf8');
  return path.join(dir, 'ObservabilityEvents.jsonl');
}

/** Safety evidence in the shape `loadSafetyEvidence` produces. */
function fixtureSafety() {
  return {
    preflight: {
      policyId: 'fixture-policy',
      policyVersion: 1,
      environment: 'Staging',
      totals: { operations: 10, allowed: 6, approvalRequired: 2, forbidden: 2, preAuthorized: 1, cleanupRequired: 2 },
    },
    policyHash: 'sha256:fixture',
    cleanupCompleted: 2,
    authorizations: [{
      authorizationId: 'AUTH-FIXTURE-1',
      runId: RUN,
      action: 'UPDATE',
      ownership: 'SelfCreated',
      module: 'fixture',
      approvedBy: 'fixture@example.test',
      approvedAt: '2026-08-07T09:02:00.000Z',
    }],
    foreign: [],
  };
}

/** Six cases: Review 4 Approved / 1 Rejected / 1 Pending · Automation 2 Approved / 3 Rejected / 1 Pending. */
const FIXTURE_CASES = [
  { id: 'TC-F-001', title: 'First fixture case', review: 'Approved', automation: 'Approved' },
  { id: 'TC-F-002', title: 'Second fixture case', review: 'Approved', automation: 'Approved' },
  { id: 'TC-F-003', title: 'Third fixture case', review: 'Approved', automation: 'Rejected' },
  { id: 'TC-F-004', title: 'Fourth fixture case', review: 'Approved', automation: 'Rejected' },
  { id: 'TC-F-005', title: 'Fifth fixture case', review: 'Rejected', automation: 'Rejected' },
  { id: 'TC-F-006', title: 'Sixth fixture case', review: 'Pending', automation: 'Pending' },
];

module.exports = {
  RUN, makeDataRoot, makeRun, makeTestSuite, fixtureEvents, writeEvents, fixtureSafety, FIXTURE_CASES,
};
