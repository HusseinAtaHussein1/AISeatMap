# Observability

**The canonical technical documentation for platform telemetry.** Other documents reference this one;
none of them restates the schema.

The platform should be able to answer *what happened during this run* from evidence, without a model
recalling it:

```text
Facts  →  Telemetry  →  Deterministic Metrics  →  Transparent Reporting
```

not:

```text
LLM remembers  →  LLM estimates  →  Report
```

---

## 1. The governing rule

> **Measure what can be proven. Mark what cannot be measured as unavailable.**

`0` and `Unavailable` are different claims and the platform never lets one become the other:

```text
Repair Cycles: 0             measured — the run needed no repairs
Repair Cycles: Unavailable   the platform could not observe it
```

Nothing here estimates a token count from text length, computes a cost from hardcoded pricing, turns
an unclosed span into a duration, or fabricates an event for a run that was never instrumented.

## 2. Observability is not governance

Four independent concerns:

| Concern | Question |
|---|---|
| **Review** | Is this test case accepted? |
| **Automation** | Should it be automated? |
| **Execution Safety** | May this operation execute here and now? |
| **Observability** | What actually happened, and how efficiently? |

Observability **never** authorizes an operation, rejects a test case, overrides a Human Decision,
changes a Safety decision, routes a pipeline, or alters a test outcome. It observes.

## 3. The model

```text
Run
 ↓
Events            append-only, run-scoped, schema-validated   ObservabilityEvents.jsonl
 ↓
Aggregator        pure, deterministic, no clock, no I/O
 ↓
Metrics           machine-readable, regenerable                ObservabilityMetrics.json
 ↓
Report            human-readable                               ObservabilityReport.md
Dashboard         presentation only                            ObservabilityDashboard.html
```

Events are evidence. Metrics are derived. The report and dashboard are renderings. Only the first is
authored; the other three are regenerable from it, which is why none of them is ever hand-edited.

## 4. Provenance — two reliability classes, never merged

Every event declares who emitted it, because they are **not** equally trustworthy:

| `source` | Meaning | Absence proves |
|---|---|---|
| `platform-tool` | Platform code emitted it as a side effect of doing the work. It cannot be forgotten. | The work did not happen |
| `skill` | A Skill emitted it because its specification says to. | **Nothing** |

The platform has no orchestrating process — a "stage" is a Claude Skill following a Markdown spec,
and nothing wraps it. So stage timing, human decisions and artifact activity can only be
skill-emitted. That is a real limitation, and it is reported rather than papered over: the two counts
appear separately in every report, and `observability validate` exists to prove a stream
under-instrumented instead of leaving a reader to notice (HD-OBS-001).

Metrics carry provenance too: `emitted` · `derived` · `historical-derived` · `unavailable`.

## 5. Events

24 types. Spans (`RUN` → `STAGE` → `SKILL` → `TOOL`, plus `REPAIR`) open and close explicitly;
parent-child links are recorded, never inferred from timestamps later.

```text
RUN_STARTED / RUN_COMPLETED              STAGE_STARTED / STAGE_COMPLETED
SKILL_STARTED / SKILL_COMPLETED          TOOL_STARTED / TOOL_COMPLETED / TOOL_FAILED
REPAIR_STARTED / REPAIR_COMPLETED        VALIDATION_PASSED / VALIDATION_FAILED
RETRY_OCCURRED                           HUMAN_DECISION_REQUESTED / HUMAN_DECISION_RESOLVED
ARTIFACT_CREATED / ARTIFACT_UPDATED      TEST_CASES_GENERATED
AUTOMATION_GENERATED / AUTOMATION_BUILD_RESULT
TEST_EXECUTION_RESULT                    SAFETY_PREFLIGHT_COMPLETED / SAFETY_BLOCKED
```

**There is no token or cost event type.** No supported source exists, so there is nothing to record,
and recording one would mean inventing it (HD-OBS-002).

**There is no `TEST_CASE_REVIEWED` event.** `Review` and `Automation` live on the test case and are
derived from the Case Index by `test_suite_export`'s own parser. A second lifecycle record would be a
second source of truth.

Each event:

```json
{"eventId":"evt-000004-3f9a1c02","schemaVersion":1,"seq":4,
 "timestamp":"2026-08-07T09:00:20.000Z","runId":"run-004__…","type":"TOOL_STARTED",
 "source":"platform-tool","stage":"3","tool":"test_suite_export","spanId":"spn-tool-000004"}
```

`eventId` = sequence + content hash. Timestamps are not unique — two tool calls inside one
millisecond are ordinary — so uniqueness comes from `seq`, and the hash makes the ID change if the
content does. Both inputs are supplied by the caller, so IDs are deterministic and testable.

Timestamps are **UTC ISO-8601**. A local formatted string is refused by the schema.

## 6. Why JSONL

The platform already treats run evidence as append-only: the Run Manifest's Checkpoint History is
appended to, `SafetyAuthorizations` appends rather than replaces. Appending a line cannot corrupt what
precedes it; rewriting a JSON array can, invisibly. One event, one line, no rewrite.

## 7. Where telemetry lives

```text
runs/{RUN_FOLDER}/metadata/observability/
├── ObservabilityEvents.jsonl      append-only evidence — never edited, never regenerated
├── ObservabilityMetrics.json      derived; regenerable at any time from the events
├── ObservabilityReport.md         human-readable
└── ObservabilityDashboard.html    self-contained, offline, presentation only
```

A subfolder, unlike Execution Safety's two flat files: four artifacts always produced and consumed
together are a family, and scattering them through `metadata/` would make it the place where
everything lands rather than the place where run state lives.

**Cross-run isolation is defended twice** (the same pattern `SafetyAuthorizations` uses, for the same
reason — file placement alone is defeated by `cp`):

1. The stream lives inside the run folder.
2. Every event carries its own `runId`, re-checked on load. A **copied** file contributes nothing.

## 8. Formula registry

No hidden formulas. Every published ratio is registered in `formulas.js` with its expression, and a
test asserts the registry and the computed output match exactly.

| ID | Expression |
|---|---|
| `TC_ACCEPTANCE_RATE` | Review Approved / (Review Approved + Review Rejected) |
| `AUTOMATION_APPROVAL_RATE` | Automation Approved / (Automation Approved + Automation Rejected) |
| `TOOL_FAILURE_RATE` | Failed / (Succeeded + Failed) — closed calls only |
| `RETRY_RATE` | Retries / Tool Calls Started — may exceed 1, not clamped |
| `FIRST_PASS_AUTOMATION_SUCCESS` | Passed on attempt 1 / Executed on attempt 1 |
| `EXECUTION_PASS_RATE` | Passed / (Passed + Failed) — Skipped and Blocked excluded from both sides |
| `VALIDATION_FAILURE_RATE` | Validation Failed / (Passed + Failed) — platform validation only |
| `HUMAN_DECISIONS_PER_STAGE` | Requested / Stages Started |
| `SAFETY_BLOCK_RATE` | Forbidden / Operations Evaluated |
| `CLEANUP_COMPLETION_RATE` | Cleanup Completed / Cleanup Required |
| `REPAIR_SUCCESS_RATE` | Repair Successes / Repair Attempts |

**A zero denominator yields `Unavailable`, never 0%.** "0 of 0 test cases were accepted" is the
absence of an acceptance rate, not a 0% one, and rendering it as 0% would make a run that designed no
test cases look like a run whose every case was rejected.

`TC_ACCEPTANCE_RATE` is **human acceptance, not correctness**, and is never labelled "AI Accuracy".

## 9. What this tool must never do

- Estimate a token count from text length, or read a Claude Code session transcript
- Compute a cost from hardcoded pricing
- Convert an unclosed span into a duration
- Fabricate an event for a historical run
- Report a metric with no evidence, or an unavailable one with no reason
- Re-evaluate an Execution Safety decision, or hold a second opinion about one
- Change a `Review` or `Automation` value it reads
- Persist a password, token, API key, session ID, cookie, authorization header, or card detail
- Publish a single composite "AI Value Score", "Quality = 97%", or financial ROI without a
  human-provided baseline

## 10. Secret safety

Metadata keys matching the secret pattern have their **values** replaced with `[redacted]`, and the
key is listed in the event's `redactedKeys` so a reviewer can see something was withheld. Redaction
is idempotent, and matches **keys only** — a value-scanning heuristic would mangle the real test case
titled *"Email Password rejects a value exceeding 15 characters"*, and telemetry that corrupts
legitimate QA vocabulary gets switched off.

## 11. Failure behaviour

| Failure | Behaviour |
|---|---|
| Telemetry write fails | Warning returned; **the QA run continues**. The metric is the only casualty. |
| Event is invalid | Refused outright, nothing written. Malformed evidence is worse than none. |
| A line is corrupt | Reported by line number; the rest of the stream still parses; the run is not certified complete. |
| Events carry a foreign `runId` | Rejected and counted as foreign, never aggregated. |
| A span is never closed | `Incomplete`. Duration `Unavailable`. Run marked `Partially Instrumented`. |

## 12. Historical runs

Observability is **prospective** (HD-OBS-003). run-001, run-002 and run-003 were never instrumented
and no event is invented for them. What their immutable artifacts genuinely prove — Surefire totals,
execution cycle counts, `run.json` timing — is available as **Historical Derived Metrics**, returned
under its own key, bannered, and never merged into instrumented metrics.

## 13. Usage

```bash
# Recording — Skills at lifecycle points, tools from their own code
node platform_core/tools/observability/cli.js record \
  --type STAGE_STARTED --stage 3 --skill test-design-skill --source skill --span-id spn-stage-000004

# Reading
node platform_core/tools/observability/cli.js summary   --run <folder>
node platform_core/tools/observability/cli.js validate  --run <folder>   # exit 2 if under-instrumented
node platform_core/tools/observability/cli.js metrics   --run <folder> --out
node platform_core/tools/observability/cli.js report    --run <folder> --out
node platform_core/tools/observability/cli.js dashboard --run <folder> --out
node platform_core/tools/observability/cli.js historical --run <folder>
node platform_core/tools/observability/cli.js compare   --run A --run B
```

`--run` defaults to the Active Run pointer. Exit codes: `0` ok · `1` error · `2` under-instrumented.

```js
const obs = require('agentic-ai-testing-platform/observability');
const { events } = obs.readEvents({ runFolder });
const metrics = obs.aggregate({ runId: runFolder, events, testSuites, safety });
```

## 14. The dashboard

Self-contained HTML: no script tag, no external stylesheet, no font, no image, no network request.
Charts are HTML/CSS bars and one inline SVG donut. It opens with a double-click, offline, forever.

No charting library was used because the repository carries **zero runtime dependencies**
(`"dependencies": {}`, enforced by `scripts/verifyPackable.js`), and a CDN `<script>` would make a QA
artifact stop working behind a proxy. OpenTelemetry was evaluated and declined for the same reason:
it needs an SDK, an exporter and a collector, and this platform is file-centric with no service to
export to. The event schema is kept shape-compatible with a future exporter.

The dashboard **computes nothing**. It renders `ObservabilityMetrics.json`; the JSON and the Markdown
report remain authoritative. Colour never carries meaning alone — every status is stated in text and
every bar is labelled with its number.

## 15. Files

```text
schema.js       vocabulary, validation, secret redaction
recorder.js     append events, open/close spans, read back with run-ID checks
formulas.js     measured/unavailable values and the formula registry
aggregator.js   pure deterministic metrics
sources.js      the only impure readers (run.json, test suites, Safety evidence)
historical.js   what a non-instrumented run's artifacts still prove
report.js       ObservabilityReport.md
dashboard.js    ObservabilityDashboard.html
cli.js          record / summary / validate / metrics / report / dashboard / historical / compare
index.js        public surface
```
