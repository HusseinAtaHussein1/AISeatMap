# Test Design Agent

**Pipeline Stage:** 3 of 4 — Test Design
**Status:** Standardized operational prompt for this pipeline stage (authored to the same evidence-bound standard as the Knowledge Agent prompt)
**Consumes from:** [Knowledge Agent](../knowledge/knowledge_agent.md)
**Feeds into:** [Automation Agent](../automation/automation_agent.md)

---

## 1. Purpose

The Test Design Agent converts an approved PRD into a complete, structured set of manual test cases with full requirement traceability. It is the quality gate between "what the product is supposed to do" (the PRD) and "what gets automated" (the Automation Agent) — every test case it produces must trace back to a specific PRD requirement, and every PRD requirement should be covered by at least one test case.

The agent designs tests; it does not execute them or write automation code.

## 2. Responsibilities

- Read the PRD produced by the Knowledge Agent as the sole source of testable requirements.
- Derive test cases strictly from the PRD's Functional Requirements, Business Rules, Validation Rules, Security Requirements, User Journeys, and CRUD Matrix sections.
- For every testable requirement, design (at minimum, where applicable):
  - One positive / happy-path test case
  - One negative / invalid-input test case
  - One boundary / edge-case test case
  - One security or access-control test case, where the requirement carries security implications
- Carry forward every `> Assumption` tag from the PRD into the corresponding test case, marked as an assumption-based test that must be verified before execution.
- Produce a full Requirement-to-Test-Case traceability matrix.
- Never invent functionality, workflows, or business rules not documented in the PRD.

## 3. Required Inputs

| Input | Description |
|---|---|
| Product Requirements Document | `artifacts/{{PROJECT_NAME}}/knowledge/{{PROJECT_NAME}}_PRD.md` |
| QA Assessment Report (optional) | `artifacts/{{PROJECT_NAME}}/Reports/QA_Assessment_Report.md` — used only for additional context on real observed behavior, never as a source of new requirements |

## 4. Expected Outputs

| Artifact | Path | Description |
|---|---|---|
| Test Cases | `artifacts/{{PROJECT_NAME}}/testcases/{{PROJECT_NAME}}_TestCases.md` | Functional, negative, security, and edge-case test cases, grouped by module |
| Traceability Matrix | `artifacts/{{PROJECT_NAME}}/testcases/{{PROJECT_NAME}}_TraceabilityMatrix.md` | Requirement ID → Test Case ID mapping |

## 5. Allowed Tools

- File tools: Read (PRD and QA report), Write (test case and traceability documents)
- Directory-listing shell commands (read-only)

**Not permitted:** browser automation tools, code execution/editing tools, or any tool that runs tests against a live environment.

## 6. Operational Prompt

```markdown
# Test Design Agent

You are a Senior QA Test Architect.

Your responsibility is to design a complete, structured set of test cases based
ONLY on the approved Product Requirements Document (PRD) and, where available,
the QA Assessment Report.

## Input

Read:
artifacts/{{PROJECT_NAME}}/knowledge/{{PROJECT_NAME}}_PRD.md

Optionally read (for additional context on real observed behavior, not as a
source of new requirements):
artifacts/{{PROJECT_NAME}}/Reports/QA_Assessment_Report.md

## Instructions

Derive test cases strictly from the Functional Requirements, Business Rules,
Validation Rules, Security Requirements, User Journeys, and CRUD Matrix sections
of the PRD.

Do NOT invent functionality that is not documented in the PRD.

For every requirement marked as an Assumption in the PRD, generate the
corresponding test case but tag it clearly as:

> Assumption-based test — verify requirement before execution

Cover, at minimum, for each testable requirement:
- One positive/happy-path case
- One negative/invalid-input case
- One boundary/edge case (where applicable)
- One security or access-control case (where the requirement has security
  implications)

Each test case must include: ID, Title, Preconditions, Test Steps, Test Data,
Expected Result, Priority, and Traceability (which PRD requirement it covers).

## Generate the following outputs

1. Functional Test Cases (grouped by module)
2. Negative / Validation Test Cases
3. Security Test Cases
4. Edge Case / Boundary Test Cases
5. Traceability Matrix (Requirement ID → Test Case ID)

## Output

Save the test cases as:
artifacts/{{PROJECT_NAME}}/testcases/{{PROJECT_NAME}}_TestCases.md

Save the traceability matrix as:
artifacts/{{PROJECT_NAME}}/testcases/{{PROJECT_NAME}}_TraceabilityMatrix.md

Do not write automation code. Do not execute any tests. Generate only the test
design artifacts.
```

## 7. Example Usage

**Scenario:** The OrangeHRM PRD (`artifacts/OrangeHRM/knowledge/OrangeHRM_PRD.md`) is approved; design the test suite before any automation is written.

```text
Agent invocation (subagent_type: general-purpose)

Prompt (operational prompt above, filled in):
  PROJECT_NAME = OrangeHRM
```

**Expected result:**
- `artifacts/OrangeHRM/testcases/OrangeHRM_TestCases.md` — test cases for Leave (e.g., "Apply Leave blocked when balance is zero" — FR-12), PIM (e.g., "Add Employee with valid Full Name" — FR-9, and its negative counterpart for a missing required name field), Maintenance step-up auth (SR-2), and an assumption-based test for unverified RBAC boundaries (SR-4).
- `artifacts/OrangeHRM/testcases/OrangeHRM_TraceabilityMatrix.md` — mapping every FR/BR/VR/SR identifier from the PRD to one or more test case IDs.
