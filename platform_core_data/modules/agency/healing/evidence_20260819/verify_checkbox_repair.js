// Stage 5H diagnosis — READ-ONLY. Confirms the REPAIR-AG-001/002/003 hypothesis on the Add Branch
// form's Product Access grid: that div.p-checkbox-box exists inside each supplier row, that the outer
// div.p-checkbox is NOT the toggling element, and where p-highlight actually lives.
// Nothing is submitted. The only clicks are on a checkbox box on a form that is never saved.
const { chromium } = require('C:/Users/Sheen/agentic-ai-testing-platform/node_modules/playwright');
const creds = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/credentials/credentials.json');
const profile = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/browser/profile.json');
const OUT = 'C:/Users/Sheen/AppData/Local/Temp/claude/c--Users-Sheen-agentic-ai-testing-platform/186f7a1f-0b02-4976-87ae-5c5fab30e20e/scratchpad/verify';

(async () => {
  const envKey = creds.activeEnvironment || creds.environment || Object.keys(creds.environments || {})[0];
  let env = (creds.environments && creds.environments[envKey]) || creds;
  const base = env.baseUrl || profile.defaultBaseUrl;
  const r = { verifiedAt: new Date().toISOString(), mode: 'headless', submitted: false, nonGet: [] };
  const b = await chromium.launch({ headless: true, channel: 'chrome' });
  const p = await (await b.newContext({ viewport: { width: 1600, height: 1200 } })).newPage();
  p.on('request', (q) => { if (q.method() !== 'GET') r.nonGet.push(q.method() + ' ' + q.url().slice(0, 90)); });
  try {
    await p.goto(base + '/auth/login', { waitUntil: 'networkidle', timeout: 40000 });
    await p.waitForSelector(profile.login.usernameSelector, { state: 'visible', timeout: 25000 });
    await p.fill(profile.login.usernameSelector, env.username);
    await p.fill(profile.login.passwordSelector, env.password);
    env = null;
    await p.click(profile.login.submitSelector);
    await p.waitForURL((u) => !String(u).includes('/auth/login'), { timeout: 60000 });
    const loginPosts = r.nonGet.length;

    await p.goto(base + '/admin/branch/add', { waitUntil: 'domcontentloaded', timeout: 40000 });
    for (let i = 0; i < 80; i++) {
      if (await p.locator('table tbody tr').count() > 0) break;
      await p.waitForTimeout(250);
    }
    r.supplierRows = await p.locator('table tbody tr').count();

    // Structure of row 2's checkbox: does the box exist, and where does p-highlight sit?
    r.row2 = await p.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const row = rows[1];
      if (!row) return { error: 'no row 2' };
      const input = row.querySelector('input[type=checkbox]');
      if (!input) return { error: 'no checkbox input in row 2' };
      const wrapper = input.closest('div.p-checkbox');
      const box = wrapper ? wrapper.querySelector('div.p-checkbox-box') : null;
      return {
        inputId: input.id || null,
        inputChecked: input.checked,
        wrapperClass: wrapper ? wrapper.className : null,
        boxExists: !!box,
        boxClass: box ? box.className : null,
        highlightOnWrapper: wrapper ? wrapper.classList.contains('p-highlight') : null,
        highlightOnBox: box ? box.classList.contains('p-highlight') : null,
      };
    });

    const dispatch = (sel) => p.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return 'not found';
      const o = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent('mouseover', o));
      el.dispatchEvent(new MouseEvent('mousedown', o));
      el.dispatchEvent(new MouseEvent('mouseup', o));
      el.dispatchEvent(new MouseEvent('click', o));
      return 'dispatched';
    }, sel);

    const readRow2 = () => p.evaluate(() => {
      const row = document.querySelectorAll('table tbody tr')[1];
      const input = row.querySelector('input[type=checkbox]');
      const wrapper = input.closest('div.p-checkbox');
      const box = wrapper.querySelector('div.p-checkbox-box');
      return { checked: input.checked,
               highlightOnWrapper: wrapper.classList.contains('p-highlight'),
               highlightOnBox: box.classList.contains('p-highlight') };
    });

    // A: click the OUTER wrapper — the level the broken code used. Expect: no change.
    r.before = await readRow2();
    r.dispatchOuter = await dispatch('table tbody tr:nth-child(2) div.p-checkbox');
    await p.waitForTimeout(600);
    r.afterOuterClick = await readRow2();

    // B: click the INNER box — the level AddBranch_Page proved correct. Expect: toggles.
    r.dispatchInner = await dispatch('table tbody tr:nth-child(2) div.p-checkbox div.p-checkbox-box');
    await p.waitForTimeout(600);
    r.afterInnerClick = await readRow2();

    await p.screenshot({ path: OUT + '/shot_checkbox_repair.png', fullPage: false });
    r.nonGetAfterLogin = r.nonGet.slice(loginPosts);
  } catch (e) {
    r.fatal = String((e && e.stack) || e).slice(0, 700);
  } finally {
    await b.close().catch(() => {});
  }
  console.log(JSON.stringify(r, null, 1));
})();
