// Stage 4A §11A live selector verification of the ADD AGENCY form — STRICTLY READ-ONLY (§27A).
// Enumerates the control inventory only. It never types, never clicks a control, and never clicks
// Send For Approval, so no record can be created and no validation state is triggered.
const { chromium } = require('C:/Users/Sheen/agentic-ai-testing-platform/node_modules/playwright');
const creds = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/credentials/credentials.json');
const profile = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/browser/profile.json');
const OUT = 'C:/Users/Sheen/AppData/Local/Temp/claude/c--Users-Sheen-agentic-ai-testing-platform/186f7a1f-0b02-4976-87ae-5c5fab30e20e/scratchpad/verify';

(async () => {
  const envKey = creds.activeEnvironment || creds.environment || Object.keys(creds.environments || {})[0];
  let env = (creds.environments && creds.environments[envKey]) || creds;
  const base = env.baseUrl || profile.defaultBaseUrl;
  const out = { verifiedAt: new Date().toISOString(), mode: 'headless', readOnly: true,
                codeStateAnchor: 'STG live build as of 2026-08-18', nonGetRequests: [] };
  const b = await chromium.launch({ headless: true, channel: 'chrome' });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1200 } });
  const p = await ctx.newPage();
  // Prove read-only: record any request that is not a GET.
  p.on('request', (r) => { if (r.method() !== 'GET') out.nonGetRequests.push(r.method() + ' ' + r.url()); });
  try {
    await p.goto(base + '/auth/login', { waitUntil: 'networkidle', timeout: 40000 });
    await p.waitForSelector(profile.login.usernameSelector, { state: 'visible', timeout: 25000 });
    await p.fill(profile.login.usernameSelector, env.username);
    await p.fill(profile.login.passwordSelector, env.password);
    env = null;
    await p.click(profile.login.submitSelector);
    await p.waitForURL((u) => !String(u).includes('/auth/login'), { timeout: 60000 });
    const loginPosts = out.nonGetRequests.length; // the login POST itself is expected

    await p.goto(base + '/admin/agency/add', { waitUntil: 'domcontentloaded', timeout: 40000 });
    // Same readiness rule as the Update form (REPAIR-014): spinners clear AND inputs visible.
    let polls = 0, vis = 0, spin = 99;
    for (let i = 0; i < 80; i++) {
      polls++;
      const st = await p.evaluate(() => ({
        vis: Array.from(document.querySelectorAll('input')).filter((e) => e.offsetParent !== null).length,
        spin: document.querySelectorAll('[class*="spinner"],[class*="loading"],[class*="p-progress"]').length,
      }));
      vis = st.vis; spin = st.spin;
      if (spin === 0 && vis > 20) break;
      await p.waitForTimeout(250);
    }
    out.readiness = { visibleInputs: vis, spinners: spin, msApprox: polls * 250,
                      totalInputs: await p.evaluate(() => document.querySelectorAll('input').length) };

    // Full control inventory, with the ancestor PrimeNG wrapper class for each — the fact that
    // decides whether a control is addressed directly or via its wrapper.
    out.controls = await p.evaluate(() => {
      const wrapperOf = (el) => {
        for (const cls of ['p-dropdown', 'p-checkbox', 'p-radiobutton', 'p-multiselect', 'p-calendar']) {
          if (el.closest('div.' + cls)) return cls;
        }
        return null;
      };
      const labelOf = (el) => {
        const host = el.closest('ndc-fg-input') || el.closest('.form-group') || el.parentElement;
        if (!host) return null;
        const lab = host.querySelector('label');
        return lab ? lab.innerText.trim().replace(/\s+/g, ' ') : null;
      };
      return Array.from(document.querySelectorAll('input, select, textarea')).map((el, i) => ({
        i, tag: el.tagName, type: el.getAttribute('type'), id: el.id || null,
        name: el.getAttribute('name') || null, placeholder: el.getAttribute('placeholder') || null,
        label: labelOf(el), wrapper: wrapperOf(el),
        visible: el.offsetParent !== null, readOnly: el.hasAttribute('readonly'),
        disabled: el.hasAttribute('disabled'), required: el.hasAttribute('required'),
        accept: el.getAttribute('accept') || null,
      }));
    });
    out.duplicateIds = await p.evaluate(() => {
      const seen = {}, dupes = {};
      document.querySelectorAll('[id]').forEach((e) => {
        seen[e.id] = (seen[e.id] || 0) + 1;
        if (seen[e.id] > 1) dupes[e.id] = seen[e.id];
      });
      return dupes;
    });
    out.buttons = await p.locator('button').allTextContents();
    out.sectionHeadings = await p.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,legend,.card-title,.panel-title'))
        .map((e) => e.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 40));
    out.productAccessRows = await p.locator('table tbody tr').count();
    out.mentionsPcc = await p.evaluate(() => /Airline Supplier credential/i.test(document.body.innerText));
    await p.screenshot({ path: OUT + '/shot_addform.png', fullPage: true });
    out.nonGetAfterLogin = out.nonGetRequests.slice(loginPosts);
  } catch (e) {
    out.fatal = String((e && e.stack) || e).slice(0, 700);
  } finally {
    await b.close().catch(() => {});
  }
  console.log(JSON.stringify(out, null, 1));
})();
