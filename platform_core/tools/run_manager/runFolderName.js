// Run Folder Naming — the single source of truth for generating and parsing run folder names.
//
// Convention (see workflows_and_pipelines/pipeline/run_manager.md §5):
//   YYYY-MM-DD_HH-mm-ss__[Scope]__[Module-or-UserStory]
//
// This module is the only place that formats a run folder name — agents/skills/scripts must
// call generateRunFolderName() (or cli.js) rather than hand-formatting the string themselves.
// Legacy `RUN-YYYYMMDD-XXX(-slug)?` names are recognized by parseRunFolderName() but are never
// produced by this module — see runFolderIndex.js for how legacy folders are resolved/mapped.

const CANONICAL_SCOPES = ['FullRun', 'Regression', 'Smoke', 'Sanity', 'Targeted', 'Module', 'UserStory'];

const DEFAULT_FALLBACK = 'Unknown';
const MAX_SEGMENT_LENGTH = 60;

// Free-text scope/run-type strings actually observed in this platform's run.json/run_configuration.md
// files, mapped onto the canonical scope set. Matching is case-insensitive and substring-based so
// phrasing variants ("Full Regression", "Entire Project") still resolve correctly.
const SCOPE_ALIASES = [
  [/full\s*regression/i, 'Regression'],
  [/regression/i, 'Regression'],
  [/entire\s*project/i, 'FullRun'],
  [/full\s*run/i, 'FullRun'],
  [/smoke/i, 'Smoke'],
  [/sanity/i, 'Sanity'],
  [/user\s*story/i, 'UserStory'],
  [/bug/i, 'Targeted'],
  [/custom/i, 'Targeted'],
  [/targeted/i, 'Targeted'],
  [/feature/i, 'Module'],
  [/module/i, 'Module'],
];

/**
 * Strips characters unsafe for a filesystem folder name, collapses whitespace/separators to a
 * single hyphen-free word-boundary form (spaces become nothing lost — see below), trims stray
 * separators, and caps length. Returns `fallback` if nothing usable remains.
 *
 * Sanitization rules:
 *   - Characters invalid on Windows/POSIX filesystems (\ / : * ? " < > | ) and control characters
 *     are removed.
 *   - Whitespace runs are collapsed to a single space, then spaces are removed (segments read as
 *     PascalCase-ish words already, e.g. "Add Cabin Class Filter" -> "AddCabinClassFilter").
 *   - Leading/trailing `_`/`-`/`.` are trimmed (Windows disallows trailing dots/spaces).
 *   - Result is capped at MAX_SEGMENT_LENGTH characters.
 *
 * @param {*} value
 * @param {string} [fallback]
 * @returns {string}
 */
function sanitizeSegment(value, fallback = DEFAULT_FALLBACK) {
  if (value === null || value === undefined) return fallback;
  let str = String(value).trim();
  if (!str) return fallback;

  // eslint-disable-next-line no-control-regex
  str = str.replace(/[\x00-\x1f\x7f\\/:*?"<>|]/g, '');
  str = str.replace(/\s+/g, ' ').trim();
  str = str.replace(/\s/g, '');
  str = str.replace(/^[-_.]+|[-_.]+$/g, '');

  if (!str) return fallback;
  if (str.length > MAX_SEGMENT_LENGTH) str = str.slice(0, MAX_SEGMENT_LENGTH);

  return str || fallback;
}

/**
 * Normalizes a free-text scope/run-type string onto CANONICAL_SCOPES.
 * - Empty/missing input -> "Unknown" (nothing to infer from).
 * - Non-empty input that matches none of the known aliases -> "Targeted" (a run that only executed
 *   specific tests/scope must never silently read as a full/complete execution).
 * - Input already exactly matching a canonical scope (case-insensitive) is normalized as-is.
 *
 * @param {*} raw
 * @returns {string} one of CANONICAL_SCOPES or "Unknown"
 */
function normalizeScope(raw) {
  if (raw === null || raw === undefined) return DEFAULT_FALLBACK;
  const str = String(raw).trim();
  if (!str) return DEFAULT_FALLBACK;

  const exact = CANONICAL_SCOPES.find((s) => s.toLowerCase() === str.toLowerCase());
  if (exact) return exact;

  for (const [pattern, canonical] of SCOPE_ALIASES) {
    if (pattern.test(str)) return canonical;
  }

  return 'Targeted';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/**
 * Formats a Date as YYYY-MM-DD_HH-mm-ss (local time of the given Date object).
 * @param {Date} date
 * @returns {string}
 */
function formatTimestamp(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('formatTimestamp requires a valid Date instance');
  }
  const y = date.getFullYear();
  const mo = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const h = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const s = pad2(date.getSeconds());
  return `${y}-${mo}-${d}_${h}-${mi}-${s}`;
}

/**
 * Same format as formatTimestamp, but reads UTC fields — used when formatting a timestamp parsed
 * from stored data (e.g. a legacy run's `startedTime`) so migration output is reproducible
 * regardless of which timezone the migration script happens to run in.
 * @param {Date} date
 * @returns {string}
 */
function formatTimestampUTC(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('formatTimestampUTC requires a valid Date instance');
  }
  const y = date.getUTCFullYear();
  const mo = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const h = pad2(date.getUTCHours());
  const mi = pad2(date.getUTCMinutes());
  const s = pad2(date.getUTCSeconds());
  return `${y}-${mo}-${d}_${h}-${mi}-${s}`;
}

/**
 * Builds the folder name from already-resolved parts. Does not sanitize `timestamp` (callers
 * should pass the output of formatTimestamp) but does sanitize scope/target.
 * @param {{timestamp: string, scope: string, target: string}} parts
 * @returns {string}
 */
function buildRunFolderName({ timestamp, scope, target }) {
  if (!timestamp) throw new TypeError('buildRunFolderName requires a timestamp');
  return `${timestamp}__${sanitizeSegment(scope)}__${sanitizeSegment(target)}`;
}

/**
 * Picks the best available "target" (Module/UserStory/Feature) label from a metadata object,
 * in priority order: userStory > module > feature > scopeDescription.
 * @param {object} metadata
 * @returns {*}
 */
function pickTarget(metadata = {}) {
  return (
    metadata.userStory ??
    metadata.userStoryTitle ??
    metadata.module ??
    metadata.moduleName ??
    metadata.feature ??
    metadata.featureName ??
    metadata.target ??
    metadata.scopeDescription ??
    null
  );
}

/**
 * Top-level generator: given run metadata, produces the full run folder name, resolving
 * collisions against `existingNames` with a deterministic numeric suffix.
 *
 * @param {object} metadata
 * @param {string} [metadata.scope] - raw scope/run-type string, normalized via normalizeScope()
 * @param {string} [metadata.target] - explicit target label; if omitted, derived via pickTarget()
 * @param {object} [options]
 * @param {string[]} [options.existingNames] - folder names already present, to avoid collisions
 * @param {Date} [options.now] - the run's start time; required (never defaults to `new Date()`
 *   internally so callers/tests stay deterministic)
 * @returns {string}
 */
function generateRunFolderName(metadata = {}, { existingNames = [], now } = {}) {
  if (!(now instanceof Date)) {
    throw new TypeError('generateRunFolderName requires options.now (a Date) — pass the run\'s start time explicitly');
  }
  const timestamp = formatTimestamp(now);
  const scope = normalizeScope(metadata.scope);
  const target = metadata.target !== undefined && metadata.target !== null
    ? metadata.target
    : pickTarget(metadata);

  let name = buildRunFolderName({ timestamp, scope, target });

  const existing = new Set(existingNames);
  if (existing.has(name)) {
    let i = 2;
    while (existing.has(`${name}__${i}`)) i += 1;
    name = `${name}__${i}`;
  }
  return name;
}

const LEGACY_RE = /^RUN-(\d{8})-(\d{3})(?:-([a-z0-9-]+))?$/i;

/**
 * Parses a run folder name, recognizing both the new convention and the legacy
 * `RUN-YYYYMMDD-XXX(-slug)?` form.
 *
 * @param {string} name
 * @returns {{format: 'new'|'legacy'|'unknown', timestamp?: string, scope?: string, target?: string,
 *   dedupeSuffix?: number, runId?: string, sequence?: string, slug?: string}}
 */
function parseRunFolderName(name) {
  if (typeof name !== 'string' || !name) {
    return { format: 'unknown' };
  }

  const legacyMatch = name.match(LEGACY_RE);
  if (legacyMatch) {
    const [, dateStr, seq, slug] = legacyMatch;
    return {
      format: 'legacy',
      runId: `RUN-${dateStr}-${seq}`,
      sequence: seq,
      timestamp: dateStr,
      slug: slug || undefined,
    };
  }

  const parts = name.split('__');
  const tsRe = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;
  if (parts.length >= 3 && tsRe.test(parts[0])) {
    const [timestamp, scope, ...rest] = parts;
    let target = rest.join('__');
    let dedupeSuffix;
    // A trailing all-numeric segment (from generateRunFolderName's collision suffix) is only
    // treated as a dedupe suffix when there's still at least one segment left for the target.
    if (rest.length >= 2 && /^\d+$/.test(rest[rest.length - 1])) {
      dedupeSuffix = Number(rest[rest.length - 1]);
      target = rest.slice(0, -1).join('__');
    }
    return { format: 'new', timestamp, scope, target, ...(dedupeSuffix ? { dedupeSuffix } : {}) };
  }

  return { format: 'unknown' };
}

module.exports = {
  CANONICAL_SCOPES,
  sanitizeSegment,
  normalizeScope,
  formatTimestamp,
  formatTimestampUTC,
  buildRunFolderName,
  generateRunFolderName,
  parseRunFolderName,
  pickTarget,
};
