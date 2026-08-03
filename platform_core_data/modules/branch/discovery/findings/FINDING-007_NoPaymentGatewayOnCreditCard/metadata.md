# FINDING-007 — No Payment Gateway dropdown appears when Credit Card payment option is selected

- **Finding ID:** FINDING-007
- **Title:** No Payment Gateway dropdown appears when Credit Card payment option is selected
- **Category:** Requirement Gap
- **Severity:** N/A
- **Severity Reason:** Category `Requirement Gap` is always N/A per the Severity Matrix — reclassified from `Bug` after human review attributed this to US 8605 being outdated rather than a build defect.
- **Confidence Score:** 92%
- **Evidence Category:** Direct Observation, corroborated by Human Observation (module-owner clarification, 2026-08-03)
- **Status:** Rejected
- **Business Risk:** A Branch could be configured to accept Credit Card payments with no way to specify which Payment Gateway processes them, since the AC-mandated dropdown never appears.
- **Technical Risk:** The conditional-rendering logic tying a Payment Gateway field to the Credit Card checkbox's checked state either does not exist or does not fire from a programmatic checkbox click; a real user click was not separately tested.
- **Module:** branch
- **Workflow:** Admin → Branch → Create Branch → Branch Sales Configuration → Payment Option → Credit Card
- **Description:** Checking the "Credit Card" checkbox in the Payment Option group does not cause a "Payment Gateway" dropdown/label to appear anywhere on the page, checked via a full-page text search both before and after the click.
- **Expected Behavior:** "The user may select Payment Options (multi-select checkboxes). If Credit Card is selected, a Payment Gateway dropdown shall appear as mandatory. (Mandatory if Credit Card is selected)" (PRD_UserStories.md US 5 §Branch Sales Configuration).
- **Actual Behavior:** `document.body.innerText` contains no occurrence of "Payment Gateway" either before or after programmatically clicking the Credit Card checkbox's underlying `<input type="checkbox">` element, on two independent fresh page loads.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch/add`. 3) Check the "Credit Card" checkbox in the Payment Option row. 4) Search the page for any "Payment Gateway" label/dropdown — none appears.
- **Investigation/Recovery Result:** Failure category "Unexpected UI rendering" (§5.7) — recovery behavior "refresh the page once" applied via a second, independent fresh navigation and repeat of the same click; the dropdown was absent both times — outcome: persisted after recovery attempt.
- **Investigation Notes:** The click was performed by calling `.click()` on the checkbox's underlying DOM input via `page.evaluate`, which dispatches a native click event (not merely setting `.checked`), so this should trigger the same event handlers a real user click would; a literal mouse-driven `page.click()` on the checkbox was not separately attempted as a second confirmation within this run's time-bounded scope. This is recorded as a residual method-specific gap rather than asserted as ruled out.

  **Human Review Update (2026-08-03):** The module owner attributed this absence to US 8605 being outdated — "a US Gap because the US is old." Disposition: Outdated Requirement, not a build defect. The residual method-specific gap noted above (no literal mouse click attempted) is now moot for this run's purposes given the disposition, but is left in the record for completeness.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (screenshot taken immediately after the second click attempt, alongside the Credit Limit 16-digit probe run in the same session — no Payment Gateway control visible anywhere on the page). Console log and DOM snapshot not captured — recorded as missing evidence.
- **Recommendation:** Revise US 8605's Payment Option acceptance criterion to match current, confirmed behavior (no conditional Payment Gateway dropdown) rather than treating the current build as non-compliant with outdated wording.
