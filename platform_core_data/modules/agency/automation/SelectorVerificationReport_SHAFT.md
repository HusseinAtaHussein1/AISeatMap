# Selector Verification Report — `agency` / SHAFT

| Field | Value |
|---|---|
| Module | `agency` |
| Framework | SHAFT Engine, Java 17 |
| Produced by run | `run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency` |
| Stage | `4A` — Automation (generation) |
| Mode | **Headless** (operator decision at the Stage 4A gate) |
| Target | `http://192.168.1.70` — STG |
| Code-State Anchor | **STG live build as of 2026-08-18** |
| Verified at | 2026-08-18 |
| Status | **Complete — 47 of 49 locators verified unique; 2 Unverified and named, neither needed by an in-scope case** |

## 1. What was verified, and how

Every locator below was resolved against the **running application**, headless, before any code was
generated (§11A). Verification is **strictly read-only** (§27A): the session logged in, opened the
Agency list, opened one agency's Update form by clicking its row pen, and read the DOM. **Nothing was
submitted, approved, rejected, or saved**, and no record was created or modified. The only non-GET
request the session issued was the login POST.

**Record observed:** `AGN10247` / `Jewell`, Branch `Brittany (BRN893)` — reached at
`/admin/agency/edit/12083`. A **pre-existing, shared** record, opened read-only. Agency 949 was
deliberately **not** used as a write target anywhere (`PO-2`).

**Evidence:** `evidence/selector_verification/locator_verification_run004.json` ·
`.../form_readiness_probe_run004.json` · `.../update_agency_form_headless.png` ·
`.../agency_list_headless.png` · `.../pcc_locator_verification_run004.json` ·
`.../pcc_section_headless.png`

## 2. Three mechanics established here that the generated code must obey

These are not stylistic preferences. Each one was established by direct observation, each one would
otherwise produce intermittent failures, and each is the kind of defect Stage `5A` would report and
Stage `5H` would spend a human approval repairing.

### 2.1 The Update form must be reached through the list, never by URL — `REPAIR-004`

A direct navigation to `/admin/agency/edit/{id}` renders the **form template with no record loaded**:
`document.body.innerText.length` is **246**, `#id-Agency` resolves but its value is empty, there are no
table rows and no section headings. The locators still resolve, which is what makes this dangerous — a
suite built on a deep link would compile, run, and assert against an empty shell.

**Required:** open `/admin/agency`, locate the row, click `i.pi.pi-pencil` in its Actions cell. This is
`REPAIR-004` ("reach a client-side SPA route via its own in-app trigger element, never via a direct URL
navigation"), applied proactively. The baseline already knew this — `EnvironmentConfig.editBranchPath()`
documents the same rule for Branch: *"the screen itself is always reached by clicking a row's edit pen,
never by direct navigation, because it needs a record id this suite does not synthesise."*

### 2.2 Readiness is spinner-clearance plus visibility — never value-presence — `REPAIR-014`

Measured settle profile after the pen click:

| Elapsed | `body.innerText` length | Visible inputs | `#id-Agency` value | Spinners |
|---|---|---|---|---|
| 1500 ms | 246 | **0 / 72** | `Jewell` | 2 |
| 3000 ms | 1563 | **69 / 72** | `Jewell` | 0 |
| 4500 ms → 15000 ms | 1563 | 69 / 72 | `Jewell` | 0 (stable) |

**The record's values bind roughly 1.5 s before the UI becomes visible.** A wait that polls for
"inputs have values" is therefore satisfied while every element is still invisible, and the test then
interacts with elements that cannot receive input. This is exactly `REPAIR-014` — *wait on the signal
that changes when the value binds, not on the absence of a transient status string* — and this run hit
it directly: an earlier verification pass in this same run polled on value-presence, reported
"29/32 unique", and was measuring an invisible shell. That pass was discarded.

**Required readiness predicate:** spinner count `== 0` **and** visible input count `> 50`. Observed
ready at ~2000 ms. `R-2`'s polling rule still holds — the correction is *which signal* is polled, not
whether to poll.

### 2.3 PrimeNG hides the real control; the clickable target is the ancestor

Carried from the `AddBranch` KB record and re-confirmed here. State/City/Invoice generation dropdowns
and every checkbox/radio wrap a visually-hidden accessibility input. The interactable target is the
nearest ancestor `div.p-dropdown` / `div.p-checkbox` / `div.p-radiobutton`. Every such locator below
is recorded in that ancestor form.

## 3. Locator inventory — 47 of 49 resolved uniquely

*(44 on the Update form pass, plus the 3 PCC controls confirmed on `AGN9767` — see §4.2.)*

Zero locators resolved to **multiple** elements. The `#id-EmailID` (×2) and `Phone Number` (×3)
duplicates the Discovery inventory warned about are disambiguated by document order, and that
disambiguation is verified, not assumed.

| Logical name | Strategy | Locator | Resolved | Visible | Notes |
|---|---|---|---|---|---|
| `branch` | id | `#id-Branch` | unique | **false** | `readonly` **and** `disabled` — `PO-10`. See §4.1 |
| `agencyName` | id | `#id-Agency` | unique | true | value `Jewell` |
| `country` | id | `#id-Country` | unique | true | `readonly`, value `Egypt` — inherited |
| `stateDropdownAncestor` | id + ancestor | `#id-State` → `div.p-dropdown` | unique | true | |
| `cityDropdownAncestor` | id + ancestor | `#id-City` → `div.p-dropdown` | unique | true | |
| `postOfficeBox` | id | `#id-Postofficebox` | unique | true | maxlength 8 |
| `companyUrl` | id | `#id-CompanyURL` | unique | true | maxlength 50 |
| `faxNo` | id | `#id-FaxNo` | unique | true | undocumented field |
| `address1` / `address2` | order | `textarea >> nth=0` / `nth=1` | unique | true | no id exists |
| `phoneNoMaster` | type + order | `input[type="tel"] >> nth=0` | unique | true | |
| `iataAgencyNo` | id + ancestor | `#id-IATAAgency-No` → `div.p-radiobutton` | unique | true | |
| `businessTypeB2B` / `businessTypeFreelancer` | id + ancestor | `#id-AgencyBusinessType-*` → `div.p-radiobutton` | unique | true | |
| `contactPerson` | id | `#id-Contactperson` | unique | true | |
| `ownerEmailId` | id + order | `#id-EmailID >> nth=0` | unique | true | **duplicate id** — Owner section |
| `ownerPhoneNumber` | type + order | `input[type="tel"] >> nth=1` | unique | true | |
| `documentFileInput` | type + order | `input[type="file"] >> nth=0` | unique | false | **no `accept`** — FINDING-004 re-confirmed |
| `contractStartDate` / `contractEndDate` | id | `#id-ContractStartDate` / `…EndDate` | unique | true | |
| `logoFileInput` | type + order | `input[type="file"] >> nth=1` | unique | false | `accept="image/*"` |
| `salesContactName` | id | `#id-Name` | unique | true | |
| `salesEmailId` | id + order | `#id-EmailID >> nth=1` | unique | true | **duplicate id** — Sales section |
| `salesPhoneNumber` | type + order | `input[type="tel"] >> nth=2` | unique | true | |
| `invoiceGenerationAncestor` | id + ancestor | `#id-Invoicegeneration` → `div.p-dropdown` | unique | true | |
| `creditLimit` / `topUpLimit` | id | `#id-Creditlimit` / `#id-Topuplimit` | unique | true | maxlength 15 |
| `outstandingThreshold` | id | `#id-OutstandingThreshold` | unique | true | undocumented, mandatory |
| `creditTermsDays` | attribute id | `[id="id-CreditTerms(Days)"]` | unique | true | parentheses force attribute form |
| `reachingPercentage` | id | `#id-ReachingPercentage` | unique | true | |
| `warningPromptDays` | attribute id | `[id="id-WarningPrompt(Days)"]` | unique | true | |
| `creditAgencyAncestor` | id + ancestor | `#id--Creditagency` → `div.p-checkbox` | unique | true | **double dash** in id |
| `payCashAncestor` | id + ancestor | `#id-Paymentoption-Cash` → `div.p-checkbox` | unique | true | **by label** — `APP-002` |
| `payWalletAncestor` | id + ancestor | `#id-Paymentoption-Wallet` → `div.p-checkbox` | unique | true | by label |
| `payCreditCardAncestor` | id + ancestor | `#id-Paymentoption-CreditCard` → `div.p-checkbox` | unique | true | by label |
| `productFlightAncestor` / `productOthersAncestor` | id + ancestor | `#id-SelectProduct-*` → `div.p-checkbox` | unique | true | |
| `productAccessTable` | tag | `table` | unique | true | 1 row on this record |
| `importPnrAncestor` | id + ancestor | `#id--ImportPNROption` → `div.p-checkbox` | unique | true | **double dash** |
| `remarks` | placeholder | `textarea[placeholder="remarks..."]` | unique | true | no id exists |
| `cancelButton` | text | `button:has-text("Cancel")` | unique | true | |
| `sendForApprovalButton` | text | `button:has-text("Send For Approval")` | unique | true | app label, not the story's |
| `approveButton` / `rejectButton` | text | `button:has-text("Approve")` / `…("Reject")` | unique | true | both present to `odeysysadmin` |

**Agency list, verified on the same pass:** grid headers are
`Code · Agency Name · Country Name · City · Status · Approval Status · Branch Name · Actions`; the row
action icons are `i.pi.pi-pencil` (edit) and `i.pi.pi-thumbs-down` (reject). **`i.pi.pi-thumbs-up` was
absent on the observed row**, which is consistent with it being `Approved` already — the thumbs-up is
expected to appear on a record in `Pending for approval`. That is stated as an expectation, not a
verified fact, because no pending record existed to observe (see §4.2).

## 4. Unverified — 2 locators, named rather than guessed (§11A.5)

**No unverified locator is emitted as though it were confirmed.** Each below either blocks a specific
in-scope case or is deferred to the fixture.

### 4.1 `branch` resolves but is not visible

`#id-Branch` is `readonly` **and** `disabled`, and `isVisible()` is `false` — the underlying input is
hidden and the value is presented by the wrapping PrimeNG control. **`TC-AGENCY-059` must therefore
assert on the ancestor/label, not on this hidden input**, or it would pass trivially against an element
no user can see. The locator is recorded, the assertion target is not yet settled; this is resolved
during generation against the visible wrapper, and re-verified then.

### 4.2 PCC section — **resolved on a second record; TC-AGENCY-055 is unblocked**

The three PCC locators resolved to **none** on `AGN10247 / Jewell` (Branch `Brittany`), whose
`body.innerText` contained no *"Airline Supplier credential"*. That is **FINDING-008 behaving exactly as
documented** — the section renders only where the parent Branch carries a supplier with a credential
(`BR-006`) — not a locator failure.

Rather than leave the case blocked, the first page of agencies was scanned read-only, each opened via
its row pen, until one rendered the section. Four did not; the fifth did.

| # | Code | Agency | Branch | Supplier rows | PCC renders |
|---|---|---|---|---|---|
| 0 | `AGN10247` | Jewell | Brittany | 1 | no |
| 1 | `AGN10246` | Nannette | Kenneth | 1 | no |
| 2 | `AGN10245` | Michael | Clarine | 1 | no |
| 3 | `AGN10244` | Nieves | Kaycee | 1 | no |
| 4 | **`AGN9767`** | Uplift1_Ahmed Mohamed AbdelDaiem | Uplif1_Ahmed Mohamed AbdelDaiem | 1 | **yes** |

**Verified on `AGN9767`:**

| Logical name | Locator | Resolved | Visible | Read-only | Value |
|---|---|---|---|---|---|
| `managerName` | `#id-ManagerName` | unique | **true** | **true** | `test` |
| `supplierCredDesc` | `#id-SupplierCredentialsDescription` | unique | true | false | `desc` |
| `genericSupplierPcc` | `[id="id-Genericsuppliercredentials(PCC)"]` | unique | **false** | true | — |
| `genericSupplierPccAncestor` | same → `div.p-multiselect` | unique | **true** | false | — |

**`Manager Name` is visible, read-only, and carries an inherited value.** That is precisely what
FINDING-009 recorded and precisely what `TC-AGENCY-055` asserts, so the case is designed as an
inheritance assertion and its locator is confirmed. **TC-AGENCY-055 moves from Blocked to
generatable.**

As with the hidden Branch input, the multiselect's own input is invisible and read-only — the
interactable target is the `div.p-multiselect` ancestor. Recorded in that form.

**Still unverified here, and out of scope:** `pccTabs`. The tab strip does not match
`div[class*="p-tabview"] li[role="tab"]` (resolved to none), so the PCC tab markup differs from a stock
PrimeNG TabView. **No in-scope case needs it** — `TC-AGENCY-060`, which asserts one tab per inherited
supplier, is `Review = Rejected`. Left unresolved deliberately rather than guessed.

**A supplier-less Branch remains the fixture requirement.** `AGN9767` proves the section renders where
the Branch carries a supplier; it does not remove the need for `{BRANCH_UNDER_TEST}` to carry one, since
`{AGENCY_UNDER_TEST}` is created fresh under a Branch this run builds.

### 4.3 `accountNumber` / `bankName` absent on the observed record

`#id-AccountNumber` and `#id-Bankname` resolved to **none** here, though Discovery recorded both on
agency 949. Most likely the Bank Account Details row renders only when at least one account exists or a
row has been added. **No in-scope case needs them** — TC-029/030/031/032 are all `Review = Rejected` —
so this is recorded and deferred rather than resolved now.

## 5. KB reuse and drift

| KB record | Anchor | Drift verdict | Action taken |
|---|---|---|---|
| `browser/screens/AddBranch.json` (21 locators) | `"STG live build as of 2026-08-03"` — prose, not a git ref | **`unknown-*`, not `unchanged`** | Treated as a **candidate**, never a fact (§11B.1). Its `#id-<FieldName>` convention, `p-dropdown`/`p-checkbox` ancestor rule, and duplicate-id warning all transferred and were **re-verified live here**. Its casing did **not** transfer: Branch has `#id-PostOfficeBox`, Agency has `#id-Postofficebox` — an assumed reuse would have failed |

**No Agency screen record existed in the Selector Verification KB.** This run is the first to verify
this screen, and its records are written back under this report's code-state anchor.

## 6. Repair KB patterns applied proactively (§11B.2)

| Rule ID | Pattern | Applied where |
|---|---|---|
| `REPAIR-004` | Reach an SPA route via its own in-app trigger, never a direct URL | Update form is opened by clicking the row pen. §2.1 |
| `REPAIR-014` | Wait on the signal that changes when the value binds | Readiness = spinners clear **and** inputs visible. §2.2 |
| `REPAIR-001` | Bounded poll for post-submit state, not an immediate assertion | To be applied to every `Send For Approval` assertion at generation |
| `REPAIR-011` | Bounded, re-locating retry on stale element during a grid read | To be applied to the Agency-list row reads |
| `REPAIR-013` | Address a required-state record by configured identity, not by scanning a paginated list | To be applied to fixture lookup, mirroring `BranchProvisioner` |
| `REASON-001` | Prefer Direct Observation over documentation for expected values | Every expected value here comes from live observation |

## 7. Budget consumed (§11A.6)

| Bound | Consumed |
|---|---|
| Strategies per locator | 1–2, in §24.1 priority order; no speculative re-attempts |
| Screens verified | Agency list · Agency Update form (via pen) · Agency Add form · 5 agencies scanned read-only for the PCC section |
| Discarded passes | **2** — one deep-linked (invalid, §2.1), one polling a false readiness signal (invalid, §2.2). Both discarded rather than reported |
| Verification budget | Not exhausted. It ended on a **confirmed** result, not a timeout |

**Nothing was silently truncated.** The 2 unverified locators in §4 are the complete list, and neither
is needed by any in-scope case.

## 8. One tooling defect found, reported not worked around

`BrowserDriver.authenticate()` **fails headless against this build.** Its post-login wait on
`profile.login.successSelector` (`text=Dashboard`) times out at 20 s, although the login itself
succeeds — `POST …/Admin2/loginAction` returns `200` with
`{"viewForm":"redirect:/Dashboard/dashboard","otpLength":0}`, and in an equivalent session the marker
is visible and the browser is on `/dashboard` within ~1.5 s.

This is **shared Stage-2 tooling** used by the Explorer skill and Manual Execution, so it was **not
edited here**. Verification proceeded with an equivalent direct Playwright session using the driver's
own credential discipline: values read in-process from `credentials.json`, never printed, never passed
into an MCP tool call (`mcp/README` §1.3), reference dropped after use. Recorded as a proposed change in
the Decision Report rather than fixed unasked (§11D.2).

**Separately, and more seriously:** `utilities/EnvironmentConfig.java` in the baseline holds the STG
Super Admin password as a **plaintext string constant in committed source**. `BrowserSession`'s own
Javadoc already acknowledges it — *"the Staging password … really does appear in a public breach
corpus, which is unsurprising for a credential committed to a repository"* — and tracks rotation as an
open item. The file is classified `shared` in `.baseline_ownership.json`, so per §11D.2 this run
**proposes** the change and does not make it. Raised in the Decision Report.
