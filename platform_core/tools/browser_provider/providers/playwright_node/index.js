// playwright-node Browser Provider — registration surface.
//
// Implements the Browser Provider interface (../../interface.md) using the Playwright Node
// library, in-process. This provider supports the full interface, including a persistent
// authenticated session.
//
// Skills never require this file. The Browser Provider interface
// (platform_core/tools/browser_provider/index.js) loads it when platform.config.json names it.

const { PlaywrightNodeSession } = require('./session');
const driver = require('./driver');

const CAPABILITIES = Object.freeze({
  persistentSession: true,
  authenticate: true,
  navigate: true,
  click: true,
  type: true,
  select: true,
  screenshot: true,
  extractText: true,
  extractTable: true,
  waitFor: true,
  captureNetwork: true,
  dialogGuardrail: true,
  captureBaseline: true,
  runSuite: false, // executing a generated suite is the CLI provider's job
  codegen: false,
  showTrace: false,
});

module.exports = {
  id: 'playwright-node',
  engine: 'playwright',
  integration: 'node-library',
  capabilities: CAPABILITIES,

  /** Returns an authenticated session implementing the interface's session operations. */
  async createSession(opts = {}) {
    return PlaywrightNodeSession.authenticate(opts);
  },

  /** Non-session helpers exposed for completeness; not part of the Skill-facing contract. */
  _internal: driver,
};
