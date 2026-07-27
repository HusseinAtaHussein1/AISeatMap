#!/usr/bin/env node
// Run Folder Migration — computes the run-folder compatibility index (.run_folder_index.json)
// and, only when provably safe, physically renames a legacy run folder to the new convention.
//
// Usage:
//   node platform_core/tools/run_manager/migrate.js [--apply] [--json]
//
// Dry-run (default): prints the proposed legacy -> new-name mapping and writes/updates
// platform_core_data/runs/.run_folder_index.json. Nothing under that directory is renamed.
//
// --apply: additionally performs a `git mv` rename for any folder where isRenameSafe() found zero
// outside references — every other folder is left untouched and stays represented only in the
// index. This is non-destructive (git mv, never copy+delete), idempotent (re-running after a
// rename is a no-op for that folder), and reversible (a `git mv` is trivially reversed).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { normalizeScope, sanitizeSegment, buildRunFolderName, formatTimestampUTC } = require('./runFolderName');
const { isRenameSafe, buildIndexEntry, saveIndex, loadIndex } = require('./runFolderIndex');
const { readActiveRun, setActiveRun } = require('./activeRun');

// Roots come from platform_paths, never from this file's own location: once the platform is
// installed inside a host project, `__dirname/../../..` is the host's repository, not the tool
// folder (pipeline.md §1.1). Resolved lazily so requiring this module never throws.
const { resolveRoots } = require('../platform_paths/paths');

function roots() {
  return resolveRoots();
}

const LEGACY_DIR_RE = /^RUN-(\d{8})-(\d{3})(?:-([a-z0-9-]+))?$/i;

// Exactly one runs directory exists. Still returned as a list so a fixture tree with none, or a
// future second location, needs no call-site change.
function findRunsDirs(dataRoot) {
  return [path.join(dataRoot, 'runs')].filter((p) => fs.existsSync(p));
}

function findFile(startDir, predicate) {
  const stack = [startDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (predicate(entry.name, full)) {
        return full;
      }
    }
  }
  return null;
}

function findAllFiles(startDir, predicate) {
  const out = [];
  const stack = [startDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(entry.name, full)) out.push(full);
    }
  }
  return out;
}

/** Case-insensitive lookup of the first present key from `keys` in `obj`. */
function firstDefined(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  const lower = {};
  for (const k of Object.keys(obj)) lower[k.toLowerCase()] = obj[k];
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return undefined;
}

function readRunJson(runFolderAbs) {
  const p = path.join(runFolderAbs, 'metadata', 'run.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Splits a markdown file into its separate pipe tables — a run_configuration.md/RunManifest.md
 * typically has several (Target Environment, Credentials, History of scope choices, ...), and
 * treating them as one flat row list would misalign column indices across unrelated tables.
 * Each returned table is an array of rows (array of trimmed cell strings); the `---|---`
 * separator row is dropped from every table.
 * @param {string} content
 * @returns {string[][][]}
 */
function parseMarkdownTables(content) {
  const lines = content.split(/\r?\n/);
  const tables = [];
  let current = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const isPipeRow = trimmed.startsWith('|') && trimmed.endsWith('|');
    if (!isPipeRow) {
      if (current.length) tables.push(current);
      current = [];
      continue;
    }
    if (/^\|[\s:|-]+\|$/.test(trimmed)) continue; // separator row — same table, not a data row
    current.push(trimmed.slice(1, -1).split('|').map((c) => c.trim()));
  }
  if (current.length) tables.push(current);
  return tables;
}

function stripMarkdown(text) {
  return String(text)
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

/** Looks up a run's row in run_configuration.md's "History of scope choices" table. */
function fromRunConfiguration(runId, dataRoot) {
  const p = path.join(dataRoot, 'run_configuration.md');
  if (!fs.existsSync(p)) return null;
  const content = fs.readFileSync(p, 'utf8');
  const tables = parseMarkdownTables(content);

  // The "History of scope choices" table is identified by its own header, not by position — a
  // run_configuration.md has several unrelated tables (Target Environment, Credentials, ...)
  // before it, and blindly using the first table's header would misalign every column lookup.
  const historyTable = tables.find((rows) => {
    const header = (rows[0] || []).map((h) => h.toLowerCase());
    return header.some((h) => h.includes('run type')) && header.some((h) => h.includes('module') || h.includes('scope'));
  });
  if (!historyTable) return null;

  const header = historyTable[0].map((h) => h.toLowerCase());
  const runTypeCol = header.findIndex((h) => h.includes('run type'));
  const moduleCol = header.findIndex((h) => h.includes('module') || (h.includes('scope') && h.includes('summary')));

  for (const row of historyTable.slice(1)) {
    const firstCell = stripMarkdown(row[0] || '');
    if (firstCell.startsWith('<!--')) continue;
    if (!firstCell.includes(runId)) continue;
    return {
      scopeRaw: runTypeCol >= 0 ? stripMarkdown(row[runTypeCol] || '') : undefined,
      target: moduleCol >= 0 ? stripMarkdown(row[moduleCol] || '') : undefined,
      source: 'run_configuration.md history table',
    };
  }
  return null;
}

/** Looks up a run's section in the RunManifest.md file. */
function fromRunManifest(runId, dataRoot) {
  const manifestPath = findAllFiles(dataRoot, (name) => /RunManifest\.md$/.test(name))[0];
  if (!manifestPath) return null;
  const content = fs.readFileSync(manifestPath, 'utf8');
  const lines = content.split(/\r?\n/);

  let sectionStart = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^#{1,3}\s/.test(lines[i]) && lines[i].includes(runId)) {
      sectionStart = i;
      break;
    }
  }
  if (sectionStart === -1) return null;

  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    if (/^#{1,3}\s/.test(lines[i])) {
      sectionEnd = i;
      break;
    }
  }
  const section = lines.slice(sectionStart, sectionEnd).join('\n');

  const headingTitleMatch = lines[sectionStart].match(/—\s*(.+)$/);
  const scopeTypeMatch = section.match(/Run Scope:\s*Type\s*=\s*([^·\n]+)/i);
  const purposeMatch = section.match(/Purpose:\s*(.+)/i);

  return {
    scopeRaw: scopeTypeMatch ? scopeTypeMatch[1].trim() : undefined,
    target: headingTitleMatch ? headingTitleMatch[1].trim() : (purposeMatch ? purposeMatch[1].trim() : undefined),
    source: `${path.relative(dataRoot, manifestPath)}`,
  };
}

function inferStartedDate(runJson, runId) {
  const raw = runJson && firstDefined(runJson, ['startedTime', 'Started Time']);
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const legacyMatch = runId.match(/^RUN-(\d{4})(\d{2})(\d{2})-\d{3}$/);
  if (legacyMatch) {
    const [, y, mo, d] = legacyMatch;
    // Built in UTC (not local time): a legacy Run ID only ever carries a calendar date, no real
    // clock time, so formatting this via formatTimestampUTC must reproduce that exact date with
    // zero timezone drift, regardless of which machine the migration runs on.
    return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 0, 0, 0));
  }
  return null;
}

/**
 * Infers {scopeRaw, target, source, confidence, startedDate} for one legacy run folder, trying
 * (in order) metadata/run.json, run_configuration.md's history table, and *_RunManifest.md —
 * filling only the fields still missing after each source, never overwriting an earlier hit.
 */
function inferRunMetadata(runId, runFolderAbs, dataRootOverride) {
  const dataRoot = dataRootOverride || roots().dataRoot;
  const runJson = readRunJson(runFolderAbs);
  // Note: the documented camelCase run.json schema (run_manager.md §7) uses the JSON key `scope`
  // for a *target* description (e.g. "Login Module"), not a scope category — so it's only ever
  // consulted as a target fallback, never as a scopeRaw source, to avoid double-counting it as both.
  // Ternary (not `runJson && ...`): when runJson is null, this must yield `undefined`, not `null`
  // — every downstream check below tests `=== undefined` to decide whether to keep searching.
  let scopeRaw = runJson ? firstDefined(runJson, ['Run Type', 'runType', 'Run Scope Type', 'runScopeType']) : undefined;
  let target = runJson ? firstDefined(runJson, ['module', 'moduleName', 'displayName', 'scope', 'userStory', 'feature']) : undefined;
  const sources = [];
  if (scopeRaw !== undefined || target !== undefined) sources.push('metadata/run.json');

  if (scopeRaw === undefined || target === undefined) {
    const fromConfig = fromRunConfiguration(runId, dataRoot);
    if (fromConfig) {
      if (scopeRaw === undefined && fromConfig.scopeRaw) scopeRaw = fromConfig.scopeRaw;
      if (target === undefined && fromConfig.target) target = fromConfig.target;
      sources.push(fromConfig.source);
    }
  }

  if (scopeRaw === undefined || target === undefined) {
    const fromManifest = fromRunManifest(runId, dataRoot);
    if (fromManifest) {
      if (scopeRaw === undefined && fromManifest.scopeRaw) scopeRaw = fromManifest.scopeRaw;
      if (target === undefined && fromManifest.target) target = fromManifest.target;
      sources.push(fromManifest.source);
    }
  }

  const startedDate = inferStartedDate(runJson, runId);
  const confidence = sources.length === 0 ? 'low' : (scopeRaw !== undefined && target !== undefined ? 'high' : 'medium');

  return {
    scopeRaw,
    target,
    startedDate,
    source: sources.length ? sources.join(' + ') : 'no metadata found (folder name only)',
    confidence,
  };
}

function computeInferredName(meta, runId) {
  const date = meta.startedDate || new Date(0);
  const timestamp = formatTimestampUTC(date);
  return buildRunFolderName({
    timestamp,
    scope: normalizeScope(meta.scopeRaw),
    target: sanitizeSegment(meta.target),
  });
}

/**
 * @param {{apply?: boolean, dataRoot?: string, gitRoot?: string}} [options]
 *   `dataRoot` and `gitRoot` default to platform_paths' resolution. Both are injectable so a test
 *   can point the migration at a fixture tree without reaching this repository's own git state.
 */
function migrateRuns({ apply = false, dataRoot, gitRoot } = {}) {
  const resolved = dataRoot ? { dataRoot, toolRoot: dataRoot } : roots();
  const effectiveDataRoot = dataRoot || resolved.dataRoot;
  // Renames are scoped to the platform's own data, never the whole repository: installed inside a
  // host project, scanning from the repository root would walk the application's entire source tree
  // and could `git mv` inside the host's history (pipeline.md §13.4).
  const effectiveGitRoot = gitRoot || effectiveDataRoot;

  const runsDirs = findRunsDirs(effectiveDataRoot);
  const report = [];
  const pointerWarnings = [];

  for (const runsDir of runsDirs) {
    const entries = fs.readdirSync(runsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && LEGACY_DIR_RE.test(e.name))
      .map((e) => e.name)
      .sort();

    const existingIndex = loadIndex(runsDir);
    const indexByLegacyName = new Map(existingIndex.map((e) => [e.legacyName, e]));
    const assignedNewNames = new Set(existingIndex.map((e) => e.inferredNewName));
    const newIndex = [];

    for (const folderName of entries) {
      const folderAbs = path.join(runsDir, folderName);
      const legacyMatch = folderName.match(LEGACY_DIR_RE);
      const runId = `RUN-${legacyMatch[1]}-${legacyMatch[2]}`;

      const meta = inferRunMetadata(runId, folderAbs, effectiveDataRoot);
      let inferredNewName = computeInferredName(meta, runId);

      // Deduplicate against names already assigned to a *different* legacy folder this run.
      if (assignedNewNames.has(inferredNewName) && indexByLegacyName.get(folderName)?.inferredNewName !== inferredNewName) {
        let i = 2;
        while (assignedNewNames.has(`${inferredNewName}__${i}`)) i += 1;
        inferredNewName = `${inferredNewName}__${i}`;
      }
      assignedNewNames.add(inferredNewName);

      const safe = isRenameSafe(effectiveGitRoot, folderAbs);
      const entry = buildIndexEntry(folderName, inferredNewName, {
        source: meta.source,
        confidence: meta.confidence,
      });
      entry.renameSafe = safe;
      newIndex.push(entry);

      let renamed = false;
      if (apply && safe) {
        const target = path.join(runsDir, inferredNewName);
        execFileSync('git', ['mv', folderAbs, target], { cwd: effectiveGitRoot });
        renamed = true;

        // Follow the Active Run pointer across the rename (run_manager.md §5.7).
        // Without this the pointer is left naming a folder that no longer exists, and — because
        // the compatibility index only maps inferredNewName -> legacyName, never the reverse — the
        // old name becomes unresolvable, so the pointer is not merely stale but UNRECOVERABLE:
        // every subsequent stage hard-stops until a human re-runs `cli.js use`. The rename is the
        // one moment both names are known, so this is the only place the fix is cheap.
        try {
          const pointer = readActiveRun(runsDir);
          if (pointer && pointer.activeRun && pointer.activeRun.folderName === folderName) {
            setActiveRun(runsDir, inferredNewName, {
              now: new Date(),
              setBy: 'Run Manager (migrate)',
              note: `followed rename ${folderName} -> ${inferredNewName}`,
            });
          }
        } catch (err) {
          // Pointer bookkeeping must never fail an otherwise-successful migration — surface it.
          pointerWarnings.push(
            `Renamed ${folderName} -> ${inferredNewName}, but the active-run pointer could not be ` +
            `updated (${err.message}). Run \`cli.js use ${inferredNewName}\` to repoint it.`
          );
        }
      }

      report.push({ runsDir: path.relative(effectiveDataRoot, runsDir), ...entry, renamed });
    }

    saveIndex(runsDir, newIndex);
  }

  // Attached rather than thrown: a migration that renamed folders successfully but could not
  // repoint the pointer still succeeded at its job; the caller needs to see the follow-up action.
  if (pointerWarnings.length) report.pointerWarnings = pointerWarnings;
  return report;
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const asJson = args.includes('--json');

  if (args.includes('--project')) {
    console.error(
      '--project is no longer accepted: the platform hosts one project, rooted at ' +
      'platform_core_data/ (pipeline.md §1). Usage: node migrate.js [--apply] [--json]'
    );
    process.exitCode = 1;
    return;
  }

  const report = migrateRuns({ apply });

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    for (const r of report) {
      const status = r.renamed ? 'RENAMED' : (r.renameSafe ? 'safe (not applied)' : 'kept (unsafe to rename)');
      console.log(`${r.legacyName}  ->  ${r.inferredNewName}  [${status}]  (confidence: ${r.confidence}, source: ${r.source})`);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  migrateRuns,
  inferRunMetadata,
  computeInferredName,
  fromRunConfiguration,
  fromRunManifest,
  parseMarkdownTables,
};
