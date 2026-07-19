# NDC — Glossary

Domain and product terminology specific to the NDC project. For platform terminology (Project Context, Run Manifest, checkpoint gates, etc.), see the repo root `pipeline/pipeline.md` and `pipeline/run_manager.md` instead — this glossary covers the *application under test*, not the testing platform.

| Term | Meaning |
|---|---|
| NDC | National Distribution Channel — IATA data exchange standard for airline retailing; also the name of this platform/portal. |
| PNR | Passenger Name Record — the booking record for a reservation, importable/exportable between the portal and suppliers. |
| Supplier | An external airline or provider the portal integrates with via the .NET integration layer to search/book flights. Two types: **LCC** and **GDS** (see below). |
| LCC Supplier | Low-Cost-Carrier supplier — a direct-connect NDC integration where the supplier is effectively the airline itself (e.g. EgyptAir NDC). Search results normally return that one airline only, though a single itinerary can still be multi-carrier with this LCC as a participant (`knowledge_base/business_rules/BR-004.md`). On Branch's Supplier Routing, supplier + credential are selected together, inline, in one row (`knowledge_base/business_rules/BR-003.md`). |
| GDS Supplier | Global Distribution System supplier (e.g. Galileo) — aggregates and can return flights from many different airlines (including an LCC's own content, still attributed to that airline) — not a single-carrier feed (`knowledge_base/business_rules/BR-004.md`). On Branch's Supplier Routing, only the supplier itself is selected at the top level; its credential is selected in a separate section further down in the Branch module (`knowledge_base/business_rules/BR-003.md`). Distinct from the unrelated Master-module "Credential Routes Filter" (White/Black-list) feature. |
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
| Operating Country | A Reference Data entity (Admin → Company → Operating Country), distinct from Country itself. Its own Add form has Operating Country Name, Select Country (the underlying Country), and Currency. One Country can have several Operating Countries under it — each pairs that same Country with a different Currency, since a single country's platform configuration may need to operate in more than one currency. Branch selects an Operating Country (not a bare Country) for exactly this reason — confirmed by user 2026-07-18. |
| Wallet | A reporting/financial category tracked in the Reporting module. |
| NDC Core | The external NDC integration endpoint used for ticket issuance. |

New terms encountered while working on this project should be added here as they come up, rather than left implicit in discovery notes or test cases.

New terms encountered while working on this project should be added here as they come up, rather than left implicit in discovery notes or test cases.
