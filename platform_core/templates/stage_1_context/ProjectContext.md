<!--
TEMPLATE — Project Context (Stage 1 — shared)
Renders to: platform_core_data/runs/{{RUN_FOLDER}}/context/ProjectContext.md
Authority:  .claude/skills/project-context-skill/SKILL.md §3 (what to extract), §7 (rules), §8 (this structure)

Section order below is mandatory. Every extracted item cites the PRD section it came from (§7 rule 5).
Never introduce scope, features, or constraints absent from the PRD or run configuration (§7 rule 2).
A missing/unreadable PRD is a HALT, not a degraded run (§7 rule 1).
Missing run configuration → run degraded: mark affected sections
`Open Question — Requires Run Configuration`, never guess values.
-->

# Project Context — {{RUN_FOLDER}}

| Field | Value |
|---|---|
| Run Folder | `{{RUN_FOLDER}}` |
| PRD Source | `platform_core_data/knowledge_base/PRD.md` |
| Run Scope Type | {{RUN_SCOPE_TYPE}} <!-- Entire Project / Epic / Feature / User Story / Bug — run_scope.md §3 --> |
| Run Type | {{RUN_TYPE}} <!-- run_scope.md §5 --> |
| Target Environment | {{APP_URL}} |
| Generated | {{TIMESTAMP}} |
| Status | {{STATUS}} <!-- Pending Review / Approved --> |

## 1. Scope Summary

<!-- A concise statement of what this pipeline run covers. Include the Run Scope Type and Run Type
     named above — downstream stages read their strategy from here (test-design §16, explorer §16). -->

{{SCOPE_SUMMARY}}

## 2. Modules In Scope

<!-- Explicit list. Silence about a module is NOT sufficient — every module appears here or in §3. -->

| Module | Why in scope | PRD Reference |
|---|---|---|
| {{MODULE}} | {{IN_SCOPE_REASON}} | {{PRD_SECTION}} |

## 3. Modules Out of Scope

<!-- Equally mandatory (§7 rule 3). A module the PRD mentions but this run excludes belongs here. -->

| Module | Why out of scope | PRD Reference |
|---|---|---|
| {{MODULE}} | {{OUT_OF_SCOPE_REASON}} | {{PRD_SECTION}} |

## 4. Roles & Credentials Required

<!-- Drawn from the PRD's User Roles section plus the run configuration's {{ROLE}} keys.
     NEVER write a credential VALUE here. Reference the role and where the value is resolved from:
     platform_core_data/knowledge_base/credentials/credentials.json (git-ignored, human-created).
     No username, password, token, or secret may ever appear in this artifact. -->

| Role | Permissions / purpose | Credential source | PRD Reference |
|---|---|---|---|
| {{ROLE}} | {{ROLE_PURPOSE}} | `knowledge_base/credentials/credentials.json` (resolved at runtime) | {{PRD_SECTION}} |

## 5. Environment Constraints

<!-- e.g. "Shared public demo — no destructive actions" vs "Isolated test environment — full CRUD
     permitted". Downstream stages gate mutating actions on this section, so state it in
     actionable terms, not as a general caution. -->

| Constraint | Implication for downstream stages | Source |
|---|---|---|
| {{CONSTRAINT}} | {{IMPLICATION}} | {{SOURCE}} <!-- PRD §N or run configuration key --> |

## 6. Carried-Forward Assumptions & Risks

<!-- Every PRD `> Assumption` and Risk entry relevant to an in-scope module, carried forward
     verbatim in MEANING (§7 rule 4) — never diluted or reworded away from its original caveat.
     Stage 2 probes these; Stage 3 designs an explicitly tagged assumption-based test per entry;
     Stage 6A resolves each as confirmed / refuted / still unverified. Keep IDs stable. -->

| ID | Type | Statement (meaning preserved) | Affected Module(s) | PRD Reference |
|---|---|---|---|---|
| {{ASSUMPTION_ID}} | Assumption | {{STATEMENT}} | {{MODULES}} | {{PRD_SECTION}} |
| {{RISK_ID}} | Risk | {{STATEMENT}} | {{MODULES}} | {{PRD_SECTION}} |

## 7. Traceability Anchor

<!-- The PRD section reference for every item in §1–§6, so any downstream claim can be traced back
     to the source document without re-reading the PRD (which only this stage may read). -->

| Context Item | Section here | PRD Reference |
|---|---|---|
| {{ITEM}} | §{{SECTION}} | {{PRD_SECTION}} |

## 8. Open Questions — Requires Run Configuration

<!-- OPTIONAL — include only in a degraded run (SKILL.md §12). List every absent run-configuration
     key and which sections above are consequently unresolved. Omit this section entirely when the
     run configuration was complete. Never substitute a guessed value for a listed gap. -->

| Missing Key | Sections Affected |
|---|---|
| {{MISSING_KEY}} | {{AFFECTED_SECTIONS}} |
