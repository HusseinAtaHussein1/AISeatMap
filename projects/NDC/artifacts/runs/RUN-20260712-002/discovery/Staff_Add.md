# Discovery Snapshot — Staff (Add screen)

**Discovery Mode:** Browser Automation · **Date:** 2026-07-12 · **URL:** `http://192.168.1.80/admin/staff/add` · **Role:** Admin · **Evidence:** `staff_add.png`

## Field set observed

| Field | Notes |
|---|---|
| User type* | dropdown |
| Operating country* | dropdown |
| Branch* | dropdown |
| Department* | dropdown |
| Role* | dropdown |
| Employee name* | text |
| Employee email* | text |
| Employee phone number* | tel, `+20` prefix |
| Secondary phone number | tel, optional |
| Username* | text |
| Approver List* | dropdown |
| Import PNR option | checkbox, optional |
| Option to undercut | Yes/No radio, default **No** |

Buttons: **Cancel**, **Send for Approval** (submit — same approval-gated pattern as Branch/Agency).

## Confirmed vs. Project Context

- Confirms Staff is created under Operating Country + Branch (both required dropdowns) — Department and Role suggest a distinct internal-staff model, separate from Agency's own "Agency Owner"/"Sales Contact" fields.
- Much smaller/simpler form than Branch or Agency — no financial/payment configuration section.
- §6 Q5 — this form's required Branch (not Agency) field reinforces the List screen's suggestion that Staff is Branch-scoped, not Agency-scoped.

## Notes

- Notably simpler than Branch/Agency Add forms — consistent with Staff being an internal-user record rather than an organizational entity with its own financial configuration.
