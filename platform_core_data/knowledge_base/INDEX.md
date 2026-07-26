# NDC Project Knowledge Index

Project-specific knowledge only — never consulted by any other project (`pipeline/pipeline.md` §10.6).

| ID | Category | Title | Platform Pattern | Path |
|---|---|---|---|---|
| REP-001 | repair | Post-submit redirect assertion ran before SPA redirect completed (TC-LOGIN-001) | [[REPAIR-001]] | `repair/REP-001.md` |
| REP-002 | repair | Validation-message assertions sourced from stale Reference Project docs (TC-LOGIN-003/005/006) | [[REASON-001]] | `repair/REP-002.md` |
| REP-003 | repair | Invalid-credentials toast — wrong locator + framework Error-vs-Exception (TC-LOGIN-002) | [[REPAIR-002]] | `repair/REP-003.md` |
| REP-004 | repair | PrimeNG native-input proxy — click the wrapper (`p-dropdown`/`p-radiobutton`), not the hidden input (TC-AGENCY-001/004) | candidate, not yet promoted | `repair/REP-004.md` |
| REP-005 | repair | PrimeNG "Name (Code)" dropdown options — filter-then-select with exact-prefix match to disambiguate substrings (TC-AGENCY-001/004) | candidate, not yet promoted | `repair/REP-005.md` |
| REP-006 | repair | p-calendar needs real keystroke-based typing, not a scripted value assignment (TC-AGENCY-001) | candidate, not yet promoted | `repair/REP-006.md` |
| REP-007 | repair | ngx-intl-tel-input phone fields expect the national number only, no literal country-code prefix (TC-AGENCY-001) | candidate, not yet promoted | `repair/REP-007.md` |
| REP-008 | repair | Repeatable-section "Add" button creates a second, itself-required empty row — don't click it for a single entry (TC-AGENCY-001) | candidate, not yet promoted | `repair/REP-008.md` |
| REP-009 | repair | Post-submit navigation must be polled, not checked after a fixed delay (TC-AGENCY-001) | [[REPAIR-001]] (same poll-not-sleep pattern) | `repair/REP-009.md` |
| BR-001 | business_rules | Contact person field strips Arabic script by design, preserves Latin/CJK (TC-AGENCY-005, FINDING-006) | N/A — application-specific | `business_rules/BR-001.md` |
| APP-001 | application | Operating Country = Country × Currency, a distinct Reference Data entity from Country (Branch Add form) | N/A — application-specific | `application/APP-001.md` |
| BR-002 | business_rules | Branch Supplier Routing scopes flight-search results and is inherited automatically by child Agencies | N/A — application-specific | `business_rules/BR-002.md` |
| BR-003 | business_rules | Supplier Routing credential selection differs by supplier type: LCC inline, GDS in a separate Branch section | N/A — application-specific | `business_rules/BR-003.md` |
| BR-004 | business_rules | GDS returns many airlines (incl. LCC content); LCC returns mostly itself but multi-carrier itineraries remain possible | N/A — application-specific | `business_rules/BR-004.md` |
| APP-002 | application | Branch's Payment Option checkboxes are sourced from Master → Payment Gateway → Payment Method (34 entries, Online/Offline) | N/A — application-specific | `application/APP-002.md` |
| BR-005 | business_rules | Agency Add form's phone fields expect national number only, no literal `+` country-code prefix, despite User Story 3's stated AC (TC-AGENCY-CREATE-007, REP-007) | N/A — application-specific | `business_rules/BR-005.md` |

Empty categories (`automation/`, `execution/`, `ui/`, `findings/`, `lessons_learned/`) have no entries yet.

This index covers **Project Knowledge only** — the application-scoped folders listed above. It deliberately does not catalog `patterns/`, which sits nested inside this folder but is the separate, application-agnostic Platform Knowledge layer with its own `patterns/INDEX.md` (`pipeline.md` §10.1, §10.6). The `diagnosis/` category moved into that layer on 2026-07-26 and is no longer indexed here.
