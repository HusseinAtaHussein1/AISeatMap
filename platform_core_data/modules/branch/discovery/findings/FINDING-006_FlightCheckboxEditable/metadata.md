# FINDING-006 — "Flight" Product Access checkbox is user-editable rather than backend-only

- **Finding ID:** FINDING-006
- **Title:** "Flight" Product Access checkbox is user-editable rather than backend-only
- **Category:** Requirement Gap
- **Severity:** N/A
- **Severity Reason:** Category `Requirement Gap` is always N/A per the Severity Matrix — this Finding does not assert a defect, only a gap between documented and observed control.
- **Confidence Score:** 93%
- **Evidence Category:** Direct Observation, corroborated by Human Observation (module-owner clarification, 2026-08-03)
- **Status:** Rejected
- **Business Risk:** If Flight is meant to be an immutable default, a user could uncheck it (the checkbox is not `disabled`), potentially leaving a Branch with no product access configured — the business intent of "always has Flight" would then depend entirely on downstream (server-side or workflow) enforcement that this run did not verify.
- **Technical Risk:** None identified beyond the business-risk framing above.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Product Access Details
- **Description:** The Product Access Details section shows two checkboxes, "Flight" (checked by default) and "Others" (unchecked). A DOM read shows Flight's `disabled` attribute is `false` — the checkbox is interactive, not read-only/backend-fixed as the AC describes.
- **Expected Behavior:** "The system shall set Flight as the default product (backend configuration, no selection by the user). (Mandatory)" (PRD_UserStories.md US 5 §Product Access Details).
- **Actual Behavior:** Flight renders as a normal, enabled checkbox (`checked: true, disabled: false`) alongside an "Others" checkbox, both of which appear user-togglable.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Scroll to "Product Access Details". 4) Inspect the "Flight" checkbox's `disabled` attribute (found `false`) and observe the sibling "Others" checkbox.
- **Investigation/Recovery Result:** Failure category "Validation failure" (deterministic attribute read) — no retry applicable; validated once.
- **Investigation Notes:** Did not attempt to uncheck Flight and submit, since that would test a real mutation whose outcome (whether the server rejects/overrides an unchecked Flight) is exactly the ambiguity this Finding raises, and forcing it via a real Submit for Approval was judged higher-risk than warranted for a single confirmatory check within this run's scope — left as an Open Question for Test Design to design a dedicated test case for, rather than resolved here by guessing.
- **Root Cause Hypothesis:** ~~The AC's "no selection by the user" wording may describe only the initial default state...~~ — superseded by the Human Review Update below.

  **Human Review Update (2026-08-03):** The module owner confirmed Flight's editability (and the Payment Gateway absence in FINDING-007) are attributable to US 8605 being an old story that predates the current build — "a US Gap because the US is old," not an application defect. Disposition: Outdated Requirement.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (full-page screenshot showing both checkboxes). DOM attribute read captured in Investigation Notes; no separate accessibility snapshot file captured — recorded as missing evidence.
- **Recommendation:** Revise US 8605's Product Access Details acceptance criterion to match current, confirmed behavior (Flight editable, "Others" a real option) rather than treating the current build as non-compliant with outdated wording.
