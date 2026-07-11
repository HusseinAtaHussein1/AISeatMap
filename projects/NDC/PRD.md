# NDC — Requirement Source for RUN-20260710-001

**This is not a comprehensive application PRD.** No full PRD exists yet for NDC (see `projects/NDC/onboarding.md`). This file exists solely to satisfy `agents/project_context_agent.md` §4's Required PRD input for this specific run, per a **User Story** Run Scope with **Pasted text** Source (`pipeline/run_scope.md` §4.1). Its content is exactly the two pasted user stories supplied for this run — nothing has been added, reworded, or "completed" beyond what was pasted.

Full originals, with cross-reference notes, live at:
- `projects/NDC/resources/docs/NDC US/Q2-CORE-WT1-T3002-066_White-Black-list-route-based.md`
- `projects/NDC/resources/docs/NDC US/T3087_Add-Airline-Whitelist-Blacklist-Credential-Route-Filter-Phase1.md`

---

## User Story 1 — Q2-CORE-WT1-T3002-066 — T3002 White / Black list route based

### Description

As an NDC Admin user, I want to apply filters on returned journeys based on supplier and supplier credentials at the route level (not only airport level), so that I can have better control over search results and ensure only valid and relevant journeys are displayed to agencies.

### Acceptance Criteria

- The system allows filtering of returned journeys based on supplier credentials.
- The filtering can be configured at the route level (origin–destination), not limited to airport-level filtering.
- Only journeys that match the configured supplier, credentials, and routes are displayed in the search results.
- The NDC Admin can manage (add, remove) route-level filtering rules.
- The applied filters ensure that agencies only see valid and supported journey options.
- The filtering reduces irrelevant or unsupported search results.
- It will be a one list and the end user choose is white or black list using the radio button.
- If select whitelist airports means all other are blacklisted and vice versa.

### Notes

- Route-level control provides more precise filtering compared to airport-level filtering.
- We need to first investigate the airport and supplier blacklists and whitelists to obtain a complete view, and determine whether any rules are being overridden or not properly applied.
- Need to take in consideration the black and white list approach which we have before implement it.

### We need to implement

- Implement an audit log to track system activities and changes.
- Provide a function to verify suppliers and identify the issue source across different system layers.
- Introduce a tag that serves as a reference for all routes. This tag must be applied exclusively to either the origin or the destination at the route level and cannot be used for both.

### Comments (confirmed current behavior, from prior investigation)

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

---

## User Story 2 — T3087 — Add Airline in Whitelist/Blacklist (Credential Route Filter CRUD) Phase 1

### Description

As an NDC Admin,
I want to configure airlines within Credential Route White/Black List rules for GDS suppliers ONLY,
So that route filtering can be applied to specific airlines returned by a selected GDS supplier on certain route.

Enhance the Credential Route Filter configuration in the Master Module by introducing airline-level filtering for White List and Black List rules.

When a user selects a supplier whose type is GDS, an additional Airlines multi-select dropdown shall be displayed. The dropdown shall allow the user to select one or more active airlines associated with the rule.

The configured airline filtering shall be applied after the supplier returns search results and before Rule Engine processing, aggregation, and result display.

The enhancement shall be supported in both Admin and Portal booking modules while retaining the current White List and Black List behavior for configurations that do not include airline filtering.

### Acceptance Criteria

**CRUD Operation Added Fields**
- A new Airlines multi-select dropdown is displayed when the selected supplier type is GDS.
- The Airlines dropdown is hidden for non-GDS suppliers.
- The Airlines dropdown displays active airlines.
- Users can select one or more airlines from the dropdown.
- Selected airlines are saved as part of the White List or Black List route configuration.
- Existing White List and Black List configurations continue to function without modification.

**Search Processing**
- Airline filtering is applied only to results returned by the configured GDS supplier.
- The filtering is executed after supplier results are received.
- The filtering is executed before: Rule Engine processing; Aggregation; Search result display.
- For White List rules, only configured airlines are allowed to proceed.
- For Black List rules, configured airlines are excluded from proceeding.
- Existing route filtering behavior remains unchanged when no airlines are configured.

**Scope**
- The filtering logic is applied consistently in both: Admin Booking Module; Portal Booking Module.

**Prerequisites**
- DBA consultation is required to determine and approve the maximum number of airline selections that can be stored, as the Airlines field supports multi-selection.
- Active airline data must be available and accessible for the population of the Airlines dropdown.
