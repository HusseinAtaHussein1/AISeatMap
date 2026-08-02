---
id: PREREQ-JAVA
name: Java + Maven
kind: toolchain
scope: platform
required_by: []
optional_for: [automation, automation-execution]
detection: "java -version and mvn -version, only when the resolved automation framework is JVM-based"
absence_behavior: halt
version: 1
last_updated: 2026-07-29
---

# PREREQ-JAVA — Java + Maven

## Purpose

The compile-and-run toolchain for JVM-based automation frameworks (SHAFT Engine, Selenium/Java,
REST Assured, anything TestNG- or JUnit-based).

## Why a Skill needs it

| Skill | Uses it for |
|---|---|
| `automation` | compilation-readiness verification of a generated JVM package (`mvn -o test-compile`) |
| `automation-execution` | executing a JVM suite and collecting its reports |

**Conditionally, never unconditionally.** This prerequisite applies only when the run's resolved
automation framework is JVM-based. A Playwright/JavaScript package needs none of it. That is why
`required_by` is empty: no Skill needs Java in general; a Skill needs it *for a JVM package*.

The framework is resolved by the automation Skill's Framework Decision Gate — an explicit human
decision, every run. This prerequisite is checked **after** that gate resolves, never before, and
never used to influence it.

## Detection

```bash
java -version     # JDK, not just a JRE — compilation is required
mvn -version      # or the project's own wrapper (mvnw), if it ships one
```

The specific version floor is the *automation package's own* declaration (its `pom.xml` /
`build.gradle`), not a platform constant — a project's binding framework structure document
(`{{PROJECT_ROOT}}/automation_framework.md`, where one exists) is authoritative over any version
stated here.

## If absent

`absence_behavior: halt`, scoped to the JVM path only:

- **`automation`** — may still generate source, but cannot verify Compilation Readiness. It must
  record that check as **not performed** in its Self Review and Known Limitations, and must never
  report a package as compilation-verified when the toolchain was unavailable. Whether to accept an
  unverified package is the reviewer's call at the Automation Approval gate, not the Skill's.
- **`automation-execution`** — halts. A JVM suite cannot run without a JVM.

A run targeting a non-JVM framework is unaffected.

## What this prerequisite is not

- **Not a reason to pick or avoid a framework.** Toolchain availability is never evidence for the
  Framework Decision Gate. "Java isn't installed, so generate Playwright instead" is exactly the
  silent framework substitution the platform forbids — surface the missing toolchain and let a human
  decide.
- **Not the application's runtime.** The application under test may well be a Java application; that
  is unrelated to whether the *automation package* is JVM-based.
- **Not Allure or any other reporter.** Reporting tools a framework pulls in are that framework's
  own dependencies, declared in its build file.

## Related

- [`PREREQ-GIT.md`](PREREQ-GIT.md) — also required by the automation lifecycle.
- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §5.5 — framework choice as a Human Decision.
