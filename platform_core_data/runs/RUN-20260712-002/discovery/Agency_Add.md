# Discovery Snapshot — Agency (Add screen)

**Discovery Mode:** Browser Automation · **Date:** 2026-07-12 · **URL:** `http://192.168.1.80/admin/agency/add` · **Role:** Admin · **Evidence:** `agency_add.png`

## Field set observed

| Section | Fields |
|---|---|
| Core | Branch* (dropdown — confirms Agency is created under a specific Branch), Agency*, Country* (auto-filled/disabled), State*, City*, Post Office Box*, Company URL, Fax No, Address 1*, Address 2, Phone No* |
| Classification | IATA Agency (Yes/No radio), Agency Business Type (B2B / Freelancer radio, default B2B) |
| Agency Owner Details | Contact person*, Email ID*, Phone Number* |
| Documents | Upload Document* (contract), Contract Start Date*, Contract End Date*, Agency Logo upload |
| Wonder Travel Sales Contact | Name*, Email ID*, Phone Number* |
| Bank Account Details | Account Number, Account Type, Bank name |
| Payment Settings | Invoice Generation*, Credit Limit*, Top-Up Limit*, Target + Month/Year, Credit Terms (Days)*, Reaching Percentage, Warning Prompt (Days), Credit Agency (checkbox), Payment Option* (same ~26-option checkbox set as Branch — Cash/Wallet/Credit Card + dynamic gateways) |
| Product Access | Select Product: Flight, Others · Enable Search Limit (checked by default, with a "Search Limit Category: A" indicator) · Import PNR Option · Transfer PNR Option |

Buttons: **Cancel**, **Send For Approval** (submit — see FINDING-002, same approval-gated pattern as Branch).

## Confirmed vs. Project Context

- Confirms Agency is subordinate to Branch (required Branch dropdown on Add) — consistent with `architecture.md`'s Company → Branch → Agency → Staff chain.
- The Payment Option set is **structurally identical** to Branch's (same option labels/order) — both appear driven by the same Master-data table, not independently configured per module. Worth a Test Design note: a single Master-data fixture change affects both forms' Payment Option coverage.
- §6 Q4 (uniqueness) — not tested this run (no form submitted).

## Notes

- This form is considerably richer than Branch's (bank details, sales-contact, document upload, contract dates) — Agency creation is the heavier of the two workflows.
