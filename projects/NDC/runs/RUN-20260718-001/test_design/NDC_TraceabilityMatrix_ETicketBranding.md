# NDC — Requirement Traceability Matrix — E-Ticket Agency Branding (WT1-T2919)

**Run:** RUN-20260718-001 · **Run Scope:** User Story / Pasted text (WT1-T2919) · **Project Context:** `context/NDC_ProjectContext_ETicketBranding.md` · **Test Suite:** `test_design/NDC_TestCases_ETicketBranding.md` / `.xlsx`

## Agency Type Configuration

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-ETB-AGTYPE-01 (radio field added) | TC-ETB-001, -002, -004, -024 | Not independently verified in Discovery | N/A | Partially Covered — Mandatory/Optional status unstated |
| FR-ETB-AGTYPE-02 (stored/retrievable) | TC-ETB-003 | Not independently verified in Discovery | N/A | Covered |

## E-Ticket Page

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-ETB-ETICKET-01 (dynamic rendering) | TC-ETB-005, -006, -024 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-ETICKET-02 (hide agency details) | TC-ETB-006 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-ETICKET-03 (header removed, Freelance) | TC-ETB-007, -008 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-ETICKET-04 (fixed Title) | TC-ETB-009 | Not independently verified in Discovery | N/A | Partially Covered — Freelance-only vs. all-tickets scope unresolved |
| FR-ETB-ETICKET-05 (fixed Subtitle) | TC-ETB-009 | Not independently verified in Discovery | N/A | Partially Covered — same scope ambiguity |
| FR-ETB-ETICKET-06 (flight details ordering) | TC-ETB-009 | Not independently verified in Discovery | N/A | Partially Covered — same scope ambiguity |
| FR-ETB-ETICKET-07 (ticket number first, all cases) | TC-ETB-010 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-ETICKET-08 (booking reference removed, Freelance) | TC-ETB-011, -012 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-ETICKET-09 (background image) | TC-ETB-013 | Not independently verified in Discovery | N/A | Partially Covered — blocked, asset not yet supplied |
| FR-ETB-ETICKET-10 ("Flywt.com" small font) | TC-ETB-014, -015 | Not independently verified in Discovery | N/A | Covered |

## Booking Confirmation Page

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-ETB-BOOKCONF-01 (ticket number first, all cases) | TC-ETB-016 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-BOOKCONF-02 (booking reference removed, Freelance) | TC-ETB-017, -019 | Not independently verified in Discovery | N/A | Covered |
| FR-ETB-BOOKCONF-03 (Trip ID removed, Freelance) | TC-ETB-018, -019 | Not independently verified in Discovery | N/A | Covered |

## Edge Cases

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-ETB-EDGE-01 (unconfigured → default) | TC-ETB-020 | Not independently verified in Discovery | N/A | Partially Covered — depends on TC-ETB-004 confirming an unset state is reachable |
| FR-ETB-EDGE-02 (existing tickets unimpacted) | TC-ETB-021 | Not independently verified in Discovery | N/A | Covered |

## Design Notes & Dependencies

| Req. ID | Test Case(s) | Discovery status | Finding/Evidence | Coverage |
|---|---|---|---|---|
| FR-ETB-DESIGN-01 (Logo/Agency info/Booking date differences only) | TC-ETB-022, -023 | Not independently verified in Discovery | N/A | Partially Covered — visual-consistency judgment call (TC-ETB-022 exploratory), Booking date sub-item (TC-ETB-023) fully covered |
| BR-ETB-01 (Agency CRUD dependency) | TC-ETB-001, -002 | Covered (as precondition) | N/A | Covered |

**Out-of-scope Requirement IDs:** none — every Requirement ID in `NDC_ProjectContext_ETicketBranding.md` §2 has at least one citing Test Case. See `NDC_CoverageReport_ETicketBranding.md` for the Coverage Percentage computation.
