---
id: PREREQ-BROWSER-PROVIDER
name: Browser Provider
kind: capability
scope: platform
required_by: [explorer, manual-execution]
optional_for: [automation, automation-execution]
satisfied_by: [PREREQ-PLAYWRIGHT]
detection: "require('platform_core/tools/browser_provider').capabilities() resolves the configured provider and returns its capability map"
absence_behavior: degrade
version: 1
last_updated: 2026-07-29
---

# PREREQ-BROWSER-PROVIDER — Browser Provider

## Purpose

Live, programmatic access to the application under test through a browser — navigation, interaction,
and observation (DOM/accessibility snapshots, screenshots, network capture) — plus the CLI-owned
operations around a generated suite (execution, recording, trace inspection).

This is a **capability**, not a tool. It names *what* a Skill needs, never *how* it is provided.

## Why a Skill needs it

| Skill | Uses it for |
|---|---|
| `explorer` | Browser Discovery Mode — the preferred mode for observing the live application |
| `manual-execution` | executing manually-designed test case steps against the live environment |
| `automation` | selector verification during generation (never for executing what it generates) |
| `automation-execution` | running the approved suite and collecting evidence |

## Detection

```js
const browser = require('<repo>/platform_core/tools/browser_provider');
const caps = browser.capabilities();   // { id, engine, integration, ...per-operation booleans }
```

The check is **capability-level, not tool-level**: a Skill asks "is `persistentSession` available?"
or "is `runSuite` available?", never "is Playwright installed?". The active provider is resolved from
`browserProvider` in `platform.config.json`.

Concrete providers that can satisfy this capability are listed in `satisfied_by`. Today that is
[`PREREQ-PLAYWRIGHT`](PREREQ-PLAYWRIGHT.md), covering both the `playwright-node` and `playwright-cli`
providers. A future Selenium, BrowserBase, or remote-grid provider is added by shipping a provider
module and adding its prerequisite ID here — **no Skill changes.**

## If absent

`absence_behavior: degrade` — but what "degrade" means is per-Skill and already specified:

- **`explorer`** — falls back through its documented Discovery Mode chain (existing screenshots,
  recordings, user-guided exploration, documentation, APIs), discloses which mode was used, and caps
  achievable Confidence accordingly. It never stops merely because no browser is available.
- **`manual-execution`** — cannot execute UI steps. Affected test cases are recorded `Blocked` with
  the missing capability named; it never reports a result it did not observe.
- **`automation`** — generates without live selector verification and records that in its Self
  Review and Known Limitations; selector confidence is explicitly lowered rather than assumed.
- **`automation-execution`** — halts. Executing a suite is the entire stage; there is no degraded
  form of it.

**A partially-capable provider is not an absent one.** If the configured provider lacks the specific
operation a Skill needs, the interface raises `UNSUPPORTED_OPERATION` naming the operation, the
active provider, and which provider does support it. The Skill treats that as a Stop Condition and
reports it — never a silent degradation, never a fabricated observation.

## What this prerequisite is not

- **Not "Playwright".** Playwright is one engine behind one set of providers. A Skill that names
  Playwright has re-coupled itself to an implementation.
- **Not an MCP server.** A Playwright MCP server was previously named in Skill prose as an example
  browser tool. It is removed from the architecture entirely; nothing in the platform depends on it.
- **Not credentials or an environment.** *Which* application, *which* URL, and *whose* login are
  project configuration (`{{PROJECT_ROOT}}/run_configuration.md`,
  `{{PROJECT_ROOT}}/browser/profile.json`, `{{PROJECT_ROOT}}/credentials/`), not a platform prerequisite.
- **Not a raw browser handle.** A Skill uses the interface's session operations and never reaches for
  a provider-specific object such as a Playwright `page`.

## Related

- [`../tools/browser_provider/interface.md`](../tools/browser_provider/interface.md) — the provider contract and capability matrix.
- [`../tools/browser_provider/README.md`](../tools/browser_provider/README.md) — the layer's design, the profile/screens/credentials split, generated output.
- [`PREREQ-PLAYWRIGHT.md`](PREREQ-PLAYWRIGHT.md) — the concrete prerequisite satisfying this capability today.
