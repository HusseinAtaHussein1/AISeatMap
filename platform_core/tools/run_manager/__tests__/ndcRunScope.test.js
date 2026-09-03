// NDC Core Service run-ownership scope exclusivity (Constraint 1).
//
// A run may carry four OPTIONAL fields — service, feature, supplier, sharedScope — all defaulting to
// null. Once a run is NDC-scoped (service+feature set), it must pick EXACTLY ONE of supplier or
// sharedScope, never both, never neither. Every non-NDC run (service: null) is entirely unaffected.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createRun, changeNdcRunScope, CreateRunError, validateNdcRunScope,
} = require('../createRun');

const NOW = new Date('2026-09-02T10:00:00Z');

function makeRunsDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ndc-run-scope-'));
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── validateNdcRunScope() as a pure function ────────────────────────────────────────────────────

test('a non-NDC run.json (service null) is entirely unaffected/unvalidated', () => {
  assert.doesNotThrow(() => validateNdcRunScope({}));
  assert.doesNotThrow(() => validateNdcRunScope({ service: null, feature: null }));
  // Even with supplier/sharedScope garbage set, service:null short-circuits — an agency/branch run
  // that never touches these fields must never be blocked by this validator.
  assert.doesNotThrow(() => validateNdcRunScope({
    service: null, feature: null, supplier: 'x', sharedScope: 'y',
  }));
});

test('a valid Supplier run passes: service+feature+supplier set, sharedScope null', () => {
  assert.doesNotThrow(() => validateNdcRunScope({
    service: 'ndc-core-service', feature: 'import-booked-pnr', supplier: 'ndc-gal', sharedScope: null,
  }));
});

test('a valid shared-scope run passes: service+feature+sharedScope set, supplier null', () => {
  assert.doesNotThrow(() => validateNdcRunScope({
    service: 'ndc-core-service', feature: 'import-booked-pnr', supplier: null, sharedScope: 'new-layer-contract',
  }));
});

test('rejects a run with BOTH supplier and sharedScope set', () => {
  assert.throws(
    () => validateNdcRunScope({
      service: 'ndc-core-service', feature: 'import-booked-pnr',
      supplier: 'ndc-gal', sharedScope: 'new-layer-contract',
    }),
    (err) => err instanceof CreateRunError && /never set both/.test(err.message)
  );
});

test('rejects an NDC-scoped run with NEITHER supplier nor sharedScope set', () => {
  assert.throws(
    () => validateNdcRunScope({
      service: 'ndc-core-service', feature: 'import-booked-pnr', supplier: null, sharedScope: null,
    }),
    (err) => err instanceof CreateRunError && /EXACTLY ONE/.test(err.message)
  );
});

test('rejects a run with service set but feature missing', () => {
  assert.throws(
    () => validateNdcRunScope({ service: 'ndc-core-service', feature: null, supplier: 'ndc-gal' }),
    (err) => err instanceof CreateRunError && /requires BOTH/.test(err.message)
  );
});

// ── enforced through createRun() itself ─────────────────────────────────────────────────────────

test('createRun writes a valid Supplier-scoped run.json with the NDC fields set', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, {
      scope: 'Feature', target: 'ImportBookedPnrNdcGal', now: NOW,
      extraRunJson: {
        service: 'ndc-core-service', feature: 'import-booked-pnr', supplier: 'ndc-gal', sharedScope: null,
      },
    });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.service, 'ndc-core-service');
    assert.equal(meta.feature, 'import-booked-pnr');
    assert.equal(meta.supplier, 'ndc-gal');
    assert.equal(meta.sharedScope, null);
  } finally {
    cleanup(runsDir);
  }
});

test('createRun writes a valid shared-scope run.json with the NDC fields set', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, {
      scope: 'Feature', target: 'ImportBookedPnrNewLayerContract', now: NOW,
      extraRunJson: {
        service: 'ndc-core-service', feature: 'import-booked-pnr', supplier: null, sharedScope: 'new-layer-contract',
      },
    });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.sharedScope, 'new-layer-contract');
    assert.equal(meta.supplier, null);
  } finally {
    cleanup(runsDir);
  }
});

test('createRun REFUSES to create a run with both supplier and sharedScope set', () => {
  const runsDir = makeRunsDir();
  try {
    assert.throws(
      () => createRun(runsDir, {
        scope: 'Feature', target: 'Bad', now: NOW,
        extraRunJson: {
          service: 'ndc-core-service', feature: 'import-booked-pnr',
          supplier: 'ndc-gal', sharedScope: 'new-layer-contract',
        },
      }),
      (err) => err instanceof CreateRunError && /never set both/.test(err.message)
    );
    // And nothing was left behind — the folder allocation must not leak a half-written run.
    assert.deepEqual(fs.readdirSync(runsDir), []);
  } finally {
    cleanup(runsDir);
  }
});

test('createRun REFUSES an NDC-scoped run naming neither supplier nor sharedScope', () => {
  const runsDir = makeRunsDir();
  try {
    assert.throws(
      () => createRun(runsDir, {
        scope: 'Feature', target: 'Bad', now: NOW,
        extraRunJson: { service: 'ndc-core-service', feature: 'import-booked-pnr' },
      }),
      (err) => err instanceof CreateRunError && /EXACTLY ONE/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});

test('a plain non-NDC run (agency-style) is created exactly as before, with all four NDC fields null', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, { scope: 'FullRun', target: 'Agency', now: NOW });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.service, null);
    assert.equal(meta.feature, null);
    assert.equal(meta.supplier, null);
    assert.equal(meta.sharedScope, null);
    // testingLayerScope/scopeHistory ride along on every run, but stay inert for non-NDC ones.
    assert.equal(meta.testingLayerScope, null);
    assert.deepEqual(meta.scopeHistory, []);
  } finally {
    cleanup(runsDir);
  }
});

// ── NDC run scope freeze / history (changeNdcRunScope) ──────────────────────────────────────────
// module_architecture.md §11.5 "Run scope freeze". Constraint 4 from the hardening request: a
// confirmed NDC run's scope is frozen; a later change must be explicitly approved, carry a reason,
// re-validate the XOR invariant, and be appended to scopeHistory rather than silently overwritten.

function makeNdcRun(runsDir, overrides = {}) {
  return createRun(runsDir, {
    scope: 'Feature', target: 'ImportBookedPnrNdcGal', now: NOW,
    extraRunJson: {
      service: 'ndc-core-service', feature: 'import-booked-pnr', supplier: 'ndc-gal', sharedScope: null,
      ...overrides,
    },
  });
}

test('1. NDC run initial scope is accepted and persisted as the baseline (no fake history entry)', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.service, 'ndc-core-service');
    assert.equal(meta.supplier, 'ndc-gal');
    assert.deepEqual(meta.scopeHistory, []);
  } finally {
    cleanup(runsDir);
  }
});

test('2. changeNdcRunScope rejects a change that would leave both supplier and sharedScope set', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    assert.throws(
      () => changeNdcRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'testing bad shape',
        changes: { sharedScope: 'new-layer-contract' }, // supplier stays 'ndc-gal' -> both set
      }),
      (err) => err instanceof CreateRunError && /never set both/.test(err.message)
    );
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.supplier, 'ndc-gal');
    assert.deepEqual(meta.scopeHistory, []); // rejected change leaves no trace
  } finally {
    cleanup(runsDir);
  }
});

test('3. changeNdcRunScope rejects a change that would leave neither supplier nor sharedScope set', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    assert.throws(
      () => changeNdcRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'testing bad shape',
        changes: { supplier: null }, // sharedScope stays null -> neither set
      }),
      (err) => err instanceof CreateRunError && /EXACTLY ONE/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});

test('4. a valid approved scope change (Supplier -> Shared Scope) records previous and new scope', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    const changedAt = new Date('2026-09-03T09:00:00Z');
    const out = changeNdcRunScope(runsDir, res.folderName, {
      now: changedAt, approvedBy: 'QA Lead', reason: 'Supplier work folded into the shared contract scope',
      changes: { supplier: null, sharedScope: 'new-layer-contract' },
    });
    assert.equal(out.previous.supplier, 'ndc-gal');
    assert.equal(out.previous.sharedScope, null);
    assert.equal(out.next.supplier, null);
    assert.equal(out.next.sharedScope, 'new-layer-contract');

    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.supplier, null);
    assert.equal(meta.sharedScope, 'new-layer-contract');
    assert.equal(meta.scopeHistory.length, 1);
    assert.equal(meta.scopeHistory[0].approvedBy, 'QA Lead');
    assert.equal(meta.scopeHistory[0].reason, 'Supplier work folded into the shared contract scope');
    assert.equal(meta.scopeHistory[0].changedAt, changedAt.toISOString());
    assert.equal(meta.scopeHistory[0].previous.supplier, 'ndc-gal');
    assert.equal(meta.scopeHistory[0].next.sharedScope, 'new-layer-contract');
  } finally {
    cleanup(runsDir);
  }
});

test('5. a scope change without --approved-by, or without a reason, is refused', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    assert.throws(
      () => changeNdcRunScope(runsDir, res.folderName, {
        now: NOW, reason: 'missing approver', changes: { testingLayerScope: 'API only' },
      }),
      (err) => err instanceof CreateRunError && /approvedBy/.test(err.message)
    );
    assert.throws(
      () => changeNdcRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: '', changes: { testingLayerScope: 'API only' },
      }),
      (err) => err instanceof CreateRunError && /reason/.test(err.message)
    );
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.deepEqual(meta.scopeHistory, []);
  } finally {
    cleanup(runsDir);
  }
});

test('6. testingLayerScope changes are recorded in scopeHistory', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    changeNdcRunScope(runsDir, res.folderName, {
      now: NOW, approvedBy: 'QA Lead', reason: 'Performance deferred pending load-test env',
      changes: { testingLayerScope: { Performance: 'Deferred', UI: 'In Scope' } },
    });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.deepEqual(meta.testingLayerScope, { Performance: 'Deferred', UI: 'In Scope' });
    assert.equal(meta.scopeHistory.length, 1);
    assert.deepEqual(meta.scopeHistory[0].next.testingLayerScope, { Performance: 'Deferred', UI: 'In Scope' });
    // service/feature/supplier/sharedScope are untouched by an unrelated field change.
    assert.equal(meta.supplier, 'ndc-gal');
  } finally {
    cleanup(runsDir);
  }
});

test('7. changeNdcRunScope refuses a non-NDC run — Agency/Branch scope-history is out of scope', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, { scope: 'FullRun', target: 'Agency', now: NOW });
    assert.throws(
      () => changeNdcRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'should never apply', changes: { testingLayerScope: 'x' },
      }),
      (err) => err instanceof CreateRunError && /not NDC-scoped/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});

test('changeNdcRunScope rejects an unknown field in `changes`', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeNdcRun(runsDir);
    assert.throws(
      () => changeNdcRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'bad field', changes: { status: 'Completed' },
      }),
      (err) => err instanceof CreateRunError && /only accepts changes to/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});
