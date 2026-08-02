// Browser Provider — THE ONLY browser surface any Skill may use.
//
// ARCHITECTURE CONTRACT (see ./interface.md and ./README.md):
//   - A Skill never invokes Playwright, Selenium, or any other browser tool directly.
//   - A Skill never chooses a browser technology. It calls this interface; the concrete provider
//     is resolved from platform.config.json ("browserProvider").
//   - The provider decides internally whether it drives the browser through a language library or
//     a CLI. That choice is invisible to every Skill, so adding a future provider (Selenium,
//     BrowserBase, a remote grid) requires no Skill edit.
//   - An operation a provider cannot perform raises an explicit UnsupportedOperation error naming
//     the operation, the active provider, and which provider does support it. Never a silent
//     degradation, never a fabricated result.

const fs = require('fs');
const path = require('path');
const { browserProviderConfig, repoRoot, resolvePaths } = require('../project_paths');

/** Every operation named by the Browser Provider interface. */
const OPERATIONS = Object.freeze([
  'createSession',
  'runSuite',
  'codegen',
  'screenshot',
  'showTrace',
  'version',
]);

/** Session-level operations a provider's session object is expected to expose. */
const SESSION_OPERATIONS = Object.freeze([
  'useScreen',
  'useComponent',
  'navigate',
  'click',
  'type',
  'select',
  'screenshot',
  'extractText',
  'extractTable',
  'waitFor',
  'captureNetwork',
  'takePendingDialog',
  'close',
]);

const BUILT_IN = Object.freeze({
  'playwright-node': './providers/playwright_node',
  'playwright-cli': './providers/playwright_cli',
});

const cache = new Map();

function unsupported(operation, providerId, hint) {
  const err = new Error(
    `Browser Provider "${providerId}" does not support "${operation}".` +
    (hint ? ` ${hint}` : '') +
    ` Change "browserProvider" in platform.config.json, or use an operation this provider supports.`
  );
  err.code = 'UNSUPPORTED_OPERATION';
  err.operation = operation;
  err.providerId = providerId;
  return err;
}

/**
 * Loads the configured provider. `providerId` overrides platform.config.json — used by tests and
 * by an operator who explicitly wants a one-off provider, never inferred by a Skill.
 */
function loadProvider(providerId) {
  const configured = browserProviderConfig();
  const id = (providerId && String(providerId).trim()) || configured.id;
  if (cache.has(id)) return cache.get(id);

  let mod;
  const declared = configured.all && configured.all[id];
  if (declared && declared.module) {
    const abs = path.isAbsolute(declared.module) ? declared.module : path.join(repoRoot(), declared.module);
    // Accept a directory (with index.js), an exact file, or a file missing its extension. Never
    // silently walk up to a parent directory — a bad path must be reported, not guessed around.
    const candidates = [abs, `${abs}.js`, path.join(abs, 'index.js')];
    const target = candidates.find((c) => fs.existsSync(c));
    if (!target) {
      throw new Error(
        `Browser Provider "${id}" declares module "${declared.module}" in platform.config.json, ` +
        `but nothing exists at that path (tried: ${candidates.join(', ')}).`
      );
    }
    mod = require(target);
  } else if (BUILT_IN[id]) {
    mod = require(BUILT_IN[id]);
  } else {
    throw new Error(
      `Unknown Browser Provider "${id}". Register it under "browserProviders" in ` +
      `platform.config.json with a "module" path, or use one of: ${Object.keys(BUILT_IN).join(', ')}.`
    );
  }

  if (!mod || typeof mod !== 'object' || !mod.id) {
    throw new Error(`Browser Provider "${id}" did not export a valid provider object (missing "id").`);
  }
  cache.set(id, mod);
  return mod;
}

/** The active provider's declared capability map — the honest answer to "can you do X?". */
function capabilities(providerId) {
  const p = loadProvider(providerId);
  return { id: p.id, engine: p.engine, integration: p.integration, ...p.capabilities };
}

function callOperation(operation, args, providerId) {
  const provider = loadProvider(providerId);
  const supported = provider.capabilities && provider.capabilities[operation];
  if (typeof provider[operation] !== 'function' || supported === false) {
    const other = Object.keys(BUILT_IN).find((id) => {
      if (id === provider.id) return false;
      try {
        return loadProvider(id).capabilities[operation] === true;
      } catch {
        return false;
      }
    });
    throw unsupported(operation, provider.id, other ? `Provider "${other}" does support it.` : undefined);
  }
  return provider[operation](args || {});
}

/**
 * Obtains an authenticated, persistent browser session. The returned object exposes
 * SESSION_OPERATIONS; a Skill uses only those and never reaches for an underlying `page` handle.
 */
async function createSession(opts = {}) {
  const provider = loadProvider(opts.provider);
  if (!provider.capabilities || provider.capabilities.persistentSession !== true) {
    throw unsupported(
      'createSession',
      provider.id,
      'Provider "playwright-node" does support persistent sessions.'
    );
  }
  const session = await provider.createSession(opts);
  const missing = SESSION_OPERATIONS.filter((op) => typeof session[op] !== 'function');
  if (missing.length) {
    throw new Error(
      `Browser Provider "${provider.id}" returned a session missing required operations: ${missing.join(', ')}.`
    );
  }
  return session;
}

module.exports = {
  OPERATIONS,
  SESSION_OPERATIONS,
  loadProvider,
  capabilities,
  createSession,

  /** Executes a generated automation suite through whichever provider owns suite execution. */
  runSuite: (args) => callOperation('runSuite', args, args && args.provider),
  /** Records a script. Output lands in the isolated, gitignored generated-output directory. */
  codegen: (args) => callOperation('codegen', args, args && args.provider),
  /** One-shot, unauthenticated screenshot. Authenticated screens need a session instead. */
  screenshot: (args) => callOperation('screenshot', args, args && args.provider),
  /** Opens a recorded trace. */
  showTrace: (args) => callOperation('showTrace', args, args && args.provider),
  /** Provider/engine version — used by the Playwright prerequisite check. */
  version: (args) => callOperation('version', args, args && args.provider),

  /** Where this provider writes generated artifacts — always isolated and gitignored. */
  generatedOutputDir: (projectRoot) => resolvePaths(projectRoot).generatedPlaywright,
};
