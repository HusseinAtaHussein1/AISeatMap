---
id: PREREQ-PLAYWRIGHT
name: Playwright
kind: tool
scope: platform
required_by: []
optional_for: [explorer, manual-execution, automation, automation-execution]
satisfies: [PREREQ-BROWSER-PROVIDER]
detection: "require('platform_core/tools/browser_provider').version() for the CLI; presence of the `playwright` package for the Node provider"
absence_behavior: degrade
version: 1
last_updated: 2026-07-29
---

# PREREQ-PLAYWRIGHT — Playwright

## Purpose

The browser engine currently backing the platform's Browser Provider capability. Ships as two
providers, deliberately complementary:

| Provider | Integration | Owns |
|---|---|---|
| `playwright-node` | Node library, in-process | persistent authenticated sessions — navigate/click/type/extract/waitFor/captureNetwork, dialog guardrail, UI baseline capture |
| `playwright-cli` | `npx playwright …` | suite execution (`test`), script recording (`codegen`), one-shot `screenshot`, `show-trace` |

## Why a Skill needs it

**It doesn't.** No Skill declares `PREREQ-PLAYWRIGHT`. Skills declare
[`PREREQ-BROWSER-PROVIDER`](PREREQ-BROWSER-PROVIDER.md); this document records what satisfies that
capability today, so replacing the engine is a platform-layer change rather than a seven-Skill edit.

`required_by` is deliberately empty. It is listed in `optional_for` only to record which stages
benefit when it is present.

## The CLI integration

The **integration architecture** is a CLI surface: operations Playwright's CLI genuinely owns are
invoked as CLI commands through the `playwright-cli` provider, rather than the platform depending on
any particular in-process implementation for them.

```
browser.runSuite({suiteDir, mode})  ->  npx playwright test --reporter list [--headed|--debug] [--grep …]
browser.codegen({url, outputFile})  ->  npx playwright codegen --output <generated>/codegen/… <url>
browser.screenshot({url, name})     ->  npx playwright screenshot [--full-page] <url> <generated>/screenshots/…
browser.showTrace({tracePath})      ->  npx playwright show-trace <tracePath>
browser.version()                   ->  npx playwright --version
```

The base command is configurable (`browserProviders["playwright-cli"].command`, default
`npx playwright`). Arguments are passed as an argv array, never shell-interpolated, so a value
containing a space or a quote cannot alter the command.

**Playwright's functionality is unchanged by this.** What changed is the integration architecture:
the platform no longer depends on a specific implementation surface (previously, Skill prose named a
Playwright MCP server), and the provider — not any Skill — decides internally whether an operation
goes through the CLI or the Node library.

A persistent, authenticated, interactive session is **not** a CLI operation. It stays with
`playwright-node`, because expressing it as CLI invocations would eliminate the session, the
in-session extraction operations, and the dialog guardrail — a functional regression, not an
integration change.

## Generated output

Every artifact the CLI produces goes under the configurable, isolated, gitignored generated-output
directory — `{{GENERATED_OUTPUT_DIR}}/playwright/{report,results,codegen,screenshots}/`, resolved by
`platform_core/tools/project_paths/`. Playwright's own default output locations
(`playwright-report/`, `test-results/`) are redirected there via `PLAYWRIGHT_HTML_REPORT`,
`PLAYWRIGHT_JSON_OUTPUT_NAME`, and `PLAYWRIGHT_TEST_OUTPUT_DIR`, so generated artifacts never land
beside a suite's maintained source.

## Detection

```js
require('<repo>/platform_core/tools/browser_provider').version();   // CLI presence + version
```

For the Node provider, presence of the `playwright` package (declared in `package.json`). Browsers
themselves are installed by `npx playwright install` — an operator action, never performed by a Skill.

## If absent

`absence_behavior: degrade` — the capability is what matters, so absence is handled by
[`PREREQ-BROWSER-PROVIDER`](PREREQ-BROWSER-PROVIDER.md)'s per-Skill rules. If another provider is
configured and available, nothing degrades at all.

## What this prerequisite is not

- **Not the automation framework choice.** Which framework the automation Skill generates in
  (Playwright, SHAFT, Selenium, …) is a separate, always-human decision. Playwright being present
  for Discovery is **never** evidence for that choice — this is a specification-level rule, recorded
  because it was a real past defect.
- **Not Playwright MCP.** Removed from the architecture; nothing depends on it.
- **Not the Browser Provider itself.** The provider layer is the abstraction; Playwright is one
  engine behind it.
- **Not a browser install.** The package and the browser binaries are separate; `npx playwright
  install` is an operator step.

## Related

- [`PREREQ-BROWSER-PROVIDER.md`](PREREQ-BROWSER-PROVIDER.md) — the capability Skills actually declare.
- [`../tools/browser_provider/interface.md`](../tools/browser_provider/interface.md) — the provider contract.
- [`PREREQ-NODE.md`](PREREQ-NODE.md) — the runtime both providers execute on.
