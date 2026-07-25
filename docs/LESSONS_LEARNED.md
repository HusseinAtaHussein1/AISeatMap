# LESSONS_LEARNED.md

_Last updated: 2026-07-05_

Architectural lessons discovered while redesigning the legacy 4-stage `prompts/` pipeline into the 6-agent `agents/` + `pipeline/` architecture. These are intended to inform future versions of the platform and future project runs — not a status report (see `SESSION_HANDOFF.md` for that).

---

## 1. Letting Discovery drive requirements causes drift — Test Design must treat it as secondary

**What happened:** The legacy pipeline's Knowledge Agent generated the PRD *from* Explorer discovery (`prompts/knowledge/knowledge_agent.md` calls itself "Stage 2 of 4 — Knowledge Synthesis," consuming discovery snapshots to produce `PRD.md`). Requirements were, in effect, whatever the live application happened to do at exploration time.

**Why this is a problem:** There is no independent "should" to test against — if the app has a bug, that bug becomes a documented requirement, and no test case can ever catch it, because the requirement and the observed behavior are the same artifact by construction. `PRD.md` itself flags this — it's explicitly labeled "Reconstructed PRD — derived from observed UI behavior, not from an original spec," with dozens of `> Assumption` tags.

**Better approach identified:** Invert the direction. The new Project Context Agent consumes an *already-approved* PRD (supplied, not generated from the app), and the Explorer Agent's job is redefined as validating and enriching that Project Context — never authoring it. Where the live app disagrees with the Project Context, the Explorer Agent logs a **Gap**, and a human decides which one is right; the agent never silently treats its own observation as the corrected truth. Same reversal applied to Test Design: Project Context is primary, Discovery is secondary (validation/enrichment/gap-detection only).

**Architectural improvement for future projects:** Any pipeline stage that both defines requirements *and* is the only thing validating them against reality is a design smell — split "define" and "validate" into separate stages with a directional, one-way dependency, and make the reversal explicit in each agent's spec (as done in `.claude/skills/explorer-agent/SKILL.md` §2–3 and `.claude/skills/test-design-agent/SKILL.md` §2–3) so it survives a change in personnel or model.

---

## 2. "Running the tests" and "interpreting the results" need to be separate agents

**What happened:** The legacy pipeline stopped at Automation — there was no dedicated execution or reporting stage. Running the suite and judging the results were implicitly bundled into whichever agent (or human) happened to invoke the tests.

**Problem this caused:** No structural guarantee that "raw results" and "narrative conclusions" stay separate. A single agent that both runs tests and writes the report is one code change away from quietly softening a failure into a footnote, or asserting a conclusion the raw data doesn't fully support.

**Better approach identified:** Two new, single-purpose terminal stages:
- **Automation Execution Agent** (named "Execution Agent" until the 2026-07-24 Manual/Automation Execution separation) — mechanical only. Records Test Case ID, Automation Script ID, status, timing, screenshots, logs. Explicitly forbidden from interpreting, summarizing, or drawing conclusions (`.claude/skills/automation-execution-agent/SKILL.md` §7, rule 5).
- **Reporting Agent** — synthesis only, and explicitly forbidden from re-running anything or inventing a result not present in the Automation Execution Agent's raw output (`.claude/skills/reporting-agent/SKILL.md` §7, rule 1).

**Architectural improvement for future projects:** Any stage that both produces data and draws conclusions from that data should be split, even if in practice one person/agent invocation will always do both back-to-back — the separation is what makes each stage's output independently auditable.

---

## 3. Not all approval gates carry the same risk — "reviewing a document" and "authorizing code to run" needed different gate types

**What happened while designing `workflows_and_pipelines/pipeline/pipeline.md` §5:** An early version treated every checkpoint (Stages 1–4) as the same kind of "Human Review Required" gate.

**Why that's insufficient:** Approving a Project Context or a Manual Test Suite risks, at worst, a wrong document going to the next stage. Approving Automation Scripts authorizes *code that is about to execute against a real environment* — a materially different blast radius (potential data mutation, destructive actions, credential use).

**Better approach identified:** Two distinct, named gate types — "Human Review Required" (Stages 1–4) vs. "Automation Approval Required" (Stage 5) — with the pipeline spec explicitly instructing that the latter be treated "as at least as strict as a production deployment approval, not as a lighter-weight variant of Stage 1–4 review" (`workflows_and_pipelines/pipeline/pipeline.md` §5.2).

**Architectural improvement for future projects:** When adding any new gate to this platform, ask "what is the blast radius if this is wrongly approved?" before defaulting to the generic review gate — a gate whose failure mode is "bad code runs against production-like data" should never look, in the spec, like a gate whose failure mode is "bad document gets read."

---

## 4. Approval gates that don't survive a re-run aren't real gates

**Problem identified during design (not yet fixed in tooling):** A checkpoint that just says "pending human approval" as a text label is trivially bypassable — nothing stops a later invocation from re-running a stage, overwriting the pending artifact, or a downstream stage from being invoked anyway "because it looked done."

**Better approach identified:** Two mechanisms written into `workflows_and_pipelines/pipeline/pipeline.md` §7:
- **Version-suffixed artifacts** (`*.v1.md`, `.v2.md`, ...) so a rejected version is never overwritten in place — it stays on record even after a revision is approved.
- **A Run Manifest** (`platform_core_data/workspace/pipeline/RunManifest.md`) as the single source of truth for "what stage are we actually at," which an orchestrator (human or tooling) must consult before invoking the next stage — §5.3 rule 5 explicitly requires refusing to invoke a stage while its predecessor's checkpoint is open, "even if a human attempts to run a later stage manually."

**Open gap / lesson for future work:** This is currently specification only — no code enforces it yet (see `SESSION_HANDOFF.md` Pending Tasks #5). The lesson is that *designing* the gate mechanics and *enforcing* them are separate milestones — a spec describing a gate is not the same as a gate that cannot be silently skipped. Future sessions should not assume the gate is real just because the document describing it is thorough.

---

## 5. Retrofitting a new architecture onto old artifacts surfaces gaps the old pipeline never had to answer

**Problem encountered this session (discovered by inspection, not yet resolved):** The existing `projects/OrangeHRM/artifacts/**` output — produced entirely under the legacy 4-stage pipeline — has no `context/` artifact at all, because the legacy pipeline never had a Project Context stage. This means none of the existing OrangeHRM discovery, test cases, or traceability matrix can currently be traced back to an approved Project Context, which the new architecture treats as mandatory (`workflows_and_pipelines/pipeline/pipeline.md` Rule 5: "Project Context is the Single Source of Truth").

**Also surfaced:** the existing test cases are Markdown-only; the current Test Design Agent spec requires Markdown **and** Excel outputs that "must never diverge" (`.claude/skills/test-design-agent/SKILL.md` §7 rule 6) — a requirement the legacy run never had to satisfy.

**Lesson for future projects:** When a platform's architecture changes mid-project, don't assume prior-pipeline artifacts satisfy the new pipeline's contracts just because they cover similar ground — each new mandatory artifact/field (Project Context, Excel exports, versioned filenames, Run Manifest entries) needs an explicit backfill-or-rerun decision, not a silent "it's basically the same output." This is precisely why `SESSION_HANDOFF.md` calls it out as an open question rather than resolving it unilaterally.

---

## 6. Single Source of Truth only works if it's structurally enforced, not just stated

**Lesson:** Multiple agent specs independently state "Project Context is the Single Source of Truth" and "no downstream agent may read the PRD directly" — but the actual enforcement mechanism is the **Allowed Tools** table in each agent spec (e.g., the Explorer Agent's tool list has no PRD-reading path at all; only Project-Context-reading is wired in). Repeating the principle in prose is not what makes it hold — restricting *what a stage is even capable of reading* is what makes it hold.

**Architectural improvement for future projects:** Whenever adding a new agent or stage, treat the Inputs/Allowed-Tools table as the actual enforcement surface, and treat the prose principle as documentation of *why* the table looks the way it does — not the other way around.

---

## 7. The flat-path/legacy-collision problem predicted in Lesson 5 was not hypothetical — it recurred on the platform's own new artifacts, not just the legacy ones

_Added 2026-07-06, after RUN-20260706-001 and RUN-20260706-002 (the platform's first two real pipeline executions, culminating in the first full Stage 1→6 run)._

**What happened:** Lesson 5 above worried about *legacy* artifacts colliding with the new architecture's contracts. In practice, the collision that actually bit was narrower and sharper: `projects/OrangeHRM/artifacts/Reports/QA_Assessment_Report.md` — a legacy-pipeline artifact — sits at the **exact same flat path** every agent spec's own "Expected Artifacts" table says the new Explorer Agent must write to. The first time a new-pipeline run actually tried to produce that file, it would have silently overwritten a pre-existing, unrelated artifact.

**Resolution used (twice, across two runs):** Generate every one of that run's artifacts inside a Run-Workspace-scoped path (`platform_core_data/runs/RUN-*/...`) instead of the flat per-project paths the specs literally name — never touching, renaming, or overwriting anything that predates the run. This worked cleanly both times, but it is a **workaround applied ad hoc by the operator each time**, not a rule written into `workflows_and_pipelines/pipeline/pipeline.md` or any agent spec. Nothing currently tells a future run, or a future person, that this is the expected behavior versus the documented flat-path behavior.

**Lesson for future projects:** A conflict predicted in the abstract (Lesson 5) will recur concretely, and the concrete recurrence will not wait for the abstract question to be resolved first. **Decide, in the specification itself, whether new-pipeline artifacts default to the flat per-project paths or the Run Workspace paths** — and if the answer is "it depends" (e.g., flat paths for a project's first-ever new-pipeline run, Run-Workspace paths whenever a same-named legacy or prior-run artifact already exists), write that decision rule down, rather than leaving each future operator to reinvent the same workaround and hope it's consistent with whatever the last person did.

---

## 8. A component's own worked example silently caps what it actually supports

**What happened:** `workflows_and_pipelines/pipeline/run_manager.md` §6 defines the Run Workspace's subfolder structure (`context/`, `discovery/`, `findings/`, `evidence/`, `screenshots/`, `videos/`, `logs/`, `network/`, `reports/`, `metadata/`) — but its own only worked example (`workflows_and_pipelines/workflows/first_run.md`) exercises Stages 1–3. Nothing in that subfolder list covers Stage 3's `testcases/`, Stage 4's `Automation/`, or Stage 5's `execution/`. This was invisible for exactly as long as no run tried to go past Stage 3 — the first run that did (RUN-20260706-002, all the way to Stage 6) had to invent those three subfolders on the spot, undocumented.

**Lesson for future projects:** A spec's own example run is doing double duty as informal documentation of "what this actually supports" — and if that example doesn't exercise the full range the spec claims to cover (here: all 6 stages), the untested range should be assumed under-specified until proven otherwise, not assumed to "obviously" extend the same way. When a component's worked example is narrower than its own stated scope, treat that gap itself as a tracked item, not just a thing to patch silently the first time someone runs past it.

---

## 9. Self Review's pre-flagged risk turned into the actual, dominant failure at first execution — treat that as validation of the step, not a coincidence

**What happened:** The Automation Agent's Self Review step (`.claude/skills/automation-agent/SKILL.md` §15) flagged, before any test ever ran, that several selectors — most prominently the Employee List filter-panel-expand locator — were "written from accessibility-tree/discovery notes rather than live interaction" and were "higher-risk... to validate at first execution." At first execution, 8 of 12 test failures traced to exactly that locator (or a closely related one). The Self Review didn't just turn out to be *right* in hindsight — it named the specific, narrow cause in advance.

**Lesson for future projects:** This is evidence the Self Review step has real, non-ceremonial predictive value when the agent honestly flags "I generated this without live verification" rather than asserting confidence it doesn't have. The improvement isn't to Self Review's existence — it's to what happens *next* time: a flagged higher-risk selector should probably trigger an actual live-verification pass (e.g., a quick interactive check via browser automation before committing to the generated code) rather than only a textual caveat carried forward into a report three stages later. The caveat correctly warned; it didn't yet prevent.

---

## 10. A regression test's failure mode matters as much as its verdict — "it failed" is not the same claim as "the bug is confirmed"

**What happened:** Of 4 regression tests generated specifically to re-assert a Confirmed Finding's corrected behavior, all 4 failed at execution. A shallow read ("4/4 regression tests failed → 4/4 bugs still present") would have been right for exactly half of them by coincidence. Two failures (`TC-LOGIN-004`, `TC-LOGIN-009`) reproduced their target defect's actual symptom. The other two (`TC-PIM-004`, `TC-PIM-006`) failed on an unrelated automation-layer timeout *before ever reaching* the assertion that would have exercised the underlying Finding — their failure carries no evidence about whether the application defect is still present.

**Lesson for future projects:** Reporting on regression-test results must check *why* each one failed against the raw evidence, not just tally pass/fail counts against Finding IDs. This is cheap to do (the raw error message is already sitting in the Execution Results) and expensive to skip (it's the difference between "confirmed" and "inconclusive" for half the regression suite in this run). Bake this distinction into `.claude/skills/reporting-agent/SKILL.md` as an explicit required check for any run that includes Finding-derived regression tests, rather than relying on each report's author to think of it independently.

---

## 11. A stage's own summary table and its own detail table can silently disagree — nothing currently cross-checks a stage against itself

**What happened:** The Automation Agent's `AutomationCoverageReport.md` stated "21 Generate New Automation" decisions; its sibling `AutomationDecisionReport.md`, listing all 25 decisions individually, actually contains 22. Both artifacts were produced by the same agent invocation, approved at the same checkpoint, by the same reviewer — and disagreed with each other from the moment they were written. Nothing in the pipeline checks a stage's own summary arithmetic against its own detail data before the checkpoint approves it.

**Lesson for future projects:** Wherever an agent produces both a per-item detail table and a rolled-up summary derived from it, the summary should be computed *from* the detail table programmatically (or at minimum cross-checked against it before the artifact is finalized), never hand-tallied separately — hand-tallying two views of the same 25 rows is exactly the kind of arithmetic a human reviewer is unlikely to re-verify at a document-review checkpoint, since the checkpoint is reviewing *decisions*, not *arithmetic*.

---

## 12. A "0 Flaky" figure is not a stability claim when retries are disabled — it's an absence of measurement

**What happened:** The Execution Agent's raw stats reported `flaky: 0` for a 25-test run. Playwright can only classify a result as flaky if a retried attempt later succeeds; this run's config set `retries: 0` deliberately, so flaky detection was structurally impossible — "0 Flaky" meant "not measured," not "confirmed stable," and a report that repeated the figure without that context would have implied a guarantee the run never actually tested for.

**Lesson for future projects:** Any report that surfaces a flakiness/retry-derived statistic should state the retry configuration alongside it, every time — the number is not self-interpreting, and the failure mode (silently implying stability that wasn't measured) is exactly the kind of "outcomes look better than they were" distortion `.claude/skills/reporting-agent/SKILL.md` §3's last bullet already warns against for other cases. Add this as a named example there.
