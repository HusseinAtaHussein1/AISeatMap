# NDC — Findings Summary (RUN-20260712-002)

| ID | Title | Category | Severity | Confidence | Status | Occ. | Module |
|---|---|---|---|---|---|---|---|
| FINDING-001 | Documented STG URL (`.70`) vs. actual (`.80`) | Observation | N/A | 95% | **Resolved** (2026-07-13: `.80` confirmed authoritative; `LogIn_Page.java` corrected) | 1 | Environment/tooling |
| FINDING-002 | Branch/Agency/Staff create → "Send For Approval," not immediate | Requirement Gap | N/A | 95% | Needs Human Review | 3 | Branch, Agency, Staff |
| FINDING-003 | Agency List requires explicit Search; Branch auto-loads | UX Issue | Low | 90% | Needs Human Review | 1 | Agency (contrast: Branch) |
| FINDING-004 | Branch Actions column: Edit vs. Reject ambiguity (near-miss, no mutation) | Recommendation | N/A | 90% | Needs Human Review | 1 | Branch |
| FINDING-005 | Staff List returns zero rows even under Both+Search | Test Gap | N/A | 45% | Needs Human Review | 1 | Staff |
| FINDING-006 | Agency "Contact person" field silently strips Arabic-script input, client-side | Application Behavior | Medium | 95% | **Resolved — Confirmed By Design** (2026-07-18: user confirmed Arabic input is intentionally unsupported) | 2 | Agency |
| FINDING-008 | Pending Branch not visible in List/Grid at all (Search, default view, or any Status filter) | UX Issue / Requirement Gap | Medium | 90% | Needs Human Review | 1 | Branch |

No Finding in this run reached `Confirmed` status — consistent with this run's Discovery Mode disclosure (Browser Automation was used and does support `Confirmed`-eligible evidence in principle, but every Finding above rests on a single observation without the full Investigation & Recovery Engine boundary-probing pass §5.7–§5.8 being exhausted, given this run's bounded Spike scope) and with the Project Context's own framing of this run as an exploratory Spike.
