const test = require('node:test');
const assert = require('node:assert/strict');

const {
  mergeGitignore, mergeMcpJson, planSkillInstall, BEGIN_MARKER, END_MARKER, _internals,
} = require('../fragments');

const OPTS = { toolDir: 'agentic-testing-tool', gitMode: 'tool-repo' };

// -------------------------------------------------------------------------------------------------
// .gitignore — additive inside markers, idempotent, format-preserving
// -------------------------------------------------------------------------------------------------

test('an absent .gitignore is created with a single delimited block', () => {
  const r = mergeGitignore(null, OPTS);
  assert.equal(r.changed, true);
  assert.equal(r.action, 'file-created');
  assert.ok(r.content.includes(BEGIN_MARKER));
  assert.ok(r.content.includes(END_MARKER));
  assert.ok(r.content.includes('agentic-testing-tool/'));
  assert.ok(r.content.endsWith('\n'), 'a new file gets a trailing newline');
});

test('the platform block is appended without disturbing existing content', () => {
  const existing = 'node_modules/\ndist/\n.env\n';
  const r = mergeGitignore(existing, OPTS);

  assert.equal(r.action, 'block-appended');
  assert.ok(r.content.startsWith(existing), 'existing lines must be preserved byte-for-byte, in order');
  assert.ok(r.content.includes('agentic-testing-tool/'));
});

test('merging is idempotent — three runs produce the identical file', () => {
  const first = mergeGitignore('node_modules/\n', OPTS);
  const second = mergeGitignore(first.content, OPTS);
  const third = mergeGitignore(second.content, OPTS);

  assert.equal(second.changed, false, 'a second run must be a no-op');
  assert.equal(second.action, 'block-updated');
  assert.equal(second.content, first.content);
  assert.equal(third.content, first.content);
  // Exactly one block, ever.
  assert.equal((third.content.match(new RegExp(BEGIN_MARKER, 'g')) || []).length, 1);
});

test('markers present with stale contents are updated in place, leaving the rest alone', () => {
  const existing = [
    'node_modules/',
    '',
    BEGIN_MARKER,
    'some-old-line/',
    END_MARKER,
    '',
    '# my own trailing section',
    'coverage/',
    '',
  ].join('\n');

  const r = mergeGitignore(existing, OPTS);

  assert.equal(r.action, 'block-updated');
  assert.ok(!r.content.includes('some-old-line/'), 'stale block contents are replaced');
  assert.ok(r.content.includes('agentic-testing-tool/'));
  assert.ok(r.content.includes('# my own trailing section'), 'content after the block survives');
  assert.ok(r.content.includes('coverage/'));
  assert.ok(r.content.indexOf('node_modules/') < r.content.indexOf(BEGIN_MARKER), 'order preserved');
});

test('a rule already present outside the block is not duplicated', () => {
  const existing = 'agentic-testing-tool/\nnode_modules/\n';
  const r = mergeGitignore(existing, OPTS);

  assert.equal(r.action, 'already-covered');
  assert.equal(r.changed, false);
  assert.deepEqual(r.skipped, ['agentic-testing-tool/']);
  assert.equal(r.content, existing, 'nothing is rewritten when the rule already exists');
});

test('CRLF files stay CRLF, and LF files stay LF', () => {
  const crlf = mergeGitignore('node_modules/\r\ndist/\r\n', OPTS);
  assert.ok(crlf.content.includes('\r\n'));
  assert.ok(!/(?<!\r)\n/.test(crlf.content), 'no bare LF may be introduced into a CRLF file');

  const lf = mergeGitignore('node_modules/\ndist/\n', OPTS);
  assert.ok(!lf.content.includes('\r'), 'no CR may be introduced into an LF file');
});

test('a file with no trailing newline does not gain one', () => {
  const r = mergeGitignore('node_modules/', OPTS);
  assert.ok(!r.content.endsWith('\n'), "the file's trailing-newline state is preserved");
});

test('host-repo mode ignores only local state, with a fully-qualified credentials path', () => {
  const r = mergeGitignore(null, { toolDir: 'tool', gitMode: 'host-repo' });

  assert.ok(!r.content.includes('\ntool/\n'), 'the tool folder itself must be tracked in host-repo mode');
  assert.ok(r.content.includes('tool/platform_core_data/credentials/credentials.json'));
  // The repo-wide pattern would silently ignore a host application's own credentials.json elsewhere.
  assert.ok(!r.content.includes('**/credentials.json'), 'never write a repo-wide credentials rule');
});

test('the host .gitignore never receives the platform\'s own .claude rules', () => {
  // `.claude/*` plus `!.claude/skills/` would override whatever policy the host team already has.
  for (const gitMode of ['tool-repo', 'host-repo', 'off']) {
    const r = mergeGitignore('node_modules/\n', { toolDir: 'tool', gitMode });
    assert.ok(!r.content.includes('.claude/*'), `${gitMode}: must not impose a .claude policy`);
    assert.ok(!r.content.includes('!.claude/skills/'), `${gitMode}: must not impose a .claude policy`);
  }
});

// -------------------------------------------------------------------------------------------------
// .mcp.json — per-key additive, never field-merged
// -------------------------------------------------------------------------------------------------

test('an absent .mcp.json is created with both servers', () => {
  const r = mergeMcpJson(null);
  assert.equal(r.action, 'file-created');
  const parsed = JSON.parse(r.content);
  assert.deepEqual(Object.keys(parsed.mcpServers).sort(), ['context7', 'playwright']);
  assert.equal(parsed.mcpServers.playwright.command, 'npx');
});

test('--no-context7 registers playwright alone', () => {
  const r = mergeMcpJson(null, { includeContext7: false });
  const parsed = JSON.parse(r.content);
  assert.deepEqual(Object.keys(parsed.mcpServers), ['playwright']);
});

test('missing servers are added and unrelated host keys are preserved', () => {
  const existing = JSON.stringify({
    mcpServers: { 'my-internal-server': { command: 'node', args: ['server.js'] } },
    someOtherHostKey: { keep: true },
  }, null, 2);

  const r = mergeMcpJson(existing);
  const parsed = JSON.parse(r.content);

  assert.equal(r.action, 'servers-added');
  assert.deepEqual(r.added.sort(), ['context7', 'playwright']);
  assert.ok(parsed.mcpServers['my-internal-server'], "the host's own server survives");
  assert.deepEqual(parsed.someOtherHostKey, { keep: true }, 'unrelated top-level keys survive');
});

test('an existing server key is left exactly as the host defined it', () => {
  // Field-merging would produce a config neither party wrote — half the host's args, half ours.
  const hostPlaywright = { command: 'pnpm', args: ['dlx', '@playwright/mcp', '--headed'], env: { X: '1' } };
  const existing = JSON.stringify({ mcpServers: { playwright: hostPlaywright } }, null, 2);

  const r = mergeMcpJson(existing);
  const parsed = JSON.parse(r.content);

  assert.deepEqual(parsed.mcpServers.playwright, hostPlaywright, 'untouched, not merged');
  assert.deepEqual(r.existing, ['playwright']);
  assert.deepEqual(r.added, ['context7']);
});

test('a fully-registered .mcp.json is a no-op', () => {
  const first = mergeMcpJson(null);
  const second = mergeMcpJson(first.content);
  assert.equal(second.changed, false);
  assert.equal(second.action, 'already-registered');
  assert.equal(second.content, first.content);
});

test('unparseable JSON is never overwritten; the fragment is returned for manual use', () => {
  const broken = '{ "mcpServers": { ';
  const r = mergeMcpJson(broken);

  assert.equal(r.changed, false);
  assert.equal(r.content, null, 'no content means apply.js writes nothing');
  assert.equal(r.action, 'parse-failed');
  assert.match(r.error, /not valid JSON/);
  assert.ok(r.fragment.mcpServers.playwright, 'the caller can print this for the human to paste');
});

test('host indentation and line endings are preserved', () => {
  const fourSpace = JSON.stringify({ mcpServers: {} }, null, 4);
  assert.ok(mergeMcpJson(fourSpace).content.includes('\n    "mcpServers"'));

  const crlf = JSON.stringify({ mcpServers: {} }, null, 2).split('\n').join('\r\n');
  const r = mergeMcpJson(crlf);
  assert.ok(r.content.includes('\r\n'));
  assert.ok(!/(?<!\r)\n/.test(r.content));
});

// -------------------------------------------------------------------------------------------------
// .claude/skills — never overwrite what we did not write
// -------------------------------------------------------------------------------------------------

test('an absent skill is copied', () => {
  const d = planSkillInstall({ name: 'explorer-skill', sourceContent: 'A', currentContent: null });
  assert.equal(d.action, 'copy');
  assert.equal(d.targetFile, '.claude/skills/explorer-skill/SKILL.md');
});

test('an identical skill is a no-op, ignoring line endings and trailing whitespace', () => {
  const d = planSkillInstall({
    name: 'explorer-skill',
    sourceContent: 'line one\nline two\n',
    currentContent: 'line one\r\nline two\r\n',
  });
  assert.equal(d.action, 'skip-identical', 'CRLF alone is not a difference');
});

test('a differing skill is written alongside as .new, never overwritten', () => {
  const d = planSkillInstall({
    name: 'explorer-skill',
    sourceContent: 'shipped version',
    currentContent: 'the team customized this',
  });
  assert.equal(d.action, 'write-new-alongside');
  assert.equal(d.targetFile, '.claude/skills/explorer-skill/SKILL.md.new');
  assert.match(d.note, /nothing overwritten/);
});

test('--force overwrites a differing skill, and says so', () => {
  const d = planSkillInstall({
    name: 'explorer-skill',
    sourceContent: 'shipped',
    currentContent: 'customized',
    force: true,
  });
  assert.equal(d.action, 'overwrite');
  assert.equal(d.targetFile, '.claude/skills/explorer-skill/SKILL.md');
  assert.match(d.note, /--force/);
});

// -------------------------------------------------------------------------------------------------
// Internals
// -------------------------------------------------------------------------------------------------

test('detectEol picks the dominant ending, defaulting to LF', () => {
  const { detectEol } = _internals;
  assert.equal(detectEol('a\r\nb\r\n'), '\r\n');
  assert.equal(detectEol('a\nb\n'), '\n');
  assert.equal(detectEol(''), '\n');
  assert.equal(detectEol('no newline at all'), '\n');
  assert.equal(detectEol('a\r\nb\r\nc\n'), '\r\n', 'majority wins in a mixed file');
});

test('detectJsonIndent recognizes 2-space, 4-space and tab files', () => {
  const { detectJsonIndent } = _internals;
  assert.equal(detectJsonIndent('{\n  "a": 1\n}'), 2);
  assert.equal(detectJsonIndent('{\n    "a": 1\n}'), 4);
  assert.equal(detectJsonIndent('{\n\t"a": 1\n}'), '\t');
  assert.equal(detectJsonIndent('{}'), 2, 'defaults to 2 when there is nothing to measure');
});
