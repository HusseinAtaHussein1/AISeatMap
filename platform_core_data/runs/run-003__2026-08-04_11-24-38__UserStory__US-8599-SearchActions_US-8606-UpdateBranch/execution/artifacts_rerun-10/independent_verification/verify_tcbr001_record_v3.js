const path = require('path');
const { BrowserDriver } = require(path.join(
  'e:/Projects/agentic-ai-testing-platform/platform_core/tools/browser_driver/api'
));

(async () => {
  const driver = await BrowserDriver.authenticate({ env: 'STG', headless: false });
  await driver.navigate('/admin/branch');
  await driver.page.waitForTimeout(800);

  // Capture the request payload for a plain, unfiltered "Both" status search (mirrors production's
  // own clickSearch() with no name filter), so we know the real POST body shape.
  let capturedPayload = null;
  driver.page.on('request', (req) => {
    if (/Branch\/search/.test(req.url()) && req.method() === 'POST') {
      capturedPayload = req.postData();
    }
  });

  await driver.page.click("xpath=//label[@for='id-Status-Both']");
  await driver.page.click("xpath=//button[@type='submit'][contains(., 'Search')]");
  await driver.page.waitForTimeout(1000);
  console.log('CAPTURED_PAYLOAD=' + capturedPayload);

  // Now replay the search endpoint directly via fetch, with a large page size, reusing the browser's
  // own authenticated session/cookies -- read-only GET/POST, no UI mutation.
  const result = await driver.page.evaluate(async (payloadTemplate) => {
    const body = payloadTemplate ? JSON.parse(payloadTemplate) : {};
    const res = await fetch('http://192.168.1.70:8080/odeysysadmin/Master2/Branch/search?size=2000&page=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    const json = await res.json();
    return { status: res.status, keys: Object.keys(json), total: json.totalElements || json.total || null, sampleRecord: (json.content || json.data || json.rows || [])[0] || null, raw: json };
  }, capturedPayload);

  console.log('RESULT_STATUS=' + result.status);
  console.log('RESULT_KEYS=' + JSON.stringify(result.keys));
  console.log('RESULT_RAW_SNIPPET=' + JSON.stringify(result.raw).slice(0, 2000));
  const list = result.raw.content || result.raw.data || result.raw.rows || result.raw;
  const arr = Array.isArray(list) ? list : [];
  const matches = arr.filter((r) => JSON.stringify(r).includes('QA_BRANCH'));
  console.log('TOTAL_RECORDS_FETCHED=' + arr.length);
  console.log('MATCHES_COUNT=' + matches.length);
  console.log('MATCHES=' + JSON.stringify(matches, null, 2));

  await driver.close();
})().catch((err) => {
  console.error('VERIFY_SCRIPT_ERROR', err);
  process.exitCode = 1;
});
