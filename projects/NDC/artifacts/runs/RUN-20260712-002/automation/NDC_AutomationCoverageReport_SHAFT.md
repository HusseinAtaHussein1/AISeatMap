# NDC — Automation Coverage Report — RUN-20260712-002 — SHAFT

| Metric | Value |
|---|---|
| Total approved test cases | 17 |
| Generate (unconditional) | 6 (35%) |
| Generate (conditional, pending TC-BRANCH-006) | 1 (6%) |
| Partially Automatable | 7 (41%) |
| Manual Only (Exploratory-test dispositions) | 3 (18%) |
| Compilation status | **BUILD SUCCESS** (`mvn -o clean test-compile`, 7 main + 6 test source files, 2026-07-12) |

## By Module

| Module | Generate | Partially Automatable | Manual Only |
|---|---|---|---|
| Branch (7 cases) | 2 unconditional + 1 conditional | 3 | 1 |
| Agency (5 cases) | 2 | 2 | 1 |
| Staff (5 cases) | 2 | 2 | 1 |

Automation Coverage (Generate ÷ total, unconditional only) = 6/17 = **35%**. Including the conditional case, 7/17 = **41%**. This is lower than the Login run's suite (8/8 Generate) because this scope's forms are materially larger and less exhaustively validated during Discovery (bounded Spike, per Coverage_Summary's 67% Discovery coverage) — the Partially Automatable rate directly reflects that, not a defect in this stage's own work.
