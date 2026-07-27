// Target Project code-state anchor — "what did the application under test look like when this run
// was created, and what has moved since?"
//
// WHY THIS EXISTS
// A run's artifacts describe the application as it was when the run executed. Revisit that run six
// months later and its findings may describe code that no longer exists. Before this module, run.json
// carried 26 fields and not one of them anchored the app's code state (every `*Version` field is a
// *platform spec* version), so "is this run still current?" could only ever be asked of a human
// (`workflows_and_pipelines/workflows/user_story_run.md` Step 1). This module makes it computable.
//
// SCOPE BOUNDARY — read carefully.
// `pipeline.md` §6 Rule 9 / §13 forbid using the Target Project's commit history "as a source of
// intent": requirements, business rules, acceptance criteria, and expected behaviour never come from
// code or history. This module does not do that and must never be extended to. It reads commit
// identity ONLY as a staleness marker — the same category as reading source to understand a selector
// or a route, which that section explicitly permits as "a technical fact". It answers "did these
// paths change?", never "what should the expected behaviour be?".
//
// It is strictly READ-ONLY against the Target Project: `git log` / `git diff --name-only` and nothing
// else. It never stages, commits, or writes anything in the target repo — that prohibition
// (`pipeline.md` §13.3) is unaffected.
//
// See workflows_and_pipelines/pipeline/run_manager.md §5.8.

const path = require('path');

/** Marker used when the target has no resolvable git repo — recorded, never guessed around. */
const NO_GIT = null;

function toPosix(p) {
  return String(p).split(path.sep).join('/');
}

/**
 * Resolves the git repository governing the Target Project.
 *
 * Deliberately separate from automation_lifecycle's `discoverRepo`, which asserts every path lies
 * inside the repo governing `platform_core_data/` (`relInRepo`/`assertSameRepo` throw otherwise).
 * That boundary is correct for the automation baseline — it must never commit into the host's
 * history — but it makes a target-side query impossible, so this reads the target's repo through its
 * own handle and grants itself no write capability at all.
 *
 * @param {string} targetRoot - absolute path to the Target Project root
 * @param {{execFileSync: Function}} deps
 * @returns {{root: string|null, available: boolean, reason: string}}
 */
function discoverTargetRepo(targetRoot, { execFileSync }) {
  try {
    const root = toPosix(
      execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: targetRoot, encoding: 'utf8' }).trim()
    );
    if (!root) {
      return { root: null, available: false, reason: `git returned no toplevel for ${toPosix(targetRoot)}` };
    }
    return { root, available: true, reason: `git repository at ${root}` };
  } catch {
    return {
      root: null,
      available: false,
      reason:
        `No git repository governs the Target Project at ${toPosix(targetRoot)} — ` +
        'run drift cannot be computed, and every run records targetRef: null. ' +
        'This is reported, never inferred: an unversioned target is not the same as an unchanged one.',
    };
  }
}

/**
 * The commit that last touched `relPaths` (or the whole repo when none given).
 *
 * Path-scoped by default for the same reason the automation lifecycle scopes its baseline ref: in a
 * monorepo, an unrelated commit elsewhere must not look like a change to the code under test.
 *
 * @param {{root: string|null, available: boolean}} repo
 * @param {string[]} relPaths - repo-relative paths; empty means repo-wide
 * @param {{execFileSync: Function}} deps
 * @returns {string|null} commit SHA, or null when git is unavailable / nothing ever touched the paths
 */
function getTargetRef(repo, relPaths, { execFileSync }) {
  if (!repo || !repo.available) return NO_GIT;
  const args = ['log', '-1', '--format=%H'];
  if (relPaths && relPaths.length) args.push('--', ...relPaths);
  try {
    return execFileSync('git', args, { cwd: repo.root, encoding: 'utf8' }).trim() || NO_GIT;
  } catch {
    return NO_GIT;
  }
}

/**
 * Captures the anchor to embed in a new run's run.json.
 *
 * `scopePaths` should be the in-scope paths the run actually covers, when known; an empty list yields
 * a repo-wide ref, which is coarser but still usable. `capturedAt` is passed in rather than read from
 * the clock, matching generateRunFolderName/setActiveRun's explicit-`now` contract.
 *
 * @param {string} targetRoot
 * @param {{scopePaths?: string[], capturedAt: Date, execFileSync: Function}} opts
 * @returns {{targetRef: string|null, targetRefScope: string[], targetRefCapturedAt: string, targetRepoRoot: string|null, targetRefReason: string}}
 */
function captureTargetRef(targetRoot, opts) {
  const { scopePaths = [], capturedAt, execFileSync } = opts;
  if (!(capturedAt instanceof Date) || Number.isNaN(capturedAt.getTime())) {
    throw new TypeError('captureTargetRef requires an explicit valid `capturedAt` Date.');
  }
  const repo = discoverTargetRepo(targetRoot, { execFileSync });
  const targetRef = getTargetRef(repo, scopePaths, { execFileSync });
  return {
    targetRef,
    targetRefScope: scopePaths,
    targetRefCapturedAt: capturedAt.toISOString(),
    targetRepoRoot: repo.root,
    targetRefReason: repo.available
      ? (targetRef ? repo.reason : `${repo.reason} — no commit has touched the scoped paths yet`)
      : repo.reason,
  };
}

/**
 * How many commits landed between `fromRef` and now, restricted to `relPaths`.
 * @returns {number|null} null when uncomputable (no git, unknown ref)
 */
function countCommitsSince(repo, fromRef, relPaths, { execFileSync }) {
  if (!repo || !repo.available || !fromRef) return null;
  const args = ['rev-list', '--count', `${fromRef}..HEAD`];
  if (relPaths && relPaths.length) args.push('--', ...relPaths);
  try {
    const out = execFileSync('git', args, { cwd: repo.root, encoding: 'utf8' }).trim();
    const n = Number(out);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null; // e.g. the recorded ref no longer exists (history rewritten, shallow clone)
  }
}

/**
 * Which files changed between `fromRef` and now, restricted to `relPaths`.
 * @returns {string[]|null} null when uncomputable
 */
function changedPathsSince(repo, fromRef, relPaths, { execFileSync }) {
  if (!repo || !repo.available || !fromRef) return null;
  const args = ['diff', '--name-only', `${fromRef}..HEAD`];
  if (relPaths && relPaths.length) args.push('--', ...relPaths);
  try {
    const out = execFileSync('git', args, { cwd: repo.root, encoding: 'utf8' });
    return out.split('\n').map((l) => l.trim()).filter(Boolean);
  } catch {
    return null;
  }
}

/**
 * The drift report: what changed in the Target Project since a run was created.
 *
 * Every "unknown" is reported as its own state, never collapsed into "no drift" — an unversioned or
 * unresolvable target is not the same as an unchanged one, and treating it as unchanged is exactly
 * how a stale run's findings get silently trusted.
 *
 * @param {string} targetRoot
 * @param {{targetRef: string|null, targetRefScope?: string[], targetRefCapturedAt?: string}} anchor - from run.json
 * @param {{execFileSync: Function}} deps
 * @returns {{status: 'unchanged'|'moved'|'unknown-no-git'|'unknown-no-anchor'|'unknown-unresolvable',
 *            commitsSince: number|null, changedPaths: string[]|null, currentRef: string|null,
 *            recordedRef: string|null, scope: string[], summary: string}}
 */
function computeDrift(targetRoot, anchor, { execFileSync }) {
  const scope = (anchor && anchor.targetRefScope) || [];
  const recordedRef = (anchor && anchor.targetRef) || null;
  const repo = discoverTargetRepo(targetRoot, { execFileSync });

  if (!repo.available) {
    return {
      status: 'unknown-no-git', commitsSince: null, changedPaths: null,
      currentRef: null, recordedRef, scope,
      summary: 'Target Project has no resolvable git repository — drift cannot be computed. ' +
        'Treat this run\'s findings as unverified against current code, not as current.',
    };
  }

  if (!recordedRef) {
    return {
      status: 'unknown-no-anchor', commitsSince: null, changedPaths: null,
      currentRef: getTargetRef(repo, scope, { execFileSync }), recordedRef: null, scope,
      summary: 'This run recorded no targetRef (created before code-state anchoring, or with git ' +
        'unavailable) — drift cannot be computed. Its findings are unverified against current code.',
    };
  }

  const currentRef = getTargetRef(repo, scope, { execFileSync });
  const commitsSince = countCommitsSince(repo, recordedRef, scope, { execFileSync });

  if (commitsSince === null) {
    return {
      status: 'unknown-unresolvable', commitsSince: null, changedPaths: null,
      currentRef, recordedRef, scope,
      summary: `Recorded targetRef ${recordedRef.slice(0, 7)} cannot be resolved in the Target ` +
        'Project\'s current history (rewritten, shallow clone, or a different repository) — ' +
        'drift cannot be computed.',
    };
  }

  const changedPaths = changedPathsSince(repo, recordedRef, scope, { execFileSync }) || [];

  if (commitsSince === 0 && changedPaths.length === 0) {
    return {
      status: 'unchanged', commitsSince: 0, changedPaths: [], currentRef, recordedRef, scope,
      summary: 'Target Project is unchanged in the scoped paths since this run was created.',
    };
  }

  const scopeNote = scope.length ? `${scope.length} scoped path(s)` : 'the whole repository';
  return {
    status: 'moved', commitsSince, changedPaths, currentRef, recordedRef, scope,
    summary:
      `Target Project moved since this run: ${commitsSince} commit(s) and ` +
      `${changedPaths.length} changed file(s) across ${scopeNote}. ` +
      'Findings and test cases touching these paths need re-verification before reuse.',
  };
}

module.exports = {
  discoverTargetRepo,
  getTargetRef,
  captureTargetRef,
  countCommitsSince,
  changedPathsSince,
  computeDrift,
};
