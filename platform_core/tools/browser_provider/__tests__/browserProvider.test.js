const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const browser = require('../index');
const { resolvePaths } = require('../../project_paths');

test('the interface names every operation and session operation it contracts for', () => {
  assert.deepStrictEqual(
    [...browser.OPERATIONS].sort(),
    ['codegen', 'createSession', 'runSuite', 'screenshot', 'showTrace', 'version'].sort()
  );
  for (const op of ['navigate', 'click', 'type', 'extractTable', 'takePendingDialog', 'close']) {
    assert.ok(browser.SESSION_OPERATIONS.includes(op), `${op} must be part of the session contract`);
  }
});

test('both shipped providers load and declare an honest capability map', () => {
  const node = browser.capabilities('playwright-node');
  assert.strictEqual(node.id, 'playwright-node');
  assert.strictEqual(node.engine, 'playwright');
  assert.strictEqual(node.integration, 'node-library');
  assert.strictEqual(node.persistentSession, true);
  assert.strictEqual(node.runSuite, false);

  const cli = browser.capabilities('playwright-cli');
  assert.strictEqual(cli.id, 'playwright-cli');
  assert.strictEqual(cli.engine, 'playwright');
  assert.strictEqual(cli.integration, 'cli');
  assert.strictEqual(cli.persistentSession, false);
  assert.strictEqual(cli.runSuite, true);
});

test('the two providers are complementary — every operation is covered by at least one', () => {
  const node = browser.capabilities('playwright-node');
  const cli = browser.capabilities('playwright-cli');
  for (const op of browser.OPERATIONS) {
    if (op === 'version') continue; // CLI-only by design
    const key = op === 'createSession' ? 'persistentSession' : op;
    assert.ok(node[key] === true || cli[key] === true, `no provider supports ${op}`);
  }
});

test('an unsupported operation fails loudly and names the provider that does support it', () => {
  assert.throws(
    () => browser.runSuite({ provider: 'playwright-node', suiteDir: 'x' }),
    (err) => {
      assert.strictEqual(err.code, 'UNSUPPORTED_OPERATION');
      assert.match(err.message, /playwright-node.*does not support "runSuite"/);
      assert.match(err.message, /playwright-cli.*does support it/);
      return true;
    }
  );
});

test('createSession on a session-less provider raises UNSUPPORTED_OPERATION, never a silent no-op', async () => {
  await assert.rejects(
    () => browser.createSession({ provider: 'playwright-cli' }),
    (err) => {
      assert.strictEqual(err.code, 'UNSUPPORTED_OPERATION');
      assert.match(err.message, /playwright-node/);
      return true;
    }
  );
});

test('an unknown provider is an explicit error listing the built-ins', () => {
  assert.throws(
    () => browser.capabilities('selenium-grid'),
    /Unknown Browser Provider "selenium-grid"[\s\S]*playwright-node/
  );
});

test('generated output resolves under the project root, isolated from source', () => {
  const dir = browser.generatedOutputDir('some_project');
  assert.strictEqual(dir, resolvePaths('some_project').generatedPlaywright);
  assert.ok(dir.split(path.sep).includes('.generated'));
});

test('CLI operations validate their required arguments before invoking anything', () => {
  const cli = browser.loadProvider('playwright-cli');
  assert.throws(() => cli.runSuite({}), /requires a suiteDir/);
  assert.throws(() => cli.codegen({}), /requires a url/);
  assert.throws(() => cli.screenshot({}), /requires a url/);
  assert.throws(() => cli.showTrace({}), /requires a tracePath/);
});

test('no provider module hardcodes the default project folder name', () => {
  const fs = require('node:fs');
  for (const rel of [
    'providers/playwright_node/driver.js',
    'providers/playwright_node/session.js',
    'providers/playwright_cli/index.js',
    'index.js',
  ]) {
    const src = fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');
    const offenders = src
      .split('\n')
      .map((line, i) => [i + 1, line])
      .filter(([, line]) => /platform_core_data/.test(line));
    assert.strictEqual(
      offenders.length,
      0,
      `${rel} hardcodes the default project folder name on line(s) ${offenders.map(([n]) => n).join(', ')}`
    );
  }
});
