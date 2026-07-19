// Data Layer helper — resolves the real NDC STG credential ONLY at test-execution time (never at
// generation time, never logged). Mirrors tools/browser_driver/driver.js's loadCredentials
// contract so this suite never duplicates real values into a versioned JSON file. Not part of the
// Locators/Pages/Tests layers proper — a thin Data Layer utility, per
// projects/NDC/automation_framework.md §4 ("no hardcoded data in code").
const fs = require('fs');
const path = require('path');

function loadValidCredential() {
  const credentialsPath = path.join(__dirname, '..', '..', '..', '..', '..', '..', 'credentials', 'credentials.json');
  const parsed = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const env = parsed.activeEnvironment;
  const creds = parsed.environments ? parsed.environments[env] : parsed;
  if (!creds.username || !creds.password) {
    throw new Error('Resolved NDC credentials are missing username/password.');
  }
  return creds; // in-memory only for the duration of the test — never logged or written elsewhere
}

module.exports = { loadValidCredential };
