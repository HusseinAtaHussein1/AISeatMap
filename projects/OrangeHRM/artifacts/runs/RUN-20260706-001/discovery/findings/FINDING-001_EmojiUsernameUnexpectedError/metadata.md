# FINDING-001

- **Finding Type:** Security Concern
- **Severity:** Medium
- **Confidence:** 95%
- **Status:** Needs Human Review

## Description

Submitting a login attempt with an emoji character (a 4-byte-UTF-8 / supplementary-plane Unicode character) in the **Username** field produces a generic `"Unexpected error occurred"` alert, instead of the standard `"Invalid credentials"` message returned for every other tested invalid-credential input (wrong username, wrong password, empty, spaces-only, long input, SQL-injection-style payload, HTML/script special characters, and non-emoji multi-script Unicode). The distinct error path suggests the request is failing at the server (most likely during the username lookup/encoding step) rather than being evaluated as a normal authentication failure.

## Expected Behavior

Not defined in Project Context. The Project Context (`artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md`, §2/§6) authorizes probing login-form input handling but does not state what the system should do with non-BMP Unicode (emoji) input specifically. PRD §5.1 FR-1 only states "the system must present a login form"; it does not specify error-handling behavior for malformed/unusual credential input.

## Actual Behavior

- Username = `😀` (or any tested emoji/emoji combination), Password = any normal string → response alert text: **`"Unexpected error occurred"`**.
- Username = normal string, Password = `😀` → response alert text: `"Invalid credentials"` (normal path) — the anomaly is isolated to the **Username** field.
- The underlying HTTP request is a standard form POST to `/web/index.php/auth/validate`, which returns `302` back to `/web/index.php/auth/login` in both the normal-failure and emoji-failure cases (the differing message is rendered server-side into the subsequent GET response, not visible as a distinct HTTP status). No stack trace, exception detail, or other information disclosure was observed in the rendered page or response headers.
- No browser console errors were raised in either case (0 errors, 0 warnings in both the normal-failure and emoji-failure runs — only a recurring benign `autocomplete` attribute suggestion unrelated to this Finding).
- `document.cookie` returned empty in both cases (no session cookie readable via JS — consistent with an `HttpOnly` cookie, a positive security property, noted here for completeness rather than as a defect).

## Steps to Reproduce

1. Navigate to `https://opensource-demo.orangehrmlive.com/web/index.php/auth/login` (unauthenticated).
2. Enter `😀` (or any other emoji) into the **Username** field.
3. Enter any string into the **Password** field (the anomaly does not require a specific password value).
4. Click **Login**.
5. Observe the alert banner reads **"Unexpected error occurred"** rather than **"Invalid credentials"**.

## Related Module

Login / Authentication & Access (in scope per Project Context §2)

## Related User Journey

Login form credential submission (PRD §5.1 FR-1)

## Retry Result

Failure category: not listed in the Retry Policy (§5.6) — not a Navigation failure, Timeout, Validation failure, Network failure, or Unexpected UI rendering in the strict sense (the page rendered correctly; it displayed a different, valid alert message). Per §5.6's default rule, treated as "No retry" — validated once by reproduction, not retried further via the Retry Policy. (Reproducibility was instead established via the Investigation Workflow's Validate step — see Investigation Notes below — not via the Retry Policy's retry counters.)

## Investigation Notes

Full Validation-category boundary sweep (§5.7) performed against the Username field, each with a normal Password value to isolate the Username field's behavior:

| Boundary condition | Username value | Result |
|---|---|---|
| Empty | *(blank)* | Client-side "Required" validation (both fields) |
| Spaces-only | `"   "` | No client-side block (whitespace not treated as empty by the client) — server returned "Invalid credentials" normally |
| Unicode (non-emoji, BMP) | `Ådmïn日本語Пользователь` | "Invalid credentials" — normal |
| **Emoji (supplementary plane)** | `😀🎉🔥💀👾` / `😀` | **"Unexpected error occurred"** — anomalous, reproduced 3 times across 2 separate emoji sets |
| Long input | 259-character string | "Invalid credentials" — normal; no visible max-length client-side enforcement, but no error either |
| SQL injection payload (input-handling probe only) | `' OR '1'='1' -- ` | "Invalid credentials" — normal; no authentication bypass observed |
| Special characters / HTML | `<script>alert(1)</script>&%$#@!{}[]|\;"'` | "Invalid credentials" — normal; no script execution, no reflected value in the field after redirect |

Isolation test: emoji placed in the Password field only (Username normal) → "Invalid credentials" (normal). This confirms the anomaly is specific to the **Username** field's handling of supplementary-plane Unicode characters, not Password, and not Unicode in general (only emoji-range characters reproduce it; accented Latin/CJK/Cyrillic in the earlier combined test did not).

Investigation Mode's other two categories (Navigation, Authorization) do not apply to this candidate — it is a pure Validation/input-handling condition confined to one field.

No boundary condition was skipped; all were within Environment Constraints (input-handling/error-message observation only, no destructive follow-through, no actual exploitation attempted).

## Occurrence Count

1 (encountered under 2 distinct emoji strings across 3 submissions — all treated as the same underlying condition, not separate Findings, per §5.8 Duplicate Detection)

## Evidence List

- `before.png` — login form immediately before submitting the emoji-username case
- `failure.png` — the "Unexpected error occurred" alert state after submission
- `console.log` — browser console output captured at the failure state (0 errors/warnings; one unrelated benign autocomplete-attribute notice)
- `network.log` — network request list captured at the failure state (shows the `POST /web/index.php/auth/validate` → `302` pattern, identical HTTP shape to the normal-failure case)
- Not captured: HAR-level request/response body for the `/auth/validate` POST (Playwright MCP's network tool exposes headers/status per request but the response body for the `302` redirect is empty by nature of a redirect; the differing message is rendered into the subsequent page's HTML, which is what `failure.png` and the alert-text capture above document instead)

## Recommendation

Confirm with the development/product team whether this is a caught application exception (e.g., a database column encoding limitation such as `utf8` vs `utf8mb4` rejecting 4-byte characters in a username lookup) surfaced via a generic error handler. If so, consider: (a) whether the generic message is an acceptable user-facing fallback for malformed input (arguably fine from a security-disclosure standpoint, since it doesn't leak detail) or (b) whether input should instead be validated/sanitized before reaching the point that raises this exception, for robustness. No action needed if this is a known, accepted limitation of the demo environment.
