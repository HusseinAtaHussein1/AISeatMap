// Install-time fragment merging — the three files the platform must add to, but never own.
//
// A host project's .gitignore, .mcp.json and .claude/ already belong to its team. Installing into
// them is additive or it is nothing: every merger here computes what it would change, refuses to
// clobber what it did not write, and preserves the file's existing formatting (CRLF, final-newline
// state, key order) so the diff a reviewer sees contains only the platform's own lines.
//
// Per pipeline.md §13.5 these are written ONCE, by init, with human confirmation. No pipeline stage
// may touch them afterwards.
//
// Every function is PURE: it takes current content and returns the proposed content plus a
// description of the change. Nothing here touches the filesystem — apply.js does the writing, so
// `--dry-run` reports exactly what a real run would do.

const BEGIN_MARKER = '# >>> agentic-ai-testing-platform >>>';
const END_MARKER = '# <<< agentic-ai-testing-platform <<<';

/** Detects a file's dominant line ending so a merge does not convert the whole file. */
function detectEol(content) {
  if (!content) return '\n';
  const crlf = (content.match(/\r\n/g) || []).length;
  const lf = (content.match(/(?<!\r)\n/g) || []).length;
  return crlf > lf ? '\r\n' : '\n';
}

function splitLines(content) {
  return content.length ? content.split(/\r?\n/) : [];
}

/**
 * The .gitignore lines the platform needs in the host project.
 *
 * @param {{toolDir: string, gitMode: string}} opts
 */
function gitignoreLines({ toolDir, gitMode }) {
  const lines = [];

  if (gitMode === 'tool-repo') {
    // The tool folder carries its own nested repository, so the host ignores the whole thing and
    // the host's working tree stays clean (pipeline.md §13.9).
    lines.push(
      '# The testing platform versions its own artifacts in a nested repository.',
      `${toolDir}/`,
    );
  } else {
    // Artifacts are versioned in the host repository, so only genuinely local state is ignored.
    // NOTE: the credential rule is a fully-qualified path, never the repo-wide `**/credentials.json`
    // the platform uses for itself — that pattern would silently ignore a host application's own
    // credentials.json somewhere else in the tree.
    lines.push(
      '# Testing platform — local state and secrets (artifacts are committed deliberately).',
      `${toolDir}/platform_core_data/credentials/credentials.json`,
      `${toolDir}/platform.config.local.json`,
      `${toolDir}/node_modules/`,
      '.playwright-mcp/',
      'playwright-report/',
      'test-results/',
    );
  }

  return lines;
}

/**
 * Merges the platform's block into a host .gitignore.
 *
 * - markers absent  → append one delimited block
 * - markers present → replace only the block's contents, in place
 * - a line already present elsewhere in the file → skipped, never duplicated
 * - nothing outside the markers is reordered, rewritten, or removed
 *
 * @returns {{content: string, changed: boolean, action: string, added: string[], skipped: string[]}}
 */
function mergeGitignore(current, opts) {
  const existing = current || '';
  const eol = detectEol(existing);
  const wanted = gitignoreLines(opts);

  const lines = splitLines(existing);
  const beginAt = lines.findIndex((l) => l.trim() === BEGIN_MARKER);
  const endAt = lines.findIndex((l) => l.trim() === END_MARKER);
  const hasBlock = beginAt !== -1 && endAt !== -1 && endAt > beginAt;

  // Lines outside our block that already cover what we want — do not restate them.
  const outsideBlock = hasBlock
    ? lines.filter((_, i) => i < beginAt || i > endAt)
    : lines;
  const outsideSet = new Set(outsideBlock.map((l) => l.trim()).filter(Boolean));

  const added = [];
  const skipped = [];
  for (const line of wanted) {
    if (line.startsWith('#')) {
      added.push(line);
      continue;
    }
    if (outsideSet.has(line)) skipped.push(line);
    else added.push(line);
  }

  // Every wanted rule already present elsewhere, and no block of ours to maintain: nothing to do.
  const meaningful = added.filter((l) => !l.startsWith('#'));
  if (!hasBlock && meaningful.length === 0) {
    return { content: existing, changed: false, action: 'already-covered', added: [], skipped };
  }

  const block = [BEGIN_MARKER, ...added, END_MARKER];

  let nextLines;
  let action;
  if (hasBlock) {
    const before = lines.slice(0, beginAt);
    const after = lines.slice(endAt + 1);
    nextLines = [...before, ...block, ...after];
    action = 'block-updated';
  } else {
    const needsBlank = lines.length > 0 && lines[lines.length - 1].trim() !== '';
    nextLines = [...lines, ...(needsBlank ? [''] : []), ...block];
    action = existing ? 'block-appended' : 'file-created';
  }

  // Preserve the file's trailing-newline state. Splitting content that ends in a newline yields a
  // trailing '' element; dropping it before the rejoin is what keeps this operation idempotent —
  // otherwise every run would append one more blank line than the last.
  const endedWithNewline = existing === '' || /\r?\n$/.test(existing);
  while (nextLines.length && nextLines[nextLines.length - 1] === '') nextLines.pop();

  let content = nextLines.join(eol);
  if (endedWithNewline) content += eol;

  return { content, changed: content !== existing, action, added, skipped };
}

/** The MCP servers the platform registers. */
function mcpServers({ includeContext7 = true } = {}) {
  const servers = {
    playwright: {
      command: 'npx',
      args: ['-y', '@playwright/mcp@latest', '--isolated', '--headless'],
      env: {},
    },
  };
  if (includeContext7) {
    servers.context7 = {
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp@latest'],
      env: { CONTEXT7_API_KEY: '${CONTEXT7_API_KEY}' },
    };
  }
  return servers;
}

/**
 * Merges the platform's MCP servers into a host .mcp.json.
 *
 * Per-key and additive: a server key the host already defines is left exactly as it is and reported,
 * never merged into field-by-field — half the host's `args` plus half ours would be a configuration
 * neither party wrote. Unparseable JSON is never overwritten; the caller prints the fragment instead.
 *
 * @returns {{content: string|null, changed: boolean, action: string, added: string[],
 *   existing: string[], error: string|null, fragment: object}}
 */
function mergeMcpJson(current, opts = {}) {
  const servers = mcpServers(opts);
  const fragment = { mcpServers: servers };

  if (!current) {
    return {
      content: `${JSON.stringify(fragment, null, 2)}\n`,
      changed: true,
      action: 'file-created',
      added: Object.keys(servers),
      existing: [],
      error: null,
      fragment,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(current);
  } catch (err) {
    return {
      content: null,
      changed: false,
      action: 'parse-failed',
      added: [],
      existing: [],
      error:
        `.mcp.json is not valid JSON (${err.message}), so it will not be modified. Add these ` +
        'servers manually:',
      fragment,
    };
  }

  const eol = detectEol(current);
  const next = { ...parsed, mcpServers: { ...(parsed.mcpServers || {}) } };
  const added = [];
  const existing = [];

  for (const [name, config] of Object.entries(servers)) {
    if (next.mcpServers[name]) existing.push(name);
    else {
      next.mcpServers[name] = config;
      added.push(name);
    }
  }

  if (!added.length) {
    return {
      content: current, changed: false, action: 'already-registered', added, existing, error: null, fragment,
    };
  }

  const indent = detectJsonIndent(current);
  let content = JSON.stringify(next, null, indent);
  if (eol === '\r\n') content = content.split('\n').join('\r\n');
  if (/\r?\n$/.test(current)) content += eol;

  return { content, changed: true, action: 'servers-added', added, existing, error: null, fragment };
}

/** Best-effort indent detection so a 4-space host file is not reformatted to 2. */
function detectJsonIndent(content) {
  const m = /\n(\t|[ ]+)\S/.exec(content);
  if (!m) return 2;
  return m[1] === '\t' ? '\t' : m[1].length;
}

/**
 * Decides what to do with one skill directory in the host's `.claude/skills/`.
 *
 * Never overwrites without `force`: a host may have customized a skill, and silently replacing it
 * would discard their edits. A differing skill is written alongside as `SKILL.md.new` and reported,
 * leaving the choice with the human.
 *
 * @returns {{action: 'copy'|'skip-identical'|'write-new-alongside'|'overwrite', targetFile: string,
 *   note: string}}
 */
function planSkillInstall({ name, sourceContent, currentContent, force = false }) {
  const target = `.claude/skills/${name}/SKILL.md`;

  if (currentContent === null || currentContent === undefined) {
    return { action: 'copy', targetFile: target, note: 'not present in the target project' };
  }
  if (normalizeForCompare(currentContent) === normalizeForCompare(sourceContent)) {
    return { action: 'skip-identical', targetFile: target, note: 'already identical' };
  }
  if (force) {
    return { action: 'overwrite', targetFile: target, note: 'differs — overwritten because --force was given' };
  }
  return {
    action: 'write-new-alongside',
    targetFile: `${target}.new`,
    note: 'differs from the shipped version — written alongside as SKILL.md.new, nothing overwritten',
  };
}

/** Line-ending- and trailing-whitespace-insensitive comparison, so CRLF alone is not a difference. */
function normalizeForCompare(content) {
  return content.replace(/\r\n/g, '\n').replace(/\s+$/, '');
}

module.exports = {
  BEGIN_MARKER,
  END_MARKER,
  mergeGitignore,
  mergeMcpJson,
  mcpServers,
  gitignoreLines,
  planSkillInstall,
  _internals: { detectEol, detectJsonIndent, normalizeForCompare, splitLines },
};
