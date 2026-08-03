# Detected Stack

> **Generated, then durable.** Unlike every other document in this folder, this one is written by the
> platform rather than by a human — Stage 4A (Automation) resolves the project's stack and its
> **pinned** dependency versions via `platform_core/tools/mcp/stack_docs/` and records the result
> here, so later runs reuse it instead of re-detecting from scratch.
>
> It lives in `knowledge_base/` because it is true of the project across runs, not of one run. The
> per-run companion artifact — which Context7 queries were made and what they returned — stays inside
> the run folder as `StackDocumentationContext_{Framework}.md` (`automation-skill` §34).
>
> Safe to edit by hand: where a human correction and mechanical detection disagree, record the
> correction plus the reason, and Stage 4A surfaces the conflict rather than silently overwriting it.

## Detected At

2026-08-03 (first detection — Stage 4A, `branch` module, run-002)

## Ecosystems

| Ecosystem | Detected From |
|---|---|
| Java (Maven) | Human decision at the Framework Decision Gate — no existing manifest; this is the platform's first automation project, any module, any framework |

## Automation Framework

| Key | Value |
|---|---|
| Framework | SHAFT Engine |
| Version | `9.4.20251220` (real groupId `io.github.shafthq`; verified via Maven Central search + `javap` against the resolved jar, not Context7 — see Detection Gaps) |
| Pinned? | Yes |
| Language | Java 17 (`maven.compiler.release`) — confirmed compilable against this environment's JDK 23 toolchain via a real `mvn test-compile` pass |
| Automation root | `platform_core_data/modules/branch/automation/tests_SHAFT/` (module project; not yet merged to `platform_core_data/automation_baseline/SHAFT/`) |

## Dependency Table

| Library | Resolved Version | Pinned? | Source File | Context7 ID |
|---|---|---|---|---|
| SHAFT_ENGINE (`io.github.shafthq:SHAFT_ENGINE`) | `9.4.20251220` | Yes | `pom.xml` | Not resolved (Context7 unavailable) |
| TestNG | Bundled via SHAFT_ENGINE | No | — | Not resolved |
| Allure (TestNG adapter) | Bundled via SHAFT_ENGINE | No | — | Not resolved |

**Note:** a newer artifact, `io.github.shafthq:shaft-engine:10.3.20260707`, also exists on Maven
Central but requires JDK 25 to compile against (class file version 69) — incompatible with this
environment's JDK 23 (max 67). Re-evaluate pinning to 10.x once a JDK 25 toolchain is available.

## Conventions Observed

| Aspect | Convention |
|---|---|
| File naming | `{Screen}Page.java` (Page Objects), `{Workflow}Tests.java` (TestNG test classes) — SHAFT Engine standard, no existing project to detect an override from |
| Page object pattern | SHAFT Engine Page Object Model — locators as `public static` `By` constants, actions via SHAFT's `SHAFT.GUI()` fluent API |
| Fixture strategy | TestNG `@BeforeMethod`/`@AfterMethod` for per-test driver lifecycle via `DriverFactory`; shared test data in a dedicated `data/` package |

## Human Corrections

_None yet._

## Detection Gaps

| Gap | Why | Status |
|---|---|---|
| SHAFT_ENGINE / TestNG / Allure resolved, pinned version | Context7 MCP server returned "Invalid API key" — unavailable this run | Open — re-run the Stack Documentation step once Context7 access is restored, before the next Stage 4A pass extends this project |
| Java/Maven toolchain version | No existing manifest; Java 17 assumed, not detected | Open — confirm with the team's actual CI/build environment when available |
