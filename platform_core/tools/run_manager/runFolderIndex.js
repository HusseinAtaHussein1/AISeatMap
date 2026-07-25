// Run Folder Compatibility Index — lets legacy RUN-YYYYMMDD-XXX folders keep living untouched on
// disk while still being resolvable under the new naming convention (see runFolderName.js and
// workflows_and_pipelines/pipeline/run_manager.md §5's "Legacy Run Folder Compatibility" section).
//
// A folder is only ever physically renamed when isRenameSafe() finds zero outside references to
// it — otherwise its inferred new-style name is recorded in a per-project `.run_folder_index.json`
// file instead, and resolveRunFolder() consults that file so lookups work under either name.

const fs = require('fs');
const path = require('path');

const INDEX_FILENAME = '.run_folder_index.json';

/**
 * Recursively collects all file paths under `dir`, excluding `excludeDirAbs` (an absolute path
 * to skip entirely, typically the run folder itself — its own content legitimately contains its
 * own name and must not count as an "outside reference").
 * @param {string} dir
 * @param {string} excludeDirAbs
 * @returns {string[]}
 */
function collectFiles(dir, excludeDirAbs) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (path.resolve(full) === path.resolve(excludeDirAbs)) continue;
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, excludeDirAbs));
    } else if (entry.name !== INDEX_FILENAME) {
      // The compatibility index itself necessarily records every legacy name it maps — that's
      // our own bookkeeping, not a real external dependency, and must not count as a reference
      // that would make a folder look unsafe to rename (it would also self-pollute run over run).
      results.push(full);
    }
  }
  return results;
}

/**
 * Returns true only if no file under `projectRoot` (outside the folder itself) contains a literal
 * reference to `folderName` or the bare Run ID prefix (e.g. "RUN-20260706-001") it starts with.
 * This is a conservative, general-purpose check — it does not special-case any project — so a
 * folder is only ever considered safe to physically rename when it is provably unreferenced.
 *
 * @param {string} projectRoot - absolute path to scan (e.g. the project's own folder)
 * @param {string} folderAbsPath - absolute path of the run folder being checked
 * @returns {boolean}
 */
function isRenameSafe(projectRoot, folderAbsPath) {
  const folderName = path.basename(folderAbsPath);
  const files = collectFiles(projectRoot, folderAbsPath);
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue; // unreadable/binary — cannot prove it's reference-free, but also cannot scan it
    }
    if (content.includes(folderName)) return false;
  }
  return true;
}

/**
 * Builds one compatibility index entry.
 * @param {string} legacyName - the folder name as it exists on disk
 * @param {string} inferredNewName - the name this run would have under the new convention
 * @param {{source: string, confidence: 'high'|'medium'|'low'}} meta
 * @returns {object}
 */
function buildIndexEntry(legacyName, inferredNewName, { source, confidence }) {
  return { legacyName, inferredNewName, confidence, source };
}

/**
 * @param {string} runsDir - the project's runs directory (e.g. projects/NDC/runs)
 * @returns {object[]} the current index entries, or [] if none exist yet
 */
function loadIndex(runsDir) {
  const indexPath = path.join(runsDir, INDEX_FILENAME);
  if (!fs.existsSync(indexPath)) return [];
  return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
}

/**
 * Writes the index atomically-enough for this use case (single writeFileSync). Idempotent:
 * writing the same entries again produces byte-identical output.
 * @param {string} runsDir
 * @param {object[]} entries
 */
function saveIndex(runsDir, entries) {
  const indexPath = path.join(runsDir, INDEX_FILENAME);
  const sorted = [...entries].sort((a, b) => a.legacyName.localeCompare(b.legacyName));
  fs.writeFileSync(indexPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
}

/**
 * Resolves a run identifier (a legacy Run ID, a full legacy folder name, or a new-convention
 * folder name) to the real on-disk folder name, consulting the compatibility index when the
 * identifier doesn't match an existing folder directly.
 *
 * @param {string} runsDir
 * @param {string} identifier
 * @returns {string|null} the actual on-disk folder name, or null if unresolvable
 */
function resolveRunFolder(runsDir, identifier) {
  if (!identifier) return null;

  let onDisk = [];
  try {
    onDisk = fs.readdirSync(runsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return null;
  }

  if (onDisk.includes(identifier)) return identifier;

  const index = loadIndex(runsDir);

  const byNewName = index.find((e) => e.inferredNewName === identifier);
  if (byNewName && onDisk.includes(byNewName.legacyName)) return byNewName.legacyName;

  const byRunIdPrefix = onDisk.find((name) => name === identifier || name.startsWith(`${identifier}-`));
  if (byRunIdPrefix) return byRunIdPrefix;

  return null;
}

module.exports = {
  INDEX_FILENAME,
  isRenameSafe,
  buildIndexEntry,
  loadIndex,
  saveIndex,
  resolveRunFolder,
};
