# Automation Coverage Report — `agency` / SHAFT

| Field | Value |
|---|---|
| Module | `agency` |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Manual Test Suite | `TestCases_Agency.md` revision 3, **Approved** — 60 cases |
| Written | 2026-08-18 |

## 1. Scope Arithmetic — how 60 cases become 18

| Step | Count | Note |
|---|---|---|
| Cases in the approved Stage 3 suite | 60 | revision 3 |
| Less `Review = Rejected` | −27 | Recorded human decisions |
| Less not-`Automation = Approved` where `Review = Approved` | −15 | 14 `Rejected` + 1 `Pending` — deliberately manual, or undecided |
| **Dual-approved — this stage's scope** | **18** | `Review = Approved` AND `Automation = Approved` |

Suite-wide lifecycle tallies: `Review` 33 Approved / 27 Rejected / 0 Pending · `Automation` 18 Approved /
41 Rejected / 1 Pending.

**The 42 excluded cases are not coverage gaps and are never reported as such.** `Automation = Rejected`
means a human decided the case stays manual; `Pending` means nobody has decided yet. This stage does not
chase, question, or advance either lifecycle value (§6.3.1) — only a human may.

## 2. Automation Coverage of the In-Scope Set

| Category | Count | % of 18 |
|---|---|---|
| **Fully automated** | **16** | **89%** |
| **Partially automated** | 2 | 11% |
| Not automated | 0 | 0% |
| Blocked | 0 | 0% |

**This is one case short of the Plan's projection** of 17 fully / 1 partial / 0 blocked — 94% projected
against 89% delivered. The difference is TC-AGENCY-002, **downgraded** from fully to partially automated
while the test was being written: two of its six mandatory fields turned out to be PrimeNG dropdowns with no
verified clear affordance.

The projection is not being quietly restated to match the outcome. A plan that promised 17 and delivered 16
should say so, because the alternative — faking the two dropdown clears to keep the number — would have
produced a test that passes without exercising the rule.

## 3. Partially Automated — exactly what is and is not covered

### TC-AGENCY-002 — Mandatory Agency Master fields block submission when cleared

| Field | Automated? | Detail |
|---|---|---|
| `Agency` | **Yes** | Field-scoped `ndc-fg-input` message asserted |
| `Post office box` | **Yes** | Form-wide message set; field restored |
| `Address` (first) | **Yes** | Form-wide message set; field restored |
| `Phone No` | **Yes** | Form-wide message set; field restored |
| `State` | **No** | PrimeNG dropdown, no verified way to return it to empty |
| `City` | **No** | Same |

**Why the two were not faked.** A dropdown cannot be "cleared" by typing an empty string, and no clear
affordance was observed. Simulating one would produce a test that reports a pass without ever exercising the
mandatory rule — worse than an honest partial. **Manual follow-up required:** clear `State` and `City` by
hand and confirm each renders `Required`.

### TC-AGENCY-059 — Branch is read-only on the Update form

| Suite step | Automated? | Detail |
|---|---|---|
| 1. Read the `Branch` value | **Yes** | |
| 2. Click the control, attempt to open its list | **No** | An absent panel is indistinguishable from a panel the locator does not find |
| 3. Attempt to type into it | **Yes, as a property assertion** | `readonly` + `disabled` + not visible as an editable control |

**Manual follow-up required:** click the Branch control and confirm no dropdown panel opens.

## 4. Suite Composition

| Suite | Tests | Cases |
|---|---|---|
| Inheritance & Read-only | 2 | TC-055, 059 |
| Field Persistence | 5 | TC-001, 011, 012, 044, 053 |
| Validation | 3 | TC-002, 021, 037 |
| Documents & Logo | 4 | TC-016, 020, 022, 023 |
| Maker–Checker | 4 | TC-047, 049, 048, 050 |
| **Total** | **18** | |

## 5. Tests Expected to Fail — by design, and they must not be "fixed"

The Stage 3 suite (disposition row 5) records that the AC-3 / AC-4 upload cases assert the **requirement**
rather than observed behaviour, and are **expected to fail**. That failure is the finding.

| Test | Why it is expected to fail | What must not happen |
|---|---|---|
| **TC-AGENCY-020** | The document input carries **no `accept` attribute at all** (run-004), so there is no format gate. A `.pdf`-named plain-text file will likely be accepted | Do not weaken the assertion to "record what happens". That deletes the finding and leaves a test that can never fail |
| **TC-AGENCY-023** | The 2 MB limit is story-sourced and never verified (ASM-009). It may not be enforced | Do not raise the fixture's size or soften the assertion. If a different threshold is enforced, record the observed one |

Both failure messages state this in the code itself, so Stage 5A records a defect and Stage 5H does not
"repair" them into passes.

## 6. Cases That May Skip — blocked preconditions, never silent passes

| Test | Skips when | Named cause |
|---|---|---|
| TC-AGENCY-055 | The PCC section does not render | FINDING-008 — the parent Branch's suppliers lack credentials. The message prints the fixture's actual supplier list |
| TC-AGENCY-048 | The rejected Agency offers no `Send For Approval` | Automation Plan §5.1's unverified assumption, shown false. **No second Agency is provisioned** — that would contradict the operator's one-Agency instruction |
| TC-AGENCY-050 | Same as TC-048 | Same |

A `SkipException` carrying a named precondition is the correct outcome here. A skip is not a pass, and none
of these is reported as coverage.

## 7. Requirement and Finding Coverage

Requirement-level coverage is the Stage 3 Coverage Report's to state (12/14 = 86% Covered). This stage
neither re-derives nor restates it. What it adds: of the 12 Findings, **6 are directly exercised by generated
automation** — FINDING-001 (TC-002, 021), FINDING-005 (TC-011), FINDING-008 (TC-055),
FINDING-009 (TC-055), FINDING-011 (measured by `paymentOptionCount()`), FINDING-012 (respected by
omission, per `PO-13`).

## 8. Records Created Per Execution

**Two** — one Branch, one Agency. Under `PO-3` (no DELETE on STG) both are permanent. Per-test provisioning
would have created 34. This is the direct, measurable effect of the operator's §5.1 decision.
