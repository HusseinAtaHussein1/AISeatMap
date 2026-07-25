// Stage 2 (Explorer Agent) discovery script for NDC Login screen — RUN-20260712-001.
// Uses raw Playwright (not BrowserDriver.authenticate(), which always completes a full valid
// login) so the pre-auth screen and a single safe invalid attempt can both be observed, then
// falls back to BrowserDriver for the valid-login confirmation. Never reads credentials.json
// itself for the invalid case — uses a fabricated, non-existent username only.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..');
const OUT_DIR = __dirname;
const profile = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'projects', 'NDC', 'browser', 'profile.json'), 'utf8'));

(async () => {
  const results = {};
  const browser = await chromium.launch({ channel: profile.browser.channel, headless: profile.browser.headless });
  const context = await browser.newContext({ viewport: profile.browser.viewport });
  const page = await context.newPage();

  // 1. Observe the raw login screen (pre-auth state)
  await page.goto(profile.defaultBaseUrl, { waitUntil: 'networkidle', timeout: 20000 });
  results.pageTitle = await page.title();
  await page.screenshot({ path: path.join(OUT_DIR, 'login_screen_initial.png'), fullPage: true });

  // Enumerate visible form fields/buttons/links for documentation (structure only, no values)
  results.fields = await page.evaluate(() => {
    const describe = (el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || null,
      id: el.id || null,
      name: el.getAttribute('name') || null,
      placeholder: el.getAttribute('placeholder') || null,
      text: (el.innerText || el.value || '').trim().slice(0, 60) || null,
    });
    return {
      inputs: Array.from(document.querySelectorAll('input')).map(describe),
      buttons: Array.from(document.querySelectorAll('button')).map(describe),
      links: Array.from(document.querySelectorAll('a')).map(describe).filter(l => l.text),
      checkboxes: Array.from(document.querySelectorAll('input[type=checkbox]')).map(describe),
    };
  });

  // 2. ONE safe invalid-login attempt — fabricated, non-existent username only, never the real
  //    shared credential (per the shared-env negative-testing default).
  await page.fill(profile.login.usernameSelector, 'qa_probe_nonexistent_user');
  await page.fill(profile.login.passwordSelector, 'ProbeOnly!23');
  await page.click(profile.login.submitSelector);
  await page.waitForTimeout(2000); // let any async validation/error render
  await page.screenshot({ path: path.join(OUT_DIR, 'login_screen_invalid_attempt.png'), fullPage: true });
  results.invalidAttemptUrl = page.url();
  results.invalidAttemptBodyText = (await page.locator('body').innerText()).slice(0, 2000);

  await context.close();
  await browser.close();

  // 3. Valid-login confirmation via the platform's own BrowserDriver (handles real credentials
  //    internally — this script never reads or sees them).
  const { BrowserDriver } = require(path.join(REPO_ROOT, 'tools', 'browser_driver', 'api'));
  const driver = await BrowserDriver.authenticate({ project: 'NDC', env: 'STG', headless: profile.browser.headless });
  results.validLoginUrl = driver.page.url();
  results.validLoginTitle = await driver.page.title();
  await driver.screenshot('login_screen_valid_post_login', { dir: OUT_DIR });
  const dialog = driver.takePendingDialog();
  results.unexpectedDialog = dialog || null;
  await driver.close();

  fs.writeFileSync(path.join(OUT_DIR, '_login_discovery_results.json'), JSON.stringify(results, null, 2));
  console.log('Login discovery complete.');
  console.log(JSON.stringify(results, null, 2));
})().catch((err) => {
  console.error('Discovery script failed:', err.message);
  process.exit(1);
});
