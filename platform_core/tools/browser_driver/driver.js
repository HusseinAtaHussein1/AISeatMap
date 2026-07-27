// Browser Driver Layer — internal auth/session bootstrap.
//
// This is SHARED PLATFORM INFRASTRUCTURE ONLY — a reusable execution engine. It contains no
// project-specific data: the browser configuration and credentials it loads live under
// platform_core_data/, the single project root (pipeline.md §1). Design principle
// (see tools/browser_driver/README.md):
//   Shared execution engine  -> platform_core/tools/
//   Project knowledge        -> platform_core_data/
//   Generated run outputs    -> platform_core_data/runs/{{RUN_FOLDER}}/  (that run's per-stage
//                                                                  artifacts, including the generated
//                                                                  automation package under
//                                                                  runs/{{RUN_FOLDER}}/automation/)
//   Automation baseline      -> platform_core_data/automation_baseline/  (the persistent Workspace
//                                                                  Automation Baseline, per framework —
//                                                                  it outlives any single run)
//   Browser Driver config    -> platform_core_data/knowledge_base/browser/       (Stage 2 exploration tooling —
//                                                                  NOT Stage 5 output; kept out of any
//                                                                  "automation" folder to avoid two
//                                                                  unrelated concepts sharing a name)
//   Credentials              -> platform_core_data/knowledge_base/credentials/   (git-ignored, never committed)
//
// This module is intentionally low-level and intentionally narrow: it knows how to load the
// Browser Profile (browser init + login mechanics ONLY — see profile.json's own
// contract below), load the Credentials file (WHO is logging in), launch a browser,
// and produce an authenticated Playwright `page`. It knows nothing about screens, menus,
// tables, or any other application-specific locator — that is Screen/Component Knowledge,
// loaded separately by `api.js` on demand (see `useScreen`/`useComponent`).
//
// Agents and automation scripts should NOT require this file directly — use `api.js`
// (`BrowserDriver`), which wraps this and exposes the operation-level API so agents never
// touch the Playwright API surface directly.
//
// SECURITY CONTRACT (do not weaken without updating tools/browser_driver/README.md):
//   - The Browser Profile (platform_core_data/knowledge_base/browser/profile.json) contains ONLY
//     non-secret structural configuration — defaultBaseUrl, browser settings, login
//     selectors/flow — and is versioned in this repo. It must stay small and stable; it is NOT a
//     place to accumulate screen/menu/table/dialog locators (see api.js) — those live in
//     platform_core_data/knowledge_base/browser/screens/ and .../components/.
//   - Credentials live at platform_core_data/knowledge_base/credentials/credentials.json, resolved from the
//     single project root — callers never need to pass a path. That file is real, secret, and
//     git-ignored (both a repo-root rule and a local platform_core_data/knowledge_base/credentials/.gitignore)
//     — it is NEVER committed. A non-secret platform_core_data/knowledge_base/credentials/credentials.template.json
//     is committed and shows the expected shape; a human copies it and fills in real values.
//   - The agent must not create or read this file itself — only this module (a plain Node
//     script the agent runs) reads it, and only at runtime.
//   - Credentials are read once, at call time, kept only in local variables for the duration of
//     the login sequence, and never written to any log, console, or artifact.
//   - This module never persists a copy of the credentials anywhere else. If a future change
//     needs a temporary file, it MUST be deleted (fs.unlink) before this function returns or throws.
//   - Calling code must not print `creds` or any of its fields, and must not paste credential
//     values into any Markdown/JSON artifact this platform generates.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Roots come from platform_paths, never from this file's own location: once the platform is
// installed inside a host project, `__dirname/../../..` is the host's repository, not the tool
// folder (pipeline.md §1.1). Resolved lazily so requiring this module never throws on a
// misconfigured install — the error surfaces when a path is actually needed.
const { resolveRoots } = require('../platform_paths/paths');

function dataRoot() {
  return resolveRoots().dataRoot;
}

// Everything this driver resolves is shared across runs, so all of it sits under knowledge_base/
// rather than at the data root (pipeline.md §10.4).
function knowledgeBase() {
  return path.join(dataRoot(), 'knowledge_base');
}

function projectBrowserDir() {
  return path.join(knowledgeBase(), 'browser');
}

function projectCredentialsPath() {
  return path.join(knowledgeBase(), 'credentials', 'credentials.json');
}

// UI Knowledge Base — canonical, versioned baseline screenshots + screen metadata. Distinct from
// Discovery run evidence (platform_core_data/runs/{{RUN_FOLDER}}/discovery/...), which stays per-run/temporary.
function projectUiScreenshotsDir() {
  return path.join(knowledgeBase(), 'ui', 'screenshots');
}

function loadProfile() {
  const profilePath = path.join(projectBrowserDir(), 'profile.json');
  if (!fs.existsSync(profilePath)) {
    throw new Error(
      `No browser profile found. Expected: ${profilePath}\n` +
      `Create it at platform_core_data/knowledge_base/browser/profile.json — see ` +
      `platform_core/tools/browser_driver/README.md.`
    );
  }
  return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
}

/**
 * Loads the credentials file (platform_core_data/knowledge_base/credentials/credentials.json, unless
 * `credentialsPathOverride` is given) and resolves which environment block to use.
 * Supported shapes (see tools/browser_driver/README.md):
 *   1. { "environment": "STG", "username": "...", "password": "...", "baseUrl": "..." }
 *   2. { "activeEnvironment": "STG", "environments": { "STG": {...}, "PREPROD": {...} } }
 *   3. { "username": "...", "password": "..." }   (flat, no environment label at all)
 * `envOverride` (the caller-supplied `env`) wins over anything named inside the file, when given.
 *
 * @returns {{ creds: {username, password, baseUrl?}, env: string|undefined }}
 */
function loadCredentials(envOverride, credentialsPathOverride) {
  const credentialsPath = credentialsPathOverride || projectCredentialsPath();

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `Credentials file not found: ${credentialsPath}\n` +
      `Create it yourself (not via the agent) by copying ` +
      `platform_core_data/knowledge_base/credentials/credentials.template.json to credentials.json in that ` +
      `same folder and filling in real values — see tools/browser_driver/README.md and ` +
      `platform_core_data/knowledge_base/credentials/README.md.`
    );
  }
  const parsed = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  let env = envOverride;
  let creds;

  if (parsed.environments) {
    env = env || parsed.activeEnvironment;
    if (!env) {
      throw new Error(
        `Credentials file uses the multi-environment shape but names no environment — ` +
        `pass { env } to authenticate(), or set "activeEnvironment" in the credentials file.`
      );
    }
    creds = parsed.environments[env];
    if (!creds) {
      throw new Error(`Credentials file has no "environments.${env}" block.`);
    }
  } else {
    // Shapes 1 and 3 — the file itself IS the (single) environment's credentials.
    env = env || parsed.environment;
    creds = parsed;
  }

  if (!creds.username || !creds.password) {
    throw new Error(
      `Resolved credentials for environment "${env}" are missing "username" and/or "password".`
    );
  }
  return { creds, env }; // in-memory only — never logged, never re-serialized
}

/**
 * Launches a browser per the Browser Profile's settings, authenticates against the resolved
 * environment, and returns the raw Playwright handles plus the loaded (non-secret) profile.
 * Prefer `api.js`'s `BrowserDriver.authenticate()` in calling code — this function is the
 * low-level building block.
 *
 * @param {object} opts
 * @param {string} [opts.env] - environment label, e.g. "STG" | "PREPROD" | "PROD" — overrides
 *   whatever the credentials file names itself; omit to let the credentials file decide.
 * @param {string} [opts.credentialsPath] - override the auto-resolved
 *   platform_core_data/knowledge_base/credentials/credentials.json path; only needed for edge cases (e.g. tests).
 * @param {boolean} [opts.headless] - overrides both the per-stage and global defaults when given
 * @param {string} [opts.stage] - pipeline stage label, e.g. "manual_execution". Selects a
 *   per-stage display-mode default from the profile's `browser.headlessByStage` map, so a stage
 *   whose purpose requires a visible browser gets one without every call site remembering to ask.
 *   Precedence: explicit `headless` argument > `headlessByStage[stage]` > `browser.headless`.
 */
async function launchAuthenticated({ env, credentialsPath, headless, stage } = {}) {
  const profile = loadProfile();
  let { creds, env: resolvedEnv } = loadCredentials(env, credentialsPath);

  const browserSettings = profile.browser || {};
  const byStage = browserSettings.headlessByStage || {};
  const stageDefault = stage && typeof byStage[stage] === 'boolean' ? byStage[stage] : undefined;
  const isHeadless = typeof headless === 'boolean'
    ? headless
    : typeof stageDefault === 'boolean'
      ? stageDefault
      : !!browserSettings.headless;

  const browser = await chromium.launch({
    channel: browserSettings.channel || 'chrome',
    headless: isHeadless,
  });
  const context = await browser.newContext({
    viewport: browserSettings.viewport || { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const baseUrl = creds.baseUrl || profile.defaultBaseUrl;
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 20000 });

  await page.fill(profile.login.usernameSelector, creds.username);
  await page.fill(profile.login.passwordSelector, creds.password);

  // Credentials are no longer needed after this point — drop the reference so nothing
  // downstream in this process can accidentally serialize/log it.
  creds = null;

  await page.click(profile.login.submitSelector);
  await page.waitForSelector(profile.login.successSelector, { timeout: 20000 });

  return { browser, context, page, profile, env: resolvedEnv };
}

module.exports = {
  launchAuthenticated,
  loadProfile,
  projectBrowserDir,
  projectCredentialsPath,
  projectUiScreenshotsDir,
};
