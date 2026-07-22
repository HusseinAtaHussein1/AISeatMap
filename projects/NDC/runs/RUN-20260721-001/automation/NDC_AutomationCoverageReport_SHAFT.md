# NDC — Automation Coverage Report — RUN-20260721-001 — SHAFT

**Status:** Pending Review

## Decision Counts

| Decision | Count | % of 22 |
|---|---|---|
| Generate New Automation | 13 | 59.1% |
| Partially Automatable | 1 | 4.5% |
| Manual Only | 8 | 36.4% |
| Reuse Existing Automation | 0 | 0% |

## Named Reasons — Partially Automatable / Manual Only

| Test Case(s) | Decision | Reason |
|---|---|---|
| TC-ROLE-001 | Partially Automatable | Full end-to-end successful save not attempted — mutation not authorized this run (Project Context §5). Automated the safe, non-mutating signal instead (see Decision Report). |
| TC-ROLE-005, 006, 007, 008, 017, 018 | Manual Only | Test Design's own assumption-based disposition — behavior not independently verified in Discovery; automating would mean inventing the expected assertion, which this agent must never do (§14 Execution Rule). |
| TC-ROLE-021, 022 | Manual Only (Exploratory charter) | Finding disposition (FINDING-001/FINDING-004) — no fixed pass/fail assertion is possible for a control/list that doesn't match the AC, per explicit user instruction not to assert these Covered against the AC's original wording. |

## Automation Coverage Percentage

13/22 = **59.1%** fully automated (Generate), 4.5% partially automated, 36.4% deliberately left Manual — 0% Uncovered (every test case received a decision).

## Locator Strategy Disclosure

Per §24: `Role_Page.java`'s tab locators (`tabByLabel()`) use Level 1-equivalent (accessible visible text) matching in preference to the Reference Project's positional `p-tabpanel-{N}-label` IDs (Level 4-equivalent, fragile — see FINDING-004's tier-dependent-list risk). The permission-checkbox locators use the real Angular `formcontrolname` attribute (Level 2-equivalent, a stable framework-level attribute) scoped by row-label text — not yet independently confirmed live through SHAFT's own Selenium binding this run (Known Limitation, both Manifest and Decision Report).
