# Manual QA Report - run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc

## 1. Run Identification

- Run folder: `run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc`; Run Scope / Type: Targeted (supplier-feature ancillaries / aegean-ndc)
- Environment: Staging (Admin 192.168.1.83, Portal 192.168.1.83:9500); supplier AegeanNdc, credential AegeanNDCProd, branch NDC1_Hussein, agency AGN9748
- Window: 2026-10-14 08:40-10:35 UTC; executed by Claude with the operator (Hussien Ata) logging in; browser headed

## 2. Executive Summary

The Portal's seat map works well for normal use: maps open per flight, seats can be chosen, moved and cleared, prices add up, and nothing leaked between flights. But two safety rules fail (an adult with an infant can take an exit seat), chargeable seats are free on one leg, and several flows lose or hide the agent's work. Two real bookings were later made with the owner's approval; they confirm totals and the wallet debit, but the Statement report is missing the payments, and the hold cases are Blocked because the Portal has no Hold option. 69 of 95 executable cases passed.

## 3. Outcome Figures

| Status | Count | % of executable scope (95) | % of suite total (124) |
|---|---|---|---|
| Passed | 69 | 72.6% | 55.6% |
| Failed | 8 | 8.4% | 6.5% |
| Blocked | 12 | 12.6% | 9.7% |
| Skipped | 0 | 0.0% | 0.0% |
| Not Executed | 3 | 3.2% | 2.4% |
| Inconclusive | 3 | 3.2% | 2.4% |
| Excluded - Not supported by supplier | 27 | - | 21.8% |
| Excluded - Rejected at Review | 2 | - | 1.6% |

## 4. Requirement Coverage

Requires Upstream Stage: no Requirement Traceability Matrix exists for this suite, so coverage per requirement cannot be computed. No requirement is claimed as verified. Test case groups verified: A (navigation), B (map), C (colours), D (choosing), E (several passengers/flights), F (prices), I (keeping choices), M (passenger types), P (exit seats), S (return and multi-city), U (baggage, partial).

## 5. Defect Register

| ID | Title | Status | Severity | Priority | Category |
|---|---|---|---|---|---|
| TC-SM-STA-004 | Seat features use known wording | Inconclusive | - | - | Documentation mismatch |
| TC-SM-PRC-002 | A seat marked 'Chargeable seat' must always have a price | Failed | High | P1 | Business Rule |
| TC-SM-NEG-006 | Opening the booking page with a broken or missing link | Failed | Medium | P2 | Workflow |
| TC-SM-PAX-007 | Closed passenger sections still report missing information | Failed | Low | P3 | UI |
| TC-SM-EXR-002 | An adult with an infant CANNOT take an exit seat | Failed | Critical | P0 | Business Rule |
| TC-SM-EXR-005 | The rule follows the infant's linked adult | Failed | Critical | P0 | Business Rule |
| TC-SM-RTP-005 | Seat and ancillary charges should be identifiable per journey | Failed | Low | P3 | UI |
| TC-SM-CNF-018 | Going back a step must not silently throw away seats and ancillaries | Failed | High | P1 | Workflow |
| TC-SM-PAX-008 | Two infant-holding adults cannot sit in the same set of seats | Inconclusive | - | - | Business Rule |
| TC-BG-001 | Extra baggage is offered per passenger and per journey | Inconclusive | Low | P3 | UI |
| TC-RPT-002 | A payment appears in the account statement with the right amount | Failed | High | P1 | Reports |

Full write-ups: `ManualExecutionResults.md` section 3.1.

## 6. Assumptions & Risks Resolved

- Test Design assumed flynas wording and rules; for AegeanNdc these are recorded as documentation gaps (STA-002, STA-004, PAX-006, BG-001).
- The intake note "no multi-segment route exists" is refuted for CAI-FCO + FCO-CAI: multi-city search works and each journey connects via Athens.
- Unverified: airline-side enforcement of exit-seat and seat-set rules (the two bookings used ordinary seats; no exit seat was booked).

## 7. Known Limitations

See `ManualExecutionSummary.md` section 6. In short: two real bookings made (to be cancelled manually), no Hold option in the Portal, no cancellation or refund tested; no second aircraft type; no Price Update pop-up; time-based cases skipped; no Traceability Matrix.

## 8. Recommendations

See `ManualExecutionSummary.md` section 7 (R1 to R10).
