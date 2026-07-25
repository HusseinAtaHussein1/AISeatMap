// Diagnosis Strategy (agents/execution_agent.md §26.0) for TC-LOGIN-002 — read-only evidence
// capture, no automation code change. One fresh attempt with the fabricated username, capturing
// console errors, network activity for the login POST, and full page HTML at the moment the
// automation's own check would have looked for the "Invalid credentials" element.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '..');
const OUT_DIR = __dirname;
const profile = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'projects', 'NDC', 'browser', 'profile.json'), 'utf8'));

(async () => {
  const results = { console: [], network: [] };
  const browser = await chromium.launch({ channel: profile.browser.channel, headless: profile.browser.headless });
  const context = await browser.newContext({ viewport: profile.browser.viewport });
  const page = await context.newPage();

  page.on('console', (msg) => results.console.push({ type: msg.type(), text: msg.text() }));
  page.on('requestfinished', async (req) => {
    if (req.url().includes('login') || req.url().includes('auth')) {
      const res = await req.response();
      results.network.push({
        url: req.url(), method: req.method(),
        status: res ? res.status() : null,
        postData: req.postData() ? req.postData().replace(/"password[^,}]*/i, '"password":"[REDACTED]"') : null,
      });
    }
  });
  page.on('requestfailed', (req) => {
    results.network.push({ url: req.url(), method: req.method(), failed: true, errorText: req.failure()?.errorText });
  });

  await page.goto(profile.defaultBaseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector(profile.login.usernameSelector, { timeout: 15000 });
  await page.fill(profile.login.usernameSelector, 'qa_probe_nonexistent_user');
  await page.fill(profile.login.passwordSelector, 'ProbeOnly!23');
  await page.click(profile.login.submitSelector);

  // Sample the DOM at 1s, 3s, 5s, 10s post-click — same timeout budget class as SHAFT's own wait,
  // but capturing full page state at multiple points instead of only a single presence check.
  const samples = [];
  for (const delayMs of [1000, 2000, 2000, 2000, 3000]) { // cumulative: 1s,3s,5s,7s,10s
    await page.waitForTimeout(delayMs);
    const bodyText = await page.locator('body').innerText();
    const hasInvalidCredEl = await page.locator('[aria-label="Invalid credentials, Please try again."]').count();
    samples.push({
      atMsSinceClick: samples.length === 0 ? 1000 : samples[samples.length - 1].atMsSinceClick + delayMs,
      hasInvalidCredElement: hasInvalidCredEl > 0,
      bodyTextSnippet: bodyText.slice(0, 300),
    });
  }
  results.samples = samples;

  await page.screenshot({ path: path.join(OUT_DIR, 'tc002_diagnostic_final_state.png'), fullPage: true });
  results.finalUrl = page.url();
  results.finalHtmlLength = (await page.content()).length;
  fs.writeFileSync(path.join(OUT_DIR, 'tc002_diagnostic_final_state.html'), await page.content());

  await context.close();
  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, '_tc002_diagnostic_results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch((err) => {
  console.error('Diagnostic script failed:', err.message);
  process.exit(1);
});
