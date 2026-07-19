// Supplementary Stage 2 Discovery — RUN-20260712-001. Purely static DOM inspection of the
// pre-auth login screen, NO login attempt performed (no fields filled, no submit clicked) — so
// this does not count against the shared-env "at most one invalid attempt" budget already used.
// Triggered by cross-referencing the Reference SHAFT Project (E:\Automation2\NDC-Uplift-Automation)
// whose LogIn_Page.java locators imply two elements this run's original Discovery script did not
// detect: a "Remember Me" control (Btn_RememberMyInfoNextTime, a div-based checkbox, not a native
// <input type=checkbox> — which is why the original script's `input[type=checkbox]` query found
// none) and a loading-indicator attribute on the Login button itself (`loadingicon` attribute).
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

  await page.goto(profile.defaultBaseUrl, { waitUntil: 'networkidle', timeout: 20000 });

  results.rememberMeCandidates = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('div, span, label, p-checkbox'));
    return all
      .filter((el) => (el.innerText || '').toLowerCase().includes('remember'))
      .map((el) => ({ tag: el.tagName.toLowerCase(), class: el.className, text: (el.innerText || '').trim().slice(0, 60) }));
  });

  // Also check for the div-based checkbox class the reference project's locator implies
  // (p-checkbox-box is a PrimeNG class) even if no "remember" text is directly on that element.
  results.primeCheckboxCandidates = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.p-checkbox-box, [class*="checkbox"]')).map((el) => ({
      tag: el.tagName.toLowerCase(),
      class: el.className,
      parentText: (el.parentElement ? el.parentElement.innerText : '').trim().slice(0, 80),
    }));
  });

  results.loginButtonAttributes = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => (b.innerText || '').includes('Login'));
    if (!btn) return null;
    const attrs = {};
    for (const a of btn.attributes) attrs[a.name] = a.value;
    return attrs;
  });

  await page.screenshot({ path: path.join(OUT_DIR, 'login_screen_supplement.png'), fullPage: true });
  await context.close();
  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, '_login_discovery_supplement_results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch((err) => {
  console.error('Supplement discovery failed:', err.message);
  process.exit(1);
});
