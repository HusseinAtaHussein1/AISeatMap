# Knowledge Index

Every document in this tree. **Category is the folder; layer is `scope:`** — see [`README.md`](README.md).

## `patterns/` — engineering knowledge

| ID | Scope | Category | Title | Status | Producer | Consumers | Linked |
|---|---|---|---|---|---|---|---|
| REPAIR-001 | platform | patterns/repair | Bounded poll for post-submit redirect state, not an immediate assertion | Confirmed | automation-execution | automation-execution, automation | generalizes [[REP-001]] |
| REPAIR-002 | platform | patterns/repair | Transient toast/snackbar — text-content locator + non-throwing presence poll | Confirmed | automation-execution | automation-execution, automation | generalizes [[REP-003]] |
| REASON-001 | platform | patterns/reasoning | Prefer Direct Observation over secondary/documentation sources for expected values | Confirmed | automation-execution | automation-execution, automation, test-design | generalizes [[REP-002]] |
| REP-001 | project | patterns/repair | Post-submit redirect assertion ran before SPA redirect completed (TC-LOGIN-001) | Confirmed | automation-execution | automation-execution | generalized_by [[REPAIR-001]] |
| REP-002 | project | patterns/repair | Validation-message assertions sourced from stale Reference Project docs (TC-LOGIN-003/005/006) | Confirmed | automation-execution | automation-execution | generalized_by [[REASON-001]] |
| REP-003 | project | patterns/repair | Invalid-credentials toast — wrong locator + framework Error-vs-Exception (TC-LOGIN-002) | Confirmed | automation-execution | automation-execution | generalized_by [[REPAIR-002]] |
| REP-004 | project | patterns/repair | PrimeNG native-input proxy — click the wrapper (`p-dropdown`/`p-radiobutton`), not the hidden input (TC-AGENCY-001/004) | Confirmed | automation-execution | automation-execution | promotion candidate |
| REP-005 | project | patterns/repair | PrimeNG "Name (Code)" dropdown options — filter-then-select with exact-prefix match to disambiguate substrings (TC-AGENCY-001/004) | Confirmed | automation-execution | automation-execution | promotion candidate |
| REP-006 | project | patterns/repair | p-calendar needs real keystroke-based typing, not a scripted value assignment (TC-AGENCY-001) | Confirmed | automation-execution | automation-execution | promotion candidate |
| REP-007 | project | patterns/repair | ngx-intl-tel-input phone fields expect the national number only, no literal country-code prefix (TC-AGENCY-001) | Confirmed | automation-execution | automation-execution | promotion candidate |
| REP-008 | project | patterns/repair | Repeatable-section "Add" button creates a second, itself-required empty row — don't click it for a single entry (TC-AGENCY-001) | Confirmed | automation-execution | automation-execution | promotion candidate |
| REP-009 | project | patterns/repair | Post-submit navigation must be polled, not checked after a fixed delay (TC-AGENCY-001) | Confirmed | automation-execution | automation-execution | same poll-not-sleep pattern as [[REPAIR-001]] |

Empty categories: `patterns/automation/`, `patterns/diagnosis/`, `patterns/execution/`,
`patterns/framework/`, `patterns/reporting/` — these exist and hold nothing yet. An empty, indexed
category tells a Skill "this category exists and has no entries"; a missing one tells it nothing and
invites each Skill to invent its own place to write.

## `business/` — application-specific knowledge (always `scope: project`)

| ID | Scope | Category | Title |
|---|---|---|---|
| BR-001 | project | business/rules | Contact person field strips Arabic script by design, preserves Latin/CJK (TC-AGENCY-005, FINDING-006) |
| BR-002 | project | business/rules | Branch Supplier Routing scopes flight-search results and is inherited automatically by child Agencies |
| BR-003 | project | business/rules | Supplier Routing credential selection differs by supplier type: LCC inline, GDS in a separate Branch section |
| BR-004 | project | business/rules | GDS returns many airlines (incl. LCC content); LCC returns mostly itself but multi-carrier itineraries remain possible |
| BR-005 | project | business/rules | Agency Add form's phone fields expect national number only, no literal `+` country-code prefix, despite User Story 3's stated AC (TC-AGENCY-CREATE-007, REP-007) |
| APP-001 | project | business/rules | Operating Country = Country × Currency, a distinct Reference Data entity from Country (Branch Add form) |
| APP-002 | project | business/rules | Branch's Payment Option checkboxes are sourced from Master → Payment Gateway → Payment Method (34 entries, Online/Offline) |

Empty categories: `business/requirements/`, `business/ui/`, `business/api/`, `business/findings/`,
`business/lessons_learned/`.

## Migration note (2026-07-29)

This index replaces two former ones — `platform_core/knowledge/INDEX.md` and
`platform_core_data/knowledge_base/INDEX.md`. Every document moved with `git mv`, so its full history
is intact under its new path.

| Was | Now |
|---|---|
| `platform_core/knowledge/repair_patterns/REPAIR-*.md` | `patterns/repair/` (`scope: platform`) |
| `platform_core/knowledge/reasoning/REASON-*.md` | `patterns/reasoning/` (`scope: platform`) |
| `platform_core/knowledge/{automation,diagnosis,execution,framework}_patterns/`, `reporting/` | `patterns/{automation,diagnosis,execution,framework,reporting}/` |
| `platform_core/knowledge/pipeline_decision_patterns/` | dropped — no reader, no promotion source |
| `knowledge_base/repair/REP-*.md` | `patterns/repair/` (`scope: project`) |
| `knowledge_base/{automation,diagnosis,execution}/` | `patterns/{automation,diagnosis,execution}/` |
| `knowledge_base/business_rules/BR-*.md` | `business/rules/` |
| `knowledge_base/application/APP-*.md` | `business/rules/` |
| `knowledge_base/ui/`, `findings/`, `lessons_learned/` | `business/{ui,findings,lessons_learned}/` |
| — | `business/requirements/`, `business/api/` (new) |

Frontmatter changes: `scope:` added; `category:` now mirrors the folder path; the retired `project:`
key removed (meaningless with one project); `promoted_from: NDC/REP-001` → `generalizes: REP-001`;
`implements_platform_pattern:` → `generalized_by:`; retired `*-agent` Skill identifiers renamed.

`application/` had no slot in the target hierarchy and was folded into `business/rules/` — both
APP documents state application-domain facts, which is what that category holds. Their IDs are
unchanged, so every existing citation still resolves.
