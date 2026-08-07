// Observability — reading the canonical evidence the aggregator counts.
//
// EVERYTHING IMPURE LIVES HERE. `aggregator.js` is a pure function over data; this module is the only
// part that touches a filesystem. That boundary is what lets every metric assertion in the test suite
// be an exact number rather than a fixture-directory scavenger hunt.
//
// NOTHING HERE IS A SECOND SOURCE OF TRUTH.
//   Test Design decisions      read through test_suite_export's own parser
//   Execution Safety outcomes  read from the run's Safety records and its preflight event
//   Run identity               read from metadata/run.json
// Where the platform already owns a reader, this calls it. Re-parsing an artifact a tool already
// parses is how two components end up disagreeing about the same file.

'use strict';

const fs = require('fs');
const path = require('path');

const { resolveDataRoot } = require('./recorder');

/** The run's own metadata. Identity, declared timing, and workflow — never recomputed. */
function loadRunJson({ dataRoot, runFolder } = {}) {
  const file = path.join(dataRoot || resolveDataRoot(), 'runs', runFolder, 'metadata', 'run.json');
  try {
    return { runJson: JSON.parse(fs.readFileSync(file, 'utf8')), path: file, exists: true };
  } catch {
    return { runJson: {}, path: file, exists: false };
  }
}

/**
 * Reads every module's Test Case suite through the canonical parser.
 *
 * Review and Automation totals are DERIVED from the Case Index each time rather than cached, so they
 * cannot drift from the artifact a reviewer is looking at. The suite's own header carries a
 * `Total Test Cases` line; it is deliberately ignored, because it is hand-maintained and the parsed
 * index is not.
 *
 * @param {{dataRoot?: string, modules?: string[]}} opts - omit `modules` to read every module
 * @returns {{suites: Array<{module, file, cases, warnings}>, problems: string[]}}
 */
function loadTestSuites({ dataRoot, modules } = {}) {
  // eslint-disable-next-line global-require
  const { parseTestCases } = require('../test_suite_export/parseTestCases');

  const root = dataRoot || resolveDataRoot();
  const modulesDir = path.join(root, 'modules');
  const problems = [];
  const suites = [];

  let slugs = modules;
  if (!slugs) {
    try {
      slugs = fs.readdirSync(modulesDir, { withFileTypes: true })
        .filter((e) => e.isDirectory()).map((e) => e.name).sort();
    } catch {
      return { suites: [], problems: [`No modules directory at ${modulesDir}.`] };
    }
  }

  for (const slug of slugs) {
    const dir = path.join(modulesDir, slug, 'test_design');
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => /^TestCases_.*\.md$/i.test(f)).sort();
    } catch {
      continue; // A module with no test_design folder has not reached Stage 3. Not a problem.
    }
    for (const f of files) {
      const file = path.join(dir, f);
      try {
        const parsed = parseTestCases(fs.readFileSync(file, 'utf8'), { sourceLabel: `${slug}/${f}` });
        suites.push({ module: slug, file, cases: parsed.cases || [], warnings: parsed.warnings || [] });
      } catch (err) {
        problems.push(`${file}: ${err.message}`);
      }
    }
  }
  return { suites, problems };
}

/**
 * Assembles Execution Safety evidence for a run.
 *
 * Preflight TOTALS come from the run's `SAFETY_PREFLIGHT_COMPLETED` event rather than from parsing
 * `SafetyPreflight.md`. That is deliberate: the Markdown is a human-readable rendering, and scraping
 * numbers back out of prose the platform itself formatted is exactly the "read Skill prose and invent
 * metrics" path this capability is supposed to close. The executing stage already holds the
 * structured `preflight()` result at the moment it writes the record, so it emits it.
 *
 * AUTHORIZATIONS come from `SafetyAuthorizations.json`, which is already machine-readable, and are
 * loaded through Execution Safety's own loader so the run-ID cross-check applies here too.
 *
 * @param {{dataRoot?: string, runFolder: string, events?: object[]}} opts
 */
function loadSafetyEvidence({ dataRoot, runFolder, events = [] } = {}) {
  const evidence = { preflight: null, authorizations: [], policyHash: null, cleanupCompleted: null, foreign: [] };

  const preflightEvents = events.filter((e) => e.type === 'SAFETY_PREFLIGHT_COMPLETED');
  const last = preflightEvents[preflightEvents.length - 1];
  if (last && last.metadata && typeof last.metadata === 'object') {
    const m = last.metadata;
    evidence.preflight = {
      policyId: m.policyId || null,
      policyVersion: m.policyVersion ?? null,
      environment: m.environment || null,
      totals: m.totals && typeof m.totals === 'object' ? m.totals : {},
    };
    evidence.policyHash = m.policyHash || null;
    if (Number.isFinite(m.cleanupCompleted)) evidence.cleanupCompleted = m.cleanupCompleted;
  }

  try {
    // eslint-disable-next-line global-require
    const { loadAuthorizations } = require('../execution_safety/policyLoader');
    const res = loadAuthorizations({ dataRoot, runFolder });
    evidence.authorizations = res.authorizations;
    evidence.foreign = res.foreign;
  } catch {
    // Execution Safety may not be installed, or the store may be unreadable. Either way this run has
    // no authorizations to report, which is a legitimate state and not an error to raise here.
  }

  return evidence;
}

/** Every run folder, newest first by name — the ordering `run_manager list` already uses. */
function listRuns({ dataRoot } = {}) {
  const runsDir = path.join(dataRoot || resolveDataRoot(), 'runs');
  try {
    return fs.readdirSync(runsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

module.exports = {
  loadRunJson,
  loadTestSuites,
  loadSafetyEvidence,
  listRuns,
};
