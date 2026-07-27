# Browser Automation Assets

Project-specific configuration for the shared **Browser Driver Layer** (`platform_core/tools/browser_driver/`) — see that folder's `README.md` for the full contract (this file only points to what's local to this project).

| File/folder | Contains | Secret? |
|---|---|---|
| `profile.json` | Auth + browser init only: default URL, browser launch settings, login selectors | No |
| `screens/*.json` | One file per screen's locators (e.g. `CredentialRoutesFilter.json`) | No |
| `components/*.json` | Shared/reusable locators (e.g. `GlobalNavigation.json`) | No |

**Credentials do not live here.** See [`../credentials/README.md`](../credentials/README.md) — `platform_core_data/knowledge_base/credentials/credentials.json`, git-ignored, loaded automatically by `BrowserDriver.authenticate()`.
