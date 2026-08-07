# Browser Provider Interface

The contract every Browser Provider implements, and the **only** browser surface a Skill may use.

> **A Skill never invokes Playwright, Selenium, or any other browser tool directly. A Skill never
> chooses a browser technology.** It calls this interface. The concrete provider is resolved from
> `platform.config.json`. Whether that provider drives the browser through a language library or a
> CLI is the provider's internal decision, invisible to every Skill.

---

## 1. Why an interface and not a direct dependency

Before this abstraction, the platform's browser access was a direct dependency on one specific
mechanism, and Skill specifications named a specific tool (including a Playwright MCP server) in
their own text. That coupled three unrelated questions together:

| Question | Whose decision |
|---|---|
| *What does this stage need the browser to do?* | the Skill |
| *Which engine drives the browser?* | `platform.config.json` |
| *Library call or CLI invocation?* | the provider, internally |

Separating them means a new engine is a new provider file plus one config value — never an edit to
any of the eight Skills.

## 1.1 A provider is an actuator, never an authorizer

*(Added 2026-08-07 — `pipeline.md` §14.7.)*

There is a fourth question, and it belongs to none of the three above:

| Question | Whose decision |
|---|---|
| *Is this action authorized to execute here, now?* | **the Execution Safety policy** — never a provider |

```text
Execution Skill → Execution Safety → authorized operation → Browser Provider
```

**No business authorization rule may live in a provider, in `browser_driver/`, or in
`platform.config.json`.** A provider that knew "don't click Delete on staging" would be a second,
invisible policy competing with the real one — reachable only through this interface, invisible to
`doctor`, untested against the decision matrix, and silently bypassed the moment a stage used a
different provider or a framework's own runner.

By the time a call reaches this interface, the decision has already been made. A provider's job is to
click the thing it was asked to click.

Technical interception inside a provider (refusing a known-destructive selector, say) is legitimate
only as **defence in depth** — never as the control itself, and never as a reason to skip evaluation
upstream.

## 2. Provider registration

```json
{
  "browserProvider": "playwright-node",
  "browserProviders": {
    "playwright-node": { "module": "platform_core/tools/browser_provider/providers/playwright_node" },
    "playwright-cli":  { "module": "platform_core/tools/browser_provider/providers/playwright_cli",
                         "command": "npx playwright" }
  }
}
```

A provider module exports:

| Field | Type | Meaning |
|---|---|---|
| `id` | string | provider id, matching its registry key |
| `engine` | string | underlying engine (`playwright`, `selenium`, …) |
| `integration` | string | `node-library` \| `cli` \| `remote` — informational; never branched on by a Skill |
| `capabilities` | object | honest per-operation `true`/`false` map |
| `createSession(opts)` | async fn | returns a session object, or throws `UNSUPPORTED_OPERATION` |
| `runSuite`, `codegen`, `screenshot`, `showTrace`, `version` | fn | operation implementations, where supported |

## 3. Interface-level operations

| Operation | Purpose | Notes |
|---|---|---|
| `createSession({env, headless, projectRoot})` | authenticated, persistent session | requires `capabilities.persistentSession` |
| `runSuite({suiteDir, grep, mode, reporter})` | execute a generated automation suite | reports/results go to the generated-output directory |
| `codegen({url, outputFile})` | record a script | output goes to the generated-output directory |
| `screenshot({url, name, fullPage})` | one-shot, unauthenticated capture | authenticated screens need a session instead |
| `showTrace({tracePath})` | open a recorded trace | |
| `version()` | engine/CLI version | used by the Playwright prerequisite check |
| `capabilities()` | the active provider's honest capability map | how a Skill asks "can you do X?" |

## 4. Session operations

A session returned by `createSession()` exposes exactly these. The interface **validates** their
presence and refuses a non-conforming provider rather than failing later at the call site.

`useScreen` · `useComponent` · `navigate` · `click` · `type` · `select` · `screenshot` ·
`extractText` · `extractTable` · `waitFor` · `captureNetwork` · `takePendingDialog` · `close`

Screen/Component locator knowledge is loaded from `{{PROJECT_ROOT}}/browser/screens/` and
`.../components/`; `click`/`type`/etc. accept either a dotted key into the loaded set or a literal
selector.

**A Skill must not reach past these operations** into a provider-specific handle (e.g. a Playwright
`page`). Doing so re-couples the Skill to one engine and defeats the abstraction.

## 5. Unsupported operations fail loudly

A provider that cannot perform an operation raises an error with `code: 'UNSUPPORTED_OPERATION'`,
naming the operation, the active provider, and which provider does support it.

```
Browser Provider "playwright-cli" does not support "createSession".
Provider "playwright-node" does support persistent sessions.
Change "browserProvider" in platform.config.json, or use an operation this provider supports.
```

**Never** a silent degradation, a no-op, or a fabricated result. A Skill that hits this halts and
reports the missing capability as a Stop Condition — exactly as it would for any other missing
prerequisite (see `platform_core/prerequisites/PREREQ-BROWSER-PROVIDER.md`).

## 6. Capability matrix — providers shipped today

| Operation | `playwright-node` | `playwright-cli` |
|---|---|---|
| persistent session | ✅ | ❌ |
| authenticate / navigate / click / type / select | ✅ | ❌ |
| extractText / extractTable / waitFor | ✅ | ❌ |
| captureNetwork / dialog guardrail | ✅ | ❌ |
| captureBaseline (UI Knowledge Base) | ✅ | ❌ |
| screenshot | ✅ (session, authenticated) | ✅ (one-shot, unauthenticated) |
| runSuite | ❌ | ✅ |
| codegen | ❌ | ✅ |
| showTrace | ❌ | ✅ |

The two are complementary, not redundant: interactive stages need a session; suite execution,
recording, and trace inspection are genuinely CLI operations. Both are Playwright; neither is
exposed to a Skill as "Playwright".

## 7. Adding a provider

1. Create `providers/{id}/index.js` exporting the fields in §2.
2. Declare honest `capabilities` — an overstated capability is worse than a missing one.
3. If it supports sessions, return an object implementing every §4 operation.
4. Register it under `browserProviders` in `platform.config.json`.
5. Write generated artifacts only under `resolvePaths().generatedPlaywright`-style isolated output.

No Skill, pipeline document, or workflow changes.

## 8. Guardrails every provider must preserve

- **Dialogs are dismissed, never accepted** — a destructive confirmation must never be silently confirmed.
- **Credentials are read at call time, held in local variables, never logged or written to an artifact.**
- **Generated artifacts land in the isolated, gitignored generated-output directory** — never mixed
  with maintained source code.
- **No project directory name is hardcoded** — every path comes from `project_paths`.

## Related

- [`README.md`](README.md) — layer overview, the four-way responsibility split, credentials rules.
- [`../project_paths/README.md`](../project_paths/README.md) — how `{{PROJECT_ROOT}}` and the generated-output directory resolve.
- [`../../prerequisites/PREREQ-BROWSER-PROVIDER.md`](../../prerequisites/PREREQ-BROWSER-PROVIDER.md) — the prerequisite Skills reference instead of naming a tool.
