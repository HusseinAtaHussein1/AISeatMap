---
id: REPAIR-003
category: repair_patterns
title: Bind the intended Surefire provider explicitly when TestNG and JUnit-Platform coexist on the classpath
status: confirmed
tags: [maven, surefire, testng, junit-platform, provider-detection, build-configuration]
producer: self-healing-skill
consumers: [automation-skill, automation-execution-skill, self-healing-skill]
promoted_from: modules/branch/healing/RepairSummary.md (HEAL-BR-20260805-01)
confidence: "1 execution, 1 project"
related_knowledge: []
created: 2026-08-05
last_updated: 2026-08-05
version: 1
---

## Problem

Maven Surefire auto-detects which test provider to run based on what it finds on the test classpath.
When both TestNG and a JUnit-Platform provider are present — the latter often pulled in transitively
by an unrelated dependency (a BDD framework, a reporting/observability agent, etc.) — Surefire's
auto-detection can resolve to the JUnit-Platform provider even though the project's own tests are
TestNG-annotated and its `testng.xml` is fully configured. The result is a misleadingly clean
`BUILD SUCCESS` reporting `Tests run: 0` — the JUnit-Platform provider finds no JUnit5-annotated
classes to run, and the TestNG suite configuration is silently ignored because only the TestNG
provider consumes it.

## Strategy

Bind the intended provider explicitly as a `<dependency>` *of the `maven-surefire-plugin` itself*
(inside the plugin's own `<dependencies>` block), e.g.:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <dependencies>
        <dependency>
            <groupId>org.apache.maven.surefire</groupId>
            <artifactId>surefire-testng</artifactId>
            <version>{matches the surefire-plugin version}</version>
        </dependency>
    </dependencies>
</plugin>
```

This forces deterministic provider selection and removes nothing from the project — no dependency
exclusion is required, and no other tooling that depends on the transitive JUnit-Platform dependency
is affected.

## Applicable Conditions

Any Maven + Surefire + TestNG project where another dependency transitively pulls in a JUnit-Platform
provider (or vice versa: a JUnit5 project where something transitively pulls in TestNG). Symptom to
watch for: `Tests run: 0, Failures: 0, Errors: 0, Skipped: 0` with `BUILD SUCCESS`, despite a non-empty,
correctly configured test suite — check the Surefire log line `Using auto detected provider ...` against
which provider the project's own tests actually use.

## Confidence

Confirmed by 1 execution, across 1 project (branch module, `run-003`): 0/13 tests attempted before the
fix, 13/13 actually invoked after it (12 passed, 1 failed for an unrelated, separately-diagnosed cause).

## Confirmed In

- `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch`,
  `EXEC-BR-20260805-01` / `rerun-1` — `platform_core_data/modules/branch/healing/RepairSummary.md`
  (Healing Pass `HEAL-BR-20260805-01`).
