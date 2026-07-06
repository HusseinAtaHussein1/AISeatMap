# LESSONS_LEARNED.md

_Last updated: 2026-07-05_

Architectural lessons discovered while redesigning the legacy 4-stage `prompts/` pipeline into the 6-agent `agents/` + `pipeline/` architecture. These are intended to inform future versions of the platform and future project runs — not a status report (see `SESSION_HANDOFF.md` for that).

---

## 1. Letting Discovery drive requirements causes drift — Test Design must treat it as secondary

**What happened:** The legacy pipeline's Knowledge Agent generated the PRD *from* Explorer discovery (`prompts/knowledge/knowledge_agent.md` calls itself "Stage 2 of 4 — Knowledge Synthesis," consuming discovery snapshots to produce `OrangeHRM_PRD.md`). Requirements were, in effect, whatever the live application happened to do at exploration time.

**Why this is a problem:** There is no independent "should" to test against — if the app has a bug, that bug becomes a documented requirement, and no test case can ever catch it, because the requirement and the observed behavior are the same artifact by construction. `OrangeHRM_PRD.md` itself flags this — it's explicitly labeled "Reconstructed PRD — derived from observed UI behavior, not from an original spec," with dozens of `> Assumption` tags.

**Better approach identified:** Invert the direction. The new Project Context Agent consumes an *already-approved* PRD (supplied, not generated from the app), and the Explorer Agent's job is redefined as validating and enriching that Project Context — never authoring it. Where the live app disagrees with the Project Context, the Explorer Agent logs a **Gap**, and a human decides which one is right; the agent never silently treats its own observation as the corrected truth. Same reversal applied to Test Design: Project Context is primary, Discovery is secondary (validation/enrichment/gap-detection only).

**Architectural improvement for future projects:** Any pipeline stage that both defines requirements *and* is the only thing validating them against reality is a design smell — split "define" and "validate" into separate stages with a directional, one-way dependency, and make the reversal explicit in each agent's spec (as done in `agents/explorer_agent.md` §2–3 and `agents/test_design_agent.md` §2–3) so it survives a change in personnel or model.

---

## 2. "Running the tests" and "interpreting the results" need to be separate agents

**What happened:** The legacy pipeline stopped at Automation — there was no dedicated execution or reporting stage. Running the suite and judging the results were implicitly bundled into whichever agent (or human) happened to invoke the tests.

**Problem this caused:** No structural guarantee that "raw results" and "narrative conclusions" stay separate. A single agent that both runs tests and writes the report is one code change away from quietly softening a failure into a footnote, or asserting a conclusion the raw data doesn't fully support.

**Better approach identified:** Two new, single-purpose terminal stages:
- **Execution Agent** — mechanical only. Records Test Case ID, Automation Script ID, status, timing, screenshots, logs. Explicitly forbidden from interpreting, summarizing, or drawing conclusions (`agents/execution_agent.md` §7, rule 5).
- **Reporting Agent** — synthesis only, and explicitly forbidden from re-running anything or inventing a result not present in the Execution Agent's raw output (`agents/reporting_agent.md` §7, rule 1).

**Architectural improvement for future projects:** Any stage that both produces data and draws conclusions from that data should be split, even if in practice one person/agent invocation will always do both back-to-back — the separation is what makes each stage's output independently auditable.

---

## 3. Not all approval gates carry the same risk — "reviewing a document" and "authorizing code to run" needed different gate types

**What happened while designing `pipeline/pipeline.md` §5:** An early version treated every checkpoint (Stages 1–4) as the same kind of "Human Review Required" gate.

**Why that's insufficient:** Approving a Project Context or a Manual Test Suite risks, at worst, a wrong document going to the next stage. Approving Automation Scripts authorizes *code that is about to execute against a real environment* — a materially different blast radius (potential data mutation, destructive actions, credential use).

**Better approach identified:** Two distinct, named gate types — "Human Review Required" (Stages 1–3) vs. "Automation Approval Required" (Stage 4) — with the pipeline spec explicitly instructing that the latter be treated "as at least as strict as a production deployment approval, not as a lighter-weight variant of Stage 1–3 review" (`pipeline/pipeline.md` §5.2).

**Architectural improvement for future projects:** When adding any new gate to this platform, ask "what is the blast radius if this is wrongly approved?" before defaulting to the generic review gate — a gate whose failure mode is "bad code runs against production-like data" should never look, in the spec, like a gate whose failure mode is "bad document gets read."

---

## 4. Approval gates that don't survive a re-run aren't real gates

**Problem identified during design (not yet fixed in tooling):** A checkpoint that just says "pending human approval" as a text label is trivially bypassable — nothing stops a later invocation from re-running a stage, overwriting the pending artifact, or a downstream stage from being invoked anyway "because it looked done."

**Better approach identified:** Two mechanisms written into `pipeline/pipeline.md` §7:
- **Version-suffixed artifacts** (`*.v1.md`, `.v2.md`, ...) so a rejected version is never overwritten in place — it stays on record even after a revision is approved.
- **A Run Manifest** (`artifacts/{{PROJECT_NAME}}/pipeline/{{PROJECT_NAME}}_RunManifest.md`) as the single source of truth for "what stage are we actually at," which an orchestrator (human or tooling) must consult before invoking the next stage — §5.3 rule 5 explicitly requires refusing to invoke a stage while its predecessor's checkpoint is open, "even if a human attempts to run a later stage manually."

**Open gap / lesson for future work:** This is currently specification only — no code enforces it yet (see `SESSION_HANDOFF.md` Pending Tasks #5). The lesson is that *designing* the gate mechanics and *enforcing* them are separate milestones — a spec describing a gate is not the same as a gate that cannot be silently skipped. Future sessions should not assume the gate is real just because the document describing it is thorough.

---

## 5. Retrofitting a new architecture onto old artifacts surfaces gaps the old pipeline never had to answer

**Problem encountered this session (discovered by inspection, not yet resolved):** The existing `artifacts/OrangeHRM/**` output — produced entirely under the legacy 4-stage pipeline — has no `context/` artifact at all, because the legacy pipeline never had a Project Context stage. This means none of the existing OrangeHRM discovery, test cases, or traceability matrix can currently be traced back to an approved Project Context, which the new architecture treats as mandatory (`pipeline/pipeline.md` Rule 5: "Project Context is the Single Source of Truth").

**Also surfaced:** the existing test cases are Markdown-only; the current Test Design Agent spec requires Markdown **and** Excel outputs that "must never diverge" (`agents/test_design_agent.md` §7 rule 6) — a requirement the legacy run never had to satisfy.

**Lesson for future projects:** When a platform's architecture changes mid-project, don't assume prior-pipeline artifacts satisfy the new pipeline's contracts just because they cover similar ground — each new mandatory artifact/field (Project Context, Excel exports, versioned filenames, Run Manifest entries) needs an explicit backfill-or-rerun decision, not a silent "it's basically the same output." This is precisely why `SESSION_HANDOFF.md` calls it out as an open question rather than resolving it unilaterally.

---

## 6. Single Source of Truth only works if it's structurally enforced, not just stated

**Lesson:** Multiple agent specs independently state "Project Context is the Single Source of Truth" and "no downstream agent may read the PRD directly" — but the actual enforcement mechanism is the **Allowed Tools** table in each agent spec (e.g., the Explorer Agent's tool list has no PRD-reading path at all; only Project-Context-reading is wired in). Repeating the principle in prose is not what makes it hold — restricting *what a stage is even capable of reading* is what makes it hold.

**Architectural improvement for future projects:** Whenever adding a new agent or stage, treat the Inputs/Allowed-Tools table as the actual enforcement surface, and treat the prose principle as documentation of *why* the table looks the way it does — not the other way around.
