# NDC — QA Assessment Report (Stage 2, Explorer Agent)

**Status: IN PROGRESS — updated continuously per screen, per user instruction.** This is not a final document; it is synchronized after every observation so the run is resumable at any point.

## 1. Scope

- Run Scope: Type = User Story (Q2-CORE-WT1-T3002-066 + T3087, jointly scoped) · Source = Pasted text
- Run Type: not explicitly stated beyond User Story scoping
- Project Context version used: `NDC_ProjectContext.v1.md` (Approved)

## 2. Objectives

Per Discovery Strategy by Run Scope (`agents/explorer_agent.md` §16, "User Story → narrowest — verify only the acceptance criteria, don't wander"):
- Confirm whether the live Credential Routes Filter CRUD already implements the single-list + Whitelist/Blacklist-radio shape T3002-066 describes (Assumption #3).
- Confirm/refute the AND-logic interaction between Airport BlackList/WhiteList and Credential Routes filtering (Assumption #1) — **pending**.
- Confirm Restricted Airlines' independence from Credential Routes filtering (Assumption #2) — **pending**.
- Determine whether the T3087 Airlines multi-select filter already exists (it should not, per the story's own premise) — **confirmed via Direct Observation: does not exist** (see §6).
- Confirm existence/non-existence of the three net-new T3002-066 capabilities (Audit Log, verification function, route tag) — **pending**.
- Confirm whether "Portal Booking Module" exists as a distinct, separately-accessible surface from Booking-Mid Office — **pending**.

## 3. Evidence Sources

- **User-guided exploration** (`agents/explorer_agent.md` §8.1 #4) — used for the initial Credential Routes Filter Add/List/Edit screens, before Browser Automation became available this run. Evidence Category: Human Observation.
- **Browser Automation** (`agents/explorer_agent.md` §8.1 #1) — **now the active Discovery Mode**, via the platform's `tools/browser_driver/` (`BrowserDriver`), driving the system's real Chrome browser (headed, human-watchable) with a real authenticated session. Evidence Category: Direct Observation — the highest tier, enabling Findings to reach `Confirmed` status where criteria are otherwise met. Per §8.2, more than one mode may be used within a run for different areas; this run used User-guided exploration first, then upgraded once Browser Automation was set up.
- No Documentation-only or API-based discovery used.

## 4. Modules Explored

**Sitemap observed so far:**
- `/master/supplier/credential-routes-filter` (list)
- `/master/supplier/credential-routes-filter/add`
- `/master/supplier/credential-routes-filter/edit/{id}`

**Business module:** Master → Supplier → Credential Routes Filter — the primary CRUD both in-scope User Stories modify.

**Reusable UI components identified:**
- Whitelist/Blacklist radio-button mode toggle (Add + Edit)
- Origin/Destination airport typeahead with an `Add` action (Add + Edit)
- Master module's left sidebar (Flight / Supplier / Miscellaneous / Payment Gateway)

## 5. Observed Behaviour

- Credential Routes Filter list screen shows exactly one configured rule: Supplier `Galileo`, Credential `Galileo Live UAE`.
- That rule is configured in **Whitelist** mode with one route, `SSH → AMM`.
- The Add and Edit screens share an identical Configuration + Add Routes + Routes layout.
- The Routes list is capped at a displayed maximum of 50 entries per rule (`{count} / 50` counter) — see FINDING-003.
- Logged-in identity for this session reads `odeysysadmin` — see FINDING-002.
- Top navigation bar shows 11 items (missing Import PNR / Import Booked PNR relative to `architecture.md`) — see FINDING-001.
- **NDC has multiple distinct Admin-tier roles** — Super Admin (`odeysysadmin`) and Admin (`e.saady`) — with different feature access; per stakeholder clarification, Super Admin cannot complete the Booking Cycle (cannot book a ticket). See FINDING-004.

## 6. Confirmed Behaviour

- **Carried-Forward Assumption #3 — CONFIRMED.** Project Context §6 Assumption #3 ("Current Credential Routes Filter UI may or may not already implement 'one list + Whitelist/Blacklist radio' — not yet confirmed against the live screen") is now resolved: the live UI **already implements** this exact shape (single Routes list, one Whitelist/Blacklist radio toggle) on both the Add and Edit screens. Evidence Category: Human Observation — capped at "Likely," not "Confirmed" Finding-status terms, but sufficient to resolve this specific Assumption as observed-true rather than leaving it open.
- **Role model clarified (not a Project Context Assumption, but directly relevant to §4 Roles & Credentials):** Super Admin and Admin are confirmed distinct roles with at least one known permission difference (Booking Cycle). See FINDING-004 for the full statement and its Test Design implications.
- **T3087 Airlines multi-select filter — CONFIRMED via Direct Observation (Browser Automation) not to exist yet.** With Supplier=Galileo and Supplier Credentials=Galileo Live UAE selected on a fresh Add Routes Filter form, no Airlines multi-select field renders between Supplier Credentials and the Whitelist/Blacklist toggle. This is stronger evidence than the earlier Human Observation pass (`CredentialRoutesFilter_EditScreen.md`) and directly consistent with T3087's own premise. See `CredentialRoutesFilter_AddScreen_SupplierSelected.md`.

## 7. Assumptions

- *(No new Assumption introduced by the agent this round — see Open Questions below for the one ambiguity surfaced.)*

## 8. Open Questions

- **Supplier type vs. Airline type ambiguity:** T3087 describes its conditional Airlines multi-select as appearing "when the rule's supplier type is GDS," while Project Context §2's in-scope module list frames the relevant classification as Master → Flight → **Airline**'s "Airline Type field (GDS/LCC/Both)." It is not yet confirmed whether "supplier type" and "Airline Type" refer to the same underlying classification, two related-but-distinct fields, or a wording imprecision in one of the source stories. Not resolvable from this screen alone — needs either a Product Owner clarification or direct observation of a Supplier-level type field (if one exists) once Master → Flight → Airline and Master → Supplier → Supplier are explored.
- **Carried-forward Assumption #1** (Airport/Credential-Routes AND-logic) — unresolved, pending Airport module exploration.
- **Carried-forward Assumption #2** (Restricted Airlines independence) — unresolved, pending Supplier Credentials module exploration.
- **Carried-forward Assumption #5** (T3087 Airlines list vs. Restricted Airlines coexistence) — unresolved, pending both Supplier Credentials and Airline module exploration.
- **Carried-forward Assumption #6** (max airlines per rule, DBA sign-off pending) — unresolved, not yet applicable (T3087's Airlines field doesn't exist live yet).
- **Carried-forward Assumption #7** (DB engine Oracle/SQL Server vs. MySQL `wonderdb`) — unresolved, not encountered this round.
- **Carried-forward Assumption #8** (Portal Booking Module existence) — unresolved, pending Booking-Mid Office / Portal exploration.
- **Carried-forward Assumption #4** (Audit Log / verification function / route tag don't exist yet) — not yet directly re-confirmed this round; the Credential Routes Filter screens observed so far show no such features, consistent with the assumption, but a dedicated look (e.g., checking for an Audit Log entry point anywhere in the Master/Supplier nav) hasn't happened yet.

## 9. Discovered Risks

- **Business Risk:** An undocumented 50-route cap (FINDING-003) could silently block a legitimate large-route-network configuration with no visible override or justification.
- **Business Risk:** Both in-scope User Stories are written "As an NDC Admin" without specifying Super Admin vs. Admin (FINDING-004) — a wrong-role test case is a false-negative risk for Stage 3/5, not a real defect.
- **Technical Risk:** Two distinct Admin-tier roles now confirmed (`e.saady` = Admin, `odeysysadmin` = Super Admin, FINDING-001/002/004) with at least one known permission boundary (Booking Cycle) — full permission matrix between them is still unknown and relevant to every in-scope module, not just booking.

## 10. Coverage

Roll-up from `Coverage_Summary.md`: 1 of 7 declared in-scope areas visited (Credential Routes Filter — Add/List/Edit, User-guided exploration) = ~14%. See that file for the full breakdown; no Skipped/Blocked/Unreachable areas recorded yet.

## 11. Gaps (Documented vs. Observed)

| Documented (source) | Observed | Gap |
|---|---|---|
| `architecture.md` Navigation Model: 13-item nav bar including Import PNR / Import Booked PNR | 11-item nav bar, those two absent | FINDING-001 |
| `run_configuration.md`: Admin identity `E.Saady` | Session identity `odeysysadmin` — confirmed distinct role (Super Admin), not stale data | FINDING-002 |
| Project Context / source User Stories: no stated cap on Routes list size | UI displays `{count} / 50` | FINDING-003 |
| Project Context §4: single undifferentiated "NDC Admin" role | Two distinct roles live — Super Admin, Admin — with different feature access | FINDING-004 |

## 12. Recommendations

- **Regression Test Candidates** (candidates only, not designed test cases — that's Stage 3's job): (a) verify the existing Galileo/Galileo Live UAE Whitelist rule with route `SSH → AMM` continues to permit that route and block others after any future change; (b) a 50-route boundary test (50th accepted, 51st rejected) for the Routes list cap, marked assumption-based/undesigned-for-execution given the Read-only environment constraint.
- No Findings of Category `Recommendation` raised this round.

## 13. Inputs for Test Design

- **Findings so far:** FINDING-001 (Observation, Needs Human Review), FINDING-002 (Observation, Needs Human Review), FINDING-003 (Requirement Gap, Needs Human Review), FINDING-004 (Requirement Gap, Needs Human Review) — none block Test Design; all are informational/documentation-accuracy items, an undocumented constraint to design a boundary case around, or (FINDING-004) a role-assignment decision Test Design must make explicitly per test case.
- **Resolved Assumptions:** Project Context Assumption #3 — Confirmed.
- **Unresolved Assumptions carried forward to Test Design as still-open:** #1, #2, #4 (partially), #5, #6, #7, #8 — plus the new Open Question on "supplier type" vs. "Airline Type" wording, plus FINDING-004's role-assignment gap.
- **Regression Test Candidates:** see §12 above.
- **Requirement Gaps needing a coverage decision:** FINDING-003's 50-route cap; FINDING-004's role model (Test Design must assign Super Admin or Admin explicitly to every test case, especially any touching Booking-Mid Office/Portal Booking Module).

---
*This report will continue to be updated after every subsequent screen until Stage 2 concludes — see `Timeline.md` for the full chronological log.*
