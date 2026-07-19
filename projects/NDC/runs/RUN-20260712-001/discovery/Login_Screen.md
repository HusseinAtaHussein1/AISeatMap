# NDC — Discovery Snapshot: Login Screen

**Run:** RUN-20260712-001 · **Discovery Mode:** Browser Automation (direct, live interaction — `tools/browser_driver/` + a supplementary raw Playwright script, `_login_discovery.js`, kept alongside this snapshot) · **Evidence Category:** Direct Observation

## Screen

- **URL:** `http://192.168.1.70/auth/login` (pre-auth landing page at the profile's `defaultBaseUrl`)
- **Page title:** `NDC`
- **Screenshot (initial state):** `login_screen_initial.png`

## Structure Observed

| Element | Selector | Notes |
|---|---|---|
| Username field | `input#id-Username` | `type=text`, placeholder "Username" |
| Password field | `input#id-Password` | `type=password`, placeholder masked |
| Login button | `button[type=submit]` (text "Login") | |
| Forgot Password link | `a` (text "Forgot Password?") | Present — existence confirmed; **flow itself not exercised**, out of scope for this run (Project Context v2 §3) |

No "Remember me" checkbox or any other control observed on this screen.

## Behaviour Observed

### 1. Invalid login attempt (one, per the shared-env negative-testing default)

- **Input:** Username `qa_probe_nonexistent_user` (fabricated, non-existent — never the real shared credential), Password `ProbeOnly!23` (fabricated).
- **Result:** Remained on `http://192.168.1.70/auth/login`. Inline message rendered: **"Invalid credentials, Please try again."**
- **Screenshot:** `login_screen_invalid_attempt.png`
- No dialog, no console-visible crash, no HTTP error page.

### 2. Valid login (existing project credential, via `BrowserDriver.authenticate()`)

- **Result:** Redirected to **`http://192.168.1.80/dashboard`** (page title "NDC - Dashboard").
- **Screenshot:** `login_screen_valid_post_login.png`
- No unexpected dialog captured.

## Open Question / Observation

The valid-login redirect lands on host `192.168.1.80`, a **different IP than the login screen's own host** (`192.168.1.70`, `browser/profile.json`'s `defaultBaseUrl`). This may be an intentional multi-host architecture (e.g., a separate app server behind the same network segment) or may be worth confirming with the infrastructure owner — not something this Discovery pass can resolve on its own. Recorded as **FINDING-NDC-LOGIN-001** (see `findings/Findings_Summary.md`), Category: Observation, Status: Needs Human Review (Evidence Category: Direct Observation, but "is this intentional" is a question for a human, not something browser observation alone can confirm per `agents/explorer_agent.md` §11 rule 9 — an unexplained cross-host redirect is not, by itself, evidence of a defect).

## Deferred (per Project Context v2 §5 / §6 item 4 — shared-env negative-testing default)

Lockout, brute-force/repeated-invalid-attempt, rate-limiting, and any security-input (e.g., SQL-injection-style payload) testing were **not** performed this run — deliberately deferred, not silently skipped, per explicit user instruction (shared staging environment). See Coverage Report (Stage 3) Coverage Gaps.
