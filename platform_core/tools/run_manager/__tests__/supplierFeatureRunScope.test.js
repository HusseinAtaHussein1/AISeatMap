// Supplier Features run-ownership scope exclusivity.
//
// A run may carry four OPTIONAL fields — scopeFamily, feature, supplier, sharedScope — all
// defaulting to null. `scopeFamily` is the discriminator: null means the classic module addressing
// system (every run written before these fields existed), "supplier-feature" means this layer. Once
// a run IS supplier-feature-scoped it must name a `feature` and pick EXACTLY ONE of supplier or
// sharedScope, never both, never neither.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  createRun, CreateRunError, validateRunScopeFamily, SUPPLIER_FEATURE_SCOPE,
  changeSupplierFeatureRunScope, SCOPE_FREEZE_FIELDS,
} = require('../createRun');

const NOW = new Date('2026-09-02T10:00:00Z');

function makeRunsDir() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-run-scope-'));
  const runsDir = path.join(root, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  return runsDir;
}
const cleanup = (d) => fs.rmSync(path.dirname(d), { recursive: true, force: true });
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── validateRunScopeFamily() as a pure function ─────────────────────────────────────────────────

test('a classic run.json (scopeFamily null) is entirely unaffected/unvalidated', () => {
  assert.doesNotThrow(() => validateRunScopeFamily({}));
  assert.doesNotThrow(() => validateRunScopeFamily({ scopeFamily: null, feature: null }));
  assert.doesNotThrow(() => validateRunScopeFamily({
    scopeFamily: null, feature: null, supplier: null, sharedScope: null,
  }));
});

test('the discriminator is exactly "supplier-feature", never an entity name', () => {
  assert.equal(SUPPLIER_FEATURE_SCOPE, 'supplier-feature');
});

test('a valid Supplier run passes: scopeFamily+feature+supplier set, sharedScope null', () => {
  assert.doesNotThrow(() => validateRunScopeFamily({
    scopeFamily: SUPPLIER_FEATURE_SCOPE,
    feature: 'import-booked-pnr',
    supplier: 'travelport-ndc',
    sharedScope: null,
  }));
});

test('a valid shared-scope run passes: scopeFamily+feature+sharedScope set, supplier null', () => {
  assert.doesNotThrow(() => validateRunScopeFamily({
    scopeFamily: SUPPLIER_FEATURE_SCOPE,
    feature: 'import-booked-pnr',
    supplier: null,
    sharedScope: 'new-layer-contract',
  }));
});

test('rejects a run with BOTH supplier and sharedScope set', () => {
  assert.throws(
    () => validateRunScopeFamily({
      scopeFamily: SUPPLIER_FEATURE_SCOPE,
      feature: 'import-booked-pnr',
      supplier: 'travelport-ndc',
      sharedScope: 'new-layer-contract',
    }),
    (err) => err instanceof CreateRunError && /never set both/.test(err.message)
  );
});

test('rejects a supplier-feature run with NEITHER supplier nor sharedScope set', () => {
  assert.throws(
    () => validateRunScopeFamily({
      scopeFamily: SUPPLIER_FEATURE_SCOPE, feature: 'import-booked-pnr',
      supplier: null, sharedScope: null,
    }),
    (err) => err instanceof CreateRunError && /EXACTLY ONE/.test(err.message)
  );
});

test('rejects a supplier-feature run with no `feature` named', () => {
  assert.throws(
    () => validateRunScopeFamily({
      scopeFamily: SUPPLIER_FEATURE_SCOPE, feature: null, supplier: 'travelport-ndc',
    }),
    (err) => err instanceof CreateRunError && /requires `feature` set/.test(err.message)
  );
});

// The failure mode the old `service`-based discriminator could not catch: ownership fields set with
// no scope family declared. Silently accepting it would produce a run nothing can classify later.
test('rejects ownership fields set while scopeFamily is still null', () => {
  assert.throws(
    () => validateRunScopeFamily({ scopeFamily: null, feature: 'import-booked-pnr' }),
    (err) => err instanceof CreateRunError && /must declare its `scopeFamily`/.test(err.message)
  );
  assert.throws(
    () => validateRunScopeFamily({ scopeFamily: null, supplier: 'travelport-ndc' }),
    (err) => err instanceof CreateRunError && /must declare its `scopeFamily`/.test(err.message)
  );
});

test('rejects an unknown scopeFamily value', () => {
  assert.throws(
    () => validateRunScopeFamily({ scopeFamily: 'ndc-core-service', feature: 'import-booked-pnr' }),
    (err) => err instanceof CreateRunError && /Unknown `scopeFamily`/.test(err.message)
  );
});

// ── enforced through createRun() itself ─────────────────────────────────────────────────────────

test('createRun writes a valid Supplier-scoped run.json', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, {
      scope: 'Feature', target: 'ImportBookedPnrTravelportNdc', now: NOW,
      extraRunJson: {
        scopeFamily: SUPPLIER_FEATURE_SCOPE,
        feature: 'import-booked-pnr',
        supplier: 'travelport-ndc',
        sharedScope: null,
      },
    });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.scopeFamily, 'supplier-feature');
    assert.equal(meta.feature, 'import-booked-pnr');
    assert.equal(meta.supplier, 'travelport-ndc');
    assert.equal(meta.sharedScope, null);
    // The retired Service-tier field is gone, not merely null.
    assert.equal(meta.service, undefined);
  } finally {
    cleanup(runsDir);
  }
});

test('createRun writes a valid shared-scope run.json', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, {
      scope: 'Feature', target: 'ImportBookedPnrNewLayerContract', now: NOW,
      extraRunJson: {
        scopeFamily: SUPPLIER_FEATURE_SCOPE,
        feature: 'import-booked-pnr',
        supplier: null,
        sharedScope: 'new-layer-contract',
      },
    });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.scopeFamily, 'supplier-feature');
    assert.equal(meta.sharedScope, 'new-layer-contract');
    assert.equal(meta.supplier, null);
  } finally {
    cleanup(runsDir);
  }
});

test('createRun REFUSES a run with both supplier and sharedScope set, leaving nothing behind', () => {
  const runsDir = makeRunsDir();
  try {
    assert.throws(
      () => createRun(runsDir, {
        scope: 'Feature', target: 'Bad', now: NOW,
        extraRunJson: {
          scopeFamily: SUPPLIER_FEATURE_SCOPE,
          feature: 'import-booked-pnr',
          supplier: 'travelport-ndc',
          sharedScope: 'new-layer-contract',
        },
      }),
      (err) => err instanceof CreateRunError && /never set both/.test(err.message)
    );
    assert.deepEqual(fs.readdirSync(runsDir), []);
  } finally {
    cleanup(runsDir);
  }
});

test('createRun REFUSES a supplier-feature run naming neither supplier nor sharedScope', () => {
  const runsDir = makeRunsDir();
  try {
    assert.throws(
      () => createRun(runsDir, {
        scope: 'Feature', target: 'Bad', now: NOW,
        extraRunJson: { scopeFamily: SUPPLIER_FEATURE_SCOPE, feature: 'import-booked-pnr' },
      }),
      (err) => err instanceof CreateRunError && /EXACTLY ONE/.test(err.message)
    );
    assert.deepEqual(fs.readdirSync(runsDir), []);
  } finally {
    cleanup(runsDir);
  }
});

test('a classic run (agency-style) is created exactly as before, all four fields null', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, { scope: 'FullRun', target: 'Agency', now: NOW });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.scopeFamily, null);
    assert.equal(meta.feature, null);
    assert.equal(meta.supplier, null);
    assert.equal(meta.sharedScope, null);
    // testingLayerScope/scopeHistory ride along on every run, but stay inert for classic ones.
    assert.equal(meta.testingLayerScope, null);
    assert.deepEqual(meta.scopeHistory, []);
  } finally {
    cleanup(runsDir);
  }
});

// ── Run scope freeze / history (changeSupplierFeatureRunScope) ──────────────────────────────────
// module_architecture.md §11.5.1, ndc_execution_rules.md §A4. A confirmed run's scope is frozen; a
// later change must be explicitly approved, carry a reason, re-validate the XOR invariant, and be
// appended to scopeHistory rather than silently overwritten.

function makeSupplierRun(runsDir, overrides = {}) {
  return createRun(runsDir, {
    scope: 'Feature', target: 'ImportBookedPnrTravelportNdc', now: NOW,
    extraRunJson: {
      scopeFamily: SUPPLIER_FEATURE_SCOPE,
      feature: 'import-booked-pnr',
      supplier: 'travelport-ndc',
      sharedScope: null,
      ...overrides,
    },
  });
}

test('scopeFamily is frozen absolutely — it is not one of the changeable fields', () => {
  // Converting a classic run into a Supplier-Feature run is not a scope CHANGE, it is a different
  // run. The retired Service-tier version allowed re-pointing `service`; nothing replaces that.
  assert.deepEqual(SCOPE_FREEZE_FIELDS, ['feature', 'supplier', 'sharedScope', 'testingLayerScope']);
  assert.equal(SCOPE_FREEZE_FIELDS.includes('scopeFamily'), false);
  assert.equal(SCOPE_FREEZE_FIELDS.includes('service'), false);
});

test('initial scope is the baseline — no fake history entry is recorded for it', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.scopeFamily, 'supplier-feature');
    assert.equal(meta.supplier, 'travelport-ndc');
    assert.deepEqual(meta.scopeHistory, []);
  } finally {
    cleanup(runsDir);
  }
});

test('a change that would leave BOTH supplier and sharedScope set is rejected', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'testing bad shape',
        changes: { sharedScope: 'new-layer-contract' }, // supplier stays set -> both
      }),
      (err) => err instanceof CreateRunError && /never set both/.test(err.message)
    );
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.supplier, 'travelport-ndc');
    assert.deepEqual(meta.scopeHistory, []); // a rejected change leaves no trace
  } finally {
    cleanup(runsDir);
  }
});

test('a change that would leave NEITHER supplier nor sharedScope set is rejected', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'testing bad shape',
        changes: { supplier: null },
      }),
      (err) => err instanceof CreateRunError && /EXACTLY ONE/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});

test('an approved Supplier → Shared Scope change records previous and new scope', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    const changedAt = new Date('2026-09-03T09:00:00Z');
    const out = changeSupplierFeatureRunScope(runsDir, res.folderName, {
      now: changedAt,
      approvedBy: 'QA Lead',
      reason: 'Supplier work folded into the shared contract scope',
      changes: { supplier: null, sharedScope: 'new-layer-contract' },
    });
    assert.equal(out.previous.supplier, 'travelport-ndc');
    assert.equal(out.next.sharedScope, 'new-layer-contract');

    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.equal(meta.supplier, null);
    assert.equal(meta.sharedScope, 'new-layer-contract');
    assert.equal(meta.scopeHistory.length, 1);
    assert.equal(meta.scopeHistory[0].approvedBy, 'QA Lead');
    assert.equal(meta.scopeHistory[0].changedAt, changedAt.toISOString());
    assert.equal(meta.scopeHistory[0].previous.supplier, 'travelport-ndc');
    assert.equal(meta.scopeHistory[0].next.sharedScope, 'new-layer-contract');
    // scopeFamily survives the change untouched.
    assert.equal(meta.scopeFamily, 'supplier-feature');
  } finally {
    cleanup(runsDir);
  }
});

test('a scope change without approvedBy, or without a reason, is refused', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, reason: 'missing approver', changes: { testingLayerScope: 'API only' },
      }),
      (err) => err instanceof CreateRunError && /approvedBy/.test(err.message)
    );
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: '', changes: { testingLayerScope: 'API only' },
      }),
      (err) => err instanceof CreateRunError && /reason/.test(err.message)
    );
    assert.deepEqual(readJson(path.join(res.runDir, 'metadata', 'run.json')).scopeHistory, []);
  } finally {
    cleanup(runsDir);
  }
});

test('testingLayerScope changes are recorded in scopeHistory', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    changeSupplierFeatureRunScope(runsDir, res.folderName, {
      now: NOW, approvedBy: 'QA Lead', reason: 'Performance deferred pending load-test env',
      changes: { testingLayerScope: { Performance: 'Deferred', UI: 'In Scope' } },
    });
    const meta = readJson(path.join(res.runDir, 'metadata', 'run.json'));
    assert.deepEqual(meta.testingLayerScope, { Performance: 'Deferred', UI: 'In Scope' });
    assert.equal(meta.scopeHistory.length, 1);
    assert.deepEqual(
      meta.scopeHistory[0].next.testingLayerScope, { Performance: 'Deferred', UI: 'In Scope' }
    );
    // An unrelated field change leaves the ownership fields untouched.
    assert.equal(meta.supplier, 'travelport-ndc');
  } finally {
    cleanup(runsDir);
  }
});

test('scope-change refuses a classic run — Agency/Branch scope-history is out of scope', () => {
  const runsDir = makeRunsDir();
  try {
    const res = createRun(runsDir, { scope: 'FullRun', target: 'Agency', now: NOW });
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'should never apply',
        changes: { testingLayerScope: 'x' },
      }),
      (err) => err instanceof CreateRunError && /not Supplier-Feature-scoped/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});

test('scope-change rejects an unknown field in `changes`', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'bad field', changes: { status: 'Completed' },
      }),
      (err) => err instanceof CreateRunError && /only accepts changes to/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});

test('scope-change rejects an attempt to change scopeFamily itself', () => {
  const runsDir = makeRunsDir();
  try {
    const res = makeSupplierRun(runsDir);
    assert.throws(
      () => changeSupplierFeatureRunScope(runsDir, res.folderName, {
        now: NOW, approvedBy: 'QA Lead', reason: 'converting run type',
        changes: { scopeFamily: null },
      }),
      (err) => err instanceof CreateRunError && /only accepts changes to/.test(err.message)
    );
  } finally {
    cleanup(runsDir);
  }
});
