# FINDING-015 — City search filter is a multi-select, where the acceptance criteria specify a dropdown

- **Finding ID:** FINDING-015
- **Title:** City search filter is a multi-select, where the acceptance criteria specify a dropdown
- **Category:** Requirement Gap
- **Severity:** N/A
- **Severity Reason:** Automatic `N/A` per §5.4 — Category is `Requirement Gap`. The control is functional and its cascade behaves as specified; what differs is its selection cardinality against the story's wording.
- **Confidence Score:** ~~94%~~ → **Withdrawn**
- **Evidence Category:** ~~Direct Observation~~ → contradicted by module-owner observation
- **Status:** **Rejected — Not Reproducible** (was `Needs Human Review`, 2026-08-04 → 2026-08-10)

- **Human Review Update (2026-08-10, module owner):** *"هو dropdown list مش multi-select"* — the City filter **is** a dropdown, not a multi-select. **This Finding's observation was wrong**, so there is no specification drift and nothing for the business to decide: the acceptance criteria and the built control agree. Closed as Not Reproducible.

  *Reading this as a statement about what the control actually is, matching the identical correction made to FINDING-002 the same day. If the intent was instead "it ought to be a dropdown" — i.e. confirming the AC and leaving the mismatch open — say so and this reverts to `Needs Human Review`.*

  **Consequence:** `TC-BR-079` (exploratory — "does the City filter accept and apply multiple cities?") existed only to answer the question this Finding raised. With the premise withdrawn the case has nothing left to explore; retiring it is a Stage 3 decision and has **not** been actioned here.
- **Business Risk:** None identified as a harm — a multi-select is a superset of a single-select, so no search a dropdown could perform is prevented. The only business consequence is specification drift: US 8599's stated behaviour and the built behaviour differ, and whichever is stale will keep generating mismatches.
- **Technical Risk:** None identified. Worth noting for downstream test authoring rather than for engineering: a multi-select and a dropdown are driven differently, so any test or automation written against the story's wording would target the wrong interaction model.
- **Module:** branch
- **Workflow:** Admin → Branch → Search Branch → Search & Filtering → City
- **Description:** US 8599 lists City among the search filters as a dropdown dependent on State. The live control is a PrimeNG **`p-multiselect`**, carrying `selecteditemslabel="All ({0} selected)"` — i.e. it is built to accept several cities at once. Country and State, by contrast, are both single-select `p-dropdown` controls, so the inconsistency is within the same cascade.
- **Expected Behavior:** "City - Dropdown (dependent on selected State)" (PRD_UserStories.md US 7 §Search & Filtering; carried into ProjectContext.md §2, row "NEW — Search Branch: search & filter form").
- **Actual Behavior:** The City control is a `p-multiselect` (element `id-City`, `role="listbox"`, `name="City"`), disabled until a State is selected, and enabling correctly once one is. The dependency rule the story states is satisfied; the control's cardinality is not what the story describes.
- **Steps to Reproduce:** 1) Log in as Super Admin. 2) Navigate to `/admin/branch`. 3) Inspect the City control — it renders as `p-multiselect`, not `p-dropdown`. 4) Select a Country, then a State, and observe City become enabled while remaining a multi-select.
- **Investigation/Recovery Result:** Not applicable — reading a rendered control's type is deterministic; no §5.7 recovery category matches.
- **Investigation Notes:** Established by comparing all three cascade controls in the same DOM capture: `id-Country` and `id-State` are `p-dropdown`; `id-City` is `p-multiselect`. The cascade itself was probed end to end and behaves exactly as US 8599's Business Rule requires — State disabled until Country chosen (33 options appeared for Egypt), City disabled until State chosen — so the dependency half of the criterion is **confirmed**, and only the control-type half diverges. Deliberately **not** probed: whether selecting several cities actually returns the union of their records. That requires opening the overlay, selecting multiple options and searching; it is a behavioural question better answered by a designed test case than by an exploratory probe, and is handed to Test Design rather than guessed at here. Related but recorded separately: the same story specifies Country and State as dropdowns and both are, so this is an isolated divergence rather than a systematic one.
- **Occurrence Count:** 1
- **Evidence Links:** `failure.png` (filter region showing the City control rendered as a multi-select alongside the two single-select dropdowns), `after.png` (cascade working — City enabled after a State is chosen). The full control-by-control DOM comparison is transcribed in `DiscoverySnapshot_SearchBranch.md` §3.
- **Recommendation:** Low priority. Confirm with Product whether multi-city search is intended — if it is, US 8599's wording is outdated and should say multi-select, which would also fold into the same "the story is old" pattern already applied to several US 8605/8606 criteria. Either way, Test Design should author against the **observed** multi-select, and should add a case covering multi-city selection, since that capability exists and is currently unspecified and therefore untested.
