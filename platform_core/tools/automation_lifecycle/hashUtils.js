// Hash Utilities — pure content hashing and directory walking used by mergePlan.js to build
// path->content-hash maps for both trees being compared. Deliberately independent of git: the
// working copy may not be committed yet (the normal state of freshly-generated automation before
// its first merge), so content must be read straight off disk, never via a git blob hash.

const crypto = require('crypto');
const path = require('path');

/**
 * @param {Buffer|string} content
 * @returns {string} sha256 hex digest
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Recursively lists every file under `dirAbsPath`, as absolute paths. Returns [] if the directory
 * doesn't exist (a brand-new package with no baseline yet is a valid, non-error input).
 * @param {string} dirAbsPath
 * @param {{fs?: object}} [deps]
 * @returns {string[]}
 */
function walkFiles(dirAbsPath, { fs = require('fs') } = {}) {
  const out = [];
  let entries;
  try {
    entries = fs.readdirSync(dirAbsPath, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dirAbsPath, entry.name);
    if (entry.name === '.git') continue;
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, { fs }));
    } else {
      out.push(full);
    }
  }
  return out;
}

module.exports = { hashContent, walkFiles };
