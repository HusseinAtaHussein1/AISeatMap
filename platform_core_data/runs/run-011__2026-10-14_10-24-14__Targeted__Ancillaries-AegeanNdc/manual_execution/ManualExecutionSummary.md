# Manual Execution Summary - run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc

| Field | Value |
|---|---|
| Execution ID | run-011 manual execution |
| Run Folder | `run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc` |
| Results artifact | `manual_execution/ManualExecutionResults.md` |
| Generated | 2026-10-14 |
| Status | Pending Review |

## 2. Execution Summary

This run tested the Ancillaries Seat Map suite against supplier AegeanNdc (credential AegeanNDCProd) on Staging, in the Admin and the Portal, for UI, E2E and Regression only. The suite has 124 cases. 27 were excluded because the supplier does not support them (Meal, Bundle, and flynas-only rules) and 2 were rejected at Review, so 95 were in the executable scope. Of those, 69 Passed, 8 Failed, 3 were Inconclusive, 12 were Blocked, 0 were Skipped and 3 were Not Executed. The 20 cases first skipped by the Execution Safety Policy were re-run after the owner relaxed the policy for this run only (BOOK, HOLD, PAYMENT set to Approval Required, policy v2): two real bookings were made and 13 of those cases passed or failed on them, while hold and clash cases were Blocked. The main findings are two Critical exit-seat defects (an adult with an infant can take an exit seat), free pricing of chargeable seats on leg 2, a hidden 20-minute booking-link limit, and silent loss of seats when passenger data is edited. Two real bookings were made on Staging (wallet 5,000,000 -> 4,914,556.7 EGP) and must be cancelled by hand in Admin; this run cannot cancel or refund. The Statement report does not show the payments (TC-RPT-002).

**Headline figures:** 69 Passed · 8 Failed · 12 Blocked · 0 Skipped · 3 Not Executed · 3 Inconclusive · 29 Excluded

**Scope:** 95 of 124 cases were in the executable scope. Pass rate 72.6% is against that scope.

## 5. Delivery Artifacts

| Artifact | Path | Present? |
|---|---|---|
| Manual Execution Results (authoritative) | `manual_execution/ManualExecutionResults.md` | Yes |
| Manual Test Results CSV | `manual_execution/ManualTestResults.csv` | Yes |
| Manual QA Report | `manual_execution/ManualQAReport.md` | Yes |
| Evidence | `manual_execution/artifacts/` | Yes |

**All renderings agree on every status:** Yes - generated from one result set in a single pass.

**Scripts produced:** none. A throwaway helper script was used in the session scratch folder only to send browser commands and has not been added to the repository.

## 6. Known Limitations

| Limitation | Affected Test Case(s) | Why |
|---|---|---|
| Booking cases not run |  | Policy v1 forbade booking; re-run after the owner's run-scoped approval (policy v2). Remaining ones are Blocked, see section 3 |
| No second aircraft type | TC-SM-RND-007 | Only the A321neo flies CAI-FCO |
| Price Update pop-up never appeared | TC-SM-FRC-001/002/003/005 | The suite note says it only happens with flynas |
| No non-EGP credential | TC-SM-PRC-005 | AegeanNDCProd is in Egyptian Pound |
| Time-based cases skipped by the operator | TC-SM-PER-004, TC-SM-ERR-002 | Need 10-20 minutes of waiting |
| Server failure cannot be forced | TC-SM-ERR-001 | Did not occur in eight searches |
| Seat rules only the airline can enforce | TC-SM-PAX-008 | Needs a completed booking |
| Fare package and meal cases not applicable | TC-SM-NAV-002 and others | Supplier has none |
| No Traceability Matrix | all | None exists beside this suite; requirement coverage cannot be computed |
| Admin precheck only for the branch/credential | - | Admin-side cases outside this suite were not in scope |
| Credential Type shows Live | - | AegeanNDCProd reads Credential Type = Live, PCC Classification = Flight Search Only, although the operator confirmed it is not production. Please confirm. |

## 7. Recommendations

| ID | Recommendation | Applies To | Rationale |
|---|---|---|---|
| R1 | Fix exit-seat rule for infant-holders and make it follow the Assigned-to link | TC-SM-EXR-002, TC-SM-EXR-005 | Critical safety rule bypassed |
| R2 | Reject a Chargeable seat priced at 0 | TC-SM-PRC-002 | Free chargeable seats on leg 2 |
| R3 | Show the real 20-minute limit, warn before expiry, and redirect to flight search on an invalid link | TC-SM-NEG-006, TC-SM-PER-004 | Hidden limit and silent HTTP 400 |
| R4 | Keep seats and bags when passenger data is edited, or warn first | TC-SM-CNF-018 | Silent data loss |
| R5 | Allow one open passenger section and show errors for closed ones | TC-SM-PAX-007 | Hidden validation |
| R6 | Show charges per journey in the breakdown | TC-SM-RTP-005 | Known fault |
| R7 | Update the suite for non-flynas suppliers (feature words, Occupied wording, baggage weights, infant baggage text, section names) | TC-SM-STA-002/004, TC-BG-001, TC-SM-PAX-006 | Documentation gaps |
| R8 | Cancel the two real bookings (Trip IDs AGN9748HUSNDCORD261014LOSA1D, AGN9748HUSNDCORD26101433BRIN) in Admin, and restore policy v1 from the backup if booking should be forbidden again | Wallet 4,914,556.7 EGP | Manual |
| R9 | Confirm the credential type of AegeanNDCProd | - | Shows Live |
| R10 | Open items: SUP-OQ-01, 04, 06 from the supplier checklist remain | - | Unanswered at intake |
