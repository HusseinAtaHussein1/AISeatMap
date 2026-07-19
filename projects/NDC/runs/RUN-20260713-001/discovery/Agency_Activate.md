# Discovery Snapshot — Agency (Activate/Approval flow)

> **Correction (2026-07-13, same day):** everything below this snapshot's "What was found"/
> "Conclusion" sections was invalidated by an environment mismatch, not a real List-screen
> limitation. `QA_SPIKE_Agency01` was created by the SHAFT/Java suite, which logs in via
> `LogIn_Page.java`'s hardcoded `NDC_LOGIN_URL = http://192.168.1.70/auth/login` — **`.70`, not
> `.80`**. This pass's `tools/browser_driver` searches all ran against `.80` (its
> `credentials.json` STG entry's `baseUrl`), a different host/dataset than where the record
> actually lives. The "no Pending records visible" conclusion below is retracted — it was never a
> real finding, just a search against the wrong environment. See `Agency_Search.md` (this run) for
> the corrected search, run against `.70` via the already-authenticated SHAFT session that created
> the record.

**Discovery Mode:** Browser Automation (`tools/browser_driver`) · **Date:** 2026-07-13 · **URL:** `http://192.168.1.80/admin/agency` · **Role:** Admin · **Scope:** Agency module only, per explicit user instruction not to navigate into other modules mid-session.

## What was attempted

`QA_SPIKE_Agency01` (created live this run's Repair Round 2, TC-AGENCY-001, confirmed submitted to
"Send For Approval") was searched for on the Agency List/Search screen to locate whatever
Activate/Approve action exists for it, mirroring Branch's own in-grid `Btn_ThumbUp`/`Btn_ThumbDown`
Actions-column pattern.

## What was found

- Searching `Agency name = "QA_SPIKE_Agency01"`, Status = Both → **"No data has been found!"**
- Searching a broader partial `Agency name = "QA_SPIKE"`, Status = Both → still **"No data has been
  found!"**
- A baseline search (default Status, blank name) confirms the grid mechanism itself works —
  returns real rows (`AGN9741 EXEBA`, `AGN2 Test Egypt`, etc.) — but **every visible row's Approval
  Status is `Approved`**; no `Pending` row was observed anywhere in this pass.

## Conclusion

**The Agency List/Search screen does not appear to surface Pending-approval records at all** — its
Status filter (Inactive/Active/Both) appears to be a different axis than Approval Status
(Pending/Approved/Rejected), and a record that hasn't cleared approval yet is not visible/searchable
here under any combination tried. This directly blocks locating an in-grid Activate/Approve action
for Agency the way Branch's `Btn_ThumbUp`/`Btn_ThumbDown` icons were found for Branch.

One sibling menu entry, "Registration Requests" (nested under the same left-nav Agency group), was
briefly checked before this constraint was given — it is a **different, external self-service Agency
application queue** (Contact Name/Email/Number, Status New/In progress/Rejected, 85 real records),
not a match for `QA_SPIKE_Agency01` — it does not appear to be where an internally-created,
`Send For Approval`-submitted Agency record's activation happens either.

## Status: Blocked — needs human input

Where the actual Activate/Approve action for an internally-created, Pending Agency record lives was
**not located** within the Agency module's own List/Search screen. Possibilities not yet ruled out
(each would require navigating outside strict "Agency screen" scope to confirm, which this pass
deliberately did not do): a distinct Approval Status filter/toggle this platform hasn't found yet on
the same List screen; a role-permission gap (the test Admin user may not have the specific approval
permission); or an entirely separate "Approvals" screen elsewhere in Admin.

**Recommendation:** Ask the human where Agency approval/activation actually happens in the live
application (screen name/path), rather than this platform continuing to guess by browsing screens
outside the originally agreed scope.

## Re-confirmed on the correct environment (2026-07-13, same day)

FINDING-001 was resolved the same day: `.80` (not `.70`) is the actual STG environment. The Agency
Repair Round 2 suite was re-run against corrected `.80` login and created a **new**
`QA_SPIKE_Agency01` record there. Repeating the exact same search (`Agency name` contains
`"QA_SPIKE"`, Status = Both) against `.80` — the same environment this new record was created in —
still returned **"No data has been found!"**, while a baseline blank-name search on the same `.80`
session returned real `Approved` records normally. This rules out the earlier environment-mismatch
explanation entirely: **the conclusion stands, now on the correct host** — Pending-approval Agency
records are genuinely not visible/searchable via the Agency List/Search screen under any
Inactive/Active/Both combination tried.

**Status stays Blocked — needs human input** on where Agency activation/approval actually happens,
per the Recommendation above. This platform will not guess further by navigating outside the Agency
module's own screens.
