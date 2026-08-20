// Stage 5H diagnosis — READ-ONLY except ticking two checkboxes and opening one dropdown (never submitted).
// Measures how long the option list items take to populate after the panel container appears, and
// whether a second click while it's open toggles it closed.
const { chromium } = require('C:/Users/Sheen/agentic-ai-testing-platform/node_modules/playwright');
const creds = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/credentials/credentials.json');
const profile = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/browser/profile.json');
const OUT = 'C:/Users/Sheen/AppData/Local/Temp/claude/c--Users-Sheen-agentic-ai-testing-platform/186f7a1f-0b02-4976-87ae-5c5fab30e20e/scratchpad/verify';

(async () => {
  const envKey = creds.activeEnvironment || creds.environment || Object.keys(creds.environments || {})[0];
  let env = (creds.environments && creds.environments[envKey]) || creds;
  const base = env.baseUrl || profile.defaultBaseUrl;
  const r = { verifiedAt: new Date().toISOString(), mode: 'headless', timeline: [] };
  const b = await chromium.launch({ headless: true, channel: 'chrome' });
  const p = await (await b.newContext({ viewport: { width: 1600, height: 1200 } })).newPage();
  const dispatch = (el) => p.evaluate((e) => {
    const o = { bubbles: true, cancelable: true, view: window };
    e.dispatchEvent(new MouseEvent('mouseover', o));
    e.dispatchEvent(new MouseEvent('mousedown', o));
    e.dispatchEvent(new MouseEvent('mouseup', o));
    e.dispatchEvent(new MouseEvent('click', o));
  }, el);
  try {
    await p.goto(base + '/auth/login', { waitUntil: 'networkidle', timeout: 40000 });
    await p.waitForSelector(profile.login.usernameSelector, { state: 'visible', timeout: 25000 });
    await p.fill(profile.login.usernameSelector, env.username);
    await p.fill(profile.login.passwordSelector, env.password);
    env = null;
    await p.click(profile.login.submitSelector);
    await p.waitForURL((u) => !String(u).includes('/auth/login'), { timeout: 60000 });

    await p.goto(base + '/admin/branch/add', { waitUntil: 'domcontentloaded', timeout: 40000 });
    for (let i = 0; i < 80; i++) { if (await p.locator('table tbody tr').count() > 0) break; await p.waitForTimeout(250); }

    for (const idx of [0, 1]) {
      const box = await p.evaluateHandle((i) => document.querySelectorAll('table tbody tr')[i]
        .querySelector('input[type=checkbox]').closest('div.p-checkbox').querySelector('div.p-checkbox-box'), idx);
      await dispatch(box);
      await p.waitForTimeout(400);
    }

    const dropdownHandle = await p.evaluateHandle(() => {
      const row = document.querySelectorAll('table tbody tr')[1];
      const cell = row.querySelectorAll('td')[2];
      return Array.from(cell.querySelectorAll('div')).filter((d) =>
        (' ' + d.className + ' ').split(' ').includes('p-dropdown'))[0];
    });

    const t0 = Date.now();
    await dispatch(dropdownHandle);
    // Poll every 100ms for up to 4s, recording panel count and item count/text at each tick.
    for (let i = 0; i < 40; i++) {
      const state = await p.evaluate(() => {
        const panels = document.querySelectorAll('.p-dropdown-panel');
        let items = [];
        if (panels.length) items = Array.from(panels[panels.length - 1].querySelectorAll('li')).map((li) => li.textContent.trim());
        return { panelCount: panels.length, itemCount: items.length, items: items.slice(0, 5) };
      });
      r.timeline.push({ ms: Date.now() - t0, ...state });
      if (state.itemCount > 0) break;
      await p.waitForTimeout(100);
    }

    // Does a SECOND click while it's open close it? (tests my retry loop's blind re-click risk)
    r.beforeSecondClick = await p.evaluate(() => document.querySelectorAll('.p-dropdown-panel').length);
    await dispatch(dropdownHandle);
    await p.waitForTimeout(300);
    r.afterSecondClick = await p.evaluate(() => document.querySelectorAll('.p-dropdown-panel').length);

    await p.screenshot({ path: OUT + '/shot_panel_timing.png', fullPage: false });
  } catch (e) {
    r.fatal = String((e && e.stack) || e).slice(0, 900);
  } finally {
    await b.close().catch(() => {});
  }
  console.log(JSON.stringify(r, null, 1));
})();
