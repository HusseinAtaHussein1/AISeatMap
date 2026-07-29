<!--
TEMPLATE — Timeline (Stage 2 — shared)
Renders to: platform_core_data/modules/{{MODULE_SLUG}}/discovery/Timeline.md
Authority:  .claude/skills/explorer-skill/SKILL.md §6

A single, run-wide, chronologically ordered log of significant actions and events — sufficient for a
human to reconstruct what happened and when WITHOUT replaying the session.

Rules (§6):
- Every entry has a timestamp and a short, FACTUAL description.
- Log at minimum: navigations, form submissions / significant actions, every Event-Driven Capture
  trigger (§5.2) the instant it fires, every Finding's creation (with its ID), and stage-level
  milestones (start/end of exploring a given module or flow).
- APPENDED CONTINUOUSLY DURING THE RUN — never reconstructed afterwards from memory.
- Factual and sequential only. No classification, severity, or conclusions — those live in the
  relevant Finding's metadata.
-->

# Discovery Timeline — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Module | `{{MODULE_SLUG}}` |
| Produced by run | `{{RUN_FOLDER}}` |
| Revision | {{REVISION_COUNT}} <!-- in-place edits since creation; this artifact belongs to the module, not the run --> |
| Run Started | {{START_TIMESTAMP}} |
| Run Ended | {{END_TIMESTAMP}} |

## Log

```
{{TIMESTAMP}}  {{EVENT}}
```

<!-- Example of the expected form and level of detail (§6):

10:15  Open Login page
10:16  Enter invalid username
10:16  Submit login form
10:16  HTTP 302 → /auth/login
10:16  Alert: "Invalid credentials"
10:17  Console: clean (0 errors)
10:18  FINDING-001 created (Category: Security Concern)

-->
