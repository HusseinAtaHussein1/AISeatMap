# NDC — Browser Automation Assets

Project-specific configuration for the shared **Browser Driver Layer** (`tools/browser_driver/`) — see that folder's `README.md` for the full contract (this file only points to what's local to NDC).

| File/folder | Contains | Secret? |
|---|---|---|
| `profile.json` | Auth + browser init only: default URL, browser launch settings, login selectors | No |
| `screens/*.json` | One file per screen's locators (e.g. `CredentialRoutesFilter.json`) | No |
| `components/*.json` | Shared/reusable locators (e.g. `GlobalNavigation.json`) | No |
| `pages/` | Reserved for future higher-level Page Object modules (JS, built on `BrowserDriver` + `screens/`/`components/`) if/when this project's automation grows past raw locator lookups | No |

**Credentials do not live here.** See [`../../credentials/README.md`](../../credentials/README.md) — `projects/NDC/credentials/credentials.json`, git-ignored, loaded automatically by `BrowserDriver.authenticate({project: 'NDC', ...})`.
