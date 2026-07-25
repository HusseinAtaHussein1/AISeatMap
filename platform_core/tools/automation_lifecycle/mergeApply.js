// Workspace Merge — Step 3 of the Automation Asset Lifecycle (pipeline.md §12). Writes the plan
// computed by mergePlan.js into the Workspace Automation Baseline. Dry-run by default, exactly
// like platform_core/tools/run_manager/migrate.js's own --apply gating: the plan is always
// computed and returned; only `apply: true` performs any real filesystem/git mutation.

const fs = require('fs');
const path = require('path');
const {
  gitAdd, gitRm, gitMv, gitCommit, REPO_ROOT,
} = require('./gitUtils');

const LOCK_FILENAME = '.automation_lifecycle.lock';

/**
 * Atomically acquires a merge lock for `baselineAbsPath` — `{flag:'wx'}` fails if the file already
 * exists, which is what makes this safe against two merges racing on the same baseline (pipeline.md
 * §12 Step 3.3). No new dependency needed: this is a standard Node idiom for an exclusive-create lock.
 * @param {string} baselineAbsPath
 * @param {{fs?: object, now: Date}} deps
 * @returns {string} the lock file path (pass to releaseLock when done)
 */
function acquireLock(baselineAbsPath, deps) {
  const fsImpl = deps.fs || fs;
  const lockPath = path.join(baselineAbsPath, LOCK_FILENAME);
  try {
    // The baseline directory may not exist yet — a brand-new package's first-ever merge is
    // exactly this case (there is nothing to lock a race against yet, but the lock file still
    // needs somewhere to live).
    fsImpl.mkdirSync(baselineAbsPath, { recursive: true });
    fsImpl.writeFileSync(lockPath, `${deps.now.toISOString()}\n`, { flag: 'wx' });
  } catch (err) {
    if (err.code === 'EEXIST') {
      throw new Error(`Workspace Merge is locked: another merge is already in progress at ${lockPath}`);
    }
    throw err;
  }
  return lockPath;
}

/**
 * @param {string} lockPath
 * @param {{fs?: object}} [deps]
 */
function releaseLock(lockPath, { fs: fsImpl = fs } = {}) {
  if (fsImpl.existsSync(lockPath)) fsImpl.rmSync(lockPath);
}

/**
 * @param {string} project
 * @param {string} packageName
 * @param {string} runFolder
 * @param {{added: string[], modified: string[], deleted: string[], renamed: object[]}} plan
 * @returns {string}
 */
function buildCommitMessage(project, packageName, runFolder, plan) {
  return `Automation Merge: ${project}/${packageName} from ${runFolder} `
    + `(+${plan.added.length}/~${plan.modified.length}/-${plan.deleted.length}/`
    + `→${plan.renamed.length})`;
}

/**
 * Applies (or, by default, only describes) the merge plan computed by mergePlan.js's
 * computeMergePlan(). Must never be called with unresolved conflicts still in `plan.conflicts` —
 * conflicts have to be resolved (or explicitly excluded from the plan) by the caller first, per
 * pipeline.md §12 Step 3's "never blindly overwrite" rule; this function refuses to proceed
 * otherwise rather than silently dropping or force-applying a conflicting file.
 *
 * @param {string} baselineAbsPath
 * @param {string} workingCopyAbsPath
 * @param {object} plan - from computeMergePlan()
 * @param {{project: string, packageName: string, runFolder: string}} identity
 * @param {{fs?: object, execFileSync: Function, now: Date, apply?: boolean}} deps
 * @returns {{applied: boolean, commitMessage: string}}
 */
function applyMerge(baselineAbsPath, workingCopyAbsPath, plan, identity, deps) {
  const fsImpl = deps.fs || fs;
  const apply = Boolean(deps.apply);
  const commitMessage = buildCommitMessage(identity.project, identity.packageName, identity.runFolder, plan);

  if (!apply) {
    return { applied: false, commitMessage };
  }
  if (plan.dirty.length > 0) {
    throw new Error('Refusing to merge: baseline has uncommitted changes (pipeline.md §12 Step 3.1)');
  }
  if (plan.conflicts.length > 0) {
    throw new Error(`Refusing to merge: ${plan.conflicts.length} unresolved conflict(s) — resolve them first`);
  }

  const relBaseline = path.relative(REPO_ROOT, baselineAbsPath).split(path.sep).join('/');
  const lockPath = acquireLock(baselineAbsPath, deps);
  const touchedPaths = [];

  try {
    for (const rel of plan.added.concat(plan.modified)) {
      const destAbs = path.join(baselineAbsPath, rel);
      fsImpl.mkdirSync(path.dirname(destAbs), { recursive: true });
      fsImpl.copyFileSync(path.join(workingCopyAbsPath, rel), destAbs);
      const relDest = `${relBaseline}/${rel}`;
      gitAdd(relDest, deps);
      touchedPaths.push(relDest);
    }
    for (const rel of plan.deleted) {
      const relDest = `${relBaseline}/${rel}`;
      gitRm(relDest, deps);
      touchedPaths.push(relDest);
    }
    for (const { from, to } of plan.renamed) {
      // git mv only relocates the tracked entry; detectRenames only ever matches on an exact
      // content hash, so the destination's content already equals the working copy's file —
      // nothing further to copy.
      gitMv(`${relBaseline}/${from}`, `${relBaseline}/${to}`, deps);
      touchedPaths.push(`${relBaseline}/${from}`, `${relBaseline}/${to}`);
    }
    // Scoped to touchedPaths only — never a bare `git commit` — so unrelated changes already
    // staged/unstaged elsewhere in this monorepo are never swept into an automation-merge commit.
    gitCommit(commitMessage, touchedPaths, deps);
  } finally {
    releaseLock(lockPath, deps);
  }

  return { applied: true, commitMessage };
}

module.exports = {
  LOCK_FILENAME, acquireLock, releaseLock, buildCommitMessage, applyMerge,
};
