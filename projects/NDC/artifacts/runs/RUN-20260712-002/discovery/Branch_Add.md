# Discovery Snapshot — Branch (Add screen)

**Discovery Mode:** Browser Automation · **Date:** 2026-07-12 · **URL:** `http://192.168.1.80/admin/branch/add` · **Role:** Admin · **Evidence:** `branch_add.png`

## Field set observed

| Section | Fields |
|---|---|
| Location | Operating Country*, Name*, Country, State, City, Post Office Box |
| Contact | Phone Number, Service Tax Number, ABTA Number, Email ID, Email Password |
| Financial | Credit Limit, Top-Up Limit, Credit Terms (Days), Reaching Percentage, Warning Prompt (Days), Target Amount + Set Month/Year |
| Payment Options | ~26 checkboxes — Cash, Wallet, Credit Card, and a long tail of dynamically-named payment-gateway options (Master-data-driven; not itemized individually — see Coverage_Summary) |
| Product Access | Flight, Others (checkboxes) |
| Supplier Routing | A dynamically-generated block of checkbox + dropdown + description rows, one per configured supplier (observed ~30 rows this run — count will vary with Master data, not itemized individually) |
| Misc | "Import PNR" checkbox |

Buttons: **Add** (adds a sub-block, e.g. another supplier row — distinct from the form's own submit), **Cancel**, **Send For Approval** (the form's actual submit — see FINDING-002).

## Confirmed vs. Project Context

- §6 Q1 (exact field set) — **confirmed**: field set is far larger than a simple "name + location" form; it bundles financial/payment/supplier configuration directly into Branch creation.
- §6 Q2 (parent-child delete dependency) — **not tested this run** (Test Gap — no delete was attempted; see Coverage_Summary).
- §6 Q4 (uniqueness) — **not tested this run** (Test Gap — no Add form was submitted; Discovery observed structure only, did not create data).

## Notes

- No field observed carries a visible `required` HTML attribute except via the red-asterisk convention shown visually in the screenshot (`Operating Country *`, `Name *`, etc.) — actual server-side validation behavior is unconfirmed (Open Question).
- Submitting this form does **not** immediately activate the Branch — see FINDING-002 (Requirement Gap: approval workflow).
