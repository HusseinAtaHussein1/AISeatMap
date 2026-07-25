# NDC — Automation Plan (Agency Module, SHAFT, new package) — RUN-20260718-001

Per `agents/automation_agent.md` §5. Written in full before any code generation, per the Consolidated Decision Gate (§30/§32.3/§31.2/§33) answered at the start of this Stage 4 run.

## Decision Gate outcomes (recorded verbatim)

| Question | Human's answer |
|---|---|
| Proceed with Stage 4 now? | Yes — explicit request ("run automation for Agency Module"). |
| Automation Target (§32.3) | Inside the platform (not the Reference Project `E:\Automation2\NDC-Uplift-Automation`, which stays read-only). |
| Framework (§31.2) | SHAFT (Java / TestNG / Allure), per `platform_core_data/automation_framework.md`. |
| Strategy (§33) | **Start a new package** — not an extension of the existing `tests_SHAFT` (RUN-20260712-001/002) in place. |
| Environment override (live, mid-run) | Discovery and automation login target `http://192.168.1.70` for this run, per explicit user instruction — **not** `.80`, which `platform_core_data/browser/profile.json` currently documents as the FINDING-001-resolved host. This is a live override, not a reversal of FINDING-001 — flagged as a Risk below, not silently reconciled. |

## Target Framework

**SHAFT Engine 7.4.20231015**, Java 17 / Maven / TestNG / Allure — matching `platform_core_data/automation_framework.md`'s SHAFT package structure (Pages / Locators / Tests / Data layers, `Btn_`/`Txt_`/`Lst_`/`Icn_`/`Rbtn_`/`Cbox_`/`Dpick_` naming) and the existing `tests_SHAFT` package's own conventions, since this is the same framework, just a new package instance.

## Target Language

Java 17.

## Project Architecture

Page Object Model with a shared driver/session layer (`Drive_Factory.CommonMethod`, `SHAFT.GUI.WebDriver`), TestNG for orchestration, Allure for reporting — identical shape to the existing `tests_SHAFT` package, copied fresh into this new package rather than imported as a dependency (per the Strategy answer above).

## Design Pattern

Page Object Model. Three Agency-scoped page objects this run:

- **`Agency_Page`** (extends the existing one from `tests_SHAFT`, carried into this new package and extended with every newly-confirmed field) — used for **both** the Add screen (`/admin/agency/add`) and the Update screen (`/admin/agency/edit/{id}`), since live discovery (`runs/RUN-20260718-001/discovery/Agency_Update.md`) confirmed the Update screen renders the identical field `id`s as Add, just pre-populated. One page object, two screens — not duplicated.
- **`SearchAgency_Page`** (existing, extended with Agency Code / State / City / combined-filter search).
- **`AgencyActions_Page`** (new) — the List screen's Actions column: pencil → Update navigation, thumbs-up/thumbs-down → remark popup, remark-popup fill/submit, per-row Status/Approval Status/icon reads. Backed entirely by `runs/RUN-20260718-001/discovery/Agency_Actions.md`.

## Planned Automation Suites (business-workflow-organized, per §10)

1. **Agency Create Suite** — Add Agency form, all sections.
2. **Agency Search Suite** — List/Search screen filters.
3. **Agency Actions Suite** — pencil / Approve / Reject from the grid.
4. **Agency Update Suite** — Update screen (pre-population, edit+resubmit, cancel, Update-screen Approve/Reject).

(Not one suite per screen in isolation — Create and Update share the same page object and field set by design, per the Design Pattern section above; Actions and Search share the same List screen but are functionally distinct workflows, kept separate per §10's business-workflow grouping.)

## Existing Assets (per §9 — every existing package inspected, not just one assumed)

| Package | What's reusable | Reused how |
|---|---|---|
| `tests_SHAFT` (`runs/RUN-20260712-001/`, extended by `RUN-20260712-002`) | `Drive_Factory.CommonMethod`, `AdminPages.Login.LogIn_Page`, `AdminPages.Admin.AdminMenu`, `AdminPages.Admin.AdminTestBase`, `utilities.CredentialsLoader`, `Agency_Page.java` (Add form, Core/Classification/Owner/Documents/Sales Contact/Invoice/Cash fields), `SearchAgency_Page.java` (Name/Status search), `pom.xml`/properties/config. | **Copied fresh** into this new package (per the Strategy answer — "start a new package," not "continue in place") and then extended. Not imported as a dependency; SHAFT packages in this project have historically been standalone Maven projects, and the registry (`AutomationPackages.md`) already tracks each as its own artifact. |
| `tests` (Playwright) | Login-only, stale, predates the finalized suite. | Not reused — different framework, out of scope for this Framework Decision Gate answer. |
| Reference Project (`E:\Automation2\NDC-Uplift-Automation`) | Its own `AdminMenu.java`, `Drive_Factory.CommonMethod` were already found reusable by RUN-20260712-002 (carried into `tests_SHAFT`, now carried again into this package). Its own Agency Add-form page objects (`AddAgencyCore_Page.java`, `AddAgency_Page.java`) were already found stale/empty for this scope by RUN-20260712-002 and are not reused here either. | Read-only, inspected, not modified (Target Decision Gate answer: inside the platform). |

## Assets To Generate

- `Agency_Page` extensions: Company URL, Fax No, IATA Agency radio, Payment Settings (Credit Limit, Top-Up Limit, Credit Terms (Days), Reaching Percentage, Warning Prompt (Days), Credit Agency checkbox, full ~26-item Payment Option checkbox set), Product Access (Select Product, Enable Search Limit), Agency Features (Import PNR/Transfer PNR/Blue Command Screen), Cancel button.
- `AgencyActions_Page` (new): grid Actions-column interactions, remark popup.
- `Agency_Create_TC`, `Agency_Search_TC`, `Agency_Actions_TC`, `Agency_Update_TC` TestNG classes.
- `agencyTestData.json` extension (new fixture data for the above fields).
- Package scaffold: `pom.xml`, `TestBase`, `AdminTestBase`, config properties, `testng.xml`.

## Assets To Reuse

`Agency_Page`'s already-proven methods (`selectBranch`, `fillRequiredCore`, `selectStateAndCity`, `fillPostOfficeBox`, `selectBusinessTypeB2B`, `fillOwnerDetails`, `uploadDocument`, `fillContractDates`, `uploadLogo`, `fillSalesContact`, `selectInvoiceGeneration`, `selectPaymentOptionCash`, `submit`, `typeContactPersonOnly`, diagnostics) — for both Create and Update suites. `SearchAgency_Page`'s `searchByName`/`waitForResultsToRender`/`getResultRowsText`/`isNoDataFoundShown`.

## Estimated Automation Coverage

Of 66 approved Agency test cases (v3 Test Design):

| Disposition | Count | IDs |
|---|---|---|
| **Reuse** (already automated in `tests_SHAFT`, ported forward) | 2 | CREATE-001, SEARCH-002 |
| **Generate** (new code, real live-verified locators) | 43 | CREATE-002/003/005/006/007/008/009/010/011/012/013/014/017/018/025/026/027/029/034/036/038†/039† (22); SEARCH-001/003/004/005/006/007/008/009 (8); ACTIONS-001–009 (9); UPDATE-001/002/003/004 (4) |
| **Partially Automatable** (assert the evidence-backed part only; remainder stays manual) | 8 | CREATE-004/015/019/020/028 (5); UPDATE-005/006/007 (3) |
| **Blocked** (no live-verified locator exists; not fabricated) | 5 | CREATE-016/021/022/023/024 — confirmed by human 2026-07-18: stays deferred, no further discovery this run |
| **Deferred** (FINDING-008 — described UI element does not exist in the live app) | 5 | CREATE-030/031/032/033/035 — confirmed by human 2026-07-18: stays deferred, no further discovery this run |
| **Manual Only** | 1 | ACTIONS-010 (role/business clarification, not a UI assertion) |
| **Superseded/N/A** (already retired by the Test Design itself) | 2 | CREATE-037, SEARCH-010 |

† CREATE-038/039 (Security Inputs / Unicode) are Generated only against fields with confirmed real ids (Agency Name, Address 1, Address 2) — the Bank Name / Manager Name / Supplier Credential Description sub-parts these cases also name are Blocked/Deferred per the table above (Bank Name has no confirmed id; Manager Name and Supplier Credential Description do not exist on the live form at all, see FINDING-008) and are not asserted.

**Net: 53 of 66 (80%) get a real TestNG `@Test` method this run** (43 full + 8 partial + 2 reused); 13 (20%) are explicitly and individually accounted for as Blocked/Deferred/Manual/Superseded, not silently dropped.

## Known Manual Tests

- ACTIONS-010 (actor/role clarification).
- The non-evidence-backed remainder of each Partially Automatable case (e.g., CREATE-004's "no stated limit" boundary judgment; CREATE-019's default-inheritance visual comparison beyond what's asserted programmatically).

## Blocked Tests

CREATE-016, -021, -022, -023, -024 — confirmed to stay Blocked this run (human decision, 2026-07-18); would need a further live discovery pass (Bank Account field ids, Sales Contact "Designation" field, document remove/replace controls) before any of these can move to Generate.

## Risks

1. **Environment discrepancy (`.70` vs `.80`)** — this run's discovery and the generated `TestBase`'s login target both point at `.70`, per live user instruction, while `platform_core_data/browser/profile.json` and FINDING-001 (2026-07-13) document `.80` as the resolved, correct STG host. The two hosts are confirmed-independent datasets (different Agency Code sequences observed: `.80` was in the AGN97xx range, `.70` is in the AGN101xx/102xx range). This is a live override, not a re-resolution of FINDING-001 — a human should reconcile which host is authoritative before this package is treated as the project's standing Agency automation.
2. **FINDING-008 fallout** — 10 test cases (5 Blocked, 5 Deferred) reference form elements this run's live inspection could not find. If those elements exist behind a role/config this session's Admin account didn't have, this plan's Blocked/Deferred classification is wrong and should be revisited once that's confirmed.
3. **ACTIONS-002 wording mismatch** — the generated Actions test asserts the *real* observed icon-per-status behavior (Pending: pencil+up+down; Approved: pencil+down only; Rejected: pencil+up only), not the Test Design's literal "shown only for Pending" wording. Flagged, not silently resolved either way.
4. **Shared STG environment** — all fixture data uses `QASPIKE_`-prefixed Agency names, consistent with this project's established mutation-authorization scope (Branch/Agency/Staff records only).
5. **PrimeNG dropdown read-back quirk** (documented in `Agency_Update.md`) — Branch/State/City/Invoice-generation fields read back empty via their proxy `<input>`'s `value` attribute even when a real selection exists; any assertion needing to *read* these values (not just set them) must open the dropdown panel, not trust the raw attribute.

## Assumptions

- The existing `tests_SHAFT` package's scaffold (`CommonMethod`, `LogIn_Page`, `AdminMenu`, `AdminTestBase`, `CredentialsLoader`) remains stable and is safe to copy forward unmodified into this new package.
- `.70`'s Branch "Test" and its State/City option lists are stable enough across this suite's test runs (confirmed live 2026-07-18: Branch "Test" exists on `.70` with a full Egypt state/city list, structurally equivalent to `.80`'s).
- The Update screen's own `Approve`/`Reject` buttons (distinct from the grid icons) use the same remark-popup mechanics documented in `Agency_Actions.md` — not independently confirmed byte-for-byte this run (see UPDATE-005/006's Partially Automatable disposition).
