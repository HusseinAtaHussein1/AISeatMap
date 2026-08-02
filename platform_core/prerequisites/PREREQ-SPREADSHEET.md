---
id: PREREQ-SPREADSHEET
name: Spreadsheet writer
kind: library
scope: platform
required_by: [test-design]
optional_for: []
detection: "the configured spreadsheet-writing library resolves in the platform's Node runtime"
absence_behavior: halt
version: 1
last_updated: 2026-07-29
---

# PREREQ-SPREADSHEET — Spreadsheet writer

## Purpose

Writing a real `.xlsx` workbook, so the Manual Test Suite's spreadsheet rendering is a genuine Excel
file rather than a CSV or an HTML table with a misleading extension.

## Why a Skill needs it

The `test-design` Skill produces the Manual Test Suite in **two renderings of one test case set** —
Markdown and Excel — and its specification requires the two to never diverge. The Excel rendering is
a declared output, not a convenience export: downstream reviewers work in the spreadsheet.

## Detection

The configured spreadsheet-writing library resolves in the platform's Node runtime. `exceljs` is the
library in use (already exercised in this repository); the prerequisite is stated at the capability
level so swapping libraries does not require editing the `test-design` Skill.

## If absent

`absence_behavior: halt`, scoped to the Excel output only. The Skill:

1. Produces the Markdown Manual Test Suite, the Traceability Matrix, and the Coverage Report in full.
2. **Halts before its checkpoint** and reports `PREREQ-SPREADSHEET` as missing, naming the Excel
   rendering as the unproduced declared output.

It must **never**:
- write a CSV or HTML file named `.xlsx` — a file that opens with a warning, or opens wrong, is worse
  than an absent file;
- mark the stage complete with a declared output missing and unmentioned;
- install the dependency on its own initiative. Installing it is an operator action; the
  orchestration layer may offer to run it and a human accepts.

This is a `halt` rather than a `skip` because the Excel suite is a **declared output** of the stage,
and a stage that quietly ships fewer artifacts than its contract names has broken the contract.

## What this prerequisite is not

- **Not a reporting or dashboard dependency.** The Final QA Report is Markdown; it needs nothing here.
- **Not a spreadsheet *reader*.** The platform only writes. If reading an externally-authored
  spreadsheet ever becomes an input, that is a separate prerequisite.
- **Not an ALM/test-management integration.** The Excel file is the platform's own canonical artifact,
  deliberately not shaped around any third-party tool's import format.

## Related

- [`PREREQ-NODE.md`](PREREQ-NODE.md) — the runtime this library loads in.
- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §4 Stage 3 — where both renderings are declared.
