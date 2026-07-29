# `test_suite_export/` — Stage 3 Manual Test Suite → Excel

## Purpose

Renders each authored `TestCases_{Module}.md` in a run's `test_design/` folder into the matching
`TestCases_{Module}.xlsx`, so Stage 3 delivers both outputs
[`test-design-skill/SKILL.md`](../../../.claude/skills/test-design-skill/SKILL.md) §9 requires
(Outputs #1 Markdown and #2 Excel).

## The one rule this tool exists to enforce

§9: the Markdown and Excel suites are **"two renderings of one test case set — they must never
diverge in content."**

The only way to *guarantee* that is to derive one from the other. So:

- **The Markdown suite is the authored artifact.** The skill writes it, a reviewer reads it, git
  diffs it.
- **The workbook is generated output.** This tool parses the Markdown and writes the `.xlsx`.

Authoring both by hand makes non-divergence a matter of discipline rather than construction — and
when they do drift, Stage 4M silently executes against whichever one the tester happened to open.
Nothing downstream can detect that. Deriving the workbook makes the failure mode unreachable.

Re-run the tool after *any* edit to a suite document; the workbook is never hand-edited.

## Usage

```bash
# the normal call — export every suite in the ACTIVE run's test_design/ folder
node platform_core/tools/test_suite_export/cli.js

node .../cli.js --run <run-folder>      # a specific run instead of the active one
node .../cli.js --dir <path>            # any folder holding TestCases_*.md
node .../cli.js --file <path/to/TestCases_Search.md>    # a single suite
node .../cli.js --file ... --sheet-name Navigation_NFR_BR
node .../cli.js --check                 # parse + report, write nothing (review/CI gate)
node .../cli.js --json                  # machine-readable result
```

| Exit code | Meaning |
|---|---|
| `0` | Exported; every case parsed cleanly |
| `1` | Error — no active run, unreadable path, or no suite documents found |
| `2` | Parsed **with warnings** (e.g. a case missing Expected Result), or `--check` found a problem |

Exit `2` is deliberate: a workflow step can gate on "did every case parse cleanly?" instead of
shipping a workbook with blank cells nobody notices until Stage 4M tries to execute it.

The run folder is **never guessed** — it comes from the Active Run pointer via
[`run_manager`](../run_manager/), per `test-design-skill/SKILL.md` §24. `--dir` bypasses run
resolution entirely, for exporting a folder that isn't inside a run.

## Programmatic use

```js
const { exportSuiteDir, parseTestCases, buildWorkbook } = require('./platform_core/tools/test_suite_export');

const { results, warnings } = exportSuiteDir('platform_core_data/runs/<run>/test_design');
```

`exportSuite` / `exportSuiteDir` are the primary surface. `parseTestCases`, `toRows`, and
`buildWorkbook` are exported for a caller assembling a workbook from records it already holds.

## Workbook structure

One sheet per module workbook, tab named for the module (`--sheet-name` overrides it — the reference
run's `TestCases_Navigation.md` groups NAV + NFR + BR and uses the tab `Navigation_NFR_BR`). Header
row frozen and bold; all columns text-typed and wrapped.

The columns are exactly `SKILL.md` §6.1's field list, in §6.1's order ("exactly these fields, in this
order — no more"):

| # | Column | Width |
|---|---|---|
| A | Test Case ID | 14 |
| B | Title | 40 |
| C | Objective | 45 |
| D | Preconditions | 30 |
| E | Test Data | 30 |
| F | Steps | 60 |
| G | Expected Result | 50 |
| H | Priority | 8 |
| I | Tags | 25 |
| J | Notes | 35 |

`FIELDS` in [`parseTestCases.js`](parseTestCases.js) is the single ordering authority for both the
columns and the per-case field extraction, so the two cannot fall out of step. Traceability, Risk,
and the Requirement/Discovery/Finding/Evidence references are deliberately **absent** — §6.2 puts
them in `TraceabilityMatrix.md`, keyed by Test Case ID, not on the execution-facing document.

**Steps** are joined into one cell with ` | ` and **renumbered canonically** (`1. … | 2. …`). The
numbering is not decoration: Stage 4M records a result per step and a defect cites "failed at step 3",
so a joined cell that dropped its numbers makes that citation unresolvable. Renumbering also
normalizes a suite authored as an all-`1.` Markdown list.

Every other field keeps its line breaks, so a Test Data `| Field | Value |` table stays legible
rather than being collapsed onto one line.

## What the parser accepts

Both case-heading shapes in use, so promoting this behaviour into permanent tooling doesn't
invalidate suites already written either way:

```markdown
## TC-SR-001                          ### TC-SR-001 — Search returns results
**Title:** Search returns results     **Objective:** …
**Objective:** …
```

Fields are `**Label:**` markers matching the table above. Front matter, scope banners, `---` rules,
and a trailing `## Summary` are skipped. Fenced code inside a field is preserved verbatim — a `## `
or `**Label:**` inside a fence is content, not structure. An unrecognized `**Label:**` is treated as
prose emphasis and stays with the field it appears in, rather than being dropped.

Strict about structure, permissive about prose: what it cannot parse is **reported**, never silently
written as a blank cell. It warns on a missing required field (Title, Objective, Steps, Expected
Result, Priority, Tags), a duplicate field label, a duplicate Test Case ID, and a document with no
cases at all. Superseded `TestCases_{Module}.vN.md` copies are skipped loudly so they can't become
shadow workbooks Stage 4M executes by accident.

## Zero dependencies, by design

`platform_core/` must run on a clean `npm install`; the repo's `package.json` declares only an
*optional* `playwright` devDependency and no runtime dependencies.

The Stage 3 experiment that first produced these workbooks used the npm `xlsx` package via a
run-scoped throwaway script. Promoting that behaviour into permanent platform tooling meant it could
not carry a new hard dependency along with it, so [`xlsxWriter.js`](xlsxWriter.js) writes the
`.xlsx` directly: an `.xlsx` is a ZIP of XML parts, and the ZIP is emitted with STORED (uncompressed)
entries — valid per the ZIP spec and readable by Excel, LibreOffice, Google Sheets, and the npm
`xlsx` package alike, with no compression library needed either.

The writer's scope is deliberately narrow — one sheet, a header row, text cells, column widths — and
must not grow into a general-purpose spreadsheet library. Anything needing charts, formulas, or
multiple sheet types wants a real library and a dependency conversation first.

**Output is byte-reproducible.** ZIP entries carry a fixed timestamp (the 1980 ZIP epoch) rather than
wall-clock time, so regenerating an unchanged suite is a no-op in git — a real-content diff instead
of a timestamp diff on every Stage 3 re-run.

## Files

| File | Role |
|---|---|
| [`cli.js`](cli.js) | Command-line entry; resolves the active run, reports results, sets the exit code |
| [`exportSuites.js`](exportSuites.js) | `exportSuite` / `exportSuiteDir` — file discovery and orchestration |
| [`parseTestCases.js`](parseTestCases.js) | Markdown suite → structured records; owns the `FIELDS` contract |
| [`xlsxWriter.js`](xlsxWriter.js) | Dependency-free single-sheet `.xlsx` writer |
| [`crc32.js`](crc32.js) | CRC-32, required by every ZIP entry header |
| [`index.js`](index.js) | Programmatic surface |
| [`__tests__/`](__tests__/) | `node --test` — parser shapes, writer/ZIP structure, export behaviour |

```bash
npm test    # the repo-wide suite, which includes this tool's tests
```

## Rules

- **Never hand-edit a generated `.xlsx`.** Edit the Markdown suite and re-run the tool; a hand-edited
  workbook is exactly the divergence §9 prohibits, and the next export silently discards it.
- **Never treat a warning as cosmetic.** A missing Expected Result means an unexecutable test case
  reaching Stage 4M — fix the Markdown, not the workbook.
- **Never resolve a run folder here.** It comes from the Active Run pointer (§24); this tool never
  writes the pointer, and never falls back to "the newest run."
- **Never add a runtime dependency to this folder.** See *Zero dependencies* above.

## Related

- [`.claude/skills/test-design-skill/SKILL.md`](../../../.claude/skills/test-design-skill/SKILL.md) — the stage that calls this tool (§9 Outputs, §6.1 fields, §12 Artifacts)
- [`platform_core/templates/stage_3_test_design/`](../../templates/stage_3_test_design/) — the structure of the Markdown suite this tool parses
- [`run_manager/`](../run_manager/) — the Active Run pointer this tool resolves against
- [`platform_paths/`](../platform_paths/) — the two-root resolver used to locate `runs/`
