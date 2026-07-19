# Discovery Snapshot — Agency (Search functional verification)

**Discovery Mode:** Browser Automation (`tools/browser_driver`) · **Date:** 2026-07-13 · **URL:** `http://192.168.1.80/admin/agency` · **Role:** Admin · **Scope:** Agency module only.

## What's on this screen (confirmed, extends `Agency_List.md` from RUN-20260712-002)

- Filters: `Agency name` (`#id-Agencyname`, plain text input, no PrimeNG wrapper needed), `Agency code`
  (`#id-Agencycode`), Select Country/State/City (`p-multiselect` wrappers), Status radio
  (`Inactive`/`Active`/`Both`, each a `p-radiobutton` wrapper), "Search in grid" submit button.
- A partial-name search (e.g. `"QA_SPIKE"`) behaves as expected for **Approved** records — narrows
  correctly. Confirmed working baseline: blank-name search returns real rows (`AGN9741 EXEBA`,
  `AGN2 Test Egypt`, etc.), all `Active`/`Approved`.
- **Pending-approval records are not returned by this screen under any Status filter** — see
  FINDING-007 (this run). Not this test case's positive-path scope; a separate, documented gap.

## Reference Project reusability confirmed

`E:\Automation2\NDC-Uplift-Automation`'s `SearchAgency_Page.java` locators
(`#id-Agencyname`, `p-radiobutton[.//input[@id="id-Status-Active/Inactive/Both"]]`,
`//button[@type="submit"]`) all match this run's own live observation exactly — reused as-is (per
`agents/automation_agent.md` §9/§11, reuse before generating new) rather than re-authored from
scratch, unlike Agency's Add-form page object (which the Reference Project's own version was found
stale/empty for, RUN-20260712-002).

## Chosen test target

`EXEBA` (code `AGN9741`) — a stable, pre-existing, real Approved record observed live this run.
Chosen over the platform's own `QA_SPIKE_Agency01` records specifically because those are Pending
(per FINDING-007, not searchable this way) — this keeps TC-AGENCY-006 a clean, read-only positive
test rather than conflating it with the Pending-visibility question.
