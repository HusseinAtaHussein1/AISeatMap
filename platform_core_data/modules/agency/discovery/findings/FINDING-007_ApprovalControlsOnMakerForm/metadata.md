# FINDING-007

- **Finding ID:** FINDING-007

- **Title:** Segregation of duties on agency update cannot be assessed — one identity is available, and it sees Send For Approval, Approve and Reject on the same form

- **Category:** Test Gap

- **Requirement Disposition:** **`Not a requirement mismatch — coverage limitation`** *(Project Context §1.1 — added 2026-07-31 by user directive)*
  **Basis:** nothing here is a disagreement between the story and the application. The story and the PRD
  agree that approval is a distinct, authorized action; the application provides one. What is missing is a
  **second credential**, which is a property of this run's configuration, not of either requirement source.
  The directive therefore does not apply and does not resolve it.
  **One sub-item does disposition, and it is the label difference:** US-4222 names the action
  `Submit for Approval` while the application's button reads `Send For Approval`. **PRD XC-01 `[V]` uses
  "Send for Approval"**, corroborating the application — so that specific mismatch is §1.1 **row 1**,
  **`Story Outdated — PRD-corroborated`**, and Stage 3 uses the application's label without further
  question.

- **Severity:** N/A

- **Severity Reason:** `Test Gap` carries no impact-if-defect rating (§5.4) — it documents a limitation in this run's own coverage, not a claim about the application. The underlying governance question is unresolved, not answered adversely.

- **Confidence Score:** 95%

- **Evidence Category:** Direct Observation

- **Status:** Needs Human Review

- **Business Risk:** US-4222's Expected Outcome reserves `Approve` and `Reject` for *"authorized users (e.g., supervisors)"*, and PRD XC-06 states an approver **should not** be able to approve their own change. With a single credential available, **this run cannot verify either statement** — so two of the story's four Expected Outcome actions will be executed by the same identity that made the edit, and a genuine segregation-of-duties failure would be indistinguishable from correct behaviour. If four-eyes governance on agency updates matters commercially — and PRD §1.1 lists *"enforce four-eyes governance on every commercial and master-data change"* as a business objective — this is the coverage gap most worth closing.

- **Technical Risk:** None identified from what was observed. The account in use is `odeysysadmin`, which PRD §2 identifies as **Super Admin** — the platform's designated approver identity. `Approve` and `Reject` rendering for that account is therefore expected, not anomalous. What is untested is whether a plain **Admin** who makes an edit also sees them, which is the actual XC-06 question.

- **Module:** `agency`

- **Workflow:** Admin → Agency → Agency → edit an existing agency → form action buttons

- **Description:** The Update Agency form presents four action buttons at its foot, all four visible and enabled to the single available account: `Cancel`, `Send For Approval`, `Approve`, `Reject`. The same session that can edit every field can therefore also, at least as far as the UI presents it, approve or reject the record.

  Because only one credential exists for this run, the run cannot distinguish between three possibilities: (a) any user with edit rights sees Approve/Reject, which would contradict XC-06; (b) only Super Admin sees them, which is correct behaviour and merely looks permissive because Super Admin is the identity in use; or (c) the buttons render for everyone but the *action* is refused server-side for the maker.

  A separate, smaller observation from the same evidence, recorded here rather than as its own Finding: **the story's button label does not match the application's.** US-4222 names the action `Submit for Approval`; the application's button reads `Send For Approval`. PRD XC-01 `[V]` uses *"Send for Approval"*, matching the application — so the story is the outlier. The full button set observed is: `Upload document *`, `Add`, `Upload logo *`, `Set target`, `Cancel`, `Send For Approval`, `Approve`, `Reject`.

- **Expected Behavior:** The Project Context (`modules/agency/context/ProjectContext.md` §4) requires **two** roles for this run — **Admin** as the maker and **Super Admin** as the checker — and states the checker is *"required because automation consistently switches to Super Admin to approve, implying a maker may not approve their own change — though this is `[I]`, never asserted (OQ-1)"*. The same document carries this forward as **ASM-004** (*"self-approval is assumed prohibited but never proven"*), **ASM-015** (which role exactly may approve), and **RSK-003**, which anticipates precisely this outcome: *"If no Super Admin credential is available and self-approval is blocked, those two acceptance criteria end `Blocked` — an environment/access limitation, never a product `Failed`."*

- **Actual Behavior:** One credential is available (`odeysysadmin`, Super Admin per PRD §2). It sees all four action buttons on the update form. Whether a maker-only identity would see them is unknown.

- **Steps to Reproduce:**
  1. Authenticate to `http://192.168.1.70` with the single configured STG account.
  2. Navigate Admin → Agency → Agency; open any agency via the pencil icon (observed at `/admin/agency/edit/949`).
  3. Scroll to the foot of the form.
  4. Observe `Cancel`, `Send For Approval`, `Approve`, `Reject` all present and enabled.

- **Investigation/Recovery Result:** Investigation & Recovery Engine — **not applicable**: no listed failure category matched (§5.7), because nothing failed. The mid-run Recovery Strategy (§21) *was* considered for the missing second identity and no fallback Discovery Mode can supply one: a second credential is not something a lower-priority mode can observe into existence, so this is recorded as a Test Gap rather than resolved.

- **Investigation Notes:** Investigation Mode's (§5.8) `Authorization` boundary conditions — different user role, session expiration, deep links — were **not** exercised, and each omission has a specific reason. *Different user role:* impossible; only one credential exists on this install, which is the whole substance of this Finding. *Deep links:* reaching `/admin/agency/edit/949` by direct URL was in fact done routinely during this run and worked, but that demonstrates nothing about authorization while only a privileged identity is available to test with. *Session expiration:* not attempted, as it would end the working session for no information this run could act on. **The decisive action was deliberately not taken:** clicking `Approve` on a record this session had itself edited would answer the self-approval question directly, but it both mutates a live agency and would place a real record into an approved state on shared staging — it belongs to Stage 4M under a designed case with a recorded pre-edit state, not to Discovery. The buttons' rendering was confirmed in two independent sessions.

- **Root Cause Hypothesis:** Omitted — no hypothesis is warranted. The condition is an access limitation of this run's configuration, not an application behaviour needing explanation, and speculating about the application's permission model from a single privileged session would be exactly the sort of unfounded inference this stage is required not to make.

- **Occurrence Count:** 1

- **Evidence Links:**
  - `action_buttons_bottom_of_form.png` — the foot of the update form with all four action buttons visible and enabled
  - `buttons_visible_to_super_admin.txt` — every button label rendered on the form for this account
  - **Not captured:** any evidence of a second identity's view, or of a self-approval attempt — the first does not exist, the second was deliberately not performed (see Investigation Notes). Console log — the session produced zero console output.

- **Recommendation:** Obtain a **plain Admin** credential (distinct from `odeysysadmin`) and add it to `platform_core_data/knowledge_base/credentials/credentials.json` before Stage 4M runs. That single addition converts three carried-forward assumptions — ASM-004, ASM-015 and OQ-1 — from untestable to testable, and lets AC-9's… more precisely, lets the Expected Outcome criteria for `Approve` and `Reject` be executed as the story intends: maker edits, checker approves. If no second credential can be provided, Stage 3 should still design the maker/checker cases and mark them `Blocked — Requires Second Identity`, and Stage 4M must report them as Blocked rather than Passed — a self-approval that succeeds under Super Admin is not evidence that XC-06 is satisfied or violated. Separately, correct either the story or the UI on the `Submit for Approval` / `Send For Approval` label difference; PRD XC-01 sides with the UI.
