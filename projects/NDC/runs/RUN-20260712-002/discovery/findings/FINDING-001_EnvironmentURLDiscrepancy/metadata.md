- **Finding ID:** FINDING-001
- **Title:** Documented STG base URL (`192.168.1.70`) does not match the URL actually used to authenticate (`192.168.1.80`)
- **Category:** Observation
- **Severity:** N/A (not a defect claim in the application itself)
- **Severity Reason:** N/A category default — this is a platform documentation/tooling discrepancy, not application behavior.
- **Confidence Score:** 95% — directly observed from two authoritative sources (see Evidence Links) plus the live post-login URL.
- **Evidence Category:** Direct Observation (post-login URL) + Static Artifact (config file contents)
- **Status:** Needs Human Review
- **Business Risk:** Low directly, but if `192.168.1.70` is genuinely stale, anyone following `run_configuration.md`'s documented URL by hand would land on the wrong/unreachable host.
- **Technical Risk:** `platform_core_data/browser/profile.json`'s `defaultBaseUrl` is `http://192.168.1.70`, but `platform_core_data/credentials/credentials.json`'s STG `baseUrl` (`http://192.168.1.80/auth/login`) wins per `tools/browser_driver/driver.js`'s `baseUrl = creds.baseUrl || profile.defaultBaseUrl` — so login correctly reaches `.80`. However, `BrowserDriver.navigate()` resolves **relative** paths against `profile.defaultBaseUrl` (`.70`), not the session's actual host — any future script calling `driver.navigate('/some/path')` would silently attempt to resolve against the wrong host. This run's scripts avoided the bug by only ever using `driver.page.click(...)` (in-session) navigation, never `driver.navigate()`.
- **Module:** Environment / Browser Driver tooling (not an Admin/Branch/Agency/Staff application module)
- **Workflow:** Session authentication (any Discovery/Execution run)
- **Description:** `run_configuration.md` states the URL was "confirmed via live screenshots, 2026-07-10" as `http://192.168.1.70`, but the credentials file used for every live session since then points at `.80`, and the actual post-login page is `http://192.168.1.80/dashboard`.
- **Expected Behavior:** Not defined in the Project Context (this is an environment-config question, not an application requirement).
- **Actual Behavior:** Login succeeds against `.80`; `.70` was not reached or tested this run.
- **Steps to Reproduce:** Run `BrowserDriver.authenticate({project:'NDC', env:'STG'})` and inspect `driver.page.url()` post-login; compare against `platform_core_data/run_configuration.md`'s documented URL.
- **Investigation/Recovery Result:** Not applicable — this is a configuration observation, not a runtime failure.
- **Investigation Notes:** Confirmed by reading `profile.json` and (non-secret keys only) `credentials.json`'s environment/baseUrl structure — password/username values were never read or displayed.
- **Root Cause Hypothesis:** Possibly the staging host was re-IP'd after 2026-07-10 and `credentials.json` was updated to match while `run_configuration.md` and `profile.json` were not. Confidence: 40% — plausible but unconfirmed; alternative is that `.70` was always a typo.
- **Occurrence Count:** 1
- **Evidence Links:** `run_configuration.md` (documented URL), `platform_core_data/browser/profile.json` (defaultBaseUrl), `platform_core_data/credentials/credentials.json` (STG.baseUrl — non-secret field only, read via a `node -e` structural check, values not displayed here); live-observed `driver.page.url()` = `http://192.168.1.80/dashboard`.
- **Recommendation:** Confirm with whoever owns the STG environment which URL is current, then update `profile.json`'s `defaultBaseUrl` (and `run_configuration.md`) to match `credentials.json`, and confirm/fix `driver.navigate()`'s relative-path resolution so it never silently targets a stale host.

**Correction / new evidence (2026-07-13, RUN-20260713-001):** the original hypothesis — that `.70`
and `.80` are the same reachable host, just documented inconsistently — is now contradicted. The
SHAFT/Java suite's `LogIn_Page.java` has always logged in against `.70` (hardcoded
`NDC_LOGIN_URL`), and its Repair Round 2 rerun (2026-07-13) created a real Agency record,
`QA_SPIKE_Agency01`, there. A `tools/browser_driver` (Playwright) search against `.80` — the host
`profile.json`/`credentials.json` were updated to point at earlier the same day — for that exact
record, and for a broader partial-name match, both returned **zero results**, while a baseline
search on `.80` with no name filter returned real, unrelated `Approved` records. This is now
evidence that **`.70` and `.80` are two distinct environments/datasets**, not one host documented
under two different addresses — not merely a stale-config question.

**Resolved 2026-07-13 (human decision):** `.80` is confirmed as the actual, current NDC STG
environment. `.70` was stale. `LogIn_Page.java`'s `NDC_LOGIN_URL` corrected from `.70` to `.80`;
the Agency Repair Round 2 suite (TC-AGENCY-001/004/005) was re-run against the corrected login and
all 3 still pass (3/3) — the fixes in REP-004/REP-005 are data-driven, not tied to either specific
environment's dataset. `profile.json`'s `defaultBaseUrl` (already `.80`, changed earlier this run)
required no further change. Status upgraded from `Needs Human Review` to **Resolved**.
