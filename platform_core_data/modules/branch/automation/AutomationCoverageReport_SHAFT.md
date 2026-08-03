# Automation Coverage Report — SHAFT — run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch

| Field | Value |
|---|---|
| Module | `branch` |
| Produced by run | `run-002__2026-08-03_10-26-17__UserStory__US-8605CreateBranch` |
| Revision | 1 |
| Framework | SHAFT Engine |
| Decision Report | `modules/branch/automation/AutomationDecisionReport_SHAFT.md` |
| Candidates decided | 13 |
| Generated | 2026-08-03 |

## 1. Automation Coverage

**100%** — basis: 13 of 13 candidate cases (`Review = Approved AND Automation = Approved`) received a Generate New Automation decision.

## 2. Decision Counts

| Decision | Count | % of Candidates |
|---|---|---|
| Reuse Existing Automation | 0 | 0% |
| Generate New Automation | 13 | 100% |
| Partially Automatable | 0 | 0% |
| Manual Only | 0 | 0% |
| **Total** | 13 | 100% |

## 3. By Module and Suite

| Module | Suite | Candidates | Automated | Partial | Manual Only |
|---|---|---|---|---|---|
| branch | CreateBranchSuite | 13 | 13 | 0 | 0 |

## 4. Estimate Reconciliation

| Decision | Projected (Plan §9) | Realized | Variance | Why |
|---|---|---|---|---|
| Reuse / Generate | 13 (100%) | 13 (100%) | None | The estimate was deliberately unhedged because it was grounded in this same run's fresh (hours-old) Stage 4M live-execution evidence, not a guess — see Automation Plan §9 |
| Partially Automatable | 0 (0%) | 0 (0%) | None | — |
| Manual Only | 0 (0%) | 0 (0%) | None | — |

## 5. Partially Automatable — Named Reasons

*(None — count is zero.)*

## 6. Manual Only — Named Reasons

*(None — count is zero.)*

## 7. Coverage Against the Manual Suite

| Stage | Count | Dropped Here | Why |
|---|---|---|---|
| Designed (Stage 3) | 39 | — | — |
| Manually executed (Stage 4M — other branch, informational only) | 31 | 8 | `Review = Rejected` — never authorized to run in the Manual branch either (independent of this branch's own scope filter) |
| Automation-approved scope (`Automation = Approved`, this stage's actual scope source) | 13 | 18 | `Automation = Rejected` — a deliberate reviewer decision to keep these 18 manual-only, not a gap this stage introduced or could close |
| Automated (this stage) | 13 | 0 | Every case in scope received Generate New Automation — no further drop-out |
