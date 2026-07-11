// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  fullyParallel: false, // shared public demo — avoid concurrent mutating actions racing each other
  retries: 0, // no automatic retries: this run's regression tests are EXPECTED to fail until the underlying bugs are fixed; retrying would obscure that signal
  reporter: [['list'], ['json', { outputFile: '../../execution/playwright-report.json' }]],
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
