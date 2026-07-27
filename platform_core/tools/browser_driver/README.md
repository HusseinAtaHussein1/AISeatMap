# Browser Driver Layer

The platform's shared, standard mechanism for live browser access — used by **Browser Automation** Discovery Mode (`.claude/skills/explorer-skill/SKILL.md` §8.1 #1), the Manual Execution Agent's execution of manually-designed test cases (`.claude/skills/manual-execution-skill/SKILL.md` §11), and any other stage needing a live, logged-in browser session (e.g. the Automation Agent's selector-verification use of browser tools, `.claude/skills/automation-skill/SKILL.md` §17).

**Design principle — four clearly separate responsibilities, never blurred:**

| Responsibility | Answers | Lives | Secret? |
|---|---|---|---|
| **Shared execution engine** | HOW the driver itself works (Playwright wiring, guardrails) | `platform_core/tools/browser_driver/` | No |
| **Browser Profile** | HOW to initialize the browser and log in | `platform_core_data/knowledge_base/browser/profile.json` | No |
| **Screen / Component Knowledge** | WHERE things are on a given screen (locators) | `platform_core_data/knowledge_base/browser/screens/*.json`, `.../components/*.json` | No |
| **Credentials** | WHO is logging in | `platform_core_data/knowledge_base/credentials/credentials.json` | **Yes — git-ignored, never committed** |

`platform_core/tools/browser_driver/` itself contains **only** the reusable engine (`driver.js`, `api.js`, this README) — zero project-specific data. Everything project-specific lives under `platform_core_data/`, so retargeting the platform at a different application means editing that folder's contents and never touching the engine.

**`platform_core_data/knowledge_base/browser/` is deliberately NOT named or nested under "automation".** `platform_core_data/automation_baseline/` is a completely different concept — the Automation Agent's Stage 5 output (the generated SHAFT automation package, per `.claude/skills/automation-skill/SKILL.md`). The Browser Driver is Stage 2 (Explorer) tooling, not automation-skill output; the repo must never have two unrelated folders both named "automation."

```js
const { BrowserDriver } = require('../../platform_core/tools/browser_driver/api');

const driver = await BrowserDriver.authenticate({
  env: 'STG',        // optional — omit to let the credentials file's activeEnvironment/environment decide
  // stage: 'manual_execution', // optional — selects that stage's display-mode default from
  //                             // the profile's browser.headlessByStage. Stage 4 maps to headed.
  // headless: false,          // optional — forces a headed window regardless of stage/profile.
  //                           // Omit both: the profile's browser.headless default is `true`.
});

driver.useComponent('GlobalNavigation');    // load shared nav locators
driver.useScreen('CredentialRoutesFilter'); // load this screen's locators

await driver.navigate('/master/supplier/credential-routes-filter/add');
await driver.click('supplierDropdown');
await driver.screenshot('add-routes-filter', { dir: '<scratchpad>/screenshots' });

const dialog = driver.takePendingDialog();
if (dialog) { /* stop and ask the human — see project constraints */ }

await driver.close();
```

Credentials are loaded **automatically** from `platform_core_data/knowledge_base/credentials/credentials.json` by project name — you never pass a credentials path in normal use.

## 1. Shared execution engine — `platform_core/tools/browser_driver/`

```
tools/
└── browser_driver/
    ├── driver.js   # low-level: resolve project paths, load profile + credentials, launch, authenticate
    ├── api.js      # BrowserDriver — the ONLY surface agents/scripts use
    └── README.md   # this file
```

Contains no project names, no selectors, no URLs, no credentials — purely the reusable engine. `driver.js` computes every project-specific path (`platform_core_data/knowledge_base/browser/...`, `platform_core_data/knowledge_base/credentials/...`) dynamically from the `project` argument at call time.

## 2. Browser Profile — inside the repo, small, stable, never secret

```
platform_core_data/
└── browser/
    ├── profile.json   # <- Browser Profile: auth + browser init ONLY
    ├── screens/       # <- Screen Knowledge (see §3)
    ├── components/    # <- Component Knowledge (see §3)
    └── pages/         # <- reserved for future higher-level Page Object modules
```

A profile contains **only**:
- `defaultBaseUrl`
- `browser` — launch/context settings (`channel`, `headless` default, `headlessByStage` per-stage display-mode overrides, `viewport`, anything else Playwright's launch/context options need)
- `login` — username/password/submit selectors, and a post-login success signal
- `notes` (optional, human-readable)

**Nothing else.** No screen locators, no menu/nav locators, no table/dialog/component locators — those are Screen/Component Knowledge (§3). Keeping this file small and stable is deliberate.

## 3. Screen / Component Knowledge — inside the repo, but NOT in the Profile

```
platform_core_data/knowledge_base/browser/
├── screens/
│   ├── CredentialRoutesFilter.json
│   └── ...
└── components/
    ├── GlobalNavigation.json
    └── ...
```

As the platform discovers new screens, locators go **here**, one small file per screen or shared component — never appended into `profile.json`. Analogous to a Page Object / Screen Definition pattern: each file is scoped to one screen or one reusable piece of UI, so no single file grows without bound.

- `useScreen(name)` loads `screens/{name}.json` into the driver's active locator set.
- `useComponent(name)` loads `components/{name}.json` into the same set (both additive; last-loaded wins on key collision).
- `click()`/`type()`/`select()`/`waitFor()`/`extractText()`/`extractTable()` accept either a dotted key into the active set (e.g. `"nav.master"`, `"addButton"`) or a literal Playwright selector, used as-is if no matching key is found.

## 4. Credentials — inside the repo's working tree, but never in Git

```
platform_core_data/
└── credentials/
    ├── credentials.template.json   # committed — non-secret placeholder (schema only, empty strings)
    ├── .gitignore                  # blocks everything except this file, README.md, and the template
    ├── README.md
    └── credentials.json            # YOUR real credentials — created locally, NEVER committed
```

**Rules — non-negotiable:**

1. **`credentials.json` is real and lives on local disk inside the project folder, but is git-ignored** by two overlapping mechanisms: the repo root `.gitignore`'s `**/credentials.json` rule, and a second, local `.gitignore` inside `platform_core_data/knowledge_base/credentials/` itself (belt-and-suspenders). Never remove either rule, and never `git add -f` this file.
2. **`credentials.template.json` must contain ONLY the schema** — empty-string placeholders, never real values. If real values ever end up in the template by mistake (they have, once — see Revision history), move them to `credentials.json` immediately and restore the template to placeholders.
3. **The agent does not create or read `credentials.json`.** A human creates it themselves — typically by copying `credentials.template.json` to `credentials.json` in the same folder and filling in real values. Its contents must never appear in the agent's tool output, chat messages, or any generated artifact. (The platform IS responsible for scaffolding `credentials.template.json`/`.gitignore`/`README.md` themselves — those contain no secrets and are ordinary repo setup.)
4. **Shape** — three supported forms, resolved by `driver.js`'s `loadCredentials`:
   ```json
   { "environment": "STG", "username": "...", "password": "...", "baseUrl": "..." }
   ```
   ```json
   {
     "activeEnvironment": "STG",
     "environments": {
       "STG":     { "baseUrl": "...", "username": "...", "password": "..." },
       "PREPROD": { "baseUrl": "...", "username": "...", "password": "..." },
       "PROD":    { "baseUrl": "...", "username": "...", "password": "..." }
     }
   }
   ```
   ```json
   { "username": "...", "password": "..." }
   ```
   `env` passed to `authenticate()` overrides whatever the file names itself (`environment`/`activeEnvironment`); omit it to let the file decide. `baseUrl` is optional in every shape — falls back to the profile's `defaultBaseUrl`.
5. **Resolved automatically from the single project root** — `BrowserDriver.authenticate({env, stage, headless})` resolves `platform_core_data/knowledge_base/credentials/credentials.json` itself; an explicit `credentialsPath` override exists only for edge cases (e.g. tests) and should not be needed in normal use.
6. **In-memory only, at runtime only.** `driver.js` reads the file once per call, uses the values only to fill the login form, and drops the in-memory reference immediately after submitting login.
7. **Never logged, never echoed, never copied into artifacts.** No console output, discovery snapshot, Finding, or report may contain a credential value. (One diagnostic `cat` of the file happened during initial setup while debugging a "file doesn't exist" report that turned out to mean "real values ended up in the template" — see Revision history. That's a standing lesson, not a repeatable exception.)
8. **No temporary copies.** If a future change needs an intermediate file, it must be deleted (`fs.unlink`) before the function returns or throws — never left on disk.
9. **Not session-scoped.** This file persists across sessions on local disk (protected only by `.gitignore`, not by living outside the working tree) — a deliberate tradeoff the user chose so credentials don't need re-entry every session. Delete it yourself if you want it gone.

## Browser Driver API (`api.js`)

`BrowserDriver` is the only interface agents/scripts should use — never `require('playwright')` directly in an automation script.

| Method | Purpose |
|---|---|
| `BrowserDriver.authenticate({env, stage, headless, credentialsPath?})` | Static — loads the profile, loads credentials (both auto-resolved under `platform_core_data/`), launches, logs in, returns a session. Every argument is optional. `stage` (e.g. `'manual_execution'`) picks that stage's display mode from `browser.headlessByStage`; precedence is `headless` > `headlessByStage[stage]` > `browser.headless`. |
| `useScreen(name)` / `useComponent(name)` | Loads that screen's/component's locators into the active set. |
| `navigate(pathOrUrl)` | Absolute URL or a path relative to the profile's `defaultBaseUrl`. |
| `click(keyOrSelector)` | Dotted key (from loaded Screen/Component knowledge) or a literal selector. |
| `type(keyOrSelector, text)` | Fills a field. |
| `select(keyOrSelector, optionLabel)` | Picks a `<select>` option by visible label. |
| `screenshot(name, {dir, fullPage})` | Saves a PNG, returns its path. |
| `extractText(keyOrSelector)` | Returns trimmed inner text. |
| `extractTable(keyOrSelector)` | Returns `string[][]` (rows × cells, header row included). |
| `waitFor(keyOrSelector, opts)` | Waits for an element/state. |
| `captureNetwork()` | Drains and returns request/response events captured since the last call. |
| `takePendingDialog()` | Drains and returns the last unexpected dialog (already auto-dismissed — never auto-accepted). Check this after any action that might trigger one, and stop per project constraints if it returns non-null. |
| `close()` | Closes the browser. |

## Adding a new project

1. Inspect the project's login page once (selectors for username/password fields, submit button, a reliable post-login success signal).
2. Create `platform_core_data/knowledge_base/browser/profile.json` with `defaultBaseUrl` + `browser` + `login` — nothing more.
3. Create `screens/` and `components/` subfolders as you explore, one file per screen/shared component.
4. Create `platform_core_data/knowledge_base/credentials/` with `credentials.template.json` (schema only) + `.gitignore` + `README.md` (mirror `platform_core_data/knowledge_base/credentials/` — the platform scaffolds these automatically), then have a human copy the template to `credentials.json` and fill in real values.
5. Document the above briefly in the project's own `run_configuration.md` — without ever storing actual secret values there.

## Revision history

- **v1:** Flat `profiles/{PROJECT}.json` inside `platform_core/tools/browser_driver/`, credentials in the session scratchpad under an unrelated `browser-driver/` path.
- **v2:** Profile moved to `platform_core/tools/browser_driver/platform_core_data/profile.json`, `api.js`/`BrowserDriver` introduced, credentials moved to `<scratchpad>/platform_core_data/knowledge_base/credentials.json`. Profile still had a growing `locators` map (wrong place — see v3).
- **v3:** Locator knowledge split out of the profile entirely into `screens/`/`components/`, loaded on demand via `useScreen()`/`useComponent()`. Profile reduced to strictly auth + browser init.
- **v4:** All project-specific assets (profile, screens, components) moved out of `platform_core/tools/browser_driver/` entirely, into `platform_core_data/automation/browser/` — the shared engine folder now contained only `driver.js`/`api.js`/this README.
- **v5:** Credentials moved from the session scratchpad into `platform_core_data/knowledge_base/credentials/credentials.json` — real, git-ignored (two overlapping `.gitignore` rules), loaded automatically by project name (no more explicit `credentialsPath` in normal use). Traded session-scoping for one-time-setup convenience, per explicit user decision. During this transition, real credentials briefly ended up inside the tracked `credentials.template.json` by mistake (a human filled in the wrong file) — caught before anything was committed (`git log`/`git diff --cached` confirmed no history), corrected by moving the real values to `credentials.json` and restoring the template to placeholders. Lesson: the platform scaffolds `credentials.template.json` itself (non-secret, so this is ordinary repo setup, not something to defer to a human) — a human should never need to hand-author it, only copy it to `credentials.json`.
- **v6 (current):** `platform_core_data/automation/browser/` renamed to `platform_core_data/knowledge_base/browser/` — "automation" was already the name of Stage 4's own output folder (`platform_core_data/workspace/automation/`, the Automation Agent's generated SHAFT package), and the repo must never have two unrelated folders sharing that name. The Browser Driver is Stage 2 (Explorer) tooling, not Automation Agent output.

No real credentials file was ever committed under any prior convention.
