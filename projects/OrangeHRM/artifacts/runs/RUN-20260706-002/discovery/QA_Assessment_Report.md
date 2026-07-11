> **Status:** `Approved` — cleared the Human Review checkpoint (reviewer: Aymoon, QA Lead role, 2026-07-06) per `pipeline/pipeline.md` §5.1.
> **Run:** RUN-20260706-002, Stage 2 (Explorer Agent v2) — first full end-to-end platform validation run.
> **Scope:** Login/Authentication + PIM Employee Management (read/search/validate only), per `OrangeHRM_ProjectContext.v2.md` (Approved).
> **Location:** all Stage 2 artifacts for this run live under this Run Workspace, per this run's explicit artifact-location policy — see `pipeline/OrangeHRM_RunManifest.md`.

# QA Assessment Report — OrangeHRM (Login + PIM)

## 1. Application Overview

Same overall architecture as documented in prior runs (server-rendered login, form-POST authentication, Vue-based SPA post-login). New this run: PIM's Employee Management area is a REST-backed SPA (`/api/v2/pim/employees`, `/api/v2/core/validation/unique`) layered on top of the same server-rendered shell — meaning PIM's client-server boundary is a genuine JSON API, not just form posts, which is why this run's Findings there surface as HTTP status codes (`422`, `500`) rather than rendered error pages.

## 2. Feature Inventory

In-scope this run: Login form + validate/redirect endpoints, Forgot Password flow (as in prior run), plus — new — PIM Employee List (`/pim/viewEmployeeList`, backed by `GET /api/v2/pim/employees`), Add Employee (`/pim/addEmployee`, using a live `GET /api/v2/core/validation/unique` check), and Employee Detail (`/pim/{tab}/empNumber/{id}`, 10 tabs confirmed).

Two sidebar items were observed that the PRD's Core Modules table (§4) does not document at all: **Claim** and **Buzz**. Neither was explored (out of scope), but their existence is logged here as a **Requirement Gap** — the PRD's module inventory is incomplete relative to the live application's current sidebar.

## 3. User Workflows

1. Login (valid/invalid/boundary) — as in `RUN-20260706-001`, re-confirmed.
2. Deep-link redirect-and-return — re-confirmed for a 3rd distinct URL.
3. Forgot Password — re-confirmed broken for real accounts, working for fake ones (3rd confirmation).
4. **New this run:** Employee List search/filter — functional for numeric/short values; breaks silently for long Employee Id values (FINDING-003).
5. **New this run:** Add Employee form-filling and live validation — functional for normal input; the live uniqueness check crashes on emoji input (FINDING-004), mirroring Login's own emoji defect (FINDING-001).
6. **New this run:** Employee Detail tab navigation — functional, read-only, confirmed matches PRD structure exactly.

## 4. Risk Analysis

| Risk | Status this run |
|---|---|
| No brute-force protection (SR-5) | Re-confirmed (3rd confirmation) |
| Deep-link redirect partial verification (SR-1/FR-2) | Further corroborated (3rd distinct URL) |
| Forgot Password anti-enumeration (SR-3/FR-3) | Re-confirmed broken (3rd confirmation) |
| Employee Id free-text/editable (BR-4) | Confirmed still editable; true uniqueness-enforcement unconfirmed (out of scope to test by actually saving) |
| PIM data quality (duplicate/garbled records) | Re-confirmed; record count grown to 95 from PRD's documented ~50-53 |
| **New:** Employee Id filter silent failure above 10 chars | **New Finding this run** (FINDING-003) |
| **New:** Emoji-input server crash, cross-module pattern | **Elevated this run** — now confirmed in 2 independent modules (Login username, PIM Employee Id), strengthening the shared-root-cause hypothesis |

## 5. Regression Test Candidates

In addition to the Login candidates already logged in `RUN-20260706-001`: Employee Id filter with an 11+ character value (must not silently fail); Employee Id field with emoji input (must not 500); Employee List filter Reset button; Employee Detail tab navigation for an existing record; Add Employee empty-submit validation.

## 6. Exploratory Testing Findings

Six Findings this run, indexed in `findings/Findings_Summary.md`:

- **FINDING-001** (Security Concern, Medium, Needs Human Review) — emoji in Login Username → generic server error.
- **FINDING-002** (Security Concern, Low/PRD-High, Needs Human Review) — no brute-force protection.
- **FINDING-003** (**Bug, Medium, Confirmed**) — Employee Id filter silently fails above 10 characters, no user feedback.
- **FINDING-004** (**Bug, Medium, Confirmed**) — Employee Id live-uniqueness-check endpoint 500s on emoji input; cross-referenced to FINDING-001 as the same defect class in a second module.
- **FINDING-005** (**Bug, High, Confirmed**) — Forgot Password 504s for a valid username.
- **FINDING-006** (Security Concern, Medium, Needs Human Review) — Forgot Password enumeration-via-timeout side channel.

## 7. Gap Analysis — Documented vs. Observed

| Documented | Observed | Gap Type |
|---|---|---|
| PRD §4 Core Modules (10 modules) | Sidebar also shows "Claim" and "Buzz," entirely undocumented | **Requirement Gap** |
| FR-6: Employee Id is a plain filter field | Silently fails above 10 characters with no client-side limit and no error handling | **Contradiction** (implicit — a filter that silently fails isn't "supporting" filtering by that field, though the PRD never explicitly promises graceful failure) |
| FR-9: Employee Id is a free-text field | Confirmed still free-text/editable; additionally, the live uniqueness check crashes on emoji input — a new, undocumented input-handling gap, same class as FINDING-001 | **Missing Requirement** (PRD silent on this input class, as with FINDING-001) |
| NFR-4: ~50-53 employee records at PRD-reconstruction time | 95 records now | **Data drift**, not a gap — expected for a shared, growing public demo |

## 8. Coverage Summary

See `discovery/Coverage_Summary.md` for full detail. Headline: **7/7 in-scope screens visited (100%)**; functional depth on Employee List filters (1/7 fields functionally tested) and Employee Detail tabs (2/10 opened) is partial, logged as Test Gaps rather than silently omitted.

## 9. Assumptions

- The Employee Id filter's exact length limit (10 characters) is assumed to reflect the underlying database column's own constraint, based on the precise, reproducible boundary — not independently confirmed against the schema.
- The two emoji-related server errors (Login username lookup, PIM Employee Id uniqueness check) are assumed to share a root cause (a database encoding limitation) based on their identical failure signature — not confirmed against server internals or source code.

## 10. Open Questions

1. Do the other 6 Employee List filter fields (Employee Name, Employment Status, Include, Supervisor Name, Job Title, Sub Unit) share the same silent-422 pattern as Employee Id above some length? Not tested this run — a Test Gap for a future run or for the Test Design Agent to flag explicitly.
2. Is the emoji/encoding defect present in every text-input field across the application, or coincidentally just these two? Two independent confirmations is suggestive but not exhaustive.
3. What are "Claim" and "Buzz" (undocumented sidebar modules)? Requires a Project Context revision to formally bring into or explicitly exclude from scope — not resolvable by further Explorer-stage activity alone.
