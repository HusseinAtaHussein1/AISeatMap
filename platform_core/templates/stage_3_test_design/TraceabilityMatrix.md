<!--
TEMPLATE — Requirement Traceability Matrix (Stage 3 — shared, divergence point)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/test_design/TraceabilityMatrix.md
Authority:  .claude/skills/test-design-skill/SKILL.md §5.1 (Four Dimensions), §5.2 (No Test Case
            Without Traceability), §5.3 (Finding disposition), §5.4 (Run Scope Reference),
            §6.2 (what lives here rather than on the test case), §9 Outputs #3, §12

This artifact — not the test case document — is where traceability, Risk, and the References live
(§6.2). One row per Test Case ID.

HARD RULE (§5.2): no test case may exist without at least a Requirement Reference AND a Discovery
Reference. A test case with no corresponding row here must not be generated. Wanting to write a case
with no traceable source is itself a signal to log a Coverage Report gap — never to invent a
requirement to justify the case.

HARD RULE (§5.1): a populated Finding Reference with an `N/A` Evidence Reference is INCOMPLETE and
must not be published — if a Finding is being tested, its evidence is what makes the case concrete.
-->

# Requirement Traceability Matrix — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| Project Context | `runs/{{RUN_FOLDER}}/context/ProjectContext.md` |
| Run Scope Type / Run Type | {{RUN_SCOPE_TYPE}} / {{RUN_TYPE}} |
| Test Cases Traced | {{TRACED_CASE_COUNT}} |
| Generated | {{TIMESTAMP}} |

## 1. Matrix

<!-- One row per Test Case ID. Mandatory/`N/A` rules per §5.1:
       Requirement Reference   — ALWAYS mandatory. Project Context requirement ID/section
                                 (e.g. FR-12, BR-1, SR-3).
       Discovery Reference     — ALWAYS mandatory. The discovery snapshot, Timeline entry, or QA
                                 Assessment Report section that validated/enriched this case — or
                                 exactly "Not independently verified in Discovery".
       Finding Reference       — mandatory when applicable, else `N/A`.
       Evidence Reference      — mandatory WHENEVER Finding Reference is populated, else `N/A`.
                                 e.g. FINDING-003/failure.png
       Acceptance Criteria Ref — the enumerated acceptance criterion this case covers (§5.4).
       Run Scope Reference     — §5.4, carried onto every case.
       Risk                    — Level + one-line statement, derived from a populated Finding's own
                                 Business/Technical Risk where applicable. Aggregated into the
                                 Coverage Report Risks section. -->

| Test Case ID | Requirement Reference | Discovery Reference | Finding Reference | Evidence Reference | Acceptance Criteria Reference | Run Scope Reference | Risk Level | Risk Statement | Validation Status |
|---|---|---|---|---|---|---|---|---|---|
| {{TEST_CASE_ID}} | {{REQUIREMENT_REF}} | {{DISCOVERY_REF}} | {{FINDING_REF}} | {{EVIDENCE_REF}} | {{AC_REF}} | {{RUN_SCOPE_REF}} | {{RISK_LEVEL}} | {{RISK_STATEMENT}} | {{VALIDATION_STATUS}} |

## 2. Requirement → Test Case Roll-Up

<!-- The inverse view: every in-scope Project Context requirement and the case(s) covering it.
     A requirement with no case here must appear in the Coverage Report's Coverage Gaps. -->

| Requirement ID | Requirement Summary | Test Case ID(s) | Coverage Status |
|---|---|---|---|
| {{REQUIREMENT_ID}} | {{REQUIREMENT_SUMMARY}} | {{TEST_CASE_IDS}} | {{COVERAGE_STATUS}} <!-- Covered / Partially Covered / Uncovered / Out-of-Scope / Unknown-Unassessed --> |

## 3. Finding Disposition

<!-- §5.3: EVERY Finding from Stage 2 becomes exactly ONE outcome — no Finding is left unaccounted
     for. A Finding with no disposition row is a gap in this stage's own output. -->

| Finding ID | Category | Severity | Disposition | Test Case ID(s) / Reason |
|---|---|---|---|---|
| FINDING-{{ID}} | {{CATEGORY}} | {{SEVERITY}} | {{DISPOSITION}} | {{CASES_OR_REASON}} |

## 4. Risk Register

<!-- Every case's Risk entry, aggregated. High/Critical items are called out explicitly in the
     Coverage Report's Risks section (§18 #9) as well. -->

| Risk Level | Test Case ID(s) | Statement | Source |
|---|---|---|---|
| {{RISK_LEVEL}} | {{TEST_CASE_IDS}} | {{RISK_STATEMENT}} | {{SOURCE}} <!-- Finding ID / Project Context assumption / risk ID --> |
