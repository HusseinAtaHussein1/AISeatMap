> **Status:** Pending Automation Approval · **Run:** RUN-20260712-001, Stage 4.

# Automation Coverage Report — NDC Login (SHAFT Export)

## Decision Counts

| Decision | Count | % of Suite |
|---|---|---|
| Reuse Existing Automation | 0 | 0% |
| Generate New Automation | 8 | 100% |
| Partially Automatable | 0 | 0% |
| Manual Only | 0 | 0% |
| **Total** | **8** | **100%** |

## Automation Coverage

**100%** of the 8 approved Login test cases received Generate New Automation. As with the earlier Playwright package, this reflects a deliberately-scoped Login-only Manual Test Suite (see `../test_design/NDC_CoverageReport.md` for the full Coverage Gaps — lockout/rate-limiting/security-input/boundary-value scenarios remain deferred, and Logout remains out of current scope, both by deliberate Engineering Decision).

## Named Reasons — Partially Automatable / Manual Only

None this package — no test case received either decision.

## Carried-Forward Caveats

- TC-LOGIN-003/005/006's exact assertion text is sourced from the Reference Project (Documentation-category evidence), not this run's own Direct Observation.
- TC-LOGIN-008 has not yet been executed even once — its first real observation will be at Stage 5.
