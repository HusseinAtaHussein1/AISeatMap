const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  MANIFEST_FILENAME,
  ManifestError,
  manifestPath,
  renderRunManifest,
  recordStage,
  recordReuse,
  recordGap,
  readManifest,
} = require('../runManifest');

const NOW = new Date('2026-07-27T21:00:00Z');
const LATER = new Date('2026-07-27T22:30:00Z');

function makeRun(opts = {}) {
  const runsDir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-')), 'runs');
  const folderName = 'run-001__2026-07-27_21-00-00__FullRun__Leave';
  fs.mkdirSync(path.join(runsDir, folderName, 'metadata'), { recursive: true });
  const runJson = {
    folderName, index: 1, scope: 'FullRun', target: 'Leave', workflow: 'first_run',
    status: 'Preparing', startedTime: NOW.toISOString(), createdBy: 'Run Manager',
    targetRef: 'a'.repeat(40), targetRefScope: ['src/leave'],
    targetRefCapturedAt: NOW.toISOString(), targetRefReason: 'git repository at /tmp/app',
    ...opts,
  };
  fs.writeFileSync(manifestPath(runsDir, folderName), renderRunManifest({ runJson, now: NOW }), 'utf8');
  return { runsDir, folderName, runJson };
}
const cleanup = (runsDir) => fs.rmSync(path.dirname(runsDir), { recursive: true, force: true });
const read = (runsDir, folderName) => fs.readFileSync(manifestPath(runsDir, folderName), 'utf8');

test('renderRunManifest produces all five sections plus the anchor', () => {
  const { runsDir, folderName } = makeRun();
  const text = read(runsDir, folderName);

  assert.match(text, /^# Run Manifest — run-001__/m);
  for (const h of ['## 1. Code-State Anchor', '## 2. Stage Ledger', '## 3. Cross-Run Reuse',
    '## 4. Checkpoint History', '## 5. Declared Gaps']) {
    assert.ok(text.includes(h), `missing ${h}`);
  }
  assert.match(text, /\| `targetRef` \| `a{40}` \|/);
  assert.match(text, /\| Scoped to \| `src\/leave` \|/);
  cleanup(runsDir);
});

test('renderRunManifest requires runJson.folderName and an explicit now', () => {
  assert.throws(() => renderRunManifest({ runJson: {}, now: NOW }), ManifestError);
  assert.throws(() => renderRunManifest({ runJson: { folderName: 'x' } }), ManifestError);
});

test('a fresh manifest states "no stage has run yet" rather than leaving an empty table', () => {
  const { runsDir, folderName } = makeRun();
  assert.match(read(runsDir, folderName), /_\(no stage has run yet\)_/);
  cleanup(runsDir);
});

test('a run with no code-state anchor declares that as a gap on creation', () => {
  const { runsDir, folderName } = makeRun({
    targetRef: null, targetRefReason: 'no git repository governs the Target Project',
  });
  const text = read(runsDir, folderName);

  assert.match(text, /\| `targetRef` \| `null` \|/);
  assert.match(text, /No code-state anchor \| all \| no git repository governs/);
  assert.match(text, /unknown-no-anchor/);
  assert.doesNotMatch(text, /_\(none declared\)_/, 'the gap replaces the "none" placeholder');
  cleanup(runsDir);
});

test('recordStage adds a ledger row and appends a checkpoint transition', () => {
  const { runsDir, folderName } = makeRun();

  recordStage(runsDir, folderName, {
    stage: 'Stage 1 — Project Context',
    artifactName: 'ProjectContext.md',
    artifactPath: '../context/ProjectContext.md',
    checkpointStatus: 'Pending Review',
    revisions: 1,
    invocationPath: 'Pipeline',
    now: LATER,
  });

  const text = read(runsDir, folderName);
  assert.match(text, /\| Stage 1 — Project Context \| \[ProjectContext\.md\]\(\.\.\/context\/ProjectContext\.md\) \|/);
  assert.match(text, /Pending Review/);
  assert.doesNotMatch(text, /_\(no stage has run yet\)_/, 'the placeholder row is replaced');
  // Checkpoint history gained entry #2 (the creation entry is #1).
  assert.match(text, /\| 2 \| 2026-07-27T22:30:00\.000Z \| Stage 1 — Project Context \| Pending Review \|/);
  assert.match(text, /\| Last updated \| 2026-07-27T22:30:00\.000Z \|/);
  cleanup(runsDir);
});

test('recordStage updates the same stage in place, and history shows the transition', () => {
  const { runsDir, folderName } = makeRun();

  recordStage(runsDir, folderName, {
    stage: 'Stage 1 — Project Context', checkpointStatus: 'Pending Review',
    revisions: 1, invocationPath: 'Pipeline', now: NOW,
  });
  recordStage(runsDir, folderName, {
    stage: 'Stage 1 — Project Context', checkpointStatus: 'Approved',
    reviewer: 'atef', revisions: 2, invocationPath: 'Pipeline', now: LATER,
  });

  const { stages } = readManifest(runsDir, folderName);
  const s1 = stages.filter((s) => s.stage === 'Stage 1 — Project Context');
  assert.equal(s1.length, 1, 'one row per stage, updated in place');
  assert.equal(s1[0].checkpointStatus, 'Approved');
  assert.equal(s1[0].revisions, '2');

  const text = read(runsDir, folderName);
  assert.match(text, /Pending Review → Approved/, 'history records the transition, not just the new value');
  cleanup(runsDir);
});

test('re-recording the same checkpoint status does not pad the history', () => {
  const { runsDir, folderName } = makeRun();

  recordStage(runsDir, folderName, { stage: 'Stage 2 — Discovery', checkpointStatus: 'Pending Review', now: NOW });
  const after1 = read(runsDir, folderName);
  recordStage(runsDir, folderName, { stage: 'Stage 2 — Discovery', checkpointStatus: 'Pending Review', now: LATER });
  const after2 = read(runsDir, folderName);

  const count = (t) => (t.match(/^\| \d+ \| 2026/gm) || []).length;
  assert.equal(count(after1), count(after2), 'no new history entry for an unchanged status');
  cleanup(runsDir);
});

test('a Rejected transition keeps its feedback', () => {
  const { runsDir, folderName } = makeRun();

  recordStage(runsDir, folderName, { stage: 'Stage 3 — Test Design', checkpointStatus: 'Pending Review', now: NOW });
  recordStage(runsDir, folderName, {
    stage: 'Stage 3 — Test Design', checkpointStatus: 'Rejected', reviewer: 'atef',
    feedback: 'BR-7 coverage missing for the carry-forward case', now: LATER,
  });

  assert.match(read(runsDir, folderName), /Rejected \| atef \| BR-7 coverage missing/);
  cleanup(runsDir);
});

test('multiple stages accumulate as separate rows, in insertion order', () => {
  const { runsDir, folderName } = makeRun();
  for (const s of ['Stage 1 — Project Context', 'Stage 2 — Discovery', 'Stage 3 — Test Design']) {
    recordStage(runsDir, folderName, { stage: s, checkpointStatus: 'Approved', now: NOW });
  }
  const { stages } = readManifest(runsDir, folderName);
  assert.deepEqual(stages.map((s) => s.stage),
    ['Stage 1 — Project Context', 'Stage 2 — Discovery', 'Stage 3 — Test Design']);
  cleanup(runsDir);
});

test('recordStage rejects an unknown checkpoint status or invocation path', () => {
  const { runsDir, folderName } = makeRun();
  assert.throws(() => recordStage(runsDir, folderName, {
    stage: 'Stage 1', checkpointStatus: 'Looks Fine', now: NOW,
  }), ManifestError);
  assert.throws(() => recordStage(runsDir, folderName, {
    stage: 'Stage 1', checkpointStatus: 'Approved', invocationPath: 'Vibes', now: NOW,
  }), ManifestError);
  cleanup(runsDir);
});

test('recordStage on a run with no manifest reports that clearly', () => {
  const runsDir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-')), 'runs');
  fs.mkdirSync(path.join(runsDir, 'run-009__x', 'metadata'), { recursive: true });
  assert.throws(
    () => recordStage(runsDir, 'run-009__x', { stage: 'Stage 1', checkpointStatus: 'Approved', now: NOW }),
    (err) => {
      assert.match(err.message, /No Run Manifest at/);
      assert.match(err.message, /was not created through the Run Manager/);
      return true;
    }
  );
  cleanup(runsDir);
});

test('recordReuse records the source run and replaces the "reuses nothing" placeholder', () => {
  const { runsDir, folderName } = makeRun();

  recordReuse(runsDir, folderName, {
    artifact: 'ProjectContext.md',
    sourceRun: 'run-002__2026-01-14_09-00-00__Targeted__Leave',
    mode: 'Referenced',
    sourceApproved: true,
    driftStatus: 'unchanged',
    now: LATER,
  });

  const text = read(runsDir, folderName);
  assert.match(text, /\| ProjectContext\.md \| `run-002__2026-01-14_09-00-00__Targeted__Leave` \| Referenced \| Approved \| unchanged \|/);
  assert.doesNotMatch(text, /_\(this run reuses nothing\)_/);
  cleanup(runsDir);
});

test('reuse with drift adds the drift-implication obligation, once', () => {
  const { runsDir, folderName } = makeRun();

  recordReuse(runsDir, folderName, {
    artifact: 'QA_Assessment_Report.md', sourceRun: 'run-002__old', driftStatus: 'moved', now: NOW,
  });
  recordReuse(runsDir, folderName, {
    artifact: 'Findings_Summary.md', sourceRun: 'run-002__old', driftStatus: 'moved', now: LATER,
  });

  const text = read(runsDir, folderName);
  assert.match(text, /unverified against current code/);
  assert.equal((text.match(/\*\*Drift implication:\*\*/g) || []).length, 1, 'stated once, not per row');
  cleanup(runsDir);
});

test('reuse with unchanged drift adds no implication note', () => {
  const { runsDir, folderName } = makeRun();
  recordReuse(runsDir, folderName, {
    artifact: 'ProjectContext.md', sourceRun: 'run-002__old', driftStatus: 'unchanged', now: NOW,
  });
  assert.doesNotMatch(read(runsDir, folderName), /\*\*Drift implication:\*\*/);
  cleanup(runsDir);
});

test('recordReuse rejects an unknown mode', () => {
  const { runsDir, folderName } = makeRun();
  assert.throws(() => recordReuse(runsDir, folderName, {
    artifact: 'a.md', sourceRun: 'r', mode: 'Borrowed', now: NOW,
  }), ManifestError);
  cleanup(runsDir);
});

test('a reuse row lands INSIDE the table, never after the trailing prose', () => {
  // Regression: §3 carries a **Lineage:** paragraph after its table. Appending "after the last line
  // starting with |" put new rows below that prose and split the table in two.
  const { runsDir, folderName } = makeRun({ inheritsFrom: 'run-002__prior', supersedes: 'run-002__prior' });

  recordReuse(runsDir, folderName, {
    artifact: 'context/', sourceRun: 'run-002__prior', sourceApproved: true, driftStatus: 'moved', now: LATER,
  });

  const lines = read(runsDir, folderName).split('\n');
  const sep = lines.findIndex((l) => /^\|---\|---\|---\|---\|---\|$/.test(l));
  const lineageIdx = lines.findIndex((l) => l.startsWith('**Lineage:**'));
  const rowIdx = lines.findIndex((l) => l.startsWith('| context/ |'));

  assert.ok(sep !== -1 && rowIdx !== -1 && lineageIdx !== -1);
  assert.ok(rowIdx > sep, 'row is below the separator');
  assert.ok(rowIdx < lineageIdx, 'row is ABOVE the trailing prose — the table is not split');
  // Every line between separator and prose is a table row.
  for (let i = sep + 1; i < lineageIdx; i++) {
    if (lines[i].trim() === '') continue;
    assert.match(lines[i], /^\|/, `line ${i} inside the table is not a row: ${lines[i]}`);
  }
  cleanup(runsDir);
});

test('a stage row also lands inside its table, and the placeholder is gone', () => {
  const { runsDir, folderName } = makeRun();
  recordStage(runsDir, folderName, { stage: 'Stage 1', checkpointStatus: 'Approved', now: NOW });
  recordStage(runsDir, folderName, { stage: 'Stage 2', checkpointStatus: 'Approved', now: LATER });

  const text = read(runsDir, folderName);
  const sec = text.slice(text.indexOf('## 2. Stage Ledger'), text.indexOf('## 3.'));
  assert.doesNotMatch(sec, /_\(no stage has run yet\)_/);
  assert.equal((sec.match(/^\| Stage \d \|/gm) || []).length, 2);
  cleanup(runsDir);
});

test('recordGap appends a declared gap', () => {
  const { runsDir, folderName } = makeRun();
  recordGap(runsDir, folderName, {
    gap: 'Stage 6 not executed', stage: 'Stage 6', why: 'no approved automation suite',
    reportedIn: 'Final_QA_Report.md §9', now: LATER,
  });
  const text = read(runsDir, folderName);
  assert.match(text, /\| Stage 6 not executed \| Stage 6 \| no approved automation suite \| Final_QA_Report\.md §9 \|/);
  assert.doesNotMatch(text, /_\(none declared\)_/);
  cleanup(runsDir);
});

test('readManifest returns the ledger as data, and empty for a missing manifest', () => {
  const { runsDir, folderName } = makeRun();
  recordStage(runsDir, folderName, {
    stage: 'Stage 1 — Project Context', checkpointStatus: 'Approved',
    reviewer: 'atef', revisions: 3, invocationPath: 'Direct (degraded)', now: NOW,
  });

  const { stages, lastUpdated } = readManifest(runsDir, folderName);
  assert.equal(stages.length, 1);
  assert.equal(stages[0].invocationPath, 'Direct (degraded)');
  assert.equal(stages[0].reviewer, 'atef');
  assert.equal(lastUpdated, NOW.toISOString());

  assert.deepEqual(readManifest(runsDir, 'no-such-run'), { stages: [], lastUpdated: null });
  cleanup(runsDir);
});

test('the manifest filename matches what the specs reference', () => {
  assert.equal(MANIFEST_FILENAME, 'RunManifest.md');
});
