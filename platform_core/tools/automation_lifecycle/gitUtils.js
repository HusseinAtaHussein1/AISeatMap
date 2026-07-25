// Git Utilities — thin execFileSync('git', [...]) wrappers shared by baselineCopy.js, mergePlan.js,
// and mergeApply.js. Mirrors platform_core/tools/run_manager/migrate.js's own approach: no git
// library, array-form args (never a shell string) to avoid injection/quoting issues, cwd always
// pinned explicitly rather than relying on process.cwd().

const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..', '..');

/**
 * The commit hash of the last commit that touched `relPath`, or null if no commit ever has
 * (a brand-new, never-yet-committed baseline). Deliberately path-scoped (`-- relPath`), never a
 * bare `git rev-parse HEAD` — this is a monorepo, so an unrelated commit anywhere else in the
 * repository must never look like a change to this specific baseline.
 * @param {string} relPath - path relative to REPO_ROOT
 * @param {{execFileSync: Function}} deps
 * @returns {string|null}
 */
function getPathScopedRef(relPath, { execFileSync }) {
  const out = execFileSync('git', ['log', '-1', '--format=%H', '--', relPath], { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  return out || null;
}

/**
 * True only if `relPath` has zero uncommitted changes (per `git status --porcelain`). A dirty
 * baseline — e.g. a human hand-edited a file directly, outside the pipeline — must hard-block a
 * merge rather than being silently overwritten; hash-based conflict detection alone can't catch
 * this, since an uncommitted edit never advances the path-scoped commit hash.
 * @param {string} relPath
 * @param {{execFileSync: Function}} deps
 * @returns {boolean}
 */
function isPathClean(relPath, { execFileSync }) {
  const out = execFileSync('git', ['status', '--porcelain', '--', relPath], { cwd: REPO_ROOT, encoding: 'utf8' });
  return out.trim() === '';
}

/**
 * True if `absPath` would be excluded by any applicable .gitignore (repo-root or nested within the
 * package itself — real, confirmed example: NDC_tests_SHAFT ships its own nested .gitignore
 * excluding target/, allure-results/, execution-summary/, generatedReport*.zip). Evaluated via
 * `--no-index` so it works even for a path that was never staged/committed — the normal state of a
 * freshly-generated run's working copy before its first merge.
 * @param {string} absPath
 * @param {{execFileSync: Function}} deps
 * @returns {boolean}
 */
function isIgnored(absPath, { execFileSync }) {
  try {
    execFileSync('git', ['check-ignore', '--no-index', '-q', absPath], { cwd: REPO_ROOT });
    return true; // exit 0 => ignored
  } catch (err) {
    if (err.status === 1) return false; // exit 1 => not ignored (the expected non-match case)
    throw err; // exit 128 etc. => a real git error, must not be swallowed as "not ignored"
  }
}

/**
 * File content at `relPath` as it existed at `ref`, or null if that path didn't exist at that
 * commit (e.g. it was added after the snapshot was taken).
 * @param {string} ref
 * @param {string} relPath
 * @param {{execFileSync: Function}} deps
 * @returns {Buffer|null}
 */
function showFileAtRef(ref, relPath, { execFileSync }) {
  try {
    return execFileSync('git', ['show', `${ref}:${relPath}`], { cwd: REPO_ROOT });
  } catch (err) {
    if (err.status === 128) return null;
    throw err;
  }
}

/**
 * Every tracked file under `relDirPath` as it existed at `ref`, relative to `relDirPath` itself
 * (not to REPO_ROOT) — used to reconstruct "base" content for a three-way merge when the baseline
 * has moved since this run's snapshot was taken (git show can reconstruct historical content by
 * commit hash; the working tree cannot, since it was overwritten by whichever run merged since).
 * @param {string} ref
 * @param {string} relDirPath
 * @param {{execFileSync: Function}} deps
 * @returns {string[]}
 */
function listFilesAtRef(ref, relDirPath, { execFileSync }) {
  const out = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', relDirPath], { cwd: REPO_ROOT, encoding: 'utf8' });
  const prefix = relDirPath.endsWith('/') ? relDirPath : `${relDirPath}/`;
  return out.split(/\r?\n/).filter(Boolean).map((p) => (p.startsWith(prefix) ? p.slice(prefix.length) : p));
}

/** @param {string} relPath @param {{execFileSync: Function}} deps */
function gitAdd(relPath, { execFileSync }) {
  execFileSync('git', ['add', '--', relPath], { cwd: REPO_ROOT });
}

/** @param {string} relPath @param {{execFileSync: Function}} deps */
function gitRm(relPath, { execFileSync }) {
  execFileSync('git', ['rm', '-q', '--', relPath], { cwd: REPO_ROOT });
}

/**
 * @param {string} fromRelPath
 * @param {string} toRelPath
 * @param {{execFileSync: Function}} deps
 */
function gitMv(fromRelPath, toRelPath, { execFileSync }) {
  execFileSync('git', ['mv', fromRelPath, toRelPath], { cwd: REPO_ROOT });
}

/**
 * Commits, scoped to exactly `relPaths` via a trailing pathspec — NEVER a bare `git commit`. This
 * repository's index can (and, in practice, does) hold unrelated staged changes from other,
 * concurrent work at the moment a merge runs; a bare `git commit` would sweep those into the
 * automation-merge commit too. `git commit -- <pathspec>` commits only the given paths' staged
 * state, leaving every other staged/unstaged change in the index untouched for its own later commit.
 * @param {string} message
 * @param {string[]} relPaths
 * @param {{execFileSync: Function}} deps
 */
function gitCommit(message, relPaths, { execFileSync }) {
  if (!Array.isArray(relPaths) || relPaths.length === 0) {
    throw new TypeError('gitCommit requires a non-empty relPaths array — a merge must never fall back to committing the whole index');
  }
  execFileSync('git', ['commit', '-m', message, '--', ...relPaths], { cwd: REPO_ROOT });
}

module.exports = {
  REPO_ROOT,
  getPathScopedRef,
  isPathClean,
  isIgnored,
  showFileAtRef,
  listFilesAtRef,
  gitAdd,
  gitRm,
  gitMv,
  gitCommit,
};
