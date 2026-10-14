# Manual Execution Results - run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc

## 1. Execution Metadata

| Field | Value |
|---|---|
| Execution ID | run-011 manual execution |
| Run Folder | `run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc` |
| Run Scope Type / Run Type | Targeted / Targeted (supplier-feature: ancillaries / aegean-ndc) |
| Environment | Staging. Admin http://192.168.1.83, Portal http://192.168.1.83:9500 |
| Target URL | http://192.168.1.83:9500 (Portal), http://192.168.1.83 (Admin) |
| Role(s) used | Admin user e.saady; Portal agency AGN9748 (login done by the operator; no credential typed by this stage) |
| Started | 2026-10-14 ~08:40 UTC |
| Ended | 2026-10-14 ~10:35 UTC |
| Test Suites executed | supplier-features/ancillaries/shared/ancillaries-baseline/test_design/TestCases_AncillariesSeatMap.xlsx |
| Browser | Chrome, **headed** (confirmed by the operator), driven through a locally started Playwright MCP server (v0.0.83) |
| Travel date | 2026-10-16 (CAI-FCO), changed from 2026-10-15 by the operator |
| Traceability | Requires Upstream Stage - no Traceability Matrix or Coverage Report exists beside this suite |

## 2. Result Totals

| Status | Count |
|---|---|
| Passed | 69 |
| Failed | 8 |
| Blocked | 12 |
| Skipped | 0 |
| Not Executed | 3 |
| Inconclusive | 3 |
| **Executable scope** (`Review = Approved` and supplier-supported) | **95** |
| Excluded - Not supported by supplier | 27 |
| Excluded - Rejected at Review | 2 |
| Excluded - Pending Review | 0 |
| **Suite total** | **124** |

Pass rate: 69 of 95 = 72.6% **against the executable scope**; 55.6% against the suite total.

## 3. Per-Test Results

| Test Case ID | Module | Status | Execution Time | Reason (non-Passed) | Evidence Refs |
|---|---|---|---|---|---|
| TC-SM-NAV-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` |
| TC-SM-NAV-002 | ancillaries / aegean-ndc | Blocked | - | Precondition not met: AegeanNdc has no fare packages (Bundle = Not Supported), so there is no package to leave unchosen. Next moves on without any bundle message. | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` |
| TC-SM-NAV-002b | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/04-NAV-002b-empty-next.png` |
| TC-SM-NAV-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-NAV-005 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/46-NAV-005-leg2-nothing-chosen.png`, `artifacts/portal/47-NAV-005-after-continue-without-seats.png` |
| TC-SM-RND-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-RND-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-RND-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-RND-005 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-RND-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-RND-007 | ancillaries / aegean-ndc | Blocked | - | Precondition not met: every CAI-FCO offer uses the same aircraft type (32Q A321neo), so no second aircraft type exists. |  |
| TC-SM-RND-010 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/30-RND-010-MPX-006-leg2-map.png`, `artifacts/portal/58-RTP-001-map-1.png`, `artifacts/portal/58-RTP-001-map-2.png`, `artifacts/portal/58-RTP-001-map-3.png` |
| TC-SM-STA-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/34-STA-002-occupied-16B.png` |
| TC-SM-STA-004 | ancillaries / aegean-ndc | Inconclusive | - | Suite lists six feature words. The map sends 19 more (for example Pet cabin, Crew seat, Deportee, Overwing seat(s), Seat not allowed for infant). The list in the suite was written from flynas, so this is a documentation gap, not an application defect. | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-STA-005 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-STA-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/17-seatmap-leg1-open.png` |
| TC-SM-STA-007 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "ladies-only-seats" does not apply to this supplier |  |
| TC-SM-SEL-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/18-SEL-001-click-10A-info-box.png` |
| TC-SM-SEL-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/19-SEL-002-10A-booked-for-Nadia.png` |
| TC-SM-SEL-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/18-SEL-001-click-10A-info-box.png` |
| TC-SM-SEL-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/19-SEL-002-10A-booked-for-Nadia.png`, `artifacts/portal/25-MPX-002-SEL-006-two-seats.png` |
| TC-SM-SEL-007 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/23-EXR-002-17A-booked-for-adult-with-infant.png` |
| TC-SM-SEL-008 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/26-SEL-008-cleared.png` |
| TC-SM-SEL-009 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/27-SEL-009-confirmed-step2.png` |
| TC-SM-SEL-010 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/28-SEL-010-change-seats-reopened.png` |
| TC-SM-SEL-012 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/20-MPX-004-SEL-012-10A-as-child.png` |
| TC-SM-MPX-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/25-MPX-002-SEL-006-two-seats.png` |
| TC-SM-MPX-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/20-MPX-004-SEL-012-10A-as-child.png` |
| TC-SM-MPX-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/30-RND-010-MPX-006-leg2-map.png`, `artifacts/portal/31-MPX-006-MPX-007-leg2-one-seat-confirmed.png`, `artifacts/portal/59-RTP-004-leg2-independent.png` |
| TC-SM-MPX-007 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/31-MPX-006-MPX-007-leg2-one-seat-confirmed.png` |
| TC-SM-PRC-001 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier |  |
| TC-SM-PRC-002 | ancillaries / aegean-ndc | Failed | - | On leg 2 of A3650, all 107 seats marked Chargeable seat are offered Free. Seat 19A booked at EGP 0. Leg 1 is correct. No Plus/Value packages here. | `artifacts/portal/32-PRC-002-19A-chargeable-free.png`, `artifacts/portal/33-PRC-002-19A-free-confirmed-total-unchanged.png`, `artifacts/portal/33-PRC-002-19A-free-confirmed-total.png` |
| TC-SM-PRC-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/27-SEL-009-confirmed-step2.png` |
| TC-SM-PRC-003b | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/30-RND-010-MPX-006-leg2-map.png` |
| TC-SM-PRC-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/27-SEL-009-confirmed-step2.png` |
| TC-SM-BND-002 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier |  |
| TC-SM-BND-003 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier |  |
| TC-SM-BND-004 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier |  |
| TC-SM-BND-005 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier |  |
| TC-SM-GEN-001 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "ladies-only-seats" does not apply to this supplier |  |
| TC-SM-GEN-002 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "ladies-only-seats" does not apply to this supplier |  |
| TC-SM-GEN-002b | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "ladies-only-seats" does not apply to this supplier |  |
| TC-SM-GEN-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/05-GEN-003-Ms-Female-disabled.png` |
| TC-SM-GEN-004 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "ladies-only-seats" does not apply to this supplier |  |
| TC-SM-GEN-005 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "ladies-only-seats" does not apply to this supplier |  |
| TC-SM-PER-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/36-PER-001-CNF-018-after-prev-next.png` |
| TC-SM-PER-002 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier |  |
| TC-SM-PER-004 | ancillaries / aegean-ndc | Not Executed | - | Skipped by operator instruction (needs about 20 minutes of waiting). Related finding: the booking link expires after 20 minutes while the screen shows 60 (see TC-SM-NEG-006). |  |
| TC-SM-PER-007 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/35-PER-007-payment-summary-before-prev.png` |
| TC-SM-NEG-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/29-NEG-003-rapid-book-11A.png` |
| TC-SM-NEG-004 | ancillaries / aegean-ndc | Excluded |  | Rejected at Review |  |
| TC-SM-NEG-006 | ancillaries / aegean-ndc | Failed | - | Expired link: page 'No Data Found' (HTTP 400), not the flight search. Altered link: same. Missing link: sent to login and the session was ended. No map or prices shown, no technical error page. | `artifacts/portal/38-CNF-018-next-silent-400-stuck-step1.png`, `artifacts/portal/40-NEG-006-expired-token-reload.png`, `artifacts/portal/41-NEG-006-missing-token.png` |
| TC-SM-A11Y-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/48-A11Y-001-narrow-map-open.png`, `artifacts/portal/49-A11Y-001-narrow-38F-details.png`, `artifacts/portal/50-A11Y-001-narrow-38F-booked.png` |
| TC-SM-A11Y-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/18-SEL-001-click-10A-info-box.png` |
| TC-SM-CAB-001 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "business-cabin" does not apply to this supplier |  |
| TC-SM-CAB-002 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier; Supplier rule "business-cabin" does not apply to this supplier |  |
| TC-SM-CAB-003 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "business-cabin" does not apply to this supplier |  |
| TC-SM-CAB-004 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "business-cabin" does not apply to this supplier |  |
| TC-SM-CAB-005 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier; Needs Meal — Not Supported by this supplier; Supplier rule "business-cabin" does not apply to this supplier |  |
| TC-SM-CAB-007 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Supplier rule "business-cabin" does not apply to this supplier |  |
| TC-SM-PAX-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/12-step2-ancillaries.png`, `artifacts/portal/27-SEL-009-confirmed-step2.png` |
| TC-SM-PAX-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/07-PAX-003-assigned-to-options.png` |
| TC-SM-PAX-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/19-SEL-002-10A-booked-for-Nadia.png` |
| TC-SM-PAX-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` |
| TC-SM-PAX-007 | ancillaries / aegean-ndc | Failed | - | Closed section hides its boxes, and Expand All / Collapse All work. But several sections can be open at once, and Next with a closed incomplete passenger shows no message. | `artifacts/portal/08-PAX-007-adult-collapsed-after-typing.png`, `artifacts/portal/09-PAX-007-adult-section-state.png`, `artifacts/portal/10-PAX-007-adult-and-child-open.png`, `artifacts/portal/11-PAX-007-next-with-closed-incomplete-infant.png` |
| TC-SM-FRC-001 | ancillaries / aegean-ndc | Blocked | - | Precondition not met: no 'Price Update' pop-up appeared in five searches, including two with an infant. Tester note says it only happens with flynas. |  |
| TC-SM-FRC-002 | ancillaries / aegean-ndc | Blocked | - | Needs the Price Update pop-up (not seen). See TC-SM-FRC-001. |  |
| TC-SM-FRC-003 | ancillaries / aegean-ndc | Blocked | - | Needs the Price Update pop-up (not seen). See TC-SM-FRC-001. |  |
| TC-SM-FRC-005 | ancillaries / aegean-ndc | Blocked | - | Needs a price change to have been accepted (none happened). See TC-SM-FRC-001. |  |
| TC-SM-ERR-001 | ancillaries / aegean-ndc | Not Executed | - | Needs a server failure on demand. None happened in eight searches. Not forced. |  |
| TC-SM-ERR-002 | ancillaries / aegean-ndc | Not Executed | - | Skipped by operator instruction (needs 10-12 minutes idle). |  |
| TC-SM-ERR-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/06-ERR-004-child-nationality-opened.png` |
| TC-SM-ERR-005 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/02-results-CAI-FCO-16Oct.png` |
| TC-SM-EXR-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/45-EXR-001-EXR-003-adult-books-exit-18C.png` |
| TC-SM-EXR-002 | ancillaries / aegean-ndc | Failed | - | Adult linked to an infant was offered exit seats 17A and 28A and could book 17A. The seat description itself says Seat not allowed for infant. | `artifacts/portal/22-EXR-002-adult-with-infant-exit-17A.png`, `artifacts/portal/23-EXR-002-17A-booked-for-adult-with-infant.png`, `artifacts/portal/24-EXR-002-repeat-28A-offered-to-adult-with-infant.png` |
| TC-SM-EXR-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/21-EXR-003-child-exit-17A.png`, `artifacts/portal/44-EXR-004-child-exit-18C.png`, `artifacts/portal/45-EXR-001-EXR-003-adult-books-exit-18C.png` |
| TC-SM-EXR-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/43-EXR-004-adult-exit-18C.png`, `artifacts/portal/44-EXR-004-child-exit-18C.png` |
| TC-SM-EXR-005 | ancillaries / aegean-ndc | Failed | - | With the infant linked to adult A, 18C was bookable for A and B. After relinking to B it was still bookable for both. The refusal does not follow the Assigned-to link. | `artifacts/portal/51-EXR-005-A-with-infant-18C.png`, `artifacts/portal/52-EXR-005-B-no-infant-18C.png`, `artifacts/portal/53-EXR-005-after-relink-A-18C.png`, `artifacts/portal/54-EXR-005-after-relink-B-18C.png` |
| TC-SM-EXR-007 | ancillaries / aegean-ndc | Excluded |  | Rejected at Review |  |
| TC-SM-RTP-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/57-RTP-001-roundtrip-step2-select-seat-disabled.png`, `artifacts/portal/58-RTP-001-map-1.png`, `artifacts/portal/58-RTP-001-map-2.png`, `artifacts/portal/58-RTP-001-map-3.png` |
| TC-SM-RTP-003 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Bundle — Not Supported by this supplier |  |
| TC-SM-RTP-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/59-RTP-004-leg2-independent.png` |
| TC-SM-MCT-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/60-MCT-003-multicity-step2.png` |
| TC-SM-MCT-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/61-MCT-004-RTP-005-four-seats-summary.png`, `artifacts/portal/83-BOOKING2-confirmation.png` |
| TC-SM-MCT-007 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/60-MCT-003-multicity-step2.png` |
| TC-SM-MCT-005 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/83-BOOKING2-confirmation.png`, `artifacts/portal/84-BOOKING2-my-bookings-list.png` |
| TC-SM-MCT-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/60-MCT-003-multicity-step2.png` |
| TC-SM-RTP-005 | ancillaries / aegean-ndc | Failed | - | One base-fare line, one seat line (+3,367) and one tax line cover both journeys. The total is right but charges cannot be told apart per journey. | `artifacts/portal/61-MCT-004-RTP-005-four-seats-summary.png` |
| TC-SM-CNF-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/70-BOOKING1-before-book-quote.png`, `artifacts/portal/71-BOOKING1-confirmation.png` |
| TC-SM-CNF-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/71-BOOKING1-confirmation.png`, `artifacts/portal/72-BOOKING1-eticket.png`, `artifacts/portal/75-CNF-012-order-details.png` |
| TC-SM-CNF-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/71-BOOKING1-confirmation.png`, `artifacts/portal/72-BOOKING1-eticket.png` |
| TC-SM-CNF-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/71-BOOKING1-confirmation.png`, `artifacts/portal/72-BOOKING1-eticket.png` |
| TC-SM-CNF-007 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/71-BOOKING1-confirmation.png`, `artifacts/portal/72-BOOKING1-eticket.png` |
| TC-SM-CNF-008 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/71-BOOKING1-confirmation.png`, `artifacts/portal/72-BOOKING1-eticket.png` |
| TC-SM-CNF-010 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/73-CNF-010-wallet-after.png` |
| TC-SM-CNF-011 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/76-CNF-011-costing-tab.png` |
| TC-SM-CNF-012 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/74-CNF-012-my-bookings-list.png`, `artifacts/portal/75-CNF-012-order-details.png`, `artifacts/portal/84-BOOKING2-my-bookings-list.png` |
| TC-SM-CNF-015 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/42-CNF-015-my-bookings.png` |
| TC-SM-CNF-016 | ancillaries / aegean-ndc | Blocked | - | Baggage options show no weight, so a baggage-and-seat clash cannot be built to test this rule. No further booking was made. |  |
| TC-SM-CNF-017 | ancillaries / aegean-ndc | Blocked | - | Baggage options show no weight, so a clash cannot be built. No further booking was made. |  |
| TC-SM-CNF-018 | ancillaries / aegean-ndc | Failed | - | Editing a passenger's document number on step 1, then Next: Net Payable fell from 41,935.4 to 37,093.4 - all seats and the bag were dropped with no warning. Known fault reproduced. | `artifacts/portal/37-CNF-018-after-editing-child-doc.png` |
| TC-SM-PAX-008 | ancillaries / aegean-ndc | Inconclusive | - | Two infant-holding adults: 12A (Rana) then 12B (Tarek) in the same ABC set were both offered, booked and confirmed with no warning. The suite records this as 'Pass by decision' because the airline enforces it at booking. Cannot be checked without a real booking. | `artifacts/portal/55-PAX-008-12B-offered-to-2nd-infant-holder.png`, `artifacts/portal/56-PAX-008-12A-12B-both-infant-holders-confirmed.png` |
| TC-SM-PRC-005 | ancillaries / aegean-ndc | Blocked | - | Precondition not met: credential AegeanNDCProd has currency Egyptian Pound, so there is no exchange rate to check. Case needs a non-EGP credential. | `artifacts/admin/PRC-005-credential-AegeanNDCProd.png` |
| TC-SM-NAV-006 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Only for suppliers without Seat — this supplier supports it |  |
| TC-ML-001 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier |  |
| TC-ML-002 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier |  |
| TC-ML-003 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier |  |
| TC-ML-004 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier; Needs Bundle — Not Supported by this supplier |  |
| TC-ML-005 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier |  |
| TC-ML-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/12-step2-ancillaries.png` |
| TC-BG-001 | ancillaries / aegean-ndc | Inconclusive | - | Adult and child each have a list of 32 options with prices, but no option shows a weight. Options are Aegean special-item descriptions plus three free-text request items at 0 EGP. Suite wording expects weights, so this may be a documentation gap. | `artifacts/portal/13-BG-001-adult-baggage-options.png`, `artifacts/portal/16-BG-001-child-baggage-options.png` |
| TC-BG-002 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/12-step2-ancillaries.png` |
| TC-BG-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/14-BG-003-extra-baggage-1240-selected.png`, `artifacts/portal/15-BG-003-changed-to-board-3542.png` |
| TC-BG-005 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/71-BOOKING1-confirmation.png`, `artifacts/portal/72-BOOKING1-eticket.png`, `artifacts/portal/75-CNF-012-order-details.png` |
| TC-BG-006 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Only for suppliers without Baggage — this supplier supports it |  |
| TC-HLD-005 | ancillaries / aegean-ndc | Excluded |  | Not supported by supplier: Needs Meal — Not Supported by this supplier |  |
| TC-PAH-002 | ancillaries / aegean-ndc | Blocked | - | No Hold option in the Portal (step 2 offers only Book and Save Quote), so no held booking can be created or paid. |  |
| TC-PAH-003 | ancillaries / aegean-ndc | Blocked | - | No Hold option in the Portal (step 2 offers only Book and Save Quote), so no held booking can be created or paid. |  |
| TC-PAH-004 | ancillaries / aegean-ndc | Blocked | - | No Hold option in the Portal (step 2 offers only Book and Save Quote), so no held booking can be created or paid. |  |
| TC-SM-BND-006 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` |
| TC-RPT-001 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/77-RPT-001-bookings-report.png` |
| TC-RPT-002 | ancillaries / aegean-ndc | Failed | - | Statement report has no debit row for the booking payment, and a search by its transaction ID finds nothing (same as run-007). | `artifacts/portal/79-RPT-002-statement-report.png`, `artifacts/portal/80-RPT-002-statement-by-transaction-id.png` |
| TC-RPT-003 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/78-RPT-003-sales-report.png` |
| TC-RPT-004 | ancillaries / aegean-ndc | Passed | - |  | `artifacts/portal/81-RPT-003-total-due-report.png` |

### 3.1 Defect Detail - Failed / Inconclusive cases

#### TC-SM-STA-004 - Seat features use known wording

1. **Test Case ID:** TC-SM-STA-004
2. **Execution Status:** Inconclusive
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** Leg 1 map.
6. **Steps Performed:** List feature words and compare with the suite list.
7. **Expected Result:** Only the six listed words appear.
8. **Actual Result:** Nineteen other words appear (Pet cabin, Crew seat, Deportee, Overwing seat(s), Seat not allowed for infant, and more).
9. **Impact:** None: a test-suite wording gap.
10. **Classification:**
    - Category: Documentation mismatch
    - Layer: N/A
    - Reproducibility: N/A
    - Regression: N/A
    - Suspected Component: N/A
    - Confidence: 
12. **Conclusion:** Documentation gap, not an application defect.
13. **Severity:** Low.
14. **Priority:** P3
15. **Evidence:** `artifacts/portal/17-seatmap-leg1-open.png`

#### TC-SM-PRC-002 - A seat marked 'Chargeable seat' must always have a price

1. **Test Case ID:** TC-SM-PRC-002
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** Round trip not needed. 1 adult, CAI-FCO, leg 2 (A3650) map.
6. **Steps Performed:** Open leg 2 map, click seat 19A, book it, confirm, read the summary and net payable.
7. **Expected Result:** A seat marked Chargeable seat must always have a price.
8. **Actual Result:** All 107 seats marked Chargeable seat on leg 2 were 'available for Free'. Seat 19A was confirmed with 'EGP 0' and the Seat Selection charge did not change. Leg 1 prices were all above zero.
9. **Impact:** Seats that should earn revenue are given away free, and the total quoted is too low.
10. **Classification:**
    - Category: Business Rule
    - Layer: Backend / Integration
    - Reproducibility: Seen once on one flight (107 seats, same pattern)
    - Regression: No (same bug found on flynas in run-006)
    - Suspected Component: Seat price mapping for leg 2
    - Confidence: Medium
11. **Root Cause Analysis (hedged):** Likely the supplier sends 0 for these seats and the Portal does not treat a Chargeable seat with 0 as an error.
12. **Conclusion:** Chargeable seats are sold at no charge on leg 2.
13. **Severity:** High - direct revenue loss.
14. **Priority:** P1
15. **Evidence:** `artifacts/portal/32-PRC-002-19A-chargeable-free.png`, `artifacts/portal/33-PRC-002-19A-free-confirmed-total-unchanged.png`, `artifacts/portal/33-PRC-002-19A-free-confirmed-total.png`

#### TC-SM-NEG-006 - Opening the booking page with a broken or missing link

1. **Test Case ID:** TC-SM-NEG-006
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** A booking page opened, then its link reused after 20 minutes, altered, or without a token.
6. **Steps Performed:** Reload the booking URL after the token expired (09:08Z); open it with an altered token; open it with no token.
7. **Expected Result:** Access is refused and the agent is sent back to the flight search, as when the time limit runs out. No technical error page.
8. **Actual Result:** Expired and altered links show 'No Data Found' (server answer HTTP 400) with Go Back / Go Home. A missing link goes to the login page and ends the session.
9. **Impact:** The agent does not know what went wrong, and a missing link logs the agent out.
10. **Classification:**
    - Category: Workflow
    - Layer: Frontend
    - Reproducibility: Seen once per link type
    - Regression: Unknown
    - Suspected Component: Booking page token guard
    - Confidence: Medium
11. **Root Cause Analysis (hedged):** The page has no redirect rule for an invalid token and treats a missing token as a lost login.
12. **Conclusion:** The booking link's failure handling does not follow the specified behaviour.
13. **Severity:** Medium - confusing, recoverable.
14. **Priority:** P2
15. **Evidence:** `artifacts/portal/38-CNF-018-next-silent-400-stuck-step1.png`, `artifacts/portal/40-NEG-006-expired-token-reload.png`, `artifacts/portal/41-NEG-006-missing-token.png`

Related: the link lasts 20 minutes (iat to exp) while the screen shows 'Time left 59:51'. After it ends, Next calls add-pax and gets HTTP 400 with no message on screen.

#### TC-SM-PAX-007 - Closed passenger sections still report missing information

1. **Test Case ID:** TC-SM-PAX-007
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** 1 adult + 1 child + 1 infant.
6. **Steps Performed:** Collapse sections, try typing, open Adult then Child, collapse all with an incomplete infant and press Next.
7. **Expected Result:** Only one passenger section is open at a time, and an incomplete closed passenger is still reported when Next is pressed.
8. **Actual Result:** Opening Child left Adult open (several open at once). With all sections closed and an infant incomplete, Next did nothing visible: no message and the Required note stayed hidden.
9. **Impact:** An agent can miss an unfilled passenger and be stuck on step 1.
10. **Classification:**
    - Category: UI
    - Layer: Frontend
    - Reproducibility: Seen twice
    - Regression: Unknown
    - Suspected Component: Passenger accordion
    - Confidence: High
11. **Root Cause Analysis (hedged):** Likely the accordion uses independent panels and validation messages live inside the closed panel.
12. **Conclusion:** The accordion does not behave as specified and hides validation.
13. **Severity:** Low - cosmetic with a workaround.
14. **Priority:** P3
15. **Evidence:** `artifacts/portal/08-PAX-007-adult-collapsed-after-typing.png`, `artifacts/portal/09-PAX-007-adult-section-state.png`, `artifacts/portal/10-PAX-007-adult-and-child-open.png`, `artifacts/portal/11-PAX-007-next-with-closed-incomplete-infant.png`

#### TC-SM-EXR-002 - An adult with an infant CANNOT take an exit seat

1. **Test Case ID:** TC-SM-EXR-002
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** 1 adult + 1 infant (and 2 adults + 1 infant) CAI-FCO 16 Oct, Economy, infant linked to the adult.
6. **Steps Performed:** Open leg 1 map, select the adult with the infant, click exit seats 17A and 28A, press 'Book 17A for Nadia'.
7. **Expected Result:** An adult travelling with an infant must not be able to take an emergency-exit seat. The seat is marked Seat not allowed for infant, so the map should refuse it and say why.
8. **Actual Result:** Seat 17A showed 'Available paid' with an enabled Book button, and the booking was accepted (card 17A, EGP 886). Seat 28A was offered the same way. No warning appeared.
9. **Impact:** An unsafe seat assignment is accepted. The airline may reject it later, or it may be missed, which is a safety and compliance risk.
10. **Classification:**
    - Category: Business Rule
    - Layer: Frontend / Backend
    - Reproducibility: Seen twice (17A, 28A)
    - Regression: Unknown (flynas refused it in run-006)
    - Suspected Component: Seat availability check for infant-holders
    - Confidence: High
11. **Root Cause Analysis (hedged):** Likely the seat map does not apply the infant-holder rule for this supplier, or the supplier does not send the restriction in a form the Portal uses.
12. **Conclusion:** The Portal offers and books exit seats to an adult with an infant.
13. **Severity:** Critical - safety rule can be bypassed.
14. **Priority:** P0
15. **Evidence:** `artifacts/portal/22-EXR-002-adult-with-infant-exit-17A.png`, `artifacts/portal/23-EXR-002-17A-booked-for-adult-with-infant.png`, `artifacts/portal/24-EXR-002-repeat-28A-offered-to-adult-with-infant.png`

#### TC-SM-EXR-005 - The rule follows the infant's linked adult

1. **Test Case ID:** TC-SM-EXR-005
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** 2 adults + 1 infant linked to adult A, then relinked to adult B.
6. **Steps Performed:** Check exit seat 18C as A and as B; go back, change Assigned to, return and check again.
7. **Expected Result:** The refusal should apply to the adult linked to the infant and move when the link moves.
8. **Actual Result:** 18C was 'Available paid' for both adults before and after the relink, and 'Book 18C' was enabled for both.
9. **Impact:** The infant link has no effect on exit-seat rules, so the rule cannot work at all.
10. **Classification:**
    - Category: Business Rule
    - Layer: Frontend / Backend
    - Reproducibility: Seen twice (before and after relink)
    - Regression: Unknown
    - Suspected Component: Seat availability check for infant-holders
    - Confidence: High
11. **Root Cause Analysis (hedged):** Same cause as TC-SM-EXR-002: the restriction is never applied.
12. **Conclusion:** The exit-seat refusal for infant-holders is missing, so it cannot follow the Assigned-to link.
13. **Severity:** Critical - safety rule bypassed.
14. **Priority:** P0
15. **Evidence:** `artifacts/portal/51-EXR-005-A-with-infant-18C.png`, `artifacts/portal/52-EXR-005-B-no-infant-18C.png`, `artifacts/portal/53-EXR-005-after-relink-A-18C.png`, `artifacts/portal/54-EXR-005-after-relink-B-18C.png`

#### TC-SM-RTP-005 - Seat and ancillary charges should be identifiable per journey

1. **Test Case ID:** TC-SM-RTP-005
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** Multi-city, 2 journeys, 4 seats chosen.
6. **Steps Performed:** Read the price breakdown.
7. **Expected Result:** Each journey's charges are identifiable.
8. **Actual Result:** One base-fare line, one seat line (+3,367) and one tax line cover both journeys. The grand total is right (35,140.8).
9. **Impact:** A reporting gap: the agent cannot see which journey costs what.
10. **Classification:**
    - Category: UI
    - Layer: Frontend
    - Reproducibility: Seen once
    - Regression: No (known)
    - Suspected Component: Price breakdown panel
    - Confidence: High
11. **Root Cause Analysis (hedged):** The breakdown groups by passenger type, not by journey.
12. **Conclusion:** The breakdown is too coarse; totals are correct.
13. **Severity:** Low.
14. **Priority:** P3
15. **Evidence:** `artifacts/portal/61-MCT-004-RTP-005-four-seats-summary.png`

#### TC-SM-CNF-018 - Going back a step must not silently throw away seats and ancillaries

1. **Test Case ID:** TC-SM-CNF-018
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** Step 2 with seats on two legs and a bag chosen (total 41,935.4).
6. **Steps Performed:** Press Prev, change the child's document number, press Next.
7. **Expected Result:** Choices survive going back, or the agent is warned.
8. **Actual Result:** After the edit the total fell to 37,093.4: all seats and the bag were dropped with no warning.
9. **Impact:** The agent loses work silently and may sell a lower total.
10. **Classification:**
    - Category: Workflow
    - Layer: Frontend
    - Reproducibility: Seen once here; same as run-006
    - Regression: No (known fault)
    - Suspected Component: Passenger step save
    - Confidence: High
11. **Root Cause Analysis (hedged):** Likely editing passenger data resets the extras on the server or in the page state.
12. **Conclusion:** Editing passenger details wipes seats and extras silently.
13. **Severity:** High - silent data loss.
14. **Priority:** P1
15. **Evidence:** `artifacts/portal/37-CNF-018-after-editing-child-doc.png`

#### TC-SM-PAX-008 - Two infant-holding adults cannot sit in the same set of seats

1. **Test Case ID:** TC-SM-PAX-008
2. **Execution Status:** Inconclusive
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** 2 adults + 2 infants, each infant linked to a different adult.
6. **Steps Performed:** Rana books 12A. Tarek checks 12B, 12C, 12D and books 12B. Confirm.
7. **Expected Result:** Seats in the same set (12B, 12C) must be blocked for the second infant-holder.
8. **Actual Result:** 12B, 12C and 12D were all 'Available paid'. 12B was booked and both seats confirmed with no warning.
9. **Impact:** Two infant-holders could share a seat set if the airline does not stop it.
10. **Classification:**
    - Category: Business Rule
    - Layer: Unknown
    - Reproducibility: Seen once
    - Regression: Unknown
    - Suspected Component: Seat-set rule
    - Confidence: Low
11. **Root Cause Analysis (hedged):** Suite note says the airline enforces this at booking, so it cannot be verified without a real booking.
12. **Conclusion:** Not provable here; no defect confirmed.
13. **Severity:** Low.
14. **Priority:** P2
15. **Evidence:** `artifacts/portal/55-PAX-008-12B-offered-to-2nd-infant-holder.png`, `artifacts/portal/56-PAX-008-12A-12B-both-infant-holders-confirmed.png`

#### TC-BG-001 - Extra baggage is offered per passenger and per journey

1. **Test Case ID:** TC-BG-001
2. **Execution Status:** Inconclusive
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** 1 adult + 1 child.
6. **Steps Performed:** Open the baggage list for each passenger.
7. **Expected Result:** Each passenger has a baggage list; every option shows weight and price.
8. **Actual Result:** 32 options each with a price and no weight. Three free-text request options (bulky, cabin, fragile) cost 0 EGP and cannot take details.
9. **Impact:** Agents may not know what each option allows.
10. **Classification:**
    - Category: UI
    - Layer: Frontend / Integration
    - Reproducibility: Seen twice (adult, child)
    - Regression: Unknown
    - Suspected Component: Baggage chooser
    - Confidence: Low
11. **Root Cause Analysis (hedged):** Suite wording was written for flynas weight options; Aegean sends special-item SSR descriptions.
12. **Conclusion:** Likely a documentation gap, plus a possible UX gap.
13. **Severity:** Low.
14. **Priority:** P3
15. **Evidence:** `artifacts/portal/13-BG-001-adult-baggage-options.png`, `artifacts/portal/16-BG-001-child-baggage-options.png`

#### TC-RPT-002 - A payment appears in the account statement with the right amount

1. **Test Case ID:** TC-RPT-002
2. **Execution Status:** Failed
3. **Execution Time:** 2026-10-14, Portal Staging
4. **Preconditions:** Logged in (by the operator); branch NDC1_Hussein with AegeanNdc / AegeanNDCProd.
5. **Test Data:** 1 adult (+child+infant) booking, order AGN9748HUSNDCORD261014LOSA1D, paid from the wallet (debit 43,894.4).
6. **Steps Performed:** Reports > Statement: look for the debit of the booking by date and by transaction ID.
7. **Expected Result:** The wallet payment appears as a debit row in the Statement with the booking amount.
8. **Actual Result:** The Statement has no row for the payment and a search by its transaction ID returns nothing, although the wallet dropped by 43,894.4 and the booking is in the Bookings, Sales and Total Due reports.
9. **Impact:** The agent cannot reconcile wallet movements with the Statement.
10. **Classification:**
    - Category: Reports
    - Layer: Backend
    - Reproducibility: Seen once (also run-007)
    - Regression: Unknown
    - Suspected Component: Statement report
    - Confidence: High
11. **Root Cause Analysis (hedged):** Booking payments are not written to the statement table for this supplier flow.
12. **Conclusion:** The Statement does not reflect booking payments.
13. **Severity:** High - finance reconciliation impact.
14. **Priority:** P1
15. **Evidence:** `artifacts/portal/79-RPT-002-statement-report.png`, `artifacts/portal/80-RPT-002-statement-by-transaction-id.png`

## 4. Evidence Inventory

| Test Case ID | Evidence Type | Path | Captured? | Gap Reason |
|---|---|---|---|---|
| TC-SM-NAV-001 | Screenshot | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` | Yes | |
| TC-SM-NAV-002 | Screenshot | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` | Yes | |
| TC-SM-NAV-002b | Screenshot | `artifacts/portal/04-NAV-002b-empty-next.png` | Yes | |
| TC-SM-NAV-003 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-NAV-005 | Screenshot | `artifacts/portal/46-NAV-005-leg2-nothing-chosen.png` | Yes | |
| TC-SM-NAV-005 | Screenshot | `artifacts/portal/47-NAV-005-after-continue-without-seats.png` | Yes | |
| TC-SM-RND-001 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-RND-002 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-RND-003 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-RND-005 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-RND-006 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-RND-010 | Screenshot | `artifacts/portal/30-RND-010-MPX-006-leg2-map.png` | Yes | |
| TC-SM-RND-010 | Screenshot | `artifacts/portal/58-RTP-001-map-1.png` | Yes | |
| TC-SM-RND-010 | Screenshot | `artifacts/portal/58-RTP-001-map-2.png` | Yes | |
| TC-SM-RND-010 | Screenshot | `artifacts/portal/58-RTP-001-map-3.png` | Yes | |
| TC-SM-RND-010 | Screenshot | `artifacts/portal/58-RTP-001-map-4.png` | Yes | |
| TC-SM-STA-002 | Screenshot | `artifacts/portal/34-STA-002-occupied-16B.png` | Yes | |
| TC-SM-STA-004 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-STA-005 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-STA-006 | Screenshot | `artifacts/portal/17-seatmap-leg1-open.png` | Yes | |
| TC-SM-SEL-001 | Screenshot | `artifacts/portal/18-SEL-001-click-10A-info-box.png` | Yes | |
| TC-SM-SEL-002 | Screenshot | `artifacts/portal/19-SEL-002-10A-booked-for-Nadia.png` | Yes | |
| TC-SM-SEL-003 | Screenshot | `artifacts/portal/18-SEL-001-click-10A-info-box.png` | Yes | |
| TC-SM-SEL-006 | Screenshot | `artifacts/portal/19-SEL-002-10A-booked-for-Nadia.png` | Yes | |
| TC-SM-SEL-006 | Screenshot | `artifacts/portal/25-MPX-002-SEL-006-two-seats.png` | Yes | |
| TC-SM-SEL-007 | Screenshot | `artifacts/portal/23-EXR-002-17A-booked-for-adult-with-infant.png` | Yes | |
| TC-SM-SEL-008 | Screenshot | `artifacts/portal/26-SEL-008-cleared.png` | Yes | |
| TC-SM-SEL-009 | Screenshot | `artifacts/portal/27-SEL-009-confirmed-step2.png` | Yes | |
| TC-SM-SEL-010 | Screenshot | `artifacts/portal/28-SEL-010-change-seats-reopened.png` | Yes | |
| TC-SM-SEL-012 | Screenshot | `artifacts/portal/20-MPX-004-SEL-012-10A-as-child.png` | Yes | |
| TC-SM-MPX-002 | Screenshot | `artifacts/portal/25-MPX-002-SEL-006-two-seats.png` | Yes | |
| TC-SM-MPX-004 | Screenshot | `artifacts/portal/20-MPX-004-SEL-012-10A-as-child.png` | Yes | |
| TC-SM-MPX-006 | Screenshot | `artifacts/portal/30-RND-010-MPX-006-leg2-map.png` | Yes | |
| TC-SM-MPX-006 | Screenshot | `artifacts/portal/31-MPX-006-MPX-007-leg2-one-seat-confirmed.png` | Yes | |
| TC-SM-MPX-006 | Screenshot | `artifacts/portal/59-RTP-004-leg2-independent.png` | Yes | |
| TC-SM-MPX-007 | Screenshot | `artifacts/portal/31-MPX-006-MPX-007-leg2-one-seat-confirmed.png` | Yes | |
| TC-SM-PRC-002 | Screenshot | `artifacts/portal/32-PRC-002-19A-chargeable-free.png` | Yes | |
| TC-SM-PRC-002 | Screenshot | `artifacts/portal/33-PRC-002-19A-free-confirmed-total-unchanged.png` | Yes | |
| TC-SM-PRC-002 | Screenshot | `artifacts/portal/33-PRC-002-19A-free-confirmed-total.png` | Yes | |
| TC-SM-PRC-003 | Screenshot | `artifacts/portal/27-SEL-009-confirmed-step2.png` | Yes | |
| TC-SM-PRC-003b | Screenshot | `artifacts/portal/30-RND-010-MPX-006-leg2-map.png` | Yes | |
| TC-SM-PRC-004 | Screenshot | `artifacts/portal/27-SEL-009-confirmed-step2.png` | Yes | |
| TC-SM-GEN-003 | Screenshot | `artifacts/portal/05-GEN-003-Ms-Female-disabled.png` | Yes | |
| TC-SM-PER-001 | Screenshot | `artifacts/portal/36-PER-001-CNF-018-after-prev-next.png` | Yes | |
| TC-SM-PER-007 | Screenshot | `artifacts/portal/35-PER-007-payment-summary-before-prev.png` | Yes | |
| TC-SM-NEG-003 | Screenshot | `artifacts/portal/29-NEG-003-rapid-book-11A.png` | Yes | |
| TC-SM-NEG-006 | Screenshot | `artifacts/portal/38-CNF-018-next-silent-400-stuck-step1.png` | Yes | |
| TC-SM-NEG-006 | Screenshot | `artifacts/portal/40-NEG-006-expired-token-reload.png` | Yes | |
| TC-SM-NEG-006 | Screenshot | `artifacts/portal/41-NEG-006-missing-token.png` | Yes | |
| TC-SM-A11Y-001 | Screenshot | `artifacts/portal/48-A11Y-001-narrow-map-open.png` | Yes | |
| TC-SM-A11Y-001 | Screenshot | `artifacts/portal/49-A11Y-001-narrow-38F-details.png` | Yes | |
| TC-SM-A11Y-001 | Screenshot | `artifacts/portal/50-A11Y-001-narrow-38F-booked.png` | Yes | |
| TC-SM-A11Y-002 | Screenshot | `artifacts/portal/18-SEL-001-click-10A-info-box.png` | Yes | |
| TC-SM-PAX-001 | Screenshot | `artifacts/portal/12-step2-ancillaries.png` | Yes | |
| TC-SM-PAX-001 | Screenshot | `artifacts/portal/27-SEL-009-confirmed-step2.png` | Yes | |
| TC-SM-PAX-003 | Screenshot | `artifacts/portal/07-PAX-003-assigned-to-options.png` | Yes | |
| TC-SM-PAX-004 | Screenshot | `artifacts/portal/19-SEL-002-10A-booked-for-Nadia.png` | Yes | |
| TC-SM-PAX-006 | Screenshot | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` | Yes | |
| TC-SM-PAX-007 | Screenshot | `artifacts/portal/08-PAX-007-adult-collapsed-after-typing.png` | Yes | |
| TC-SM-PAX-007 | Screenshot | `artifacts/portal/09-PAX-007-adult-section-state.png` | Yes | |
| TC-SM-PAX-007 | Screenshot | `artifacts/portal/10-PAX-007-adult-and-child-open.png` | Yes | |
| TC-SM-PAX-007 | Screenshot | `artifacts/portal/11-PAX-007-next-with-closed-incomplete-infant.png` | Yes | |
| TC-SM-ERR-004 | Screenshot | `artifacts/portal/06-ERR-004-child-nationality-opened.png` | Yes | |
| TC-SM-ERR-005 | Screenshot | `artifacts/portal/02-results-CAI-FCO-16Oct.png` | Yes | |
| TC-SM-EXR-001 | Screenshot | `artifacts/portal/45-EXR-001-EXR-003-adult-books-exit-18C.png` | Yes | |
| TC-SM-EXR-002 | Screenshot | `artifacts/portal/22-EXR-002-adult-with-infant-exit-17A.png` | Yes | |
| TC-SM-EXR-002 | Screenshot | `artifacts/portal/23-EXR-002-17A-booked-for-adult-with-infant.png` | Yes | |
| TC-SM-EXR-002 | Screenshot | `artifacts/portal/24-EXR-002-repeat-28A-offered-to-adult-with-infant.png` | Yes | |
| TC-SM-EXR-003 | Screenshot | `artifacts/portal/21-EXR-003-child-exit-17A.png` | Yes | |
| TC-SM-EXR-003 | Screenshot | `artifacts/portal/44-EXR-004-child-exit-18C.png` | Yes | |
| TC-SM-EXR-003 | Screenshot | `artifacts/portal/45-EXR-001-EXR-003-adult-books-exit-18C.png` | Yes | |
| TC-SM-EXR-004 | Screenshot | `artifacts/portal/43-EXR-004-adult-exit-18C.png` | Yes | |
| TC-SM-EXR-004 | Screenshot | `artifacts/portal/44-EXR-004-child-exit-18C.png` | Yes | |
| TC-SM-EXR-005 | Screenshot | `artifacts/portal/51-EXR-005-A-with-infant-18C.png` | Yes | |
| TC-SM-EXR-005 | Screenshot | `artifacts/portal/52-EXR-005-B-no-infant-18C.png` | Yes | |
| TC-SM-EXR-005 | Screenshot | `artifacts/portal/53-EXR-005-after-relink-A-18C.png` | Yes | |
| TC-SM-EXR-005 | Screenshot | `artifacts/portal/54-EXR-005-after-relink-B-18C.png` | Yes | |
| TC-SM-RTP-001 | Screenshot | `artifacts/portal/57-RTP-001-roundtrip-step2-select-seat-disabled.png` | Yes | |
| TC-SM-RTP-001 | Screenshot | `artifacts/portal/58-RTP-001-map-1.png` | Yes | |
| TC-SM-RTP-001 | Screenshot | `artifacts/portal/58-RTP-001-map-2.png` | Yes | |
| TC-SM-RTP-001 | Screenshot | `artifacts/portal/58-RTP-001-map-3.png` | Yes | |
| TC-SM-RTP-001 | Screenshot | `artifacts/portal/58-RTP-001-map-4.png` | Yes | |
| TC-SM-RTP-004 | Screenshot | `artifacts/portal/59-RTP-004-leg2-independent.png` | Yes | |
| TC-SM-MCT-003 | Screenshot | `artifacts/portal/60-MCT-003-multicity-step2.png` | Yes | |
| TC-SM-MCT-004 | Screenshot | `artifacts/portal/61-MCT-004-RTP-005-four-seats-summary.png` | Yes | |
| TC-SM-MCT-004 | Screenshot | `artifacts/portal/83-BOOKING2-confirmation.png` | Yes | |
| TC-SM-MCT-007 | Screenshot | `artifacts/portal/60-MCT-003-multicity-step2.png` | Yes | |
| TC-SM-MCT-005 | Screenshot | `artifacts/portal/83-BOOKING2-confirmation.png` | Yes | |
| TC-SM-MCT-005 | Screenshot | `artifacts/portal/84-BOOKING2-my-bookings-list.png` | Yes | |
| TC-SM-MCT-006 | Screenshot | `artifacts/portal/60-MCT-003-multicity-step2.png` | Yes | |
| TC-SM-RTP-005 | Screenshot | `artifacts/portal/61-MCT-004-RTP-005-four-seats-summary.png` | Yes | |
| TC-SM-CNF-001 | Screenshot | `artifacts/portal/70-BOOKING1-before-book-quote.png` | Yes | |
| TC-SM-CNF-001 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-SM-CNF-002 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-SM-CNF-002 | Screenshot | `artifacts/portal/72-BOOKING1-eticket.png` | Yes | |
| TC-SM-CNF-002 | Screenshot | `artifacts/portal/75-CNF-012-order-details.png` | Yes | |
| TC-SM-CNF-003 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-SM-CNF-003 | Screenshot | `artifacts/portal/72-BOOKING1-eticket.png` | Yes | |
| TC-SM-CNF-004 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-SM-CNF-004 | Screenshot | `artifacts/portal/72-BOOKING1-eticket.png` | Yes | |
| TC-SM-CNF-007 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-SM-CNF-007 | Screenshot | `artifacts/portal/72-BOOKING1-eticket.png` | Yes | |
| TC-SM-CNF-008 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-SM-CNF-008 | Screenshot | `artifacts/portal/72-BOOKING1-eticket.png` | Yes | |
| TC-SM-CNF-010 | Screenshot | `artifacts/portal/73-CNF-010-wallet-after.png` | Yes | |
| TC-SM-CNF-011 | Screenshot | `artifacts/portal/76-CNF-011-costing-tab.png` | Yes | |
| TC-SM-CNF-012 | Screenshot | `artifacts/portal/74-CNF-012-my-bookings-list.png` | Yes | |
| TC-SM-CNF-012 | Screenshot | `artifacts/portal/75-CNF-012-order-details.png` | Yes | |
| TC-SM-CNF-012 | Screenshot | `artifacts/portal/84-BOOKING2-my-bookings-list.png` | Yes | |
| TC-SM-CNF-015 | Screenshot | `artifacts/portal/42-CNF-015-my-bookings.png` | Yes | |
| TC-SM-CNF-018 | Screenshot | `artifacts/portal/37-CNF-018-after-editing-child-doc.png` | Yes | |
| TC-SM-PAX-008 | Screenshot | `artifacts/portal/55-PAX-008-12B-offered-to-2nd-infant-holder.png` | Yes | |
| TC-SM-PAX-008 | Screenshot | `artifacts/portal/56-PAX-008-12A-12B-both-infant-holders-confirmed.png` | Yes | |
| TC-SM-PRC-005 | Screenshot | `artifacts/admin/PRC-005-credential-AegeanNDCProd.png` | Yes | |
| TC-ML-006 | Screenshot | `artifacts/portal/12-step2-ancillaries.png` | Yes | |
| TC-BG-001 | Screenshot | `artifacts/portal/13-BG-001-adult-baggage-options.png` | Yes | |
| TC-BG-001 | Screenshot | `artifacts/portal/16-BG-001-child-baggage-options.png` | Yes | |
| TC-BG-002 | Screenshot | `artifacts/portal/12-step2-ancillaries.png` | Yes | |
| TC-BG-003 | Screenshot | `artifacts/portal/14-BG-003-extra-baggage-1240-selected.png` | Yes | |
| TC-BG-003 | Screenshot | `artifacts/portal/15-BG-003-changed-to-board-3542.png` | Yes | |
| TC-BG-005 | Screenshot | `artifacts/portal/71-BOOKING1-confirmation.png` | Yes | |
| TC-BG-005 | Screenshot | `artifacts/portal/72-BOOKING1-eticket.png` | Yes | |
| TC-BG-005 | Screenshot | `artifacts/portal/75-CNF-012-order-details.png` | Yes | |
| TC-SM-BND-006 | Screenshot | `artifacts/portal/03-step1-empty-NAV-001-BND-006.png` | Yes | |
| TC-RPT-001 | Screenshot | `artifacts/portal/77-RPT-001-bookings-report.png` | Yes | |
| TC-RPT-002 | Screenshot | `artifacts/portal/79-RPT-002-statement-report.png` | Yes | |
| TC-RPT-002 | Screenshot | `artifacts/portal/80-RPT-002-statement-by-transaction-id.png` | Yes | |
| TC-RPT-003 | Screenshot | `artifacts/portal/78-RPT-003-sales-report.png` | Yes | |
| TC-RPT-004 | Screenshot | `artifacts/portal/81-RPT-003-total-due-report.png` | Yes | |

Gaps: cases with Status Skipped, Blocked, Not Executed or Excluded have no execution evidence, for the reason stated in section 3. Console and network evidence: `artifacts/portal/console-errors-step2-calcBaggagePrice.log` (two TypeErrors on step 2), `artifacts/req67.txt` and `artifacts/req72.txt` (add-pax request bodies). Page snapshots: `artifacts/snapshots/`. Video was not recorded (the tooling was not configured for it).

**Evidence root:** `platform_core_data/runs/run-011__2026-10-14_10-24-14__Targeted__Ancillaries-AegeanNdc/manual_execution/artifacts/`
