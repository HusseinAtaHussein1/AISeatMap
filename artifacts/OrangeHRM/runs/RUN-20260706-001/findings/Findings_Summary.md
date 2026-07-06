# Findings Summary — OrangeHRM (RUN-20260706-001)

Index of every finalized Finding raised during this run. Scope: Login / Authentication & Access only, per `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved). This file is kept current throughout the run and is checked for duplicates before any new Finding is created (§5.8 of `agents/explorer_agent.md`).

| ID | Type | Severity | Confidence | Status | Occurrence Count | Related Module | Description |
|---|---|---|---|---|---|---|---|
| FINDING-001 | Security Concern | Medium | 95% | Needs Human Review | 1 | Login / Authentication & Access | Emoji character in the Username field produces a generic "Unexpected error occurred" alert instead of the normal "Invalid credentials" message; isolated to the Username field only. |
| FINDING-002 | Security Concern | Low (see Investigation Notes — PRD itself rates this High) | 95% | Needs Human Review | 1 | Login / Authentication & Access | 5 consecutive failed logins against the valid Admin username showed no CAPTCHA, lockout, delay, or rate-limit headers — re-confirms PRD SR-5. |
| FINDING-003 | Bug | High | 98% | Confirmed | 1 | Login / Authentication & Access | Forgot Password submission for the valid username "Admin" times out (504 Gateway Time-out) instead of returning the PRD-required generic success message; reproduced 2/2. |
| FINDING-004 | Security Concern | Medium | 90% | Needs Human Review | 1 | Login / Authentication & Access | Forgot Password outcome differs sharply by username validity (504 timeout vs. fast success) — a behavioral/timing side channel for username enumeration, independent of message-text parity. |
