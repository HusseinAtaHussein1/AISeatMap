// Module Summary — regenerates a module's README.md.
//
// See workflows_and_pipelines/pipeline/module_architecture.md §5.3.
//
// This file is the single human entry point to a module: the answer to "what do we know about Login,
// and where does it stand?" without opening five folders.
//
// Two properties make it safe to rely on, and both are enforced here rather than by convention:
//
//   1. It is REGENERATED, never hand-authored. The file says so in its own header, because a
//      generated file that does not announce itself invites edits that are then silently lost.
//   2. It is a SUMMARY AND AN INDEX, never a source of truth. Every figure is cited from the
//      artifact that owns it. Where the summary and an artifact disagree, the artifact wins — the
//      same precedence the Active Run pointer declares over run.json (run_manager.md §5.7).

const fs = require('fs');
const path = require('path');

const { MODULE_STAGES, readRegistry, resolveModule } = require('./moduleRegistry');
const { readAutomationState } = require('./automationState');

/** Human-facing stage labels, in pipeline order. */
const STAGE_LABELS = {
  context: 'Stage 1 — Project Context',
  discovery: 'Stage 2 — Discovery',
  test_design: 'Stage 3 — Test Design',
  automation: 'Stage 4A — Automation',
  healing: 'Stage 5H — Self-Healing',
};

/** The primary artifact each stage's status refers to, for the summary's links. */
const STAGE_PRIMARY_ARTIFACT = {
  context: 'context/ProjectContext.md',
  discovery: 'discovery/QA_Assessment_Report.md',
  test_design: 'test_design/CoverageReport.md',
  automation: 'automation/AutomationSummary.md',
  healing: 'healing/RepairSummary.md',
};

function safeRead(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Pulls the module's scope statement out of its Project Context.
 *
 * Deliberately conservative: it looks for an explicit `## Scope` (or `## Module Scope`) section and
 * takes its first paragraph. When the heading is absent it returns null rather than guessing at
 * which paragraph is the scope — a wrong scope statement in the summary is worse than none, because
 * a reader has no way to tell it was a guess.
 *
 * @param {string} contextFile
 * @returns {string|null}
 */
function extractScopeStatement(contextFile) {
  const text = safeRead(contextFile);
  if (!text) return null;

  const match = text.match(/^##+\s+(?:Module\s+)?Scope\s*$/im);
  if (!match) return null;

  const after = text.slice(match.index + match[0].length);
  const paragraph = after
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith('#'));

  if (!paragraph) return null;
  return paragraph.replace(/\s+/g, ' ').trim();
}

/**
 * Counts test cases in a module's Test Design suite by counting `TC-` identifiers.
 *
 * Returns null when the file is absent, and that null is rendered as "—" rather than "0". A missing
 * suite and an empty suite are different facts, and reporting the first as the second would let a
 * stage that never ran look like one that found nothing to test.
 *
 * @param {string} moduleDir
 * @returns {number|null}
 */
function countTestCases(moduleDir) {
  const dir = path.join(moduleDir, 'test_design');
  let files;
  try {
    files = fs.readdirSync(dir).filter((f) => f.startsWith('TestCases_') && f.endsWith('.md'));
  } catch {
    return null;
  }
  if (!files.length) return null;

  const ids = new Set();
  for (const file of files) {
    const text = safeRead(path.join(dir, file)) || '';
    for (const m of text.matchAll(/\bTC-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\b/g)) ids.add(m[0]);
  }
  return ids.size;
}

/**
 * Counts findings recorded in a module's discovery folder.
 * @param {string} moduleDir
 * @returns {number|null}
 */
function countFindings(moduleDir) {
  const dir = path.join(moduleDir, 'discovery', 'findings');
  try {
    return fs.readdirSync(dir)
      .filter((f) => /^FINDING-.*\.md$/i.test(f))
      .length;
  } catch {
    return null;
  }
}

/** Renders a value that may legitimately be unknown. Never invents a zero. */
function orDash(value) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function formatStageRow(slug, stage, stageState, moduleDir) {
  const state = stageState || {};
  const artifact = state.artifactPath || STAGE_PRIMARY_ARTIFACT[stage];
  const exists = artifact && fs.existsSync(path.join(moduleDir, artifact.replace(/^.*modules\/[^/]+\//, '')));
  const link = artifact && (exists || state.status !== 'Not Started')
    ? `[${path.posix.basename(artifact)}](${artifact.startsWith('platform_core_data/') ? artifact.replace(`platform_core_data/modules/${slug}/`, '') : artifact})`
    : '—';

  return `| ${STAGE_LABELS[stage]} | ${orDash(state.status || 'Not Started')} | ${link} | `
    + `${orDash(state.revisionCount ? `rev ${state.revisionCount}` : null)} | `
    + `${orDash(state.lastUpdated ? state.lastUpdated.slice(0, 10) : null)} | `
    + `${orDash(state.lastRun)} |`;
}

/**
 * Renders a module's README.md content.
 *
 * @param {string} modulesDir
 * @param {string} slug
 * @param {{now: Date, runs?: string[]}} opts
 * @returns {string} the Markdown
 */
function renderModuleSummary(modulesDir, slug, opts = {}) {
  const { now } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new TypeError('renderModuleSummary requires an explicit valid `now` Date.');
  }

  const moduleDir = path.join(modulesDir, slug);
  const registry = readRegistry(modulesDir);
  const module = resolveModule(modulesDir, slug, registry);
  if (!module) {
    throw new Error(`No module "${slug}" is registered.`);
  }

  const stages = module.stages || {};
  const scope = extractScopeStatement(path.join(moduleDir, 'context', 'ProjectContext.md'));
  const testCases = countTestCases(moduleDir);
  const findings = countFindings(moduleDir);
  const automation = readAutomationState(modulesDir, slug);

  // Every run that touched any stage of this module — the module's link back into execution history.
  const runs = new Set(opts.runs || []);
  for (const stage of MODULE_STAGES) {
    if (stages[stage]?.lastRun) runs.add(stages[stage].lastRun);
  }
  for (const run of automation?.sourceRuns || []) runs.add(run);

  const lines = [];

  lines.push(`# ${module.name}`);
  lines.push('');
  lines.push(
    '> **Generated file — do not edit.** Regenerated by '
    + '`node platform_core/tools/module_manager/cli.js summary ' + slug + '`. '
    + 'Hand-edits are overwritten without warning.'
  );
  lines.push('>');
  lines.push(
    '> This is a **summary and an index**, never a source of truth. Every figure below is cited '
    + 'from the artifact that owns it; where this file and an artifact disagree, **the artifact wins**.'
  );
  lines.push('');
  lines.push(`**Slug:** \`${slug}\` · **Status:** ${orDash(module.status)}`
    + (module.supersededBy ? ` · **Superseded by:** \`${module.supersededBy}\`` : ''));
  lines.push(`**Last generated:** ${now.toISOString()}`);
  lines.push('');

  lines.push('## Scope');
  lines.push('');
  if (scope) {
    lines.push(scope);
    lines.push('');
    lines.push('*— quoted from [`context/ProjectContext.md`](context/ProjectContext.md)*');
  } else if (module.description) {
    lines.push(module.description);
    lines.push('');
    lines.push('*— from the module registry; no Scope section found in `context/ProjectContext.md`*');
  } else {
    lines.push('*No scope statement yet — Stage 1 has not written this module\'s Project Context.*');
  }
  lines.push('');

  lines.push('## Pipeline Status');
  lines.push('');
  lines.push('| Stage | Status | Artifact | Revisions | Last updated | Last run |');
  lines.push('|---|---|---|---|---|---|');
  for (const stage of MODULE_STAGES) {
    lines.push(formatStageRow(slug, stage, stages[stage], moduleDir));
  }
  lines.push('');

  lines.push('## Coverage');
  lines.push('');
  lines.push('| Measure | Value | Source |');
  lines.push('|---|---|---|');
  lines.push(`| Test cases designed | ${orDash(testCases)} | [\`test_design/\`](test_design/) |`);
  lines.push(`| Findings recorded | ${orDash(findings)} | [\`discovery/findings/\`](discovery/findings/) |`);
  lines.push('');

  lines.push('## Automation');
  lines.push('');
  if (automation) {
    lines.push(`**Lifecycle state:** ${orDash(automation.state)}`
      + (automation.framework ? ` · **Framework:** ${automation.framework}` : ''));
    lines.push('');
    lines.push(`- Assembled into the baseline: ${orDash(automation.assembledAt) === '—' ? 'never' : automation.assembledAt}`);
    lines.push(`- Generated against shared ref: ${orDash(automation.baselineRef)}`);
    if (automation.sourceRuns?.length) {
      lines.push(`- Executed by: ${automation.sourceRuns.map((r) => `\`${r}\``).join(', ')}`);
    }
    // A promoted module's code is NOT under this module folder any more. Saying so here matters more
    // than anywhere else: this README is what a person opens to find the suite (pipeline.md §12.9).
    if (automation.state === 'Promoted' || automation.sourceOfTruth === 'baseline') {
      lines.push('');
      lines.push('> **Promoted — the code is not in this folder.** This module\'s executable'
        + ' automation lives in the Workspace Automation Baseline'
        + (automation.baselinePath ? ` at \`${automation.baselinePath}\`` : '')
        + ', which is its single source of truth. The working copy at'
        + (automation.retiredPath ? ` \`${automation.retiredPath}\`` : ' this module')
        + ` was retired on ${orDash(automation.promotedAt)}`
        + (automation.promotedBy ? ` by ${automation.promotedBy}` : '')
        + '. Everything else here — plans, reports, healing records, evidence — is permanent module'
        + ' history and stays.');
      if (automation.ownedPaths?.length) {
        lines.push('');
        lines.push(`- Baseline paths owned by this module: ${automation.ownedPaths.map((p) => `\`${p}\``).join(', ')}`);
      }
      if (automation.baselineUpdates?.length) {
        const last = automation.baselineUpdates[automation.baselineUpdates.length - 1];
        lines.push(`- In-place baseline updates: ${automation.baselineUpdates.length} (last ${last.at}, ${last.changedPaths.length} file(s))`);
      }
      lines.push('- If a `tests_*` directory ever reappears under this module, it is not usable —'
        + ' stop and report it (pipeline.md §12.10, safety rule 3).');
    }
  } else {
    lines.push('*No automation project yet — Stage 4A has not generated one for this module.*');
  }
  lines.push('');

  lines.push('## Runs that touched this module');
  lines.push('');
  if (runs.size) {
    for (const run of [...runs].sort()) {
      lines.push(`- [\`${run}\`](../../runs/${run}/)`);
    }
  } else {
    lines.push('*None yet.*');
  }
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(
    'Execution results are **not** stored in this folder — they belong to the run that produced them '
    + '([`module_architecture.md` §9](../../../workflows_and_pipelines/pipeline/module_architecture.md)). '
    + 'The runs listed above are where they live.'
  );
  lines.push('');

  return lines.join('\n');
}

/**
 * Renders and writes a module's README.md.
 * @param {string} modulesDir
 * @param {string} slug
 * @param {{now: Date, runs?: string[]}} opts
 * @returns {string} the file path written
 */
function writeModuleSummary(modulesDir, slug, opts = {}) {
  const content = renderModuleSummary(modulesDir, slug, opts);
  const file = path.join(modulesDir, slug, 'README.md');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

module.exports = {
  STAGE_LABELS,
  STAGE_PRIMARY_ARTIFACT,
  extractScopeStatement,
  countTestCases,
  countFindings,
  renderModuleSummary,
  writeModuleSummary,
};
