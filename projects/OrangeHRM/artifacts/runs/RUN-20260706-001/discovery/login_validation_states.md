# Discovery Snapshot — Login (Validation & Invalid-Credential States)

- **Run:** RUN-20260706-001
- **Project Context:** `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved)
- **Module (In Scope):** Login / Authentication & Access
- **URL:** https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
- **Timestamp:** 2026-07-06T10:25Z–10:32Z
- **Browser:** Chromium (Playwright MCP)
- **Logged-in user:** none (unauthenticated) throughout

## States Explored

### 1. Empty form submission

Both Username and Password textboxes show a client-side `Required` inline message immediately below the field on submitting an empty form. Screenshot: `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/login_empty_submit.png`.

### 2. Invalid credentials (wrong username, wrong password)

Submitting any incorrect Username/Password combination renders a red `role="alert"` banner reading **"Invalid credentials"** above the form, and the "Username : Admin / Password : admin123" demo-credential hint remains visible. Screenshot: `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/login_invalid_credentials.png`.

Confirmed identical `"Invalid credentials"` message whether the Username itself was valid (`Admin`) with a wrong Password, or the Username itself was also invalid (`wronguser`) — i.e., the Login form itself does not enumerate valid usernames through its error message. (Distinct from, but related to, the Forgot Password anti-enumeration check under Carried-Forward Risk #3 — see the Forgot Password discovery snapshot and the QA Assessment Report's Gap Analysis.)

### 3. Full Validation boundary sweep (Investigation Mode §5.7)

Performed against the Username field (Password held to a normal, non-empty value throughout, to isolate Username-specific behavior):

| Boundary condition | Result |
|---|---|
| Empty | Client-side `Required` |
| Spaces-only | No client-side block; server: "Invalid credentials" |
| Unicode (non-emoji) | "Invalid credentials" |
| **Emoji** | **"Unexpected error occurred"** — see `FINDING-001_EmojiUsernameUnexpectedError` |
| Long input (259 chars) | "Invalid credentials"; no visible max-length enforcement |
| SQL injection payload (probe only) | "Invalid credentials"; no bypass |
| Special characters / HTML | "Invalid credentials"; no reflection, no script execution |

Full detail, isolation testing, and evidence for the emoji anomaly are recorded in `artifacts/OrangeHRM/runs/RUN-20260706-001/findings/FINDING-001_EmojiUsernameUnexpectedError/metadata.md`.

## Console & Network

No console errors or warnings were observed across any of the above states (only a recurring benign `autocomplete` attribute suggestion). Each login submission is a standard HTML form POST to `/web/index.php/auth/validate`, receiving a `302` redirect back to `/web/index.php/auth/login`; the differing "Invalid credentials" vs "Unexpected error occurred" message is rendered server-side into the resulting page, not exposed as a distinct HTTP status or response body.

## Carried-Forward Assumption/Risk Coverage (this snapshot)

- Carried-Forward Observation #4 (login form UI stability, PRD NFR-1): **Confirmed still holds** for all states in this snapshot — 0 console errors across every submission, including the anomalous emoji case.
