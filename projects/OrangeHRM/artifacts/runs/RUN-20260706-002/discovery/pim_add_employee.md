# Discovery Snapshot — PIM Add Employee

- **Run:** RUN-20260706-002
- **URL:** https://opensource-demo.orangehrmlive.com/web/index.php/pim/addEmployee
- **Timestamp:** 2026-07-06T14:37Z–14:40Z

## Structure

Matches PRD FR-9 exactly: photo upload (stated constraint: "Accepts jpg, .png, .gif up to 1MB. Recommended dimensions: 200px X 200px"), Employee Full Name (First*/Middle/Last*), Employee Id (pre-filled `0390`, editable), "Create Login Details" checkbox, Cancel/Save. Raw snapshot: `pim_add_employee_raw_snapshot.md`. Screenshot: `screenshots/pim_add_employee_initial.png`.

**Per Project Context §5 Environment Constraints, the form was never submitted to completion in this run** — every test below used an empty Full Name specifically so that clicking Save could never persist a real employee record, regardless of what was entered in Employee Id.

## Validation testing (VR-1)

Empty-form Save click → `Required` messages shown for First/Last Name, form does not submit. Screenshot: `screenshots/pim_add_employee_empty_submit.png`. VR-1 confirmed holding.

## Employee Id boundary sweep — surfaced FINDING-004

| Value | Result |
|---|---|
| `0390` (default) | Normal |
| 40-digit numeric string | Normal (`200` on the live uniqueness check) |
| Emoji + long string | **HTTP 500** on the uniqueness-check endpoint — see `findings/FINDING-004_EmployeeIdEmojiServerError/metadata.md` |
| Single emoji character alone | **HTTP 500** — isolates the cause to the emoji itself, not length |

This Finding is structurally near-identical to `FINDING-001` (Login Username field) — see its Investigation Notes for the cross-reference and shared root-cause hypothesis.

## Create Login Details / Photo Upload

Not exercised this run (would require either completing the form, which is out of scope, or uploading a real file for a field that only matters once an employee exists) — logged as a Test Gap in the Coverage Summary, not a resolved observation.

## Console

Baseline 0 errors on initial load; errors only appeared during the deliberate emoji boundary probes (see FINDING-004) — consistent with Carried-Forward Observation #8 holding for all other input.
