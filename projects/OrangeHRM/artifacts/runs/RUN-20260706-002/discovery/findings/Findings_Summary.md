# Findings Summary — RUN-20260706-002

Scope: Login + PIM (read/search/validate only), per `OrangeHRM_ProjectContext.v2.md` (Approved).

| ID | Title | Category | Severity | Confidence | Status | Occurrence Count | Module |
|---|---|---|---|---|---|---|---|
| FINDING-001 | Emoji in Username field triggers generic server error | Security Concern | Medium | 95% | Needs Human Review | 1 | Login |
| FINDING-002 | No brute-force/lockout protection on repeated failed logins | Security Concern | Low (PRD rates High) | 95% | Needs Human Review | 1 | Login |
| FINDING-003 | Employee Id filter silently fails (422, no feedback) above 10 characters | Bug | Medium | 98% | Confirmed | 1 | PIM |
| FINDING-004 | Employee Id uniqueness-check endpoint returns HTTP 500 for emoji input | Bug | Medium | 98% | Confirmed | 1 | PIM |
| FINDING-005 | Forgot Password times out (504) for a valid, existing username | Bug | High | 98% | Confirmed | 1 | Login |
| FINDING-006 | Forgot Password outcome differs by username validity — timing side channel | Security Concern | Medium | 92% | Needs Human Review | 1 | Login |
