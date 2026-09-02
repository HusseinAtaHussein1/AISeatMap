// `cli.js ndc <...>` — the NDC Core Service layer's CLI namespace, kept separate from the
// module/feature verbs above it (module_architecture.md, NDC Core Service section).
//
// Run as a real subprocess, same convention as cli.test.js: the behavior under test is argument
// handling and the exit code, which main() communicates through process.exitCode.

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'cli.js');

function runCli(args, servicesDir) {
  const argv = servicesDir ? [...args, '--services-dir', servicesDir] : args;
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...argv], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status === undefined ? null : err.status,
      stdout: err.stdout === undefined ? '' : err.stdout,
      stderr: err.stderr === undefined ? '' : err.stderr,
    };
  }
}

function withServicesDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ndc-cli-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Drives the full Service → Feature → shared-scope + Supplier lifecycle through the CLI. */
function seedFullTree(dir) {
  assert.equal(runCli(['ndc', 'service', 'propose', '--name', 'NDC_Core_Service'], dir).code, 0);
  assert.equal(runCli(['ndc', 'service', 'approve', 'ndc-core-service', '--by', 'Reviewer'], dir).code, 0);
  assert.equal(runCli(['ndc', 'feature', 'propose', '--name', 'Import Booked PNR'], dir).code, 0);
  assert.equal(runCli(['ndc', 'feature', 'approve', 'import-booked-pnr', '--by', 'Reviewer'], dir).code, 0);
  assert.equal(
    runCli(['ndc', 'shared', 'propose', 'import-booked-pnr', '--name', 'New Layer Contract'], dir).code, 0
  );
  assert.equal(
    runCli(['ndc', 'shared', 'approve', 'import-booked-pnr', 'new-layer-contract', '--by', 'Reviewer'], dir).code, 0
  );
  assert.equal(
    runCli(['ndc', 'shared', 'scaffold', 'import-booked-pnr', 'new-layer-contract'], dir).code, 0
  );
  assert.equal(runCli(['ndc', 'supplier', 'propose', 'import-booked-pnr', '--name', 'NDCGal'], dir).code, 0);
  assert.equal(
    runCli(['ndc', 'supplier', 'approve', 'import-booked-pnr', 'ndc-gal', '--by', 'Reviewer'], dir).code, 0
  );
  assert.equal(runCli(['ndc', 'supplier', 'scaffold', 'import-booked-pnr', 'ndc-gal'], dir).code, 0);
}

test('service propose/approve scaffolds the service folder and no Feature subfolder', () => {
  withServicesDir((dir) => {
    assert.equal(runCli(['ndc', 'service', 'propose', '--name', 'NDC_Core_Service'], dir).code, 0);
    const approve = runCli(['ndc', 'service', 'approve', 'ndc-core-service', '--by', 'Reviewer'], dir);
    assert.equal(approve.code, 0);
    assert.ok(fs.existsSync(path.join(dir, 'ndc-core-service', 'service.json')));
    // Refund/Reissue/Seatmap are never created with any content — only Import Booked PNR is
    // proposed in this test, and even it is not scaffolded until `ndc feature scaffold`/`approve`.
    assert.deepEqual(fs.readdirSync(path.join(dir, 'ndc-core-service')), ['service.json']);
  });
});

test('feature/shared/supplier: full lifecycle produces the documented on-disk layout', () => {
  withServicesDir((dir) => {
    seedFullTree(dir);

    const featureRoot = path.join(dir, 'ndc-core-service', 'import-booked-pnr');
    assert.ok(fs.existsSync(path.join(featureRoot, 'module.json')));
    assert.ok(fs.existsSync(path.join(featureRoot, 'shared', 'new-layer-contract', 'feature.json')));
    assert.ok(fs.existsSync(path.join(featureRoot, 'suppliers', 'ndc-gal', 'supplier.json')));

    // A Supplier is never registered as a "feature" — no features/ folder appears anywhere.
    assert.equal(fs.existsSync(path.join(featureRoot, 'features')), false);
  });
});

test('ndc feature list shows the service-qualified Feature', () => {
  withServicesDir((dir) => {
    seedFullTree(dir);
    const res = runCli(['ndc', 'feature', 'list', '--json'], dir);
    assert.equal(res.code, 0);
    const rows = JSON.parse(res.stdout);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].service, 'ndc-core-service');
    assert.equal(rows[0].slug, 'import-booked-pnr');
    assert.equal(rows[0].kind, 'ndc_feature');
  });
});

test('ndc supplier list shows the Supplier under its Feature', () => {
  withServicesDir((dir) => {
    seedFullTree(dir);
    const res = runCli(['ndc', 'supplier', 'list', 'import-booked-pnr', '--json'], dir);
    assert.equal(res.code, 0);
    const rows = JSON.parse(res.stdout);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].slug, 'ndc-gal');
    assert.equal(rows[0].service, 'ndc-core-service');
    assert.equal(rows[0].feature, 'import-booked-pnr');
  });
});

test('use-feature and use-supplier resolve the Service automatically and set the pointer', () => {
  withServicesDir((dir) => {
    seedFullTree(dir);

    const uf = runCli(['ndc', 'use-feature', 'import-booked-pnr'], dir);
    assert.equal(uf.code, 0);
    assert.match(uf.stdout, /ndc-core-service.*import-booked-pnr/s);

    const us = runCli(['ndc', 'use-supplier', 'import-booked-pnr', 'ndc-gal'], dir);
    assert.equal(us.code, 0);
    assert.match(us.stdout, /ndc-core-service.*import-booked-pnr.*ndc-gal/s);
  });
});

test('a Proposed Feature cannot be activated', () => {
  withServicesDir((dir) => {
    assert.equal(runCli(['ndc', 'service', 'propose', '--name', 'NDC_Core_Service'], dir).code, 0);
    assert.equal(runCli(['ndc', 'service', 'approve', 'ndc-core-service', '--by', 'Reviewer'], dir).code, 0);
    assert.equal(runCli(['ndc', 'feature', 'propose', '--name', 'Refund'], dir).code, 0);

    const res = runCli(['ndc', 'use-feature', 'refund'], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /still Proposed/);
  });
});

test('ndc inspect-scope reports overlap candidates and exits 2', () => {
  withServicesDir((dir) => {
    seedFullTree(dir);
    const hit = runCli(['ndc', 'inspect-scope', '--name', 'New Layer Contract'], dir);
    assert.equal(hit.code, 2);
    assert.match(hit.stdout, /Overlap candidates: 1/);

    const miss = runCli(['ndc', 'inspect-scope', '--name', 'Totally New Scope'], dir);
    assert.equal(miss.code, 0);
    assert.match(miss.stdout, /Overlap candidates: none/);
  });
});

test('an unknown flag under the ndc namespace still fails loudly (KNOWN_FLAGS is shared)', () => {
  withServicesDir((dir) => {
    const res = runCli(['ndc', 'service', 'propose', '--name', 'X', '--lastRun', 'run-001'], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Unknown option: --lastRun/);
  });
});

test('refund/reissue/seatmap remain empty Feature registrations until scaffolded individually', () => {
  withServicesDir((dir) => {
    assert.equal(runCli(['ndc', 'service', 'propose', '--name', 'NDC_Core_Service'], dir).code, 0);
    assert.equal(runCli(['ndc', 'service', 'approve', 'ndc-core-service', '--by', 'Reviewer'], dir).code, 0);
    for (const name of ['Refund', 'Reissue', 'Seatmap']) {
      assert.equal(runCli(['ndc', 'feature', 'propose', '--name', name], dir).code, 0);
    }
    const approve = runCli(
      ['ndc', 'feature', 'approve', 'refund', 'reissue', 'seatmap', '--by', 'Reviewer'], dir
    );
    assert.equal(approve.code, 0);

    // Approved — and moduleScaffold's own eager folders exist — but nothing beyond that: no shared/,
    // no suppliers/, for any of the three.
    for (const slug of ['refund', 'reissue', 'seatmap']) {
      const root = path.join(dir, 'ndc-core-service', slug);
      assert.ok(fs.existsSync(root));
      assert.equal(fs.existsSync(path.join(root, 'shared')), false);
      assert.equal(fs.existsSync(path.join(root, 'suppliers')), false);
    }
  });
});
