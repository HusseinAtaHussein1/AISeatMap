---
id: PREREQ-GIT
name: Git
kind: tool
scope: platform
required_by: [automation]
optional_for: [automation-execution]
detection: "git --version, plus git rev-parse --is-inside-work-tree for the target tree"
absence_behavior: halt
version: 1
last_updated: 2026-07-29
---

# PREREQ-GIT — Git

## Purpose

Version-control operations the Automation Asset Lifecycle depends on: recording a baseline snapshot,
classifying a three-way merge, staging adds/deletes/renames, and distinguishing tracked from ignored
files.

## Why a Skill needs it

| Skill | Uses it for |
|---|---|
| `automation` | Working Copy Creation records the baseline's path-scoped commit hash; the Workspace Merge is a real merge, not a file copy |
| `automation-execution` | optional — only when a confirmed repair is merged back into the baseline |

The lifecycle's specific dependencies:

- `git log -1 --format=%H -- <baseline-path>` — the **path-scoped** baseline snapshot. A bare repo
  `HEAD` is wrong here: this is a monorepo, and an unrelated commit elsewhere must never look like a
  baseline change.
- `git status --porcelain` — the hard pre-check that blocks a merge into a dirty baseline.
- `git show <hash>:<path>` — reconstructs the `base` side of a three-way classification.
- `git add` / `git rm` / `git mv` — writing the merge.
- `git check-ignore --no-index` — classifying untracked/ignored files so generated build output is
  reported as Discarded Untracked rather than silently merged or silently dropped.

## Detection

```bash
git --version
git rev-parse --is-inside-work-tree      # in the baseline/working-copy tree
```

Both must succeed. A tree that is not a work tree fails the second check even when Git itself is
installed.

## If absent

`absence_behavior: halt`. Without Git, the Automation Asset Lifecycle cannot function safely:

- No baseline snapshot means the conflict check has no `base`, so a two-way diff would silently
  delete another run's already-merged work.
- No `status --porcelain` means a dirty baseline could be overwritten without warning.
- No `check-ignore` means generated build output would be indistinguishable from source.

Each of those is a data-loss path, so the Skill stops and reports `PREREQ-GIT` rather than
substituting a plain file copy. Generation into a run's working copy may still proceed; the **merge**
is what halts.

## What this prerequisite is not

- **Not a remote, a credential, or a push.** Everything above is local. The platform never pushes,
  and never commits on a human's behalf outside the explicitly-approved Workspace Merge.
- **Not a requirement for the application under test.** This is about the platform's own repository.

## Related

- [`../../workflows_and_pipelines/pipeline/pipeline.md`](../../workflows_and_pipelines/pipeline/pipeline.md) §12 — the Automation Asset Lifecycle.
- [`../tools/automation_lifecycle/`](../tools/automation_lifecycle/) — the implementation.
