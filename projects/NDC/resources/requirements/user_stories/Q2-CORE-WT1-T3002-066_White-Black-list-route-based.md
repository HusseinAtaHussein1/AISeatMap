# Q2-CORE-WT1-T3002-066 — T3002 White / Black list route based

**Type:** User Story · **Source:** Plain Text (pasted) · **Received:** 2026-07-10 · **Status:** Raw pasted-text source, not yet used to generate a Project Context (per `pipeline/run_scope.md` §4.1, this is a User Story Run Scope, Source = Pasted text).

> Source is metadata, not a folder — see `resources/README.md` → "Requirement Source is metadata." This file lives at `requirements/user_stories/` regardless of Source; only the `Source:` field above records how it was delivered.

## Description

As an NDC Admin user, I want to apply filters on returned journeys based on supplier and supplier credentials at the route level (not only airport level), so that I can have better control over search results and ensure only valid and relevant journeys are displayed to agencies.

## Acceptance Criteria

- The system allows filtering of returned journeys based on supplier credentials.
- The filtering can be configured at the route level (origin–destination), not limited to airport-level filtering.
- Only journeys that match the configured supplier, credentials, and routes are displayed in the search results.
- The NDC Admin can manage (add, remove) route-level filtering rules.
- The applied filters ensure that agencies only see valid and supported journey options.
- The filtering reduces irrelevant or unsupported search results.
- It will be a one list and the end user choose is white or black list using the radio button.
- If select whitelist airports means all other are blacklisted and vice versa.

## Notes

- Route-level control provides more precise filtering compared to airport-level filtering.
- We need to first investigate the airport and supplier blacklists and whitelists to obtain a complete view, and determine whether any rules are being overridden or not properly applied.
- Need to take in consideration the black and white list approach which we have before implement it.

## We need to implement

- Implement an audit log to track system activities and changes.
- Provide a function to verify suppliers and identify the issue source across different system layers.
- Introduce a tag that serves as a reference for all routes. This tag must be applied exclusively to either the origin or the destination at the route level and cannot be used for both.

## Comments (confirmed current behavior, from prior investigation)

Based on the current behavior analysis, the filtering logic between Airport BlackList/WhiteList and Credential Routes WhiteList/BlackList is working with AND condition, not OR.

**Example 1 — Airport vs. Credential Routes:**
- If airport CAI is configured as BlackList from the Airport module.
- Then from Credential Routes, any route From/To CAI is configured as WhiteList.
- Expected behavior: Searches containing CAI should still NOT return any results because the airport itself is already blocked from the Airport module.

This means:
- If any rule from either module is BlackList → route should not appear in search results.
- Route will only appear if both conditions allow it (WhiteList / supported).
- Therefore, there is no conflict between Airport filtering and Credential Routes filtering, and there is no need to add an additional flag to disable the Airport BlackList logic, since both modules complement each other and follow AND logic correctly.

**Example 2 — Restricted Airlines vs. Credential Routes:**
- The Restricted Airlines configuration inside the Supplier Credentials module works independently from the Credential Routes WhiteList/BlackList logic and does not create any conflict.
- If EgyptAir is added as a Restricted Airline for a supplier credential such as Galileo Egy.
- Then a specific route is configured as WhiteList from Credential Routes.
- When performing search on this route, results will still return normally.
- Expected behavior: Flights from all allowed airlines will appear. Only flights operated by EgyptAir will be excluded from the search results due to the Restricted Airlines configuration.
- This confirms that the Restricted Airlines logic only filters airline results after route validation and does not interfere with the Credential Routes filtering behavior.
- Therefore, there is no need to add an additional flag to disable the Restricted Airlines logic, since both functionalities operate independently without causing conflicts.

## Cross-references

- Relevant existing modules observed live (see `projects/NDC/architecture.md` Navigation Model): `Master → Supplier → Credential Routes Filter`, `Master → Flight → Airport`, `Master → Supplier → Supplier Credentials` (Restricted Airlines).
- Per [`pipeline/run_scope.md`](../../../../pipeline/run_scope.md), this is a **User Story** Run Scope Type — a future Project Context version scoped to this story should treat the Comments section above as already-confirmed behavior, not as something to re-litigate as a defect.
