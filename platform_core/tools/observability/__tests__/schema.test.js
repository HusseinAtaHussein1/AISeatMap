// The event vocabulary, and what it refuses.

'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  SCHEMA_VERSION, EVENT_TYPES, EVENT_SOURCES, SPAN_OPENERS, SPAN_CLOSERS, SPAN_PAIRS,
  DECISION_CATEGORIES, STAGE_IDS, SKILLS, redactSecrets, validateEvent, assertValidEvent,
  ObservabilityError,
} = require('../schema');

const valid = (over = {}) => ({
  eventId: 'evt-000001-abcdef01',
  schemaVersion: SCHEMA_VERSION,
  seq: 1,
  timestamp: '2026-08-07T09:00:00.000Z',
  runId: 'run-999__fixture',
  type: 'VALIDATION_PASSED',
  source: 'platform-tool',
  kind: 'schema',
  ...over,
});

test('a well-formed event validates', () => {
  assert.deepStrictEqual(validateEvent(valid()), { valid: true, problems: [] });
});

test('provenance is required — an event may not decline to say who emitted it', () => {
  const { valid: ok, problems } = validateEvent(valid({ source: undefined }));
  assert.strictEqual(ok, false);
  assert.ok(problems.some((p) => p.includes('provenance is required')));
});

test('only the two declared sources are accepted', () => {
  assert.strictEqual(validateEvent(valid({ source: 'guessed' })).valid, false);
  for (const s of EVENT_SOURCES) assert.strictEqual(validateEvent(valid({ source: s })).valid, true);
});

test('an unknown event type is refused, listing what is known', () => {
  const { valid: ok, problems } = validateEvent(valid({ type: 'MADE_UP' }));
  assert.strictEqual(ok, false);
  assert.ok(problems.some((p) => p.includes('Unknown event type') && p.includes('VALIDATION_PASSED')));
});

test('timestamps must be UTC ISO-8601 — a local formatted string is refused', () => {
  for (const bad of ['2026-08-07 09:00:00', '07/08/2026', '2026-08-07T09:00:00+03:00', 'T+00:12']) {
    assert.strictEqual(validateEvent(valid({ timestamp: bad })).valid, false, `${bad} should be refused`);
  }
  assert.strictEqual(validateEvent(valid({ timestamp: '2026-08-07T09:00:00Z' })).valid, true);
});

test('a foreign schemaVersion is refused rather than reinterpreted', () => {
  const { problems } = validateEvent(valid({ schemaVersion: 2 }));
  assert.ok(problems.some((p) => p.includes('not reinterpreted')));
});

test('an unsupported field is refused — the whitelist is the contract', () => {
  const { valid: ok, problems } = validateEvent(valid({ tokensUsed: 4000 }));
  assert.strictEqual(ok, false);
  assert.ok(problems.some((p) => p.includes('tokensUsed')));
});

test('span openers and closers both require a spanId', () => {
  for (const type of SPAN_OPENERS) {
    assert.strictEqual(validateEvent(valid({ type })).valid, false, `${type} without spanId`);
    assert.strictEqual(validateEvent(valid({ type, spanId: 's1' })).valid, true, `${type} with spanId`);
  }
  for (const type of SPAN_CLOSERS) {
    assert.strictEqual(validateEvent(valid({ type })).valid, false, `${type} without spanId`);
  }
});

test('every span opener has at least one declared closer, and no closer is orphaned', () => {
  for (const opener of SPAN_OPENERS) {
    assert.ok(SPAN_PAIRS[opener].length >= 1, `${opener} has no closer`);
    for (const c of SPAN_PAIRS[opener]) assert.ok(EVENT_TYPES.includes(c), `${c} is not an event type`);
  }
  for (const closer of SPAN_CLOSERS) {
    assert.ok(Object.values(SPAN_PAIRS).flat().includes(closer));
  }
});

test('TOOL_STARTED closes on failure as well as success, so failures are still timed', () => {
  assert.deepStrictEqual(SPAN_PAIRS.TOOL_STARTED, ['TOOL_COMPLETED', 'TOOL_FAILED']);
});

test('a human decision event requires its decisionId, both when asked and when answered', () => {
  assert.strictEqual(validateEvent(valid({ type: 'HUMAN_DECISION_REQUESTED' })).valid, false);
  assert.strictEqual(validateEvent(valid({ type: 'HUMAN_DECISION_RESOLVED' })).valid, false);
  assert.strictEqual(validateEvent(valid({ type: 'HUMAN_DECISION_REQUESTED', decisionId: 'HD-1' })).valid, true);
});

test('a test execution result requires a status from the platform vocabulary', () => {
  assert.strictEqual(validateEvent(valid({ type: 'TEST_EXECUTION_RESULT', status: 'Great' })).valid, false);
  assert.strictEqual(validateEvent(valid({ type: 'TEST_EXECUTION_RESULT', status: 'Passed' })).valid, true);
  // No new status is introduced by observability; blocks reuse the existing ones.
  assert.strictEqual(validateEvent(valid({ type: 'TEST_EXECUTION_RESULT', status: 'Blocked' })).valid, true);
});

test('attempt must be >= 1 — first-pass success depends on it being trustworthy', () => {
  assert.strictEqual(validateEvent(valid({ attempt: 0 })).valid, false);
  assert.strictEqual(validateEvent(valid({ attempt: -1 })).valid, false);
  assert.strictEqual(validateEvent(valid({ attempt: 1 })).valid, true);
});

test('stages and skills are validated against the platform\'s own vocabulary', () => {
  assert.strictEqual(validateEvent(valid({ stage: '7Z' })).valid, false);
  assert.strictEqual(validateEvent(valid({ skill: 'explorer-agent' })).valid, false, 'obsolete *-agent naming');
  for (const id of STAGE_IDS) assert.strictEqual(validateEvent(valid({ stage: id })).valid, true);
  for (const s of SKILLS) assert.strictEqual(validateEvent(valid({ skill: s })).valid, true);
});

test('decision categories are a closed set — none is inferred from free text', () => {
  assert.strictEqual(validateEvent(valid({ category: 'Vibes' })).valid, false);
  for (const c of DECISION_CATEGORIES) assert.strictEqual(validateEvent(valid({ category: c })).valid, true);
});

test('there is no event type for tokens or cost — nothing can record what has no source', () => {
  const forbidden = EVENT_TYPES.filter((t) => /TOKEN|COST|USAGE|PRICE|SPEND/i.test(t));
  assert.deepStrictEqual(forbidden, []);
});

test('secret-shaped metadata keys are redacted, at any depth, in objects and arrays', () => {
  const { value, redactedKeys } = redactSecrets({
    username: 'qa.user',
    password: 'hunter2',
    nested: { apiKey: 'AKIA-XYZ', sessionId: 'JSESSIONID=99', safe: 'keep me' },
    list: [{ token: 'tok_live_9911' }],
    cardNumber: '4111111111111111',
  });

  const flat = JSON.stringify(value);
  for (const secret of ['hunter2', 'AKIA-XYZ', 'JSESSIONID=99', 'tok_live_9911', '4111111111111111']) {
    assert.ok(!flat.includes(secret), `${secret} must not survive redaction`);
  }
  assert.ok(flat.includes('qa.user'), 'a credential IDENTITY is allowed; only the secret is not');
  assert.ok(flat.includes('keep me'));
  assert.deepStrictEqual(redactedKeys.sort(),
    ['cardNumber', 'list[0].token', 'nested.apiKey', 'nested.sessionId', 'password'].sort());
});

test('redaction matches KEYS, never values — a test case titled "Email Password ..." survives intact', () => {
  // A real title from this repository. A value-scanning heuristic would mangle it, and telemetry
  // that corrupts legitimate QA vocabulary is telemetry people switch off.
  const title = 'Email Password rejects a value exceeding 15 characters';
  const { value, redactedKeys } = redactSecrets({ title, note: 'password field boundary' });
  assert.strictEqual(value.title, title);
  assert.strictEqual(value.note, 'password field boundary');
  assert.deepStrictEqual(redactedKeys, []);
});

test('an event carrying a secret-shaped key fails validation loudly', () => {
  const { valid: ok, problems } = validateEvent(valid({ metadata: { authorization: 'Bearer abc' } }));
  assert.strictEqual(ok, false);
  assert.ok(problems.some((p) => p.includes('§43')));
});

test('assertValidEvent throws once, listing every problem at the same time', () => {
  assert.throws(
    () => assertValidEvent({ type: 'NOPE', source: 'nope', seq: 0 }),
    (err) => {
      assert.ok(err instanceof ObservabilityError);
      assert.ok(err.message.includes('NOPE'));
      assert.ok(err.message.includes('seq'));
      assert.ok(err.message.split('\n').length > 3, 'every problem, not just the first');
      return true;
    },
  );
});
