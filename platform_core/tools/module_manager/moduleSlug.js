// Module Slug — the single source of truth for generating and parsing module folder names.
//
// Convention (see workflows_and_pipelines/pipeline/module_architecture.md §5.2):
//   lowercase, hyphen-separated, filesystem-safe, capped at 60 characters
//   "Flight Search" -> "flight-search", "US-245 Cabin Class" -> "us-245-cabin-class"
//
// Sanitization is delegated to run_manager's sanitizeSegment() rather than reimplemented — the
// filesystem-unsafe character set is the same problem in both places, and two copies of it would
// drift. This module only adds the module-specific part: the lowercase/hyphen shape.
//
// A slug is IMMUTABLE once created (§5.2). The human-readable name lives in module.json and may be
// corrected freely without moving the folder; a module that must be re-identified is superseded via
// module.json's `supersededBy`, never renamed on disk.

const { sanitizeSegment } = require('../run_manager/runFolderName');

const MAX_SLUG_LENGTH = 60;
const DEFAULT_FALLBACK = 'unknown-module';

/** Matches a well-formed slug: lowercase alphanumerics in hyphen-separated groups. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

class ModuleSlugError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ModuleSlugError';
  }
}

/**
 * Converts a human-readable module name into its slug.
 *
 * Word boundaries are recovered BEFORE sanitizeSegment() runs, because that function strips spaces
 * entirely ("Flight Search" -> "FlightSearch") which is right for a run folder's PascalCase-ish
 * target segment and wrong here — we need "flight-search", not "flightsearch". So separators and
 * camelCase humps become hyphens first, and sanitizeSegment() then handles the unsafe-character
 * pass on a string that already carries its boundaries.
 *
 * @param {*} value - the module name, e.g. "Flight Search" or "AgencyManagement"
 * @param {string} [fallback]
 * @returns {string} the slug
 */
function generateModuleSlug(value, fallback = DEFAULT_FALLBACK) {
  if (value === null || value === undefined) return fallback;
  let str = String(value).trim();
  if (!str) return fallback;

  // camelCase / PascalCase humps become boundaries: "AgencyManagement" -> "Agency Management".
  // Done before lowercasing, since that is the only point the humps are still visible.
  str = str.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  // An acronym run followed by a word: "PNRLookup" -> "PNR Lookup".
  str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  str = str.toLowerCase();

  // Every separator-ish character becomes a hyphen, so sanitizeSegment() sees boundaries it keeps.
  str = str.replace(/[\s_.+/\\]+/g, '-');
  // Anything left that is neither alphanumeric nor a hyphen is dropped rather than transliterated —
  // guessing at a transliteration would make the slug unpredictable from the name.
  str = str.replace(/[^a-z0-9-]/g, '');
  str = str.replace(/-+/g, '-');
  str = str.replace(/^-+|-+$/g, '');

  if (!str) return fallback;

  // Run the shared sanitizer last as a safety net. It cannot introduce anything invalid here (the
  // string is already [a-z0-9-]), so this is belt-and-braces against a future change to its rules.
  str = sanitizeSegment(str, fallback);
  str = str.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  if (!str) return fallback;
  if (str.length > MAX_SLUG_LENGTH) {
    str = str.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
  }

  return str || fallback;
}

/**
 * True when `slug` is already in canonical form. Used to reject a hand-written slug at the boundary
 * rather than silently normalizing it — a caller passing "Flight_Search" as a slug has made a
 * mistake worth reporting, since the folder it expects will not be the folder that exists.
 * @param {*} slug
 * @returns {boolean}
 */
function isValidModuleSlug(slug) {
  return typeof slug === 'string'
    && slug.length > 0
    && slug.length <= MAX_SLUG_LENGTH
    && SLUG_RE.test(slug);
}

/**
 * Validates a slug, throwing with a corrective suggestion. The suggestion matters: the common error
 * is passing a display name where a slug belongs, and showing the slug that name WOULD produce turns
 * a rejection into an instruction.
 * @param {*} slug
 * @returns {string} the slug, unchanged, when valid
 */
function assertValidModuleSlug(slug) {
  if (isValidModuleSlug(slug)) return slug;
  const suggestion = generateModuleSlug(slug);
  throw new ModuleSlugError(
    `"${slug}" is not a valid module slug (lowercase alphanumerics separated by single hyphens, ` +
    `max ${MAX_SLUG_LENGTH} chars). Did you mean "${suggestion}"?`
  );
}

/**
 * Resolves a caller-supplied identifier onto a slug that exists in `existingSlugs`.
 *
 * Accepts an exact slug, a display name ("Flight Search"), or any casing variant — every one of
 * which a human legitimately types. Returns null when nothing matches, and reports ambiguity rather
 * than picking a winner, mirroring resolveRunFolderStrict()'s contract.
 *
 * @param {string[]} existingSlugs
 * @param {*} identifier
 * @returns {{slug: string|null, ambiguous: boolean, candidates: string[]}}
 */
function resolveModuleSlugStrict(existingSlugs = [], identifier) {
  if (identifier === null || identifier === undefined || String(identifier).trim() === '') {
    return { slug: null, ambiguous: false, candidates: [] };
  }
  const slugs = existingSlugs.map(String);

  const raw = String(identifier).trim();
  if (slugs.includes(raw)) return { slug: raw, ambiguous: false, candidates: [] };

  const normalized = generateModuleSlug(raw);
  if (slugs.includes(normalized)) return { slug: normalized, ambiguous: false, candidates: [] };

  // Prefix match, last: "book" -> "booking". Genuinely useful at a CLI, and genuinely ambiguous
  // often enough that reporting the candidates beats guessing.
  const prefixed = slugs.filter((s) => s.startsWith(normalized));
  if (prefixed.length === 1) return { slug: prefixed[0], ambiguous: false, candidates: [] };
  if (prefixed.length > 1) return { slug: null, ambiguous: true, candidates: prefixed };

  return { slug: null, ambiguous: false, candidates: [] };
}

/**
 * The forgiving accessor: resolves an identifier to a slug, or null.
 * @param {string[]} existingSlugs
 * @param {*} identifier
 * @returns {string|null}
 */
function resolveModuleSlug(existingSlugs = [], identifier) {
  return resolveModuleSlugStrict(existingSlugs, identifier).slug;
}

/**
 * Ensures a slug is unique against `existingSlugs`, appending a deterministic `-2`, `-3`, … suffix
 * on collision — never a random one, and never a silent overwrite. Mirrors generateRunFolderName()'s
 * collision handling (run_manager.md §5.4 #2).
 * @param {string} slug
 * @param {string[]} [existingSlugs]
 * @returns {string}
 */
function uniqueModuleSlug(slug, existingSlugs = []) {
  const existing = new Set(existingSlugs.map(String));
  if (!existing.has(slug)) return slug;
  let i = 2;
  while (existing.has(`${slug}-${i}`)) i += 1;
  return `${slug}-${i}`;
}

module.exports = {
  MAX_SLUG_LENGTH,
  SLUG_RE,
  ModuleSlugError,
  generateModuleSlug,
  isValidModuleSlug,
  assertValidModuleSlug,
  resolveModuleSlug,
  resolveModuleSlugStrict,
  uniqueModuleSlug,
};
