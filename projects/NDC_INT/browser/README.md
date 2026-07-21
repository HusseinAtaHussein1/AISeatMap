# NDC_INT — Browser Automation Assets

Project-specific configuration for the shared **Browser Driver Layer** (`tools/browser_driver/`) — see that folder's `README.md` for the full contract.

| File/folder | Contains | Secret? |
|---|---|---|
| `profile.json` | Auth + browser init only: default URL, browser launch settings, login selectors. **Not yet created** — add it after a one-time inspection of this application's login page. | No |
| `screens/*.json` | One file per screen's locators | No |
| `components/*.json` | Shared/reusable locators (e.g. a global navigation bar) | No |
| `pages/` | Reserved for future higher-level Page Object modules if/when this project's automation grows past raw locator lookups | No |

**Credentials do not live here.** See [`../../credentials/README.md`](../../credentials/README.md) — `projects/NDC_INT/credentials/credentials.json`, git-ignored, loaded automatically by `BrowserDriver.authenticate({project: 'NDC_INT', ...})`.
