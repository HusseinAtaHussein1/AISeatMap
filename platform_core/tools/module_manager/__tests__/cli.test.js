const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'cli.js');

/**
 * Runs the CLI as a real subprocess rather than importing main().
 *
 * The behaviour under test is argument handling and the exit code, and `main()` communicates the
 * latter through `process.exitCode` — a value a same-process test would have to read back out of
 * its own runner. A subprocess observes exactly what a stage invoking this CLI observes.
 */
function runCli(args, modulesDir) {
  const argv = modulesDir ? [...args, '--modules-dir', modulesDir] : args;
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

function withModulesDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-cli-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Gets a module all the way to scaffolded-and-approved, the state most verbs require. */
function approvedModule(dir, name) {
  assert.equal(runCli(['propose', '--name', name], dir).code, 0);
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  assert.equal(runCli(['approve', slug, '--by', 'QA Lead'], dir).code, 0);
  return slug;
}

test('an unknown flag fails loudly instead of being silently ignored', () => {
  withModulesDir((dir) => {
    const slug = approvedModule(dir, 'Flight Search');

    // --lastRun is a plausible misspelling of --run: it is the field name the flag writes.
    // Accepting it silently would report success while recording lastRun: null.
    const res = runCli(
      ['stage', slug, 'context', '--status', 'Approved', '--lastRun', 'run-001'],
      dir,
    );

    assert.equal(res.code, 1, 'a typo must not exit 0');
    assert.match(res.stderr, /Unknown option: --lastRun/);

    // The remedy has to be in the message — the caller is often an agent, not a human at a shell.
    assert.match(res.stderr, /--run\b/, 'the known-flag list names the flag that was meant');

    const moduleJson = JSON.parse(
      fs.readFileSync(path.join(dir, slug, 'module.json'), 'utf8'),
    );
    assert.equal(
      moduleJson.stages.context.status,
      'Not Started',
      'a rejected invocation must not have recorded a partial stage',
    );
  });
});

test('every unknown flag is named at once, so a caller fixes them in one pass', () => {
  withModulesDir((dir) => {
    const res = runCli(['list', '--jsonn', '--verbose'], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Unknown options: --jsonn, --verbose/);
  });
});

test("an unknown flag's value is not mistaken for the verb", () => {
  withModulesDir((dir) => {
    // `--oops list` would otherwise leave "list" as a positional and run the wrong command.
    const res = runCli(['--oops', 'list'], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Unknown option: --oops/);
    assert.doesNotMatch(res.stdout, /stages on disk/, 'no verb ran');
  });
});

test('--run is accepted and recorded, which is what the rejection above protects', () => {
  withModulesDir((dir) => {
    const slug = approvedModule(dir, 'Flight Search');
    const res = runCli(
      ['stage', slug, 'context', '--status', 'Approved', '--run', 'run-001__2026-07-29'],
      dir,
    );
    assert.equal(res.code, 0, res.stderr);

    const moduleJson = JSON.parse(
      fs.readFileSync(path.join(dir, slug, 'module.json'), 'utf8'),
    );
    assert.equal(moduleJson.stages.context.status, 'Approved');
    assert.equal(moduleJson.stages.context.lastRun, 'run-001__2026-07-29');
  });
});

test('every flag in the usage header is a known flag', () => {
  // Guards the failure mode this allowlist introduces: documenting a flag the parser now rejects.
  const source = fs.readFileSync(CLI, 'utf8');
  const declared = new Set(
    [...source.matchAll(/const KNOWN_FLAGS = new Set\(\[([\s\S]*?)\]\);/g)]
      .flatMap((m) => [...m[1].matchAll(/'([a-z-]+)'/g)].map((f) => f[1])),
  );
  assert.ok(declared.size > 0, 'KNOWN_FLAGS should be parseable from the source');

  const header = source.slice(0, source.indexOf('const VERBS'));
  for (const [, flag] of header.matchAll(/--([a-z][a-z-]+)/g)) {
    assert.ok(declared.has(flag), `--${flag} is documented in the header but not in KNOWN_FLAGS`);
  }
});

test('--help exits 0 and an unrecognized verb exits 1', () => {
  withModulesDir((dir) => {
    assert.equal(runCli(['--help'], dir).code, 0);
    assert.equal(runCli(['frobnicate'], dir).code, 1);
  });
});
