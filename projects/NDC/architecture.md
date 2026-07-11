# NDC — Application Architecture

This describes the architecture of **NDC itself, the application under test** — not the Agentic AI Testing Platform's own architecture (for that, see the repo root `agents/`, `pipeline/pipeline.md`, and `pipeline/run_manager.md`).

## What NDC Admin Portal is

NDC Admin Portal ("National Distribution Channel") is a web-based system for travel agencies and administrators to manage configurations, business rules, bookings, reports, and system operations. It is used by three broad user classes: **Admins**, **Agencies**, and **Agents**.

Source: architecture overview infographic provided 2026-07-10 (see `resources/diagrams/`), plus live screenshots of the running Admin Portal (`http://192.168.1.70`, logged in as `E.Saady`) captured the same day. The infographic-derived sections below (Business Flow, System Architecture, Cross-Module Data Model, Access Control, Technology Stack) are still provisional until cross-checked with `projects/NDC/PRD.md`. The Navigation Model, by contrast, is now based on direct observation of the live portal, not the infographic — see the note at the end of that section.

## Business Flow (end-to-end)

`Configure` (setup system, suppliers, rules, users) → `Manage` (agencies, agents, traveller profiles) → `Search` (flights from multiple suppliers) → `Book` (create booking, apply rules, add ancillaries) → `Issue Ticket` (via NDC integration) → `Analyze` (reports & analytics).

## Navigation Model

The top nav bar (Admin session, confirmed live 2026-07-10) is: **Dashboard · Admin · Master · Rule Engine · Settings · User Management · Booking-Mid Office · Profile · Reports · PNR Query · Transfer PNR · Import PNR · Import Booked PNR**. Full breakdown by module and observed sidebar sub-items:

| Module | Sub-items observed | Purpose |
|---|---|---|
| Admin | Company (Operating Country, Branch), Agency (Agency, Search Login Details, Registration Requests, Category Management, Agency Assignation), Staff | Organization structure — Company → Branch → Agency → Staff |
| Master | Flight (Airline, Airport, Prefer Airline, BSP Commission, Deal Code), Supplier (Supplier, Credential Field, Supplier Credentials, Credential Routes Filter, Flight Search Limitation), Miscellaneous (Region, Currency, Rate of Exchange, Credential Rate of Exchange), Payment Gateway (Payment Method) | Master/reference data (airlines, suppliers, currencies, payment methods) |
| Rule Engine | Markup, Discount, Service Charge, Cancellation Charge, Fare Rule Master, Offer Pricing, Terms And Conditions | Pricing rule chain applied to bookings |
| Settings | Suppliers (supplier name + supplier list), Admin Settings (system feature-flag/config table — see below) | System-wide configuration |
| User Management | Agency User Information → Agent Information, Travellers Details | Search/manage agents and traveller profiles by agency |
| Booking-Mid Office | Booking (Flight Search), Search Booking, My Quotes, Manual Booking Invoice, Blue Command Screen | Flight search, booking creation, quotations |
| Profile | Traveller (search/add traveller profiles by branch/client ID/name/email/phone/country/status) | Traveller profile management (distinct from User Management's Traveller Details — likely the same underlying data surfaced in two places; not yet confirmed whether these are the same view or diverge) |
| Reports | Total Due Report, Agency Wallet Report, Sales Report, Sync. PNR Report, Booking Report, Quotation Report, Finance Report, Statement Report, Released PNR Report, AR Ledger Report, Wallet History Report, Daily Sales Report, Import PNR Report, Transfer PNR Report | Business & financial analytics, each with a "Send A Report" action |
| PNR Query | Search by PNR Code / Ticket No. / Booking Ref., toggle Itinerary Details vs. Agency Information | Look up existing bookings across suppliers |
| Transfer PNR | Send PNR to a Target Agency; separately, search previously transferred PNRs | Move a booked PNR's ownership between agencies |
| Import PNR | PNR Code, Branch, Agency, Agent, Supplier, Supplier Credential, with Auto ticketing / Manual ticketing status toggle | Import a PNR from a supplier into the portal |
| Import Booked PNR | PNR Code, Supplier, Supplier Credential, Branch (all required), Agency, Agent — no ticketing-status toggle | Import an already-booked PNR from a supplier |

**Admin Settings key/value table observed** (`Settings → Admin Settings`, also directly queryable as `TT_TS_SETTINGS`): `Up-Selling`, `OTP_STATUS`, `OTP_LENGTH`, `OTP_VALIDATION_TIME`, `FINGERPRINT_VALIDATION_TIME`, `OTP_ADMIN_STATUS`, `PAX_EMAIL_ENTRY_STATUS`, `FILTER_BY_CABIN_ALLOWED`, `CAPTCHA_STATUS`, `MAX_SUPPLIER_RESULTS` (plus `Connection_Timeout` / `Read_Timeout` dropdown-choice rows visible only via direct SQL, not yet seen in the Admin Settings UI itself — worth confirming whether the UI exposes them too).

This table supersedes the infographic-derived module list previously here (Administration / Reference Data / Rule Engine / Configuration / Identity & Profile / Booking Operations / Reporting / Import-Export Operations) — that grouping was directionally right but the real module names, and the split of Master into Flight/Supplier/Miscellaneous/Payment Gateway, only became clear from the live screenshots.

## System Architecture (high level)

- **Users** — Admin, Agency, Agent — interact with the NDC Admin Portal.
- **NDC Admin Portal** (Java, Spring Boot) — Web UI (Thymeleaf / React), REST APIs, Business Services, Validation Engine, Authorization (Spring Security), Workflow Engine, Notification Service.
- **Integration Layer** (.NET) — Supplier Adapter housing the NDC API Client, Payment Adapter, Email/SMS Adapter, and Supplier Adapter; bridges the Portal to external systems.
- **External Systems** — Suppliers (Airlines), NDC Core, Payment Gateway, Email/SMS Service, other 3rd-party APIs.
- **Database** (Oracle / SQL Server) — Operational Data, Master Data, Transactions, Audit, Logs.

## Cross-Module Data Model

Module relationship chain (organizational → transactional):

`Company → Branch → Agency → Agent → Traveller → Booking → Reports`

Each booking additionally depends on: `Airline → Supplier → Credential → Markup/Rules → Currency → Payment Gateway`.

Reference Data dependency chain: `Region → Country → Currency → Operating Country → Branch → Agency`.

Sub-flows referencing this shared data:
- **Flight Management Flow:** Airline → Supplier → Supplier Credential → Credential Routes, then Search Flight → Availability → Book Flight → Final Fare.
- **Rule Engine Flow:** Markup → Discount → Service Charge → Cancellation Charge → Offer Pricing → Final Fare.
- **Reporting Flow:** Source Data → Process & Aggregate → Reports & Dashboards (Sales, Finance, Bookings, Wallet, Statements).

## Access Control

Role-based access control with three primary roles (Admin, Agency, Agent) per the diagram; JWT authentication and data encryption are called out as standing security controls. Exact permission boundaries per role, auth flow specifics, and step-up auth for sensitive actions are **not yet documented** — needs confirmation via PRD or exploration.

## Technology Stack (reference)

| Layer | Stack |
|---|---|
| Application | Java 17, Spring Boot, Spring Security, Spring Data JPA, Hibernate, RESTful APIs |
| Database | Oracle / SQL Server, per infographic — **conflicts with observation:** a screenshot shows a MySQL-Workbench-style tool querying a schema literally named `wonderdb` (`SELECT * FROM wonderdb.TT_TS_SETTINGS`). Do not assume either source is correct; confirm the actual DB engine before it matters for test design. |
| Integration layer | .NET — NDC API Client, Supplier Adapters, Payment Adapter, Email/SMS Adapter |
| Deployment | Docker, Linux Server, Nginx, CI/CD Pipeline |
| Security | Role-Based Access, JWT Authentication, Data Encryption, Audit Logs |
| External integrations | Suppliers (Airlines), NDC Core, Payment Gateway, Email/SMS Service, other 3rd-party APIs |

## Known Structural Risks

<!-- Standing properties of the application/environment relevant to any future exploration or test design. -->
- Booking/pricing correctness depends on a long dependency chain (Reference Data → Rule Engine → Booking → Reporting) — errors introduced upstream (e.g. wrong currency/country reference data) can silently propagate into final fares and reports.
- The .NET integration layer is a distinct trust/technology boundary between the Java portal and external suppliers — failure modes there (adapter errors, supplier timeouts) may not surface clearly in the Java-side UI.
- Import/Export of PNRs from suppliers is a data-integrity-sensitive path not yet detailed here.
- Profile → Traveller and User Management → Travellers Details appear to be two separate UI entry points into what may be the same traveller data — not yet confirmed whether they diverge (e.g., different filter scopes, different underlying tables).

For the full, current-run-scoped version of these risks (which are actively being tracked vs. out of scope), see the current approved Project Context, not this file — this file is a standing description of the application, not of any particular run's scope.
