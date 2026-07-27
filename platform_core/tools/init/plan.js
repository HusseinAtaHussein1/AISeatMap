// Install planning — decides everything, writes nothing.
//
// A strict plan/apply split so `--dry-run` is exact rather than approximate: the plan below is the
// complete list of operations, and apply.js only executes it. Installing into somebody else's
// repository is not a place for "it'll probably be fine".
//
// The plan is also the human-review artifact. Every operation carries a `reason`, so the person
// approving the install can see why each file is being touched (pipeline.md §13.5).

const fs = require('fs');
const path = require('path');

const { detectProject } = require('../mcp/stack_docs/detectProject');
const { mergeGitignore, mergeMcpJson, planSkillInstall } = require('./fragments');

const DEFAULT_TOOL_DIR = 'agentic-testing-tool';
const CONFIG_FILENAME = 'platform.config.json';
const MANIFEST_FILENAME = '.install_manifest.json';

/** Copied from the package into the target's tool folder. Data is scaffolded, not copied. */
const TOOL_PAYLOAD_DIRS = ['platform_core', 'workflows_and_pipelines'];

const SKILL_NAMES = [
  'project-context-skill',
  'explorer-skill',
  'test-design-skill',
  'manual-execution-skill',
  'automation-skill',
  'automation-execution-skill',
  'reporting-skill',
];

/**
 * The fixed platform_core_data/ shape (pipeline.md §10.4). Every folder is always present, including
 * categories with no entries yet — a stage must never have to create its own output directory, and a
 * missing category folder reads as "this category does not apply" rather than "nothing found yet".
 */
const DATA_DIRS = [
  'runs',
  'automation_baseline',
  'knowledge_base/application',
  'knowledge_base/automation',
  'knowledge_base/business_rules',
  'knowledge_base/execution',
  'knowledge_base/findings',
  'knowledge_base/lessons_learned',
  'knowledge_base/repair',
  'knowledge_base/ui',
  'browser/screens',
  'browser/components',
  'browser/pages',
  'credentials',
  'ui/screenshots',
  'resources/requirements/user_stories',
  'resources/requirements/features',
  'resources/requirements/epics',
  'resources/requirements/bugs',
  'resources/requirements/specifications',
  'resources/api/postman',
  'resources/api/swagger',
  'resources/TestData',
  'resources/Documents',
  'resources/Records',
  'resources/diagrams',
  'resources/external_links',
  'resources/notes',
  'resources/sample_data',
  'resources/screenshots',
  'resources/credentials',
];

/** Input documents scaffolded blank at install; the human fills them in. */
const DATA_TEMPLATES = [
  'PRD.md',
  'PRD_UserStories.md',
  'run_configuration.md',
  'architecture.md',
  'glossary.md',
  'onboarding.md',
  'automation_framework.md',
  'reference_automation_project.md',
];

class InitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InitError';
  }
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function readIfExists(abs, fsImpl) {
  try {
    return fsImpl.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Guesses the target project root, for a human to confirm. This is the ONLY place in the platform
 * that infers a target root — at runtime it is always config-declared (pipeline.md §1.1), because a
 * stage that guessed wrong would write into the wrong repository.
 *
 * @returns {{root: string, reason: string}}
 */
function inferTargetRoot(startDir, fsImpl = fs) {
  const start = path.resolve(startDir);

  const markers = [
    { file: '.git', reason: 'nearest ancestor containing .git' },
    { file: 'package.json', reason: 'nearest ancestor containing package.json' },
    { file: 'pom.xml', reason: 'nearest ancestor containing pom.xml' },
    { file: 'build.gradle', reason: 'nearest ancestor containing build.gradle' },
    { file: 'pyproject.toml', reason: 'nearest ancestor containing pyproject.toml' },
    { file: 'go.mod', reason: 'nearest ancestor containing go.mod' },
    { file: 'Gemfile', reason: 'nearest ancestor containing Gemfile' },
    { file: 'composer.json', reason: 'nearest ancestor containing composer.json' },
  ];

  let dir = start;
  for (;;) {
    for (const { file, reason } of markers) {
      if (fsImpl.existsSync(path.join(dir, file))) return { root: toPosix(dir), reason };
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return { root: toPosix(start), reason: 'no project marker found — defaulting to the given directory' };
}

/**
 * Builds the complete install plan.
 *
 * @param {Object} opts
 * @param {string} opts.packageRoot   Where the platform's own files live (the clone or npm package).
 * @param {string} opts.targetRoot    The host project.
 * @param {string} [opts.toolDir]     Folder name inside the target. Default 'agentic-testing-tool'.
 * @param {'auto'|'brownfield'|'greenfield'} [opts.mode]
 * @param {string} [opts.testDir]     Override the detected automation directory.
 * @param {string} [opts.framework]   Override the detected framework.
 * @param {'tool-repo'|'host-repo'|'off'} [opts.gitMode]
 * @param {boolean} [opts.mcp]        Register MCP servers. Default true.
 * @param {boolean} [opts.context7]   Include the context7 server. Default true.
 * @param {string[]|'all'|'none'} [opts.skills]
 * @param {boolean} [opts.force]      Overwrite differing skills. NEVER applies to platform_core_data/.
 * @param {boolean} [opts.allowDetached] Permit a tool folder outside the target.
 * @param {object} [opts.fs]
 * @returns {object} the plan
 */
function buildPlan(opts) {
  const fsImpl = opts.fs || fs;
  const packageRoot = path.resolve(opts.packageRoot);
  const targetRoot = path.resolve(opts.targetRoot);
  const toolDir = opts.toolDir || DEFAULT_TOOL_DIR;
  const toolRoot = path.join(targetRoot, toolDir);
  const gitMode = opts.gitMode || 'tool-repo';

  assertPaths({ packageRoot, targetRoot, toolRoot, allowDetached: opts.allowDetached, fsImpl });

  // --- Detect --------------------------------------------------------------------------------
  // The tool folder is excluded from detection: on a re-install it already contains the platform's
  // own `__tests__` directories, and without this the platform would report its own tests as the
  // host project's test suite — and then write generated automation into them.
  const detected = detectProject(targetRoot, { fs: fsImpl, exclude: [toolDir] });
  const mode = resolveMode(opts.mode, detected);
  const greenfield = mode === 'greenfield';

  const automationRoot = opts.testDir || detected.automationRoot;
  const framework = opts.framework || detected.recommended.framework;

  // --- Reinstall? ----------------------------------------------------------------------------
  const manifestPath = path.join(toolRoot, MANIFEST_FILENAME);
  const priorManifest = fsImpl.existsSync(manifestPath)
    ? JSON.parse(readIfExists(manifestPath, fsImpl) || '{}')
    : null;

  const operations = [];
  const warnings = [];
  const notes = [];

  // --- Tool code -----------------------------------------------------------------------------
  for (const dir of TOOL_PAYLOAD_DIRS) {
    const source = path.join(packageRoot, dir);
    if (!fsImpl.existsSync(source)) {
      throw new InitError(`Package is incomplete: ${toPosix(source)} does not exist.`);
    }
    operations.push({
      op: fsImpl.existsSync(path.join(toolRoot, dir)) ? 'replace-dir' : 'copy-dir',
      from: toPosix(source),
      to: toPosix(path.join(toolRoot, dir)),
      reason: `${dir} is tool code — replaced wholesale on install and upgrade, never merged`,
    });
  }

  // --- Data scaffold -------------------------------------------------------------------------
  // platform_core_data/ is the one thing install never overwrites: it holds the team's PRD and every
  // artifact the pipeline has produced. --force does not apply here, by design.
  const dataRoot = path.join(toolRoot, 'platform_core_data');
  const dataExists = fsImpl.existsSync(dataRoot);

  if (dataExists) {
    notes.push(
      `platform_core_data/ already exists and will not be touched — it holds your PRD and every ` +
        'artifact produced so far. Missing folders from the fixed shape will be added.',
    );
  }

  for (const rel of DATA_DIRS) {
    const abs = path.join(dataRoot, rel);
    if (fsImpl.existsSync(abs)) continue;
    operations.push({
      op: 'mkdir',
      to: toPosix(abs),
      keep: true,
      reason: 'fixed platform_core_data/ shape (pipeline.md §10.4) — always present, even when empty',
    });
  }

  // Platform Knowledge ships WITH the tool and survives retargeting (pipeline.md §10.6), so it is
  // copied from the package rather than scaffolded empty.
  const patternsSource = path.join(packageRoot, 'platform_core_data', 'knowledge_base', 'patterns');
  const patternsTarget = path.join(dataRoot, 'knowledge_base', 'patterns');
  if (fsImpl.existsSync(patternsSource) && !fsImpl.existsSync(patternsTarget)) {
    operations.push({
      op: 'copy-dir',
      from: toPosix(patternsSource),
      to: toPosix(patternsTarget),
      reason: 'Platform Knowledge ships with the tool and survives retargeting (pipeline.md §10.6)',
    });
  }

  for (const file of DATA_TEMPLATES) {
    const abs = path.join(dataRoot, file);
    if (fsImpl.existsSync(abs)) continue;
    operations.push({
      op: 'write-template',
      template: file,
      to: toPosix(abs),
      reason: 'blank input document for the team to fill in',
    });
  }

  const credentialsTemplate = path.join(dataRoot, 'credentials', 'credentials.template.json');
  if (!fsImpl.existsSync(credentialsTemplate)) {
    operations.push({
      op: 'write-template',
      template: 'credentials.template.json',
      to: toPosix(credentialsTemplate),
      reason: 'credential template — the real credentials.json is created by a human, never committed',
    });
  }

  // --- Config --------------------------------------------------------------------------------
  const config = buildConfig({
    targetRoot, toolRoot, automationRoot, framework, detected, greenfield, gitMode, opts,
  });
  operations.push({
    op: fsImpl.existsSync(path.join(toolRoot, CONFIG_FILENAME)) ? 'rewrite-config' : 'write-config',
    to: toPosix(path.join(toolRoot, CONFIG_FILENAME)),
    config,
    reason: 'wires the two roots and the target access policy (pipeline.md §13.1)',
  });

  // --- Skills --------------------------------------------------------------------------------
  const wantedSkills = resolveSkills(opts.skills);
  for (const name of wantedSkills) {
    const source = path.join(packageRoot, '.claude', 'skills', name, 'SKILL.md');
    if (!fsImpl.existsSync(source)) {
      warnings.push(`Skill ${name} is missing from the package and will be skipped.`);
      continue;
    }
    const targetFile = path.join(targetRoot, '.claude', 'skills', name, 'SKILL.md');
    const decision = planSkillInstall({
      name,
      sourceContent: readIfExists(source, fsImpl),
      currentContent: readIfExists(targetFile, fsImpl),
      force: Boolean(opts.force),
    });

    if (decision.action === 'skip-identical') {
      notes.push(`Skill ${name}: ${decision.note}`);
      continue;
    }
    if (decision.action === 'write-new-alongside') {
      warnings.push(`Skill ${name} ${decision.note}. Review and merge it yourself.`);
    }
    operations.push({
      op: 'copy-file',
      from: toPosix(source),
      to: toPosix(path.join(targetRoot, decision.targetFile)),
      reason: `Claude Code discovers skills in .claude/skills/ — ${decision.note}`,
    });
  }

  // --- Fragments -----------------------------------------------------------------------------
  const gitignorePath = path.join(targetRoot, '.gitignore');
  const gitignore = mergeGitignore(readIfExists(gitignorePath, fsImpl), { toolDir, gitMode });
  if (gitignore.changed) {
    operations.push({
      op: 'write-file',
      to: toPosix(gitignorePath),
      content: gitignore.content,
      reason: `.gitignore — ${gitignore.action}, additive inside markers only (pipeline.md §13.5)`,
    });
  } else {
    notes.push(`.gitignore: ${gitignore.action} — no change needed.`);
  }

  if (opts.mcp !== false) {
    const mcpPath = path.join(targetRoot, '.mcp.json');
    const mcp = mergeMcpJson(readIfExists(mcpPath, fsImpl), { includeContext7: opts.context7 !== false });
    if (mcp.error) {
      warnings.push(`${mcp.error}\n${JSON.stringify(mcp.fragment, null, 2)}`);
    } else if (mcp.changed) {
      operations.push({
        op: 'write-file',
        to: toPosix(mcpPath),
        content: mcp.content,
        reason: `.mcp.json — registers ${mcp.added.join(', ')}; existing keys untouched`,
      });
      if (mcp.existing.length) {
        notes.push(`.mcp.json: left your existing ${mcp.existing.join(', ')} definition(s) alone.`);
      }
    } else {
      notes.push(`.mcp.json: ${mcp.action} — no change needed.`);
    }
  }

  // --- Git mode ------------------------------------------------------------------------------
  if (gitMode === 'tool-repo' && !fsImpl.existsSync(path.join(toolRoot, '.git'))) {
    operations.push({
      op: 'git-init',
      to: toPosix(toolRoot),
      reason:
        'the tool folder gets its own repository, so baseline merge protection works and no commit ' +
        "ever lands in the host's history (pipeline.md §13.9)",
    });
  }
  if (gitMode === 'host-repo') {
    warnings.push(
      'git.mode is "host-repo": the platform will commit its process artifacts into THIS ' +
        "repository's history, restricted to paths under platform_core_data/. Use --git-mode " +
        'tool-repo to keep them in a nested repository instead.',
    );
  }
  if (gitMode === 'off') {
    warnings.push(
      'git.mode is "off": the automation baseline gets no three-way-merge protection, so ' +
        'concurrent-run conflicts cannot be detected (pipeline.md §13.9).',
    );
  }

  // --- Greenfield ----------------------------------------------------------------------------
  if (greenfield) {
    notes.push(
      'Greenfield: no existing test suite was found. The pipeline will scaffold test ' +
        'INFRASTRUCTURE only — the test directory, the framework config, and one example smoke ' +
        'test. It never scaffolds the application (pipeline.md §13.6).',
    );
  }
  if (!greenfield && detected.testDirs.primary) {
    notes.push(
      `Brownfield: generated automation will match ${detected.testDirs.primary.path} — ` +
        `${detected.recommended.conventions.fileNaming || 'existing naming'}, ` +
        `${detected.recommended.language || 'detected language'}.`,
    );
  }

  operations.push({
    op: 'write-manifest',
    to: toPosix(manifestPath),
    reason: 'records every install-time write, so upgrade and uninstall know what the platform owns',
  });

  for (const w of detected.warnings) warnings.push(w);

  return {
    packageRoot: toPosix(packageRoot),
    targetRoot: toPosix(targetRoot),
    toolRoot: toPosix(toolRoot),
    toolDir,
    mode,
    greenfield,
    gitMode,
    framework,
    automationRoot,
    detected,
    config,
    operations,
    warnings,
    notes,
    reinstall: Boolean(priorManifest),
    priorManifest,
  };
}

function assertPaths({ packageRoot, targetRoot, toolRoot, allowDetached, fsImpl }) {
  if (!fsImpl.existsSync(targetRoot)) {
    throw new InitError(`Target project does not exist: ${toPosix(targetRoot)}`);
  }
  if (path.resolve(packageRoot) === path.resolve(toolRoot)) {
    throw new InitError(
      'The package root and the install destination are the same directory — installing the ' +
        'platform into itself. Run init from the target project, or pass --target.',
    );
  }
  const relToTarget = path.relative(targetRoot, toolRoot);
  const inside = relToTarget && !relToTarget.startsWith('..') && !path.isAbsolute(relToTarget);
  if (!inside && !allowDetached) {
    throw new InitError(
      `The tool folder (${toPosix(toolRoot)}) would sit outside the target project ` +
        `(${toPosix(targetRoot)}). Pass --allow-detached if that is deliberate.`,
    );
  }
}

function resolveMode(requested, detected) {
  if (requested === 'brownfield' || requested === 'greenfield') return requested;
  return detected.greenfield ? 'greenfield' : 'brownfield';
}

function resolveSkills(requested) {
  if (requested === 'none') return [];
  if (!requested || requested === 'all') return SKILL_NAMES;
  if (Array.isArray(requested)) return requested;
  return String(requested)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildConfig({ targetRoot, toolRoot, automationRoot, framework, detected, greenfield, gitMode, opts }) {
  // Relative to the config file's own directory, so the tool folder can be moved wholesale.
  const relTarget = toPosix(path.relative(toolRoot, targetRoot)) || '..';

  const writeAllowlist = [];
  if (automationRoot) {
    writeAllowlist.push(`${automationRoot.replace(/\/+$/, '')}/**`);
    // The framework's config file is allowlisted only when the project has none — an existing
    // config belongs to the team and changing it needs per-run approval (pipeline.md §13.3 item 3).
    for (const extra of detected.recommended.writeAllowlist) {
      if (!extra.endsWith('/**') && !writeAllowlist.includes(extra)) writeAllowlist.push(extra);
    }
  }

  return {
    $schema: './platform_core/tools/platform_paths/platform.config.schema.json',
    configVersion: 1,
    mode: 'installed',
    targetRoot: relTarget,
    dataRoot: 'platform_core_data',
    target: {
      testDirs: detected.recommended.testDirs,
      automationRoot: automationRoot || null,
      writeAllowlist,
      readDenylist: [],
      detectedStack: {
        detectedAt: null, // stamped by apply.js, which owns the clock
        ecosystems: detected.stack.ecosystems,
        frameworks: framework ? [framework] : [],
        greenfield,
      },
    },
    git: { mode: gitMode, commitBaseline: opts.commitBaseline !== false },
  };
}

/** Human-readable rendering of a plan — what `--dry-run` prints. */
function renderPlan(plan) {
  const lines = [];
  lines.push(`Target project:  ${plan.targetRoot}`);
  lines.push(`Install into:    ${plan.toolRoot}`);
  lines.push(`Mode:            ${plan.mode}${plan.reinstall ? ' (reinstall)' : ''}`);
  lines.push(`Framework:       ${plan.framework || '(none resolved)'}`);
  lines.push(`Automation dir:  ${plan.automationRoot || '(none)'}`);
  lines.push(`Git mode:        ${plan.gitMode}`);
  lines.push('');

  const grouped = new Map();
  for (const op of plan.operations) {
    if (!grouped.has(op.op)) grouped.set(op.op, []);
    grouped.get(op.op).push(op);
  }

  lines.push(`Operations (${plan.operations.length}):`);
  for (const [kind, ops] of grouped) {
    lines.push(`  ${kind} (${ops.length})`);
    for (const op of ops.slice(0, 8)) {
      lines.push(`    ${op.to}`);
    }
    if (ops.length > 8) lines.push(`    … and ${ops.length - 8} more`);
  }

  if (plan.notes.length) {
    lines.push('');
    lines.push('Notes:');
    for (const n of plan.notes) lines.push(`  - ${n}`);
  }
  if (plan.warnings.length) {
    lines.push('');
    lines.push('Warnings:');
    for (const w of plan.warnings) lines.push(`  ! ${w}`);
  }

  return lines.join('\n');
}

module.exports = {
  buildPlan,
  renderPlan,
  inferTargetRoot,
  InitError,
  DEFAULT_TOOL_DIR,
  CONFIG_FILENAME,
  MANIFEST_FILENAME,
  TOOL_PAYLOAD_DIRS,
  DATA_DIRS,
  DATA_TEMPLATES,
  SKILL_NAMES,
  _internals: { resolveMode, resolveSkills, buildConfig, assertPaths },
};
