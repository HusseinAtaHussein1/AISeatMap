// Cleanup — Step 4 of the Automation Asset Lifecycle (pipeline.md §12). Removes a run's working
// copy of a package's source/build content ONLY for files the Merge Plan actually accounted for
// (merged tracked files + explicitly-logged discarded/ignored files) — never a blind recursive
// delete, so nothing can vanish from the run without a corresponding line in the Merge Summary.

const fs = require('fs');
const path = require('path');

/**
 * @param {object} plan - the Merge Plan (or the subset actually applied, if some files were held
 *   back for an unresolved conflict — those must be excluded from the caller's `plan` so they stay
 *   in the run until a follow-up merge resolves them)
 * @returns {string[]} every relative path this cleanup pass is allowed to delete
 */
function accountedForPaths(plan) {
  return [
    ...plan.added,
    ...plan.modified,
    ...plan.deleted,
    ...plan.renamed.map((r) => r.from),
    ...plan.discardedIgnored,
  ];
}

/**
 * @param {string} workingCopyAbsPath
 * @param {object} plan
 * @param {{fs?: object, apply?: boolean}} [deps]
 * @returns {{wouldDelete: string[], deleted: string[]}}
 */
function cleanupRunPackage(workingCopyAbsPath, plan, deps = {}) {
  const fsImpl = deps.fs || fs;
  const apply = Boolean(deps.apply);
  const candidates = accountedForPaths(plan);

  if (!apply) {
    return { wouldDelete: candidates, deleted: [] };
  }

  const deleted = [];
  for (const rel of candidates) {
    const absPath = path.join(workingCopyAbsPath, rel);
    if (fsImpl.existsSync(absPath)) {
      fsImpl.rmSync(absPath, { recursive: true, force: true });
      deleted.push(rel);
    }
  }

  // Remove now-empty directories left behind, deepest first — but only within the working copy
  // itself, never anything above it.
  removeEmptyDirs(workingCopyAbsPath, fsImpl);

  return { wouldDelete: candidates, deleted };
}

/**
 * @param {string} dirAbsPath
 * @param {object} fsImpl
 * @returns {boolean} true if `dirAbsPath` itself is now empty and was removed
 */
function removeEmptyDirs(dirAbsPath, fsImpl) {
  let entries;
  try {
    entries = fsImpl.readdirSync(dirAbsPath, { withFileTypes: true });
  } catch {
    return false;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      removeEmptyDirs(path.join(dirAbsPath, entry.name), fsImpl);
    }
  }
  const remaining = fsImpl.readdirSync(dirAbsPath);
  if (remaining.length === 0) {
    fsImpl.rmdirSync(dirAbsPath);
    return true;
  }
  return false;
}

module.exports = { accountedForPaths, cleanupRunPackage };
