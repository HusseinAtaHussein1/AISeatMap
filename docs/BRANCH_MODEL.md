# Branch Model — Tool Development vs Platform Testing

*(Established 2026-08-07.)*

The repository keeps **two long-lived branches with intentionally different tracked contents.**

```text
Tool Development  =  Reusable Product
Platform Testing  =  Reusable Product + Dogfooding Environment + Project Data + Execution Evidence
```

| Branch | Contains | `platform_core_data` | Declares |
|---|---|---|---|
| **`tool-development`** | The reusable platform: Skills, workflows, `platform_core/`, templates, tests, docs, packaging | **zero tracked files** | `.toolonly` |
| **`platform-testing`** | Everything above, **plus** the real project data used to validate it | tracked, deliberately | `.platformdata` |

`platform-testing` answers *"does the platform actually work in realistic usage?"*. `tool-development`
answers *"what would I distribute?"* — and a fresh clone of it gives a developer the product without a
single byte of anyone's project evidence.

---

## 1. The normal workflow

```text
    feature/*
        │
        │  PR
        ▼
  tool-development          ← the reusable Tool's source of truth
        │
        │  git merge tool-development
        ▼
  platform-testing          ← receives the Tool change, keeps its own data
        │
        ▼
  real platform validation  ← run the pipeline against real modules and runs
```

Concretely:

```bash
# 1. Build the Tool change
git checkout tool-development
git checkout -b feature/my-improvement
#    …work, commit…
git checkout tool-development
git merge feature/my-improvement

# 2. Promote it for validation — a plain merge, nothing special
git checkout platform-testing
git merge tool-development
npm run verify:boundary        # proves the project data survived

# 3. Validate against real data, then report defects back to tool-development
```

**Tool source flows down. Project evidence never flows back.**

## 2. Why `platform-testing` must never be merged backward

A blind `git merge platform-testing` while on `tool-development` reintroduces 900+ project files into
the distributable product, and nothing about that merge looks wrong in a diff summary.

`npm run verify:boundary` catches it. But the correct habit is simpler: if a Tool fix was made while
you were on `platform-testing`, promote **only the Tool-owned files**:

```bash
git checkout tool-development
git cherry-pick <the-tool-only-commit>
#   …or, for a mixed commit:
git checkout platform-testing -- path/to/tool/file.js
```

That is exception behaviour, not normal workflow. Tool changes belong on `tool-development` from the
start.

## 3. The one-time baseline merge — why it exists

`tool-development` was created **from** the current working state by deleting `platform_core_data`.
That deletion is a real commit in its history, so the first time `tool-development` is merged into
`platform-testing`, git faithfully replays it and **deletes every run, module and piece of execution
evidence.**

This was proven before it could happen, with a read-only simulation:

```bash
git merge-tree --write-tree platform-testing tool-development
#   -> platform_core_data files in the resulting tree: 0
```

The fix is a **single deliberate merge**, performed once, which resolves that conflict by *keeping*
`platform_core_data` and *rejecting* `.toolonly`. That merge commit records "this branch has seen the
Tool boundary and does not adopt it." It then becomes the merge base for every future promotion, so
subsequent merges never replay the deletion.

**This is normal git behaviour, not a workaround.** A merge commit is exactly how git records a
decision about a conflict, and this decision needs to be recorded once rather than re-made — and
possibly got wrong — on every promotion.

After the baseline merge, `git merge tool-development` is safe and routine. If the data-loss guard
ever fires on a routine promotion, the baseline merge is missing from that branch's history.

## 4. The boundary declarations

Each branch declares what it is, with a committed file:

| File | Declares | Invariant enforced |
|---|---|---|
| `.toolonly` | Tool Development | `git ls-files platform_core_data` → **empty** |
| `.platformdata` | Platform Testing | `platform_core_data` carries its tracked data |

**Declaration files rather than branch names, deliberately.** A `if (branch === 'tool-development')`
check misses every `feature/*` branch cut from it — precisely the branches most likely to breach the
boundary — and silently disables itself on a detached HEAD or after a rename. A file is inherited by
anything branched from it, so the check follows the work rather than the label.

A tree carrying **both** declarations is a contradiction and fails: it means `tool-development` was
merged into `platform-testing` without rejecting `.toolonly`.

```bash
npm run verify:boundary     # also runs as part of prepack
```

The check is a repository validation, not a git hook. Nothing is installed into `.git/`, so CI and a
developer run the same command.

## 5. Why not `.gitignore`

`.gitignore` controls **untracked** files; it does not untrack anything already committed. The
separation here is real Git-tree state, achieved with `git rm --cached`.

A branch-specific `.gitignore` would also be actively harmful: it is versioned, so it diverges between
the two branches and creates merge friction — and if a `platform_core_data/` ignore rule ever reached
`platform-testing`, it would silently ignore **new** project data on the branch whose entire purpose is
to track it.

Local untracked noise in a dual-purpose working copy belongs in `.git/info/exclude`, which is
per-clone and cannot merge anywhere. A fresh clone of `tool-development` does not need it: the
directory simply does not exist there.

## 6. Superseded branches

**`Tool_latest_Update` is superseded by this model.** It was an earlier attempt at the same
separation — its commit message reads *"chore: strip run output and remove projects/ — tooling
snapshot"* — but it retains 66 tracked `platform_core_data` files, so it never reached the zero
invariant, and it has no enforcement to keep it there.

It is **left untouched, not renamed and not deleted**: it holds one commit that is not in the current
line, and discarding it could lose that work. Use `tool-development` for all new Tool work.

## 7. What has *not* changed

The old branches — including `execution_round_1`, `main`, and every `feature/*` — are untouched. This
model adds a separation; it does not retire anything.

---

**Canonical invariants**

```text
tool-development:   git ls-files platform_core_data   ->  EMPTY
platform-testing:   platform_core_data                ->  tracked and intact
both:               reusable Tool source identical, except the declaration files
```
