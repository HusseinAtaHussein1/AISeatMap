# Playwright — Workspace Automation Baseline

Per the Automation Asset Lifecycle (`workflows_and_pipelines/pipeline/pipeline.md` §12, added 2026-07-24), this folder is the authoritative, persistent Workspace Automation Baseline location for a NDC Playwright package, whenever one exists — this is the same lifecycle model now governing `../shaft/`, not a Playwright-specific exception.

**No Playwright package has been promoted here.** The only Playwright automation generated for NDC to date — `projects/NDC/runs/RUN-20260712-001/automation/NDC_tests/` (JavaScript, 3-case Login suite, TC-LOGIN-001–003) — predates the finalized 8-case Login suite and was never carried forward or re-approved; per `../NDC_AutomationPackages.md`, it "should not be treated as complete or current." It was intentionally **not** included in the 2026-07-24 bootstrap migration (only the two SHAFT packages were), so this folder starts empty under the new lifecycle, exactly as it was under the old one.

A future Playwright run that clears Automation Approval (`pipeline.md` §5.2) will populate this folder via the ordinary Workspace Merge (`pipeline.md` §12.4) — no special-case handling is needed for this to happen.
