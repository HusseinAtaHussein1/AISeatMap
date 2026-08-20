// Stage 5H diagnosis — READ-ONLY except for ticking two checkboxes on a form never submitted.
// Reproduces the exact failing sequence: open Add Branch, tick row 1's status checkbox, tick row 2's,
// then inspect row 2's credential dropdown's full readiness signal set (the same four AddBranch_Page
// checks for: visible, p-disabled class, aria-disabled, pointer-events) rather than guessing.
const { chromium } = require('C:/Users/Sheen/agentic-ai-testing-platform/node_modules/playwright');
const creds = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/credentials/credentials.json');
const profile = require('C:/Users/Sheen/agentic-ai-testing-platform/platform_core_data/knowledge_base/browser/profile.json');
const OUT = 'C:/Users/Sheen/AppData/Local/Temp/claude/c--Users-Sheen-agentic-ai-testing-platform/186f7a1f-0b02-4976-87ae-5c5fab30e20e/scratchpad/verify';

(async () => {
  const envKey = creds.activeEnvironment || creds.environment || Object.keys(creds.environments || {})[0];
  let env = (creds.environments && creds.environments[envKey]) || creds;
  const base = env.baseUrl || profile.defaultBaseUrl;
  const r = { verifiedAt: new Date().toISOString(), mode: 'headless', nonGet: [] };
  const b = await chromium.launch({ headless: true, channel: 'chrome' });
  const p = await (await b.newContext({ viewport: { width: 1600, height: 1200 } })).newPage();
  p.on('request', (q) => { if (q.method() !== 'GET') r.nonGet.push(q.method() + ' ' + q.url().slice(0, 90)); });
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
    const loginPosts = r.nonGet.length;

    await p.goto(base + '/admin/branch/add', { waitUntil: 'domcontentloaded', timeout: 40000 });
    for (let i = 0; i < 80; i++) { if (await p.locator('table tbody tr').count() > 0) break; await p.waitForTimeout(250); }

    // Tick row 1's box (mirrors AddBranch_Page.fillMandatoryBaseline's default first-row selection).
    const box1 = await p.evaluateHandle(() => document.querySelectorAll('table tbody tr')[0]
      .querySelector('input[type=checkbox]').closest('div.p-checkbox').querySelector('div.p-checkbox-box'));
    await dispatch(box1);
    await p.waitForTimeout(500);

    // Tick row 2's box.
    const box2 = await p.evaluateHandle(() => document.querySelectorAll('table tbody tr')[1]
      .querySelector('input[type=checkbox]').closest('div.p-checkbox').querySelector('div.p-checkbox-box'));
    await dispatch(box2);
    await p.waitForTimeout(500);

    r.rowsAfterTicking = await p.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.slice(0, 4).map((row, i) => {
        const input = row.querySelector('input[type=checkbox]');
        const wrapper = input ? input.closest('div.p-checkbox') : null;
        const box = wrapper ? wrapper.querySelector('div.p-checkbox-box') : null;
        return { rowIndex: i + 1, checked: input ? input.checked : null, highlighted: box ? box.classList.contains('p-highlight') : null };
      });
    });

    // Row 2's credential dropdown -- the full readiness signal set AddBranch_Page checks.
    r.row2Dropdown = await p.evaluate(() => {
      const row = document.querySelectorAll('table tbody tr')[1];
      const cell = row.querySelectorAll('td')[2]; // td[3], 0-indexed
      if (!cell) return { error: 'no td[3] in row 2' };
      const dropdowns = Array.from(cell.querySelectorAll('div')).filter((d) =>
        (' ' + d.className + ' ').split(' ').includes('p-dropdown'));
      if (dropdowns.length === 0) return { error: 'no exact p-dropdown match in row 2 td[3]', cellHtml: cell.outerHTML.slice(0, 500) };
      const el = dropdowns[0];
      const cs = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        matchCount: dropdowns.length,
        outerHTML: el.outerHTML.slice(0, 600),
        rect: { w: rect.width, h: rect.height },
        display: cs.display, visibility: cs.visibility, pointerEvents: cs.pointerEvents,
        classList: el.className,
        ariaExpanded: el.getAttribute('aria-expanded'),
        ariaDisabled: el.getAttribute('aria-disabled'),
        hasPDisabledClass: (' ' + el.className + ' ').indexOf(' p-disabled ') !== -1,
      };
    });

    // Now actually try clicking it and see what happens to aria-expanded / panel count.
    const beforePanels = await p.locator('.p-dropdown-panel').count();
    const dropdownHandle = await p.evaluateHandle(() => {
      const row = document.querySelectorAll('table tbody tr')[1];
      const cell = row.querySelectorAll('td')[2];
      return Array.from(cell.querySelectorAll('div')).filter((d) =>
        (' ' + d.className + ' ').split(' ').includes('p-dropdown'))[0];
    });
    await dispatch(dropdownHandle);
    await p.waitForTimeout(800);
    r.afterClick = {
      panelsNow: await p.locator('.p-dropdown-panel').count(),
      panelsBefore: beforePanels,
      ariaExpandedNow: await p.evaluate((el) => el ? el.getAttribute('aria-expanded') : null, dropdownHandle),
    };

    await p.screenshot({ path: OUT + '/shot_row2_dropdown.png', fullPage: true });
    r.nonGetAfterLogin = r.nonGet.slice(loginPosts);
  } catch (e) {
    r.fatal = String((e && e.stack) || e).slice(0, 900);
  } finally {
    await b.close().catch(() => {});
  }
  console.log(JSON.stringify(r, null, 1));
})();
