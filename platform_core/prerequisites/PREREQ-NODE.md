---
id: PREREQ-NODE
name: Node.js runtime
kind: runtime
scope: platform
required_by: [project-context, explorer, test-design, manual-execution, automation, automation-execution, reporting]
optional_for: []
detection: "node --version reports a supported major version"
absence_behavior: halt
version: 1
last_updated: 2026-07-29
---

# PREREQ-NODE — Node.js runtime

## Purpose

The runtime every platform tool executes on: `project_paths`, `browser_provider`, `run_manager`, and
`automation_lifecycle` are all Node modules, and the platform's own test suite runs on Node's
built-in test runner.

## Why a Skill needs it

Every Skill needs it indirectly, because every Skill resolves its paths through `project_paths` and
several invoke `browser_provider`, `run_manager`, or `automation_lifecycle`. It is listed on all
seven rather than left implicit, so "which Skills break if Node is missing?" has a written answer.

Node's presence is **not** related to which framework the automation Skill generates in. A Java/SHAFT
automation package still needs Node for the platform's own tooling, and needs
[`PREREQ-JAVA`](PREREQ-JAVA.md) separately for the package itself.

## Detection

```bash
node --version
```

A version supporting `node:test` with the assertion API the platform's tests use (Node 18+; Node 20+
recommended). `require('node:test')` succeeding is the functional check.

## If absent

`absence_behavior: halt`. Nothing in the platform can resolve a path, drive a browser, allocate a run
folder, or run its own tests. A Skill invoked without Node available stops before producing any
artifact and reports `PREREQ-NODE` as missing.

There is no degraded mode: path resolution is not optional.

## What this prerequisite is not

- **Not npm dependency installation.** `npm install` having been run is covered by the specific
  library prerequisites ([`PREREQ-PLAYWRIGHT`](PREREQ-PLAYWRIGHT.md),
  [`PREREQ-SPREADSHEET`](PREREQ-SPREADSHEET.md)), not by this one.
- **Not the automation package's runtime.** A generated suite may run on an entirely different
  runtime; that is the framework's concern.

## Related

- [`../tools/project_paths/README.md`](../tools/project_paths/README.md) — the module every Skill depends on.
- [`PREREQ-PLAYWRIGHT.md`](PREREQ-PLAYWRIGHT.md), [`PREREQ-SPREADSHEET.md`](PREREQ-SPREADSHEET.md) — libraries that assume this runtime.
