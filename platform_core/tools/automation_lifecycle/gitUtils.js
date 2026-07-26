// Git Utilities — thin execFileSync('git', [...]) wrappers shared by baselineCopy.js, mergePlan.js,
// and mergeApply.js. Mirrors platform_core/tools/run_manager/migrate.js's own approach: no git
// library, array-form args (never a shell string) to avoid injection/quoting issues, cwd always
// pinned explicitly rather than relying on process.cwd().
//
// WHICH REPOSITORY. The platform is installed into the repository it tests (pipeline.md §13), so
// "the repository" is no longer a single obvious thing. This module used to derive one from
// `__dirname/../../..` — which, once installed inside a host project, aimed `git commit` at the
// HOST's history. The repository is therefore an explicit argument now: a GitRepo handle from
// discoverRepo(), threaded through every call, with two hard guarantees:
//
//   1. assertSameRepo() — every write verifies its paths resolve inside repo.root, so a Target
//      Project path can never reach `git add`. Generated automation is left in the target's working
//      tree for the host team to commit with their own conventions (pipeline.md §13.3).
//   2. Honest degradation — when git is unavailable (no repository, or the host gitignores the tool
//      folder) reads return documented "no git" values and writes throw, rather than reporting a
//      successful merge that never happened.
//
// Every function takes ABSOLUTE paths; relInRepo() does the conversion at the boundary.

const path = require('path');

class GitUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GitUnavailableError';
  }
}

class GitWriteForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GitWriteForbiddenError';
  }
}

class RepoBoundaryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RepoBoundaryError';
  }
}

/**
 * @typedef {Object} GitRepo
 * @property {string|null} root  Absolute POSIX git toplevel, or null when `available` is false.
 * @property {boolean} available false ⇒ every read returns its documented "no git" value and every
 *                               write throws GitUnavailableError.
 * @property {boolean} writable  false ⇒ reads work, writes throw GitWriteForbiddenError.
 * @property {'tool-repo'|'host-repo'|'off'} mode
 * @property {string} reason     Human-readable provenance, surfaced in the Merge Summary.
 */

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** The nearest existing ancestor directory of `absPath` — a baseline may not exist yet. */
function nearestExistingDir(absPath, fsImpl) {
  let dir = path.resolve(absPath);
  for (;;) {
    if (fsImpl.existsSync(dir)) {
      try {
        if (fsImpl.statSync(dir).isDirectory()) return dir;
      } catch {
        // unreadable — fall through to the parent
      }
      return path.dirname(dir);
    }
    const parent = path.dirname(dir);
    if (parent === dir) return dir;
    dir = parent;
  }
}

/** `git check-ignore` against an explicit root, used during discovery before a GitRepo exists. */
function isIgnoredRaw(root, absPath, execFileSync) {
  try {
    execFileSync('git', ['check-ignore', '--no-index', '-q', path.resolve(absPath)], { cwd: root });
    return true;
  } catch {
    // exit 1 => not ignored. Anything else during discovery is treated the same way: we are
    // establishing capability, and a probe failure must not masquerade as "ignored".
    return false;
  }
}

/**
 * Identifies which git repository governs `absPath`, and whether the lifecycle may write to it.
 *
 * Never throws for "not a repository" — that is a supported, degraded configuration, not an error.
 *
 * @param {string} absPath
 * @param {{execFileSync: Function, fs?: object, gitMode?: string, dataRoot?: string}} deps
 *   `gitMode` comes from platform.config.json's `git.mode`; 'off' short-circuits every git call.
 *   `dataRoot` enables the gitignore probe and the host-repo commit boundary (see gitCommit).
 * @returns {GitRepo}
 */
function discoverRepo(absPath, deps) {
  const { execFileSync } = deps;
  const fsImpl = deps.fs || require('fs');
  const gitMode = deps.gitMode || 'auto';

  if (gitMode === 'off') {
    return {
      root: null,
      available: false,
      writable: false,
      mode: 'off',
      reason: 'git.mode is "off" in platform.config.json — the lifecycle runs filesystem-only.',
    };
  }

  const cwd = nearestExistingDir(absPath, fsImpl);

  let root;
  try {
    root = toPosix(
      execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf8' }).trim(),
    );
  } catch {
    return {
      root: null,
      available: false,
      writable: false,
      mode: 'off',
      reason:
        `No git repository governs ${toPosix(path.resolve(absPath))} — three-way conflict ` +
        'detection and baseline protection are unavailable. Run `agentic-testing init ' +
        '--git-mode tool-repo` to give the tool folder its own repository.',
    };
  }

  if (!root) {
    return {
      root: null,
      available: false,
      writable: false,
      mode: 'off',
      reason: `git reported no toplevel for ${toPosix(cwd)}.`,
    };
  }

  // Is the tool's data folder gitignored by the repository we just found? This is the trap a naive
  // implementation falls into: `git status --porcelain -- <ignored path>` returns empty, so the
  // baseline reads as CLEAN when it was never tracked at all, and `git log -1 -- <path>` returns
  // empty, so every merge looks like a first-ever promotion. Both are vacuously true and deeply
  // misleading, so detect the case and degrade honestly instead.
  const probe = deps.dataRoot || absPath;
  if (isIgnoredRaw(root, probe, execFileSync)) {
    return {
      root,
      available: false,
      writable: false,
      mode: 'off',
      reason:
        `${toPosix(path.resolve(probe))} is gitignored by the repository at ${root} — git-based ` +
        'baseline protection is unavailable, so concurrent-run conflicts cannot be detected. Run ' +
        '`agentic-testing init --git-mode tool-repo` to give the tool folder its own nested ' +
        'repository and restore full lifecycle protection.',
    };
  }

  // 'tool-repo' vs 'host-repo' is about WHOSE history this is: a repository whose toplevel lies
  // inside the tool's own data folder is the tool's; anything containing it is the host team's.
  let mode = gitMode;
  if (gitMode === 'auto') {
    const dataRoot = deps.dataRoot ? toPosix(path.resolve(deps.dataRoot)) : null;
    const rootIsInsideTool =
      dataRoot !== null && (root === dataRoot || root.startsWith(`${dataRoot}/`));
    const toolIsInsideRoot = dataRoot !== null && dataRoot.startsWith(`${root}/`);
    mode = rootIsInsideTool || !toolIsInsideRoot ? 'tool-repo' : 'host-repo';
  }

  return {
    root,
    available: true,
    writable: true,
    mode,
    reason: `git repository at ${root} (mode: ${mode})`,
  };
}

/**
 * POSIX path of `absPath` relative to `repo.root`.
 * @throws {RepoBoundaryError} when `absPath` resolves outside the repository.
 * @throws {GitUnavailableError} when no repository is available.
 */
function relInRepo(repo, absPath) {
  if (!repo || !repo.root) {
    throw new GitUnavailableError(
      `Cannot resolve ${toPosix(path.resolve(absPath))} against a repository: none is available. ${
        repo ? repo.reason : 'No GitRepo handle was provided.'
      }`,
    );
  }
  const abs = path.resolve(absPath);
  const rel = toPosix(path.relative(repo.root, abs));
  if (rel === '') return '.';
  if (rel.startsWith('../') || rel === '..' || path.isAbsolute(rel)) {
    throw new RepoBoundaryError(
      `Path escapes its repository: ${toPosix(abs)} is not inside ${repo.root}. The automation ` +
        'lifecycle only ever operates on the repository governing platform_core_data/; generated ' +
        'automation in the Target Project is written to disk and never staged or committed by the ' +
        'platform (pipeline.md §13.3).',
    );
  }
  return rel;
}

/** Throw unless EVERY path resolves inside `repo.root`. Called at the top of every write. */
function assertSameRepo(repo, absPaths) {
  for (const p of absPaths) relInRepo(repo, p);
}

function assertAvailable(repo, operation) {
  if (!repo || !repo.available) {
    throw new GitUnavailableError(
      `Cannot ${operation}: no git repository is available. ${repo ? repo.reason : ''}`.trim(),
    );
  }
}

function assertWritable(repo, operation) {
  assertAvailable(repo, operation);
  if (!repo.writable) {
    throw new GitWriteForbiddenError(`Refusing to ${operation}: ${repo.reason}`);
  }
}

/**
 * The commit hash of the last commit that touched `absPath`, or null if no commit ever has
 * (a brand-new, never-yet-committed baseline). Deliberately path-scoped (`-- <path>`), never a
 * bare `git rev-parse HEAD` — this may be a monorepo, so an unrelated commit anywhere else in the
 * repository must never look like a change to this specific baseline.
 * @param {GitRepo} repo
 * @param {string} absPath
 * @param {{execFileSync: Function}} deps
 * @returns {string|null} null when git is unavailable.
 */
function getPathScopedRef(repo, absPath, { execFileSync }) {
  if (!repo || !repo.available) return null;
  const rel = relInRepo(repo, absPath);
  const out = execFileSync('git', ['log', '-1', '--format=%H', '--', rel], { cwd: repo.root, encoding: 'utf8' }).trim();
  return out || null;
}

/**
 * True only if `absPath` has zero uncommitted changes (per `git status --porcelain`). A dirty
 * baseline — e.g. a human hand-edited a file directly, outside the pipeline — must hard-block a
 * merge rather than being silently overwritten; hash-based conflict detection alone can't catch
 * this, since an uncommitted edit never advances the path-scoped commit hash.
 *
 * Returns true when git is unavailable. That is not a claim of cleanliness — there is simply no
 * uncommitted-change concept without git — and computeMergePlan separately marks the whole plan
 * `degradedMode: 'no-git'`, so the absence of protection is reported rather than implied.
 * @param {GitRepo} repo
 * @param {string} absPath
 * @param {{execFileSync: Function}} deps
 * @returns {boolean}
 */
function isPathClean(repo, absPath, { execFileSync }) {
  if (!repo || !repo.available) return true;
  const rel = relInRepo(repo, absPath);
  const out = execFileSync('git', ['status', '--porcelain', '--', rel], { cwd: repo.root, encoding: 'utf8' });
  return out.trim() === '';
}

/**
 * True if `absPath` would be excluded by any applicable .gitignore (repository-root or nested within
 * the package itself — real, confirmed example: tests_SHAFT ships its own nested .gitignore
 * excluding target/, allure-results/, execution-summary/, generatedReport*.zip). Evaluated via
 * `--no-index` so it works even for a path that was never staged/committed — the normal state of a
 * freshly-generated run's working copy before its first merge.
 *
 * Returns false when git is unavailable, so nothing is classified "discarded untracked" in a
 * degraded run.
 * @param {GitRepo} repo
 * @param {string} absPath
 * @param {{execFileSync: Function}} deps
 * @returns {boolean}
 */
function isIgnored(repo, absPath, { execFileSync }) {
  if (!repo || !repo.available) return false;
  try {
    execFileSync('git', ['check-ignore', '--no-index', '-q', path.resolve(absPath)], { cwd: repo.root });
    return true; // exit 0 => ignored
  } catch (err) {
    if (err.status === 1) return false; // exit 1 => not ignored (the expected non-match case)
    throw err; // exit 128 etc. => a real git error, must not be swallowed as "not ignored"
  }
}

/**
 * File content at `absOrRelPath` as it existed at `ref`, or null if that path didn't exist at that
 * commit (e.g. it was added after the snapshot was taken), or if git is unavailable.
 *
 * Accepts an already-repository-relative POSIX path as well as an absolute one: reconstructing
 * historical content means naming paths that no longer exist on disk, which path.resolve can't help
 * with.
 * @param {GitRepo} repo
 * @param {string} ref
 * @param {string} absOrRelPath
 * @param {{execFileSync: Function}} deps
 * @returns {Buffer|null}
 */
function showFileAtRef(repo, ref, absOrRelPath, { execFileSync }) {
  if (!repo || !repo.available) return null;
  const rel = path.isAbsolute(absOrRelPath) ? relInRepo(repo, absOrRelPath) : toPosix(absOrRelPath);
  try {
    return execFileSync('git', ['show', `${ref}:${rel}`], { cwd: repo.root });
  } catch (err) {
    if (err.status === 128) return null;
    throw err;
  }
}

/**
 * Every tracked file under `absOrRelDirPath` as it existed at `ref`, relative to that directory
 * itself (not to the repository root) — used to reconstruct "base" content for a three-way merge
 * when the baseline has moved since this run's snapshot was taken (git show can reconstruct
 * historical content by commit hash; the working tree cannot, since it was overwritten by whichever
 * run merged since).
 * @param {GitRepo} repo
 * @param {string} ref
 * @param {string} absOrRelDirPath
 * @param {{execFileSync: Function}} deps
 * @returns {string[]} empty when git is unavailable.
 */
function listFilesAtRef(repo, ref, absOrRelDirPath, { execFileSync }) {
  if (!repo || !repo.available) return [];
  const relDir = path.isAbsolute(absOrRelDirPath)
    ? relInRepo(repo, absOrRelDirPath)
    : toPosix(absOrRelDirPath);
  const out = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', relDir], { cwd: repo.root, encoding: 'utf8' });
  const prefix = relDir.endsWith('/') ? relDir : `${relDir}/`;
  return out.split(/\r?\n/).filter(Boolean).map((p) => (p.startsWith(prefix) ? p.slice(prefix.length) : p));
}

/** @param {GitRepo} repo @param {string} absPath @param {{execFileSync: Function}} deps */
function gitAdd(repo, absPath, { execFileSync }) {
  assertWritable(repo, 'git add');
  execFileSync('git', ['add', '--', relInRepo(repo, absPath)], { cwd: repo.root });
}

/** @param {GitRepo} repo @param {string} absPath @param {{execFileSync: Function}} deps */
function gitRm(repo, absPath, { execFileSync }) {
  assertWritable(repo, 'git rm');
  execFileSync('git', ['rm', '-q', '--', relInRepo(repo, absPath)], { cwd: repo.root });
}

/**
 * Both endpoints must lie in the same repository — a cross-repository move is not a rename.
 * @param {GitRepo} repo
 * @param {string} fromAbsPath
 * @param {string} toAbsPath
 * @param {{execFileSync: Function}} deps
 */
function gitMv(repo, fromAbsPath, toAbsPath, { execFileSync }) {
  assertWritable(repo, 'git mv');
  assertSameRepo(repo, [fromAbsPath, toAbsPath]);
  execFileSync('git', ['mv', relInRepo(repo, fromAbsPath), relInRepo(repo, toAbsPath)], { cwd: repo.root });
}

/**
 * Commits, scoped to exactly `absPaths` via a trailing pathspec — NEVER a bare `git commit`. A
 * repository's index can (and, in practice, does) hold unrelated staged changes from other,
 * concurrent work at the moment a merge runs; a bare `git commit` would sweep those into the
 * automation-merge commit too. `git commit -- <pathspec>` commits only the given paths' staged
 * state, leaving every other staged/unstaged change in the index untouched for its own later commit.
 *
 * When `repo.mode === 'host-repo'` the platform is committing into the application team's own
 * history, so two extra conditions apply: `deps.commitBaseline` must not be false, and every path
 * must lie under `deps.dataRoot`. Process artifacts may be versioned there by explicit
 * configuration; generated automation in the Target Project never is (pipeline.md §13.3).
 * @param {GitRepo} repo
 * @param {string} message
 * @param {string[]} absPaths
 * @param {{execFileSync: Function, dataRoot?: string, commitBaseline?: boolean}} deps
 */
function gitCommit(repo, message, absPaths, deps) {
  const { execFileSync } = deps;
  if (!Array.isArray(absPaths) || absPaths.length === 0) {
    throw new TypeError('gitCommit requires a non-empty absPaths array — a merge must never fall back to committing the whole index');
  }
  assertWritable(repo, 'git commit');
  assertSameRepo(repo, absPaths);
  assertHostRepoCommitAllowed(repo, absPaths, deps);

  const rels = absPaths.map((p) => relInRepo(repo, p));
  execFileSync('git', ['commit', '-m', message, '--', ...rels], { cwd: repo.root });
}

/**
 * In host-repo mode the platform is writing into the application team's own history, so the commit
 * is confined to the platform's own artifacts under dataRoot. Generated automation in the Target
 * Project is never committed by the platform (pipeline.md §13.3).
 */
function assertHostRepoCommitAllowed(repo, absPaths, deps) {
  if (repo.mode !== 'host-repo') return;

  if (deps.commitBaseline === false) {
    throw new GitWriteForbiddenError(
      'Refusing to commit: git.commitBaseline is false, so baseline files are written but never ' +
        'committed. Commit them yourself, or set git.commitBaseline to true.',
    );
  }
  if (!deps.dataRoot) {
    throw new GitWriteForbiddenError(
      'Refusing to commit into the host repository without a configured dataRoot: there would be ' +
        "no boundary confining the commit to the platform's own artifacts (pipeline.md §13.3).",
    );
  }

  const dataRoot = path.resolve(deps.dataRoot);
  for (const p of absPaths) {
    const abs = path.resolve(p);
    const rel = path.relative(dataRoot, abs);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw new GitWriteForbiddenError(
        `Refusing to commit ${toPosix(abs)} into the host repository at ${repo.root}: it lies ` +
          `outside dataRoot (${toPosix(dataRoot)}). In host-repo mode the platform may only ` +
          'commit its own process artifacts (pipeline.md §13.3).',
      );
    }
  }
}

module.exports = {
  discoverRepo,
  relInRepo,
  assertSameRepo,
  getPathScopedRef,
  isPathClean,
  isIgnored,
  showFileAtRef,
  listFilesAtRef,
  gitAdd,
  gitRm,
  gitMv,
  gitCommit,
  GitUnavailableError,
  GitWriteForbiddenError,
  RepoBoundaryError,
};
