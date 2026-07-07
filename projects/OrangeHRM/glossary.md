# OrangeHRM — Glossary

Domain and product terminology specific to the OrangeHRM project. For platform terminology (Project Context, Run Manifest, checkpoint gates, etc.), see the repo root `pipeline/pipeline.md` and `pipeline/run_manager.md` instead — this glossary covers the *application under test*, not the testing platform.

| Term | Meaning |
|---|---|
| **PIM** | Personnel Information Management — the OrangeHRM module holding the employee master record (system of record other modules key off of) |
| **ESS** | Employee Self-Service — a referenced-but-unconfirmed non-Admin role for employees managing their own data |
| **empNumber** | Internal employee identifier used to cross-reference records across PIM, Leave, Time, Performance, and Directory |
| **My Info** | The self-service module showing the logged-in user's own PIM record (same underlying view as Personal Details, scoped to self) |
| **Employee List** | The PIM screen listing all employees with filter/sort/pagination — columns: Id, Name, Job Title, Employment Status, Sub Unit, Supervisor, Actions |
| **Add Employee** | The PIM form for creating a new employee record — captures profile photo, name, Employee Id, optional login credentials |
| **Employee Detail** | The tabbed per-employee view (Personal Details, Contact Details, Emergency Contacts, Dependents, Immigration, Job, Salary, Report-to, Qualifications, Memberships) |
| **Maintenance** | The step-up-authenticated module for destructive administrative utilities (e.g., employee purge) |
| **Administrator Access modal** | The re-authentication prompt (current user's password re-entry) gating Maintenance actions |
| **Apply Leave** | The Leave module screen where an employee submits a leave request against an available leave type/balance |
| **Leave List** | The Leave module's approver-facing screen for reviewing/filtering submitted leave requests by status, date, employee, etc. |
| **Directory** | The org-wide employee search/lookup module, independent of PIM's administrative Employee List |
| **Hiring Manager** | A column/filter value on Recruitment candidate records — unconfirmed whether this is a distinct login role or just a data attribute |
| **Reconstructed PRD** | The PRD status label (`OrangeHRM_PRD.md`) indicating it was derived from observed UI behavior rather than an original specification — see the `> Assumption` tags throughout it |

New terms encountered while working on this project should be added here as they come up, rather than left implicit in discovery notes or test cases.
