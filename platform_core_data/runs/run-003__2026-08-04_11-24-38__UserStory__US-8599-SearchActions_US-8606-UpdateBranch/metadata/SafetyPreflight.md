# Safety Preflight

Written before the test runner was invoked, as required by `automation-execution-skill` §14A.2.

---

# EXEC-BR-20260815-07 — TC-BR-057 and TC-BR-058

| Field | Value |
|---|---|
| Execution ID | `EXEC-BR-20260815-07` |
| Run | `run-003__2026-08-04_11-24-38__UserStory__US-8599-SearchActions_US-8606-UpdateBranch` |
| Module | `branch` |
| Environment | Staging (STG), `http://192.168.1.70` |
| Scope | `BranchActions_TC` — TC-BR-057 and TC-BR-058 only |
| Mode | **Headed** (operator choice) |
| Preflight run at | 2026-08-15 (+03:00) |

## 1. Operations these two tests declare

| Test | Actions | Ownership |
|---|---|---|
| TC-BR-058 | CREATE, SUBMIT, **APPROVE** | SelfCreated |
| TC-BR-057 | CREATE, SUBMIT, **REJECT** | SelfCreated |

## 2. What the preflight found — one action was not authorized

**The four authorizations in force covered CREATE, UPDATE, SUBMIT and APPROVE. None covered
`REJECT`.** TC-BR-057 rejects a branch, so it had no grant to run under.

This is exactly the case §14A exists to catch: `Automation = Approved` made the test an asset, but it
never authorized the business mutation the test performs. The two are decided by different mechanisms,
and discovering the gap by executing the rejection would have defeated the point of the check.

| Test | Preflight decision | Basis |
|---|---|---|
| TC-BR-058 | **Allowed, executed immediately** | `AUTH-BRANCH-CREATE/SUBMIT/APPROVE-SelfCreated`, all in force |
| TC-BR-057 | **Held** until authorized, then Allowed | No REJECT grant existed; one was requested and granted |

## 3. The authorization requested and granted

```
AUTH-BRANCH-REJECT-SelfCreated
  environment   Staging
  module        branch
  action        REJECT
  ownership     SelfCreated
  targetScope   all SelfCreated records in branch for this run
  decision      Allowed
  approvedBy    ahmed.ayman@tildetech.ae
  approvedAt    2026-08-15
```

Asked as **one scoped question**, not one per test, per §14A.2 step 3. The narrower of the two options
offered was taken: rejection is permitted only on records this run created. **Rejecting any
pre-existing branch remains forbidden**, which matters on a shared Staging environment where other
teams' records sit in the same grid.

## 4. Tests deselected by policy

**None.** After the REJECT grant, every action both tests perform resolves `Allowed`. No test was
withheld from the runner and no result is recorded as `Skipped — Execution Safety Policy`.

## 5. Enforcement strength — stated honestly

Enforcement here is at **suite preflight** and **test selection**. It is not per operation.

Maven driving SHAFT/TestNG is an external process; once it starts there is no interception point
inside it. If a test performed an action its declared set did not mention, nothing here would stop it
mid-run. That is why the declared operation list in §1 is load-bearing rather than documentation.

No framework-level pre-action hook is in use in this project, so no per-operation defence in depth is
claimed for this execution.

## 6. Records these tests create

Two Branch records named `QA_<nanoTime>`, one per test, each created by the test that acts on it and
confirmed by exact Branch Code before any action is taken (`BranchProvisioner`, REPAIR-BR-014). One
ends `Approved`, one ends `Rejected`. Both are left in place — deletion is not authorized and no test
attempts it.
