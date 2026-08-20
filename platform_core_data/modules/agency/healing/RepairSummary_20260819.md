# Self-Healing Repair Summary — `agency` / SHAFT — 2026-08-19

| Field | Value |
|---|---|
| Module | `agency` |
| Trigger | Human invocation ("run 5H for Agency Module") |
| Input | Failed execution, 2026-08-19 06:27 UTC — `prepareSharedFixture` broken ×5, 18 skipped, 5 failures reported |
| Execution mode | Headed (operator's explicit choice at this invocation's gate) |
| Outcome | **Continued 2026-08-19/20: 7 further automation defects (REPAIR-AG-013..019) fixed and verified, one Branch reuse change applied, and 2 confirmed-application-defect test cases retired by explicit operator direction. `BUILD SUCCESS`: 16 of 16 enabled tests pass, 1 self-diagnosing skip, 0 failures — see §16, §17** |
| Runs performed this session | 8 full Maven executions of `testng-agency.xml`, plus ~10 read-only live diagnostic scripts. **Continuation: 9 further full Maven executions, plus live headless Playwright MCP reproduction/verification throughout.** |

## 1. Starting Point

The failed execution handed to this stage showed `AgencyFixture.ensureBuilt` throwing on its first
(and only) real attempt, with the wrapper message obscuring the actual cause. All 18 tests skipped as a
direct consequence of Automation Plan §5.1's single-fixture design: a fixture failure fails the whole
suite, by the operator's own instruction, rather than leaving 17 permanent partial records behind.

## 2. REPAIR-AG-001 — Checkbox click target was one DOM level too high

**Symptom:** `BranchSupplierGrid.selectRow(2)` threw "the click was accepted and had no effect."

**Root cause:** The Status checkbox locator ended at the outer `div.p-checkbox` wrapper.
`AddBranch_Page`'s own class Javadoc already documents, verified live 2026-08-05, that this exact
wrapper "is one level too high and does not toggle the checkbox" — the real target is the inner
`div.p-checkbox-box`. The generated code read the pattern (dispatch-full-mouse-events) without also
reading the correction it was paired with.

**Verified live (read-only):** dispatching the same click event sequence at the outer wrapper left
`input.checked = false`; the identical dispatch at the inner box produced `checked = true`,
`p-highlight` appearing on the box (never the wrapper).

**Fix:** `checkboxWrapper()`/`radioWrapper()` in `Agency_Common` now resolve to the inner `-box` element.

## 3. REPAIR-AG-002 — Checked-state read was structurally wrong

**Symptom:** Even after a real, working click, `isPrimeControlChecked` could return `false` for a truly
ticked control.

**Root cause:** The read checked for `p-highlight` on the outer wrapper — the same element REPAIR-AG-001
established never carries that class.

**Fix:** State is now read from the underlying input's `checked` DOM **property** (not attribute, and not
a CSS class) via `readBooleanProperty`, matching what the Branch suite itself already asserts on.

## 4. REPAIR-AG-005 — Credential Name is per-supplier, not a shared constant

**Symptom:** `selectCredentialInRow(2, "Live")` timed out waiting for an option that never appeared.

**Root cause:** `SupplierBranchProvisioner` passed `BranchTestData.credentialName()` (`"Live"`) to every
row. **Verified live: each of the first five supplier rows offers a completely different, single-option
credential list** — row 1 `Live`, row 2 `Aegean staging`, row 3 `AegeanUAE`, row 4 `AirArabiaEgypt`, row
5 three of its own. No credential name is shared across suppliers. "Live" only ever matched row 1 by
coincidence.

**Fix:** `selectCredentialInRow` now selects the preferred name if the row actually offers it, otherwise
the row's own first available option — correct because no in-scope test asserts *which* credential a
supplier carries, only that the Branch has two-or-more suppliers *with a* credential set (`BR-006`).

## 5. REPAIR-AG-006 — Branch dropdown option text includes the code

**Symptom:** `AddAgency_Page.selectBranch` timed out on `normalize-space(.) = branchName`.

**Root cause:** Verified live: the Branch dropdown (553 entries) renders each option as
`"{Branch Name} ({Branch Code})"`, e.g. `"AAAAA (BRN384)"` — never the bare name. State, City and Invoice
generation render plain text with no such suffix, which is why `selectFromDropdown` is still correct for
those.

**Fix:** `selectBranch` now matches by prefix (`starts-with(..., "{branchName} (")`) instead of an exact
string built from a code it doesn't know in advance.

## 6. REPAIR-AG-007 — Agency's Product Access grid uses a native checkbox, not PrimeNG

**Symptom:** `tickFirstSupplierRow` found "2 row(s) but no selectable supplier checkbox."

**Root cause:** Verified live: the **Agency** form's Product Access grid uses a plain
`<input type="checkbox">` with **no PrimeNG wrapper at all** — structurally different from the **Branch**
form's Product Access grid, which does wrap its Status checkbox in `div.p-checkbox > div.p-checkbox-box`.
The original locator assumed the Branch grid's structure transferred to Agency's; it does not.

**Fix:** The native checkbox is clicked and its `checked` property read directly — no wrapper indirection
needed or possible.

## 7. REPAIR-AG-008 — Exception handling missed `AssertionError`

**Symptom:** After the first real failure, every *subsequent* test's `prepareSharedFixture` threw a bare
`NullPointerException` instead of the intended "not retried" message.

**Root cause:** `AgencyFixture.ensureBuilt` caught `RuntimeException`, but `org.testng.Assert` — used
throughout `AgencyProvisioner` and `SupplierBranchProvisioner` — throws `AssertionError`, which extends
`Error`, not `Exception`. An assertion failure skipped the catch block entirely: `buildAttempted` stayed
`true` but neither `buildFailure` nor `agency` was ever set, so every later call took the
"already succeeded" branch and returned a `null` agency.

**Fix:** Catches `Throwable`, records it, and re-throws in its original form (`RuntimeException`, `Error`,
or wrapped). A defensive check was also added: if the build completes without an exception yet `agency`
is still `null`, it now fails loudly naming that as a defect in the fixture itself, rather than letting a
caller NPE.

## 8. REPAIR-AG-009 / AG-010 — Synthetic field values rejected by format validation

**Symptom:** `assertSubmissionSucceeded` reported `"Please enter a valid contact Person"`,
`"Please enter a valid name"`, and `"Please enter valid phone number"` ×3.

**Root cause, verified live:**
- Contact Person / Sales Contact Name: `"QA_Contact_" + nanoTime()` contains digits and an underscore;
  the field accepts letters and a space only.
- Phone fields: `"555" + 7 digits` was rejected specifically — `555` is the conventional
  reserved-for-fiction prefix, and this validator evidently blocks it by pattern, not just malformed
  shapes. `branch_baseline.properties`' own accepted `phoneNumber=1001234567` does not use it.

**Fix:** Contact/Sales names are now fixed, letter-only strings (uniqueness was never needed for these —
they are not looked up by value). Phone numbers keep the `branch_baseline.properties`-proven `10`-prefix
shape with a unique tail.

## 9. REPAIR-AG-011 — PrimeNG Calendar rejects scripted value assignment

**Symptom:** Contract Start/End Date appeared in `assertSubmissionSucceeded`'s empty-fields diagnostic
even though `typeVia` reported no error.

**Root cause, verified live, side by side on the identical field:**

| Method | Resulting DOM value |
|---|---|
| `typeVia` (synthetic `element.value = "..."` + dispatched `input`/`change`) | **empty** |
| Real, per-character keystrokes | `"01/01/2026"` |

PrimeNG's Calendar component keeps its own internal date model and only updates it in response to
genuine key events; a value assigned by script bypasses that model entirely, and the component clears
the input on blur rather than accepting a value it never parsed. This is a different mechanism from
`typeVia`'s own reason for existing (REPAIR-BR-013, an Angular `formControl` not registering a scripted
value) — same symptom class, different cause, different fix.

**Fix:** New `Agency_Common.typeRealKeystrokes` (Selenium `sendKeys`, real per-character events) used only
for the two Contract Date fields. `typeVia` is unchanged and still correct for every plain input.

## 10. REPAIR-AG-012 — Agency list search was never implemented

**Symptom (after all of §2–9 were fixed):** provisioning finally reached a clean `assertSubmissionSucceeded`
— navigated away from `/admin/agency/add`, zero validation messages — yet the very next step, finding the
just-created Agency to read back its code, failed across all 4 lookup attempts.

**Root cause, verified live:** the default, unfiltered `/admin/agency` view renders only **10** rows in
an order unrelated to creation time — it never surfaced any record this run created, at any point,
including minutes after creation. `SearchAgency_Page` had never implemented the name/code search filter
that demonstrably exists (`#id-Agencyname`, `#id-Agencycode`, a "Search in grid" button) — unlike
`SearchBranch_Page`, which always searches by name. This class shipped with an omission
`SearchBranch_Page` never had.

**Fix:** Added `searchByName`/`searchByCode` to `SearchAgency_Page`, and every place that reopens the
shared fixture (`AgencyTestBase.openUpdateForm`, `.agencyList()`, `AgencyProvisioner`'s post-create
lookup, `waitForApprovalStatusContaining`) now searches by the fixture's own code/name instead of scanning
the unfiltered view. **Verified the search mechanism itself works**: searching for a known, long-existing
agency ("Jewell") by name returns exactly the one matching row.

## 11. Open, Unresolved Issue — the just-created Agency still cannot be found

**This is the one defect this session did not close.** After REPAIR-AG-012, the proven, working search
mechanism was pointed at the exact name this run generated and typed — and still returns **zero rows**,
every attempt, both immediately and minutes later. Diagnostics added directly into the real execution
(`[PROVISION] lookup attempt N/4: search box holds "...", rows returned=0`) confirm the search box holds
the correct, exact string on every attempt; the query itself is not malformed.

**What is confirmed:**
- `assertSubmissionSucceeded` genuinely observes navigation away from `/admin/agency/add` to
  `/admin/agency`, with an empty validation-message set — the same signal `UpdateBranch_Page` and
  `AddBranch_Page` treat as sufficient.
- The search feature itself works correctly against an existing record.
- The unfiltered top-10 rows at failure time are the same long-standing, unrelated `Approved` agencies
  every time — never anything this run created.

**What could not be confirmed, despite four rounds of live read-only diagnosis:** whether the record is
genuinely absent server-side (the client navigated on a false-positive signal — e.g., the app redirects to
the list on any response, not only success) or is present but not reachable through this search endpoint
for a reason not yet identified (a status/visibility gate this list's UI does not expose the way Branch's
Active/Inactive filter does, or a delay this session's bounded diagnosis window did not reach).

**Why this is reported rather than guessed at further:** every hand-rolled reproduction attempted in this
session (outside the real Maven-executed suite) failed to even reach a successful submission itself, so
none could serve as a trustworthy point of comparison. Continuing to iterate against unverifiable
hypotheses would mean shipping a "fix" without the live evidence this stage's own methodology requires
(§27A/§11A of the automation-skill — verify, never assume). Self-healing's iteration budget is bounded by
design; this is the point at which further progress needs either server-side visibility this session does
not have, or a longer diagnosis window.

**Recommended next step for whoever picks this up:** capture the server's actual response to the "Send
For Approval" POST (network tab / server logs), which would settle definitively whether the record is
created and unsearchable, or never created at all.

## 13. Root Cause Found — Live Network Reproduction (Stage 5H, continued 2026-08-19)

**§11's open question is now answered.** A live, headless reproduction (Playwright MCP) of the exact
`AgencyProvisioner.createAgency` flow — same Branch, same document/logo files, same form fields —
captured the network traffic around the "Send For Approval" submission. This settles the question §11
could not: **the record is genuinely never created.** The client does not observe a false-positive
signal from an otherwise-successful save; the server itself rejects the submission.

**Captured evidence:**

| Request | Result |
|---|---|
| `POST /odeysysadmin/file/upload` (document) | `200 OK` → `{"uuid":"c7c4814e-c37b-4761-ac4b-8d2826373ee0"}` |
| `POST /odeysysadmin/file/upload` (logo) | `200 OK` → `{"uuid":"8d435279-f3e0-455f-ad4f-87435ad12a04"}` |
| `POST /odeysysadmin/Admin2/agency/` (the actual creation call, immediately after) | **`400 Bad Request`** → `{"code":400,"message":"File not found for UUID: c7c4814e-c37b-4761-ac4b-8d2826373ee0", ...}` |

The UUID the creation call says it cannot find is **the exact UUID the upload endpoint had just
returned, successfully, in the same session, seconds earlier.** The file was uploaded and acknowledged;
the very next call referencing it by that acknowledged ID could not find it.

**Human confirmation, same day:** the operator manually added an Agency through the same UI, at a
similarly fast pace (uploads to submit in a few seconds or less), and it succeeded. This rules out
"submitting quickly" as the trigger on its own — a client-side pacing rule would have failed for the
human too. Combined with this session's own retry evidence (§14: the identical automated flow passed on
some retries and failed on others), the defect reads as **non-deterministic server-side flakiness** — a
race whose outcome depends on backend state at that moment (load, replication timing, which instance
served which request), not on how fast the client moves. This *narrows* the classification; it does not
weaken it — the 400/UUID-mismatch was captured directly off the wire and is not in question.

### 13.1 Classification: `Application Failure` — reclassified, not healed

This is a genuine server-side defect in the target application — most likely a race or eventual-
consistency gap between the file-upload service and the agency-creation service (different backend
instances, a replication lag, or a missing "confirm" step between upload and reference). It is **not**
an automation defect, and per this stage's Application-Defect Prohibition (§8), it is **reported, not
repaired**. No code was changed to make this pass.

**Filed as a defect finding** for Stage 6A / a human bug report: *Add Agency Send-For-Approval
intermittently (or consistently, under this environment's load pattern) fails with `400 File not found
for UUID` for a file UUID the upload endpoint had just issued successfully in the same session.*

### 13.2 A separate, genuine Automation Failure — proposed repair

`AddAgency_Page.assertSubmissionSucceeded()` (lines 532–556) treats **navigation away from
`/admin/agency/add`, plus no visible inline validation message,** as proof the submission succeeded. It
never inspects the actual HTTP response of the submission call. In the real failing execution
(2026-08-19 10:28 AM), the suite's own log shows exactly this: `[PROVISION] submission navigated to
http://192.168.1.70/admin/agency` — logged on the *success* branch — immediately followed by four
lookup attempts that all found nothing, because nothing was ever created.

**Root Cause Confidence: High.** Directly observed via live network capture (§13, this session), not
inferred: the same 400/"File not found" failure occurs whether or not the client happens to navigate
away afterward — this session's own reproduction hit the identical server error while *not* navigating,
proving the navigation signal is decoupled from the actual save outcome.

**Proposed repair (not yet applied — pending the Batch Repair Approval gate):** `assertSubmissionSucceeded`
inspects the actual network response of the submission call (status code, or the JSON `code`/`message`
on failure) instead of relying on navigation alone. This does not touch what any test *asserts as
correct* (§8.1) — it only makes the existing "did the save succeed" check observe the real signal
instead of a proxy that this application's Add Agency flow has shown can mislead it. Effect: a future
run fails **immediately and legibly** at submission with the server's own message, instead of cascading
into five confusing "Agency not found" fixture failures three lookups later.

## 14. Targeted Rerun (2026-08-19, continued) — Before/After

The REPAIR-AG-013 fix (§13.2) was applied and the full `testng-agency.xml` suite rerun, Headed, per the
gate. **Mode:** Headed (operator's explicit choice at this rerun's gate).

| | Before (10:29 AM run) | After (12:53 PM rerun, post-repair) |
|---|---|---|
| Tests | 67 | 67 |
| Failures | 5 | 5 |
| Skipped | 62 | 62 |
| Failure message | Generic "no Agency found after 4 lookup attempts" | **`AgencyInheritanceAndReadOnly_TC`'s failure now names REPAIR-AG-013 directly: "the Add Agency form navigated to the list, but no record ... exists immediately afterward ... This is an application defect, not an automation defect."** |
| Time to first clear signal | ~60s (4 lookup attempts) | ~7s (one immediate check) |

**Fixed: 0. Remaining Failures: 5 (all 18 tests, same as before). New Failures: 0.** This is reported
plainly, not summarized as a win: the *detection* is repaired — a future run now fails fast with the
real cause instead of a misleading one — but **zero tests newly pass**, because the underlying
Application Failure (§13.1) is real and still present. Maven's own flaky-test rerun mechanism retried
`prepareSharedFixture` several times per class during this run and it intermittently reported `PASS` on
individual retries (visible in the console log), consistent with §13.1's race-condition hypothesis — but
the authoritative `surefire-reports/TEST-TestSuite.xml` end state is unchanged: all 18 `@Test` methods
remain `SKIPPED`, because TestNG skips a class's tests once its `@BeforeClass` has failed once, regardless
of a later retry succeeding. **Nothing here is written to the Repair KB** (§10.2) — no test moved to
Fixed.

**Confirms §13.1's race-condition hypothesis further:** the same defect intermittently *doesn't* occur
(the retry passes), which is exactly the signature of a server-side timing/consistency bug, not a
deterministic one — strengthening rather than weakening the Application Failure classification.

## 15. Approval Status

The repaired suite (`AddAgency_Page.assertSubmissionSucceeded`, `AgencyProvisioner`) is
**`Pending Automation Approval`** per §15 — Stage 4A's original approval does not cover it. It may not
merge to any baseline or project into a Target Project until that clears.

## 16. Continuation (2026-08-20) — pushback, deeper diagnosis, five more automation defects found

**Trigger.** The operator manually created an Agency through the UI and it worked, then reran the SHAFT
suite and it failed again — and pushed back explicitly that this reads as an automation defect, not a
backend one. That challenge is what reopened this pass rather than resting on §13's conclusion.

### 16.1 The §13 finding stands, refined

A second live reproduction (headless Playwright MCP, identical flow) reproduced the exact same `400
"File not found for UUID"` signature independently, including after a deliberate **15-second** wait
between the file uploads finishing and submitting — ruling out "the client moved too fast" as the
trigger, since no client-side wait could plausibly be needed for 15 seconds. The operator's own manual
submission, at a similarly fast pace, succeeded. Both facts together point at **non-deterministic
server-side flakiness** (backend state at that moment, not client timing) rather than a fixed,
reproducible break — which is also consistent with Maven's flaky-test reruns in §14 sometimes passing
the identical flow. §13.1's classification (`Application Failure`, not healed) stands, refined rather
than reversed.

### 16.2 Five more automation defects, found by pushing past §13 rather than stopping at it

Continuing to investigate surfaced five further, genuine automation defects — each confirmed live before
being fixed, each verified by a full suite rerun after:

| ID | Symptom | Root cause | Fix |
|---|---|---|---|
| **REPAIR-AG-014** | A `204`-successful creation was still unfindable by name/code search | `SearchAgency_Page`'s search never touched the grid's Status filter (defaults to `Active`); a just-created Agency is not yet `Active` | `searchByName`/`searchByCode` now select `Both` first, mirroring `SearchBranch_Page`'s own established pattern |
| **REPAIR-AG-015** | Every downstream test timed out reopening the fixture Agency | The fixture was left `Pending for approval` forever — `AgencyProvisioner` never approved its own creation, and approving raises a mandatory Remarks dialog neither `clickThumbsUp` nor the provisioner ever handled | `SearchAgency_Page` gained `remarksPromptShown()`/`completeRemarksPrompt(...)` (ported from `SearchBranch_Page`'s proven version); `AgencyProvisioner` now approves the creation and waits for "Approved" before returning |
| **REPAIR-AG-016** | `openUpdateForm()` timed out even for an *Approved* fixture | `Agency_Common.MIN_VISIBLE_INPUTS` (50) was calibrated 2026-08-18 against a richly-populated Agency (69 visible); this suite's own minimally-populated fixture genuinely, stably settles at 25 | Recalibrated to 20 — comfortably above the empty-shell figure (0), comfortably below the lowest real-render figure now measured (25) |
| **REPAIR-AG-017** | Every persistence test read back the *pre-edit* value after submitting a change | `UpdateAgency_Page.clickSendForApproval()` clicked with **no confirmation of any kind** — the same class of gap `AddAgency_Page` had before REPAIR-AG-013 — so the caller's reopen raced the submission | Added a bounded wait for *either* navigation away (success) or a validation message appearing (blocked) — **never a hard assertion**, since a first version of this fix wrongly broke TC-AGENCY-023/037, which deliberately submit invalid data expecting the submission to be blocked. Confirmed live: the submission itself is real (a `204` on the update `PUT`), only the wait was missing |
| **REPAIR-AG-018** | Two independent-looking failures, one root cause each, both fixed together | (a) `UPLOADED_FILE_NAMES` was one of five *disclosed, never-verified* guessed selectors, none of which exist on this form — the real element, confirmed live, is `ndc-fg-file-input .file p.name`. (b) `typeRealKeystrokes`'s `WebElement.clear()` is not a real keystroke on this Calendar component — live A/B: clearing via genuine `Ctrl+A`+`Delete` made the "Required" message appear; the prior `clear()`-based version did not, for the identical field | Locator corrected to the verified element; clearing now uses real `Ctrl+A` + `Delete` key events instead of `clear()` |

Each fix was applied singly and verified by a full `mvn test -Dsurefire.suiteXmlFiles=testng-agency.xml`
rerun before the next was attempted — never batched blind. Progression: **0/18 → 8/18 → 11/18 → 14/18 →
16/18** tests passing across five successive reruns.

### 16.3 Before/After — this continuation

| | Before (§14, post-AG-013 only) | After (post AG-014..018) |
|---|---|---|
| Tests executed of 18 | 0 (all skipped, fixture never built) | 18 |
| Passing | 0 | **16** |
| Failing | 0 (skipped, not failed) | 2 — both genuine, both below |
| Fixed | — | 16 tests, across `AgencyDocumentsAndLogo_TC`, `AgencyInheritanceAndReadOnly_TC`, `AgencyMakerChecker_TC`, `AgencyUpdatePersistence_TC`, `AgencyUpdateValidation_TC` |
| New Failures | — | 0 |

**Labelled `Automation Repaired`, not `Passed`** per §13's own rule: every one of these 16 required a
fix in this pass before it could run at all, let alone pass.

### 16.4 The two remaining failures — genuine Application Failures, correctly left unhealed

| Test | Finding | Classification |
|---|---|---|
| `tc020_fakePdfExtensionIsRejected` | A file named `.pdf` whose content is plain text with no `%PDF` header is accepted with no validation message. The test's own assertion states this explicitly: *"THIS ASSERTION MUST NOT BE WEAKENED to make the suite pass... its failure is the finding it exists to produce."* | `Application Failure` — document content is not validated against its declared type (AC-3 gap) |
| `tc049_rejectPendingUpdateWithReason` | Rejecting a pending update correctly transitions Approval Status to "Rejected" (confirmed via the test's own REPAIR-001-style bounded wait) but the field's *value* still reads the submitted-for-rejection value, not the pre-submission one, when reopened | `Application Failure` — a rejection does not roll back the value it was rejecting, undermining the maker-checker guarantee the test exists to confirm |

Neither was repaired, per §8: an application defect is reported, never patched to stop failing. Both are
filed as findings below for Stage 6A / the application's owners.

### 16.5a Continuation (2026-08-20, later) — reuse one Branch instead of creating one per execution

**Operator instruction:** every execution so far had built its own new Branch (PO-14). The operator
observed several Branches now exist on STG from these runs and directed that the suite settle on one
already-created, already-working one instead of creating another every time.

`SupplierBranchProvisioner.getOrCreateApprovedBranchWithSuppliers` was added: it searches for the
Branch named in `agency_baseline.properties` (`knownApprovedBranchCode` / `knownApprovedBranchName` /
`knownApprovedBranchSuppliers`), confirms it is still that exact Branch and still `Approved`, and reuses
it **read-only** — never creating, editing, or re-approving it. `AgencyFixture` now calls this instead of
`createApprovedBranchWithSuppliers`; the latter remains available as the fallback when no known Branch is
configured, and is used automatically if the configured one is ever removed, renamed, or deactivated.

Configured: `BRN908` / `QA_694969440098400`, suppliers `[3O, AegeanNdc]` — live-verified `Approved`,
created by an earlier run of this same suite.

**REPAIR-AG-019, found during this change's own verification rerun:** `selectStatusBoth()` (REPAIR-AG-014)
clicked the Status-Both radio with no wait for its presence, and failed once, live, with a
`NoSuchElementException` rather than a timeout — the search filter panel was not yet rendered the instant
`agencyList()` reached it. Fixed with a bounded presence wait before the click. Confirmed by rerun: the
suite is back to 16/18 passing, and the fixture log now reads `[PROVISION] reusing known approved Branch
BRN908 ("QA_694969440098400") ... -- no new Branch created` — no new Branch was created by this run.

### 16.5 Findings to file (not automation's to fix)

1. **Add Agency: intermittent `400 "File not found for UUID"`** on the creation POST, immediately after
   the upload endpoint issued that exact UUID successfully in the same session. Non-deterministic — not
   tied to client submission speed (§16.1). Likely a race/replication gap between the file-upload service
   and the agency-creation service.
2. **Update Agency: document content-type is not validated.** A `.pdf`-named file with plain-text content
   and no `%PDF` header is accepted silently (TC-AGENCY-020, AC-3).
3. **Update Agency: rejecting a pending update does not revert the field value.** Approval Status
   correctly becomes "Rejected," but the previously-submitted (would-be-rejected) value remains in place
   rather than the pre-submission value (TC-AGENCY-049).

## 17. Operator ruling on the two remaining findings (2026-08-20) — retired, not fixed

The operator reviewed both remaining findings (§16.5, items 2 and 3) directly and ruled: **both are
confirmed, intended system behaviour, not defects.** This is the human resolution the self-healing
skill's own §8.3 exists to defer to — an automation-vs-requirement disagreement is disclosed, never
silently resolved by this stage, and here the disagreement has been resolved by the person with the
authority to do so.

**Action taken:** both test methods were disabled (`@Test(..., enabled = false)`), not deleted and not
weakened — the original assertions, and the reasoning that produced them, remain in the code verbatim
inside a Javadoc block explaining exactly why they no longer run. This preserves the finding's history
without a permanently-red suite asserting a requirement the operator has confirmed does not hold.

| Test | Disabled because |
|---|---|
| `tc020_fakePdfExtensionIsRejected` | Confirmed: document content is not validated against its declared file type, by design |
| `tc049_rejectPendingUpdateWithReason` | Confirmed: rejecting a pending update does not revert the field's value, by design |

**Stage 3 follow-up, not yet done.** `TestCases_Agency.md` still documents the original (now-overridden)
expected results for TC-AGENCY-020 and TC-AGENCY-049. This automation change corrects the automation
only — Stage 3 artifacts are outside this stage's write access (§17 tool list; self-healing-skill §17) —
and should be updated separately so the Manual Test Suite and the automation do not silently disagree
about what these two cases now assert.

### 17.1 Final state

```
mvn test -Dsurefire.suiteXmlFiles=testng-agency.xml
Tests run: 16, Failures: 0, Errors: 0, Skipped: 1
BUILD SUCCESS
```

The 1 skip (`tc055_managerNameIsInheritedAndReadOnly`) is a pre-existing, self-diagnosing "blocked
precondition" check unrelated to anything in this pass — the Airline Supplier credentials (PCC) section
did not render for this run's reused Branch/Agency pair, and the test says so by name rather than failing
misleadingly (FINDING-008). Worth a look if it recurs, but it is not a failure and not new.

## 12. State After This Session

| | |
|---|---|
| `mvn -o clean test-compile` | Clean |
| `AgencyFixture` build | Succeeds reliably as of REPAIR-AG-014/015/016 |
| Tests executed | **16 of 18 pass.** 2 fail on genuine, confirmed application defects (§16.4) |
| Records left on STG | Every submission across both sessions' diagnosis and reruns may have created a permanent record. Not cleaned up — `PO-3` gives this environment no DELETE |
| Module state | Unchanged: `Generated`. Not reset to `Healed` — 2 tests still fail, correctly, on real application defects that are not automation's to fix |
| Recommended next step | File the three findings in §16.5 for the application's owners. Once those are addressed, rerun `testng-agency.xml` — nothing further is expected to block it |

Evidence for every repair above — live diagnostic scripts, JSON captures, screenshots, and all run
logs — is under `platform_core_data/modules/agency/healing/evidence_20260819/`.
