const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MAX_SLUG_LENGTH,
  ModuleSlugError,
  generateModuleSlug,
  isValidModuleSlug,
  assertValidModuleSlug,
  resolveModuleSlug,
  resolveModuleSlugStrict,
  uniqueModuleSlug,
} = require('../moduleSlug');

test('generateModuleSlug lowercases and hyphenates a spaced name', () => {
  assert.equal(generateModuleSlug('Flight Search'), 'flight-search');
  assert.equal(generateModuleSlug('  Agency   Management  '), 'agency-management');
});

test('generateModuleSlug recovers word boundaries from camelCase and PascalCase', () => {
  // The whole reason this module does not just call sanitizeSegment(): that helper strips spaces
  // entirely, which is right for a run folder's PascalCase target and wrong for a slug.
  assert.equal(generateModuleSlug('AgencyManagement'), 'agency-management');
  assert.equal(generateModuleSlug('flightSearch'), 'flight-search');
});

test('generateModuleSlug splits an acronym from the word that follows it', () => {
  assert.equal(generateModuleSlug('PNRLookup'), 'pnr-lookup');
  assert.equal(generateModuleSlug('APIGateway'), 'api-gateway');
});

test('generateModuleSlug keeps identifiers that are already slug-shaped', () => {
  assert.equal(generateModuleSlug('us-245-cabin-class'), 'us-245-cabin-class');
  assert.equal(generateModuleSlug('login'), 'login');
});

test('generateModuleSlug strips filesystem-unsafe characters rather than transliterating them', () => {
  assert.equal(generateModuleSlug('Book/Cancel: Flights?'), 'book-cancel-flights');
  assert.equal(generateModuleSlug('Payments (v2)'), 'payments-v2');
});

test('generateModuleSlug collapses separator runs and trims stray hyphens', () => {
  assert.equal(generateModuleSlug('__Booking___Flow__'), 'booking-flow');
  assert.equal(generateModuleSlug('a...b'), 'a-b');
});

test('generateModuleSlug falls back rather than returning an empty slug', () => {
  assert.equal(generateModuleSlug(''), 'unknown-module');
  assert.equal(generateModuleSlug(null), 'unknown-module');
  assert.equal(generateModuleSlug('***'), 'unknown-module');
  assert.equal(generateModuleSlug('', 'custom-fallback'), 'custom-fallback');
});

test('generateModuleSlug caps length without leaving a trailing hyphen', () => {
  const slug = generateModuleSlug('a'.repeat(80));
  assert.equal(slug.length, MAX_SLUG_LENGTH);

  // A cut landing exactly on a hyphen must not leave one dangling — "foo-" is not a valid slug.
  const words = generateModuleSlug(`${'x'.repeat(59)} tail`);
  assert.ok(!words.endsWith('-'), `slug should not end with a hyphen: ${words}`);
  assert.ok(isValidModuleSlug(words));
});

test('isValidModuleSlug accepts canonical form and rejects everything else', () => {
  assert.ok(isValidModuleSlug('flight-search'));
  assert.ok(isValidModuleSlug('us-245'));
  assert.ok(!isValidModuleSlug('Flight-Search'), 'uppercase is not canonical');
  assert.ok(!isValidModuleSlug('flight_search'), 'underscores are not canonical');
  assert.ok(!isValidModuleSlug('flight--search'), 'doubled hyphens are not canonical');
  assert.ok(!isValidModuleSlug('-flight'), 'leading hyphen is not canonical');
  assert.ok(!isValidModuleSlug('flight-'), 'trailing hyphen is not canonical');
  assert.ok(!isValidModuleSlug(''));
  assert.ok(!isValidModuleSlug(null));
});

test('assertValidModuleSlug rejects a display name and suggests the slug it would produce', () => {
  // The suggestion is the point: the common error is passing a name where a slug belongs, and
  // showing the corresponding slug turns the rejection into an instruction.
  assert.throws(
    () => assertValidModuleSlug('Flight Search'),
    (err) => err instanceof ModuleSlugError && /Did you mean "flight-search"/.test(err.message)
  );
  assert.equal(assertValidModuleSlug('flight-search'), 'flight-search');
});

test('resolveModuleSlug matches an exact slug, a display name, and a unique prefix', () => {
  const slugs = ['flight-search', 'booking', 'agency-management'];
  assert.equal(resolveModuleSlug(slugs, 'flight-search'), 'flight-search');
  assert.equal(resolveModuleSlug(slugs, 'Flight Search'), 'flight-search');
  assert.equal(resolveModuleSlug(slugs, 'Agency Management'), 'agency-management');
  assert.equal(resolveModuleSlug(slugs, 'book'), 'booking');
});

test('resolveModuleSlug returns null for an unknown identifier rather than guessing', () => {
  assert.equal(resolveModuleSlug(['login'], 'checkout'), null);
  assert.equal(resolveModuleSlug([], 'login'), null);
  assert.equal(resolveModuleSlug(['login'], ''), null);
});

test('resolveModuleSlugStrict reports ambiguity with its candidates instead of picking one', () => {
  const slugs = ['booking-create', 'booking-cancel'];
  const result = resolveModuleSlugStrict(slugs, 'booking');
  assert.equal(result.slug, null);
  assert.equal(result.ambiguous, true);
  assert.deepEqual(result.candidates.sort(), ['booking-cancel', 'booking-create']);
});

test('resolveModuleSlugStrict prefers an exact match over an ambiguous prefix', () => {
  const slugs = ['booking', 'booking-create', 'booking-cancel'];
  assert.equal(resolveModuleSlug(slugs, 'booking'), 'booking');
});

test('uniqueModuleSlug appends a deterministic suffix on collision', () => {
  assert.equal(uniqueModuleSlug('login', []), 'login');
  assert.equal(uniqueModuleSlug('login', ['login']), 'login-2');
  assert.equal(uniqueModuleSlug('login', ['login', 'login-2']), 'login-3');
});
