// Browser Driver Layer — internal auth/session bootstrap.
//
// This is SHARED PLATFORM INFRASTRUCTURE ONLY — a reusable execution engine. It contains no
// project-specific data. Every project's own browser configuration and credentials live inside
// that project's own folder — this module loads both dynamically by project name. Design
// principle (see tools/browser_driver/README.md):
//   Shared execution engine  -> tools/
//   Project knowledge        -> projects/
//   Generated outputs        -> projects/{PROJECT}/artifacts/                (includes Stage 4's
//                                                                              SHAFT automation package,
//                                                                              artifacts/automation/)
//   Browser Driver config    -> projects/{PROJECT}/browser/                  (Stage 2 exploration
//                                                                              tooling — NOT Stage 4
//                                                                              output; kept out of any
//                                                                              "automation" folder to
//                                                                              avoid two unrelated
//                                                                              concepts sharing a name)
//   Credentials              -> projects/{PROJECT}/credentials/              (git-ignored, never committed)
//
// This module is intentionally low-level and intentionally narrow: it knows how to load a
// project's Browser Profile (browser init + login mechanics ONLY — see profile.json's own
// contract below), load that project's Credentials file (WHO is logging in), launch a browser,
// and produce an authenticated Playwright `page`. It knows nothing about screens, menus,
// tables, or any other application-specific locator — that is Screen/Component Knowledge,
// loaded separately by `api.js` on demand (see `useScreen`/`useComponent`).
//
// Agents and automation scripts should NOT require this file directly — use `api.js`
// (`BrowserDriver`), which wraps this and exposes the operation-level API so agents never
// touch the Playwright API surface directly.
//
// SECURITY CONTRACT (do not weaken without updating tools/browser_driver/README.md):
//   - Browser Profiles (projects/{PROJECT}/browser/profile.json) contain ONLY
//     non-secret structural configuration — defaultBaseUrl, browser settings, login
//     selectors/flow — and are versioned in this repo, inside the project's own folder. They
//     must stay small and stable; they are NOT a place to accumulate screen/menu/table/dialog
//     locators (see api.js) — those live in that same project's screens/ and components/.
//   - Credentials live at projects/{PROJECT}/credentials/credentials.json, loaded automatically
//     by project name — callers never need to pass a path. That file is real, secret, and
//     git-ignored (both a repo-root rule and a local projects/{PROJECT}/credentials/.gitignore)
//     — it is NEVER committed. A non-secret projects/{PROJECT}/credentials/credentials.template.json
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

// platform_core/tools/browser_driver/driver.js -> repo root is three levels up.
const REPO_ROOT = path.join(__dirname, '..', '..', '..');

function projectBrowserDir(project) {
  return path.join(REPO_ROOT, 'projects', project, 'browser');
}

function projectCredentialsPath(project) {
  return path.join(REPO_ROOT, 'projects', project, 'credentials', 'credentials.json');
}

// UI Knowledge Base — canonical, versioned baseline screenshots + screen metadata. Distinct from
// Discovery run evidence (projects/{PROJECT}/artifacts/discovery/...), which stays per-run/temporary.
function projectUiScreenshotsDir(project) {
  return path.join(REPO_ROOT, 'projects', project, 'ui', 'screenshots');
}

function loadProfile(project) {
  const profilePath = path.join(projectBrowserDir(project), 'profile.json');
  if (!fs.existsSync(profilePath)) {
    throw new Error(
      `No browser profile for project "${project}". Expected: ${profilePath}\n` +
      `Create it under projects/${project}/browser/profile.json — see tools/browser_driver/README.md.`
    );
  }
  return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
}

/**
 * Loads a project's credentials file (projects/{PROJECT}/credentials/credentials.json, unless
 * `credentialsPathOverride` is given) and resolves which environment block to use.
 * Supported shapes (see tools/browser_driver/README.md):
 *   1. { "environment": "STG", "username": "...", "password": "...", "baseUrl": "..." }
 *   2. { "activeEnvironment": "STG", "environments": { "STG": {...}, "PREPROD": {...} } }
 *   3. { "username": "...", "password": "..." }   (flat, no environment label at all)
 * `envOverride` (the caller-supplied `env`) wins over anything named inside the file, when given.
 *
 * @returns {{ creds: {username, password, baseUrl?}, env: string|undefined }}
 */
function loadCredentials(project, envOverride, credentialsPathOverride) {
  const credentialsPath = credentialsPathOverride || projectCredentialsPath(project);

  if (!fs.existsSync(credentialsPath)) {
    throw new Error(
      `Credentials file not found: ${credentialsPath}\n` +
      `Create it yourself (not via the agent) by copying ` +
      `projects/${project}/credentials/credentials.template.json to credentials.json in that ` +
      `same folder and filling in real values — see tools/browser_driver/README.md and ` +
      `projects/${project}/credentials/README.md.`
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
 * @param {string} opts.project - project name, e.g. "NDC" (matches projects/NDC/browser/profile.json
 *   and projects/NDC/credentials/credentials.json)
 * @param {string} [opts.env] - environment label, e.g. "STG" | "PREPROD" | "PROD" — overrides
 *   whatever the credentials file names itself; omit to let the credentials file decide.
 * @param {string} [opts.credentialsPath] - override the auto-resolved
 *   projects/{PROJECT}/credentials/credentials.json path; only needed for edge cases (e.g. tests).
 * @param {boolean} [opts.headless] - overrides the profile's browser.headless default when given
 */
async function launchAuthenticated({ project, env, credentialsPath, headless }) {
  const profile = loadProfile(project);
  let { creds, env: resolvedEnv } = loadCredentials(project, env, credentialsPath);

  const browserSettings = profile.browser || {};
  const isHeadless = typeof headless === 'boolean' ? headless : !!browserSettings.headless;

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
