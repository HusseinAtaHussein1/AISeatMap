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

const { createRun, CreateRunError, validateNdcRunScope } = require('../createRun');

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
  } finally {
    cleanup(runsDir);
  }
});
