// Working Copy Creation — Step 1 of the Automation Asset Lifecycle (pipeline.md §12). Copies the
// current Workspace Automation Baseline into a run's working automation folder before any
// generation begins, and records the baseline's git ref at that moment (the "snapshot") so a later
// merge can tell whether another run has since merged into the same baseline.

const fs = require('fs');
const path = require('path');
const { getPathScopedRef, REPO_ROOT } = require('./gitUtils');

const SNAPSHOT_FILENAME = '.lifecycle_snapshot.json';

/**
 * @param {string} baselineAbsPath
 * @param {string} runPackageAbsPath - where this run's working copy of the package should live
 * @param {{fs?: object, execFileSync: Function, now: Date}} deps
 * @returns {{copied: boolean, baselineRef: string|null, snapshotPath: string}}
 */
function copyBaselineIntoRun(baselineAbsPath, runPackageAbsPath, deps) {
  const fsImpl = deps.fs || fs;
  if (!(deps.now instanceof Date)) {
    throw new TypeError('copyBaselineIntoRun requires deps.now (a Date) — pass it explicitly, never default to new Date() internally so callers/tests stay deterministic');
  }

  const baselineExists = fsImpl.existsSync(baselineAbsPath);
  let baselineRef = null;

  if (baselineExists) {
    fsImpl.cpSync(baselineAbsPath, runPackageAbsPath, { recursive: true });
    const relBaselinePath = path.relative(REPO_ROOT, baselineAbsPath).split(path.sep).join('/');
    baselineRef = getPathScopedRef(relBaselinePath, deps);
  }

  const snapshot = {
    baselinePath: path.relative(REPO_ROOT, baselineAbsPath).split(path.sep).join('/'),
    baselineRef,
    copiedAt: deps.now.toISOString(),
  };
  const snapshotPath = path.join(path.dirname(runPackageAbsPath), SNAPSHOT_FILENAME);
  fsImpl.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fsImpl.writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  return { copied: baselineExists, baselineRef, snapshotPath };
}

/**
 * Reads a previously-written snapshot file (see copyBaselineIntoRun above).
 * @param {string} snapshotPath
 * @param {{fs?: object}} [deps]
 * @returns {object|null}
 */
function loadSnapshot(snapshotPath, { fs: fsImpl = fs } = {}) {
  if (!fsImpl.existsSync(snapshotPath)) return null;
  return JSON.parse(fsImpl.readFileSync(snapshotPath, 'utf8'));
}

module.exports = { SNAPSHOT_FILENAME, copyBaselineIntoRun, loadSnapshot };
