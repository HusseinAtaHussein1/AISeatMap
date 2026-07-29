// Module Automation State — a module automation project's lifecycle, from Generated to Approved.
//
// See workflows_and_pipelines/pipeline/module_architecture.md §7.4.
//
// This tracks the third automation location the module workspace introduces: the Module Automation
// Project at modules/{slug}/automation/, which sits between generation and the whole-project
// baseline. It replaces the per-run .lifecycle_snapshot.json that §12.3's Working Copy Creation
// used to write, and carries the same baseline-ref role for the shared/ directory.
//
// The four states are a strict progression with exactly one branch: Healed re-enters at Executed's
// position, because a healed suite must be re-approved before assembly (§8.4). Approval is per
// module and is the EXISTING §5.2 Automation Approval gate — not a new one.

const fs = require('fs');
const path = require('path');

const { writeJsonAtomic } = require('./moduleRegistry');

const AUTOMATION_STATE_FILENAME = '.module_automation_state.json';
const AUTOMATION_STATE_SCHEMA_VERSION = 1;

/**
 * The lifecycle states, in order.
 *   Generated — Stage 4A wrote it; not yet executed
 *   Executed  — Stage 5A ran it; results live in a run folder, referenced here
 *   Healed    — Stage 5H applied approved repairs and re-ran the affected tests
 *   Approved  — cleared the §5.2 gate; eligible for assembly into the baseline
 */
const AUTOMATION_STATES = ['Generated', 'Executed', 'Healed', 'Approved'];

/**
 * Which transitions are legal.
 *
 * The two that matter:
 *   - `Approved -> Healed` is legal: an already-approved suite that later fails may be repaired, and
 *     the repair drops it out of Approved so it must clear the gate again (§8.4). Healing never
 *     shortcuts assembly.
 *   - `Generated -> Approved` is legal but notable: a reviewer may approve a suite they ran
 *     themselves rather than through Stage 5A. §7.2's standalone requirement is what makes that
 *     possible, and refusing it would punish the reviewer for doing the more careful thing.
 */
const LEGAL_TRANSITIONS = {
  Generated: ['Generated', 'Executed', 'Approved'],
  Executed: ['Generated', 'Executed', 'Healed', 'Approved'],
  Healed: ['Generated', 'Executed', 'Healed', 'Approved'],
  Approved: ['Generated', 'Executed', 'Healed', 'Approved'],
};

class AutomationStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AutomationStateError';
  }
}

/**
 * @param {string} modulesDir
 * @param {string} slug
 * @returns {string} absolute path to the state file
 */
function automationStatePath(modulesDir, slug) {
  return path.join(modulesDir, slug, 'automation', AUTOMATION_STATE_FILENAME);
}

/**
 * Reads a module's automation state. Returns null when there is no automation project yet — a
 * legitimate state (Stage 4A has not run for this module), not an error.
 * @param {string} modulesDir
 * @param {string} slug
 * @returns {object|null}
 */
function readAutomationState(modulesDir, slug) {
  let raw;
  try {
    raw = fs.readFileSync(automationStatePath(modulesDir, slug), 'utf8');
  } catch {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new AutomationStateError(
      `${AUTOMATION_STATE_FILENAME} for module "${slug}" is not valid JSON: ${err.message}`
    );
  }

  if (parsed.schemaVersion !== undefined && parsed.schemaVersion > AUTOMATION_STATE_SCHEMA_VERSION) {
    throw new AutomationStateError(
      `${AUTOMATION_STATE_FILENAME} for module "${slug}" declares schemaVersion ` +
      `${parsed.schemaVersion}, but this tool understands ${AUTOMATION_STATE_SCHEMA_VERSION}.`
    );
  }

  return parsed;
}

/**
 * Records a module automation project's state.
 *
 * Transitions are validated rather than assumed: an illegal one means a caller has skipped a step,
 * and skipping the step before Approved is exactly the failure mode §5.2's gate exists to prevent.
 *
 * `approvedBy` is REQUIRED when moving to Approved, and never defaulted — for the same reason
 * pipeline.md §12.6 forbids a fabricated Automation Approval record for code nobody reviewed.
 *
 * @param {string} modulesDir
 * @param {string} slug
 * @param {string} state - one of AUTOMATION_STATES
 * @param {{now: Date, framework?: string, baselineRef?: string, sourceRun?: string,
 *          approvedBy?: string, note?: string}} opts
 * @returns {object} the written state
 */
function setAutomationState(modulesDir, slug, state, opts = {}) {
  const { now, sourceRun, approvedBy } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new AutomationStateError('setAutomationState requires an explicit valid `now` Date.');
  }
  if (!AUTOMATION_STATES.includes(state)) {
    throw new AutomationStateError(
      `Unknown automation state "${state}". Expected one of: ${AUTOMATION_STATES.join(', ')}.`
    );
  }

  const prior = readAutomationState(modulesDir, slug);
  if (prior?.state && !LEGAL_TRANSITIONS[prior.state].includes(state)) {
    throw new AutomationStateError(
      `Illegal automation state transition for "${slug}": ${prior.state} -> ${state}. ` +
      `Legal next states: ${LEGAL_TRANSITIONS[prior.state].join(', ')}.`
    );
  }
  if (state === 'Approved' && (!approvedBy || !String(approvedBy).trim())) {
    throw new AutomationStateError(
      `Approving "${slug}"'s automation requires \`approvedBy\` — an Automation Approval record ` +
      'naming no approver is not an approval (pipeline.md §5.2).'
    );
  }

  const timestamp = now.toISOString();
  const sourceRuns = new Set(prior?.sourceRuns || []);
  if (sourceRun) sourceRuns.add(sourceRun);

  const next = {
    schemaVersion: AUTOMATION_STATE_SCHEMA_VERSION,
    module: slug,
    state,
    framework: opts.framework ?? prior?.framework ?? null,
    // The shared/ commit this project was generated against — path-scoped, per §12.3's rule that a
    // bare repo HEAD must never stand in for a scoped one in a monorepo.
    baselineRef: opts.baselineRef ?? prior?.baselineRef ?? null,
    sourceRuns: [...sourceRuns],
    assembledAt: prior?.assembledAt ?? null,
    approvedBy: state === 'Approved' ? approvedBy : (prior?.approvedBy ?? null),
    approvedAt: state === 'Approved' ? timestamp : (prior?.approvedAt ?? null),
    updatedAt: timestamp,
    history: [
      ...(prior?.history || []),
      { state, at: timestamp, ...(sourceRun ? { run: sourceRun } : {}), ...(opts.note ? { note: opts.note } : {}) },
    ],
  };

  writeJsonAtomic(automationStatePath(modulesDir, slug), next);
  return next;
}

/**
 * Records that an approved module project has been assembled into the whole-project baseline (§7.5).
 *
 * Refuses anything but Approved. Assembly is the point at which one module's code joins the suite
 * the Target Project will receive, and letting an unapproved project through here would make §5.2's
 * gate advisory.
 *
 * @param {string} modulesDir
 * @param {string} slug
 * @param {{now: Date, baselineRef?: string, mergeSummaryPath?: string}} opts
 * @returns {object} the written state
 */
function recordAssembly(modulesDir, slug, opts = {}) {
  const { now } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new AutomationStateError('recordAssembly requires an explicit valid `now` Date.');
  }

  const prior = readAutomationState(modulesDir, slug);
  if (!prior) {
    throw new AutomationStateError(`Module "${slug}" has no automation project to assemble.`);
  }
  if (prior.state !== 'Approved') {
    throw new AutomationStateError(
      `Module "${slug}"'s automation is ${prior.state}, not Approved. Only an Approved module ` +
      'project may be assembled into the baseline (module_architecture.md §7.5).'
    );
  }

  const timestamp = now.toISOString();
  const next = {
    ...prior,
    assembledAt: timestamp,
    baselineRef: opts.baselineRef ?? prior.baselineRef,
    ...(opts.mergeSummaryPath ? { lastMergeSummary: opts.mergeSummaryPath } : {}),
    updatedAt: timestamp,
    history: [...(prior.history || []), { state: 'Assembled', at: timestamp }],
  };

  writeJsonAtomic(automationStatePath(modulesDir, slug), next);
  return next;
}

/**
 * Every module whose automation project is Approved and therefore eligible for assembly. This is
 * what the assembly step iterates: the whole-project baseline is built from approved module
 * projects, and an unapproved one is simply not part of it yet.
 * @param {string} modulesDir
 * @param {string[]} slugs
 * @returns {Array<{slug: string, state: object}>}
 */
function listAssemblable(modulesDir, slugs = []) {
  return slugs
    .map((slug) => ({ slug, state: readAutomationState(modulesDir, slug) }))
    .filter((m) => m.state && m.state.state === 'Approved');
}

module.exports = {
  AUTOMATION_STATE_FILENAME,
  AUTOMATION_STATE_SCHEMA_VERSION,
  AUTOMATION_STATES,
  LEGAL_TRANSITIONS,
  AutomationStateError,
  automationStatePath,
  readAutomationState,
  setAutomationState,
  recordAssembly,
  listAssemblable,
};
