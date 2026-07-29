// Step 1 of the Automation Asset Lifecycle (pipeline.md §12.3). Seeds a destination package from the
// current Workspace Automation Baseline before any generation begins, and records the baseline's git
// ref at that moment (the "snapshot") so a later merge can tell whether anything else has merged into
// the same baseline since.
//
// AS OF 2026-07-29 the destination is a MODULE AUTOMATION PROJECT,
// platform_core_data/modules/{slug}/automation/tests_{Framework}/ — durable, standalone, and reused in
// place across runs (pipeline.md §12.1). Use copyBaselineIntoModule().
//
// The mechanism is destination-agnostic and always was: it copies a directory and records a
// path-scoped ref. That is why this revision adds a name rather than a second implementation — two
// copies of the ref-capture logic would be two things to keep in agreement about what a snapshot
// means. copyBaselineIntoRun() is retained as a deprecated alias for pre-migration callers.
//
// NOTE ON STATE: for a module project, the authoritative lifecycle record is
// .module_automation_state.json (module_manager/automationState.js), whose `baselineRef` carries the
// same anchor this snapshot does. The snapshot file remains for callers that have no module.

const fs = require('fs');
const path = require('path');
const { getPathScopedRef, discoverRepo } = require('./gitUtils');

const SNAPSHOT_FILENAME = '.lifecycle_snapshot.json';
const SNAPSHOT_SCHEMA_VERSION = 2;

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/**
 * `baselinePath` is recorded relative to `deps.dataRoot` when one is configured, so the snapshot
 * survives the tool folder being moved or renamed — it is a location within the platform's own data,
 * not within whatever repository happens to contain it. Falls back to an absolute POSIX path.
 */
function recordedBaselinePath(baselineAbsPath, dataRoot) {
  if (!dataRoot) return { path: toPosix(path.resolve(baselineAbsPath)), root: 'absolute' };
  const rel = toPosix(path.relative(path.resolve(dataRoot), path.resolve(baselineAbsPath)));
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return { path: toPosix(path.resolve(baselineAbsPath)), root: 'absolute' };
  }
  // The identity case yields '', which reads as "no path" downstream — normalize to '.', matching
  // platform_paths' relativeWithin().
  return { path: rel === '' ? '.' : rel, root: 'data' };
}

/**
 * Seeds `destPackageAbsPath` from the baseline and records the snapshot beside it.
 *
 * @param {string} baselineAbsPath
 * @param {string} destPackageAbsPath - where the package being worked on should live: a module
 *   automation project (current) or a run working copy (pre-migration).
 * @param {{fs?: object, execFileSync: Function, now: Date, repo?: object, gitMode?: string,
 *          dataRoot?: string}} deps
 *   `repo` is the GitRepo governing the baseline; omitted, it is discovered from the baseline path.
 * @returns {{copied: boolean, baselineRef: string|null, snapshotPath: string, repo: object}}
 */
function copyBaselineInto(baselineAbsPath, destPackageAbsPath, deps) {
  const fsImpl = deps.fs || fs;
  if (!(deps.now instanceof Date)) {
    throw new TypeError('copyBaselineInto requires deps.now (a Date) — pass it explicitly, never default to new Date() internally so callers/tests stay deterministic');
  }

  const runPackageAbsPath = destPackageAbsPath;
  const baselineExists = fsImpl.existsSync(baselineAbsPath);
  let baselineRef = null;
  // Discovered only when there is a baseline to inspect: a greenfield run must not shell out to git
  // at all (the existing tests assert exactly that).
  let repo = deps.repo || null;

  if (baselineExists) {
    fsImpl.cpSync(baselineAbsPath, runPackageAbsPath, { recursive: true });
    if (!repo) repo = discoverRepo(baselineAbsPath, deps);
    baselineRef = getPathScopedRef(repo, baselineAbsPath, deps);
  }

  const recorded = recordedBaselinePath(baselineAbsPath, deps.dataRoot);
  const snapshot = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    baselinePath: recorded.path,
    baselinePathRoot: recorded.root,
    baselineRef,
    // Recorded so a later merge can detect that git was available when the snapshot was taken but
    // is not now — that combination is a hard block, never a silent downgrade (pipeline.md §12.4).
    gitAvailable: Boolean(repo && repo.available),
    gitMode: repo ? repo.mode : null,
    repoRoot: repo ? repo.root : null,
    copiedAt: deps.now.toISOString(),
  };
  const snapshotPath = path.join(path.dirname(runPackageAbsPath), SNAPSHOT_FILENAME);
  fsImpl.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fsImpl.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  return { copied: baselineExists, baselineRef, snapshotPath, repo };
}

/**
 * Seeds a **Module Automation Project** from the baseline (pipeline.md §12.3) — the sanctioned entry
 * point since 2026-07-29.
 *
 * Idempotence is the CALLER's responsibility, deliberately: a module project is reused in place
 * across runs (`automation-skill` §11D.3), so a second Stage 4A pass must NOT re-seed over the
 * project it already has. Check for an existing project first; seed only when there is none. Making
 * that decision here would require this function to guess whether an existing directory is a
 * half-finished seed or a suite someone has been working on for six runs.
 *
 * @param {string} baselineAbsPath
 * @param {string} modulePackageAbsPath - modules/{slug}/automation/tests_{Framework}/
 * @param {object} deps - as copyBaselineInto()
 * @returns {{copied: boolean, baselineRef: string|null, snapshotPath: string, repo: object}}
 */
function copyBaselineIntoModule(baselineAbsPath, modulePackageAbsPath, deps) {
  return copyBaselineInto(baselineAbsPath, modulePackageAbsPath, deps);
}

/**
 * The pre-2026-07-29 entry point, retained so existing callers and in-flight runs keep working.
 * @deprecated The run working copy is removed (pipeline.md §12.1). Use copyBaselineIntoModule().
 */
function copyBaselineIntoRun(baselineAbsPath, runPackageAbsPath, deps) {
  return copyBaselineInto(baselineAbsPath, runPackageAbsPath, deps);
}

/**
 * Reads a previously-written snapshot file (see copyBaselineInto above).
 *
 * A schemaVersion 1 snapshot (written before the two-root refactor) has no `schemaVersion`,
 * `gitAvailable`, `gitMode`, or `repoRoot`. It is normalized rather than rejected: an in-flight run
 * created before an upgrade must still be mergeable. `gitAvailable` defaults to true because a v1
 * snapshot could only have been written by a build that required git unconditionally.
 * @param {string} snapshotPath
 * @param {{fs?: object}} [deps]
 * @returns {object|null}
 */
function loadSnapshot(snapshotPath, { fs: fsImpl = fs } = {}) {
  if (!fsImpl.existsSync(snapshotPath)) return null;
  const raw = JSON.parse(fsImpl.readFileSync(snapshotPath, 'utf8'));

  if (raw.schemaVersion === undefined) {
    return {
      ...raw,
      schemaVersion: 1,
      baselinePathRoot: raw.baselinePathRoot || 'legacy-repo-relative',
      gitAvailable: raw.gitAvailable === undefined ? true : raw.gitAvailable,
      gitMode: raw.gitMode === undefined ? null : raw.gitMode,
      repoRoot: raw.repoRoot === undefined ? null : raw.repoRoot,
    };
  }
  return raw;
}

module.exports = {
  SNAPSHOT_FILENAME,
  SNAPSHOT_SCHEMA_VERSION,
  copyBaselineInto,
  copyBaselineIntoModule,
  copyBaselineIntoRun,
  loadSnapshot,
};
