# NDC — Glossary

Domain and product terminology specific to the NDC project. For platform terminology (Project Context, Run Manifest, checkpoint gates, etc.), see the repo root `pipeline/pipeline.md` and `pipeline/run_manager.md` instead — this glossary covers the *application under test*, not the testing platform.

| Term | Meaning |
|---|---|
| NDC | National Distribution Channel — IATA data exchange standard for airline retailing; also the name of this platform/portal. |
| PNR | Passenger Name Record — the booking record for a reservation, importable/exportable between the portal and suppliers. |
| Supplier | An external airline or provider the portal integrates with via the .NET integration layer to search/book flights. |
| Supplier Credential | Authentication details used by the integration layer to connect to a specific supplier. |
| Supplier Adapter | The .NET-layer component that translates portal requests into supplier-specific API calls. |
| Company | Top-level organizational entity in the Administration module. |
| Branch | Organizational unit operating in a specific country under a Company. |
| Agency | Entity that sells and manages bookings; operates under a Branch. |
| Agent | System user (under an Agency) who uses the portal to search and book on behalf of travellers. |
| Traveller | The end passenger whose profile is attached to a booking. |
| Rule Engine | Module defining pricing rules: markup, discount, service charge, cancellation charge, and offer pricing. |
| Markup / Offer Pricing | Rule Engine outputs applied in sequence (Markup → Discount → Service Charge → Cancellation Charge → Offer Pricing) to arrive at the Final Fare. |
| Final Fare | The fully-computed price for a booking after all Rule Engine charges are applied. |
| Reference Data | Master data (Region, Country, Currency, Operating Country) that other modules depend on. |
| Operating Country | A country in which the platform is configured to operate, tied to Reference Data and Branch setup. |
| Wallet | A reporting/financial category tracked in the Reporting module. |
| NDC Core | The external NDC integration endpoint used for ticket issuance. |

New terms encountered while working on this project should be added here as they come up, rather than left implicit in discovery notes or test cases.

New terms encountered while working on this project should be added here as they come up, rather than left implicit in discovery notes or test cases.
