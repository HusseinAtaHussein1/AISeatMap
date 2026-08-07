// Execution Safety — loading, hashing, and locating the project policy.
//
// SEPARATION OF OWNERSHIP (HD-SAFETY-004, pipeline.md §1.1)
//   platform_core/tools/execution_safety/   the evaluator — reusable, project-agnostic, no rules
//   platform_core_data/knowledge_base/      the policy    — this project's actual permissions
//
// This file is the only place the two meet, and it meets them by path resolution alone: it never
// contains a rule, a module name, or an environment this project happens to use.
//
// THE JSON IS AUTHORITATIVE FOR EVALUATION; the `.md` companion beside it is authoritative for
// review. That asymmetry is deliberate and mirrors the platform's existing Markdown-authored /
// generated-workbook split: a governance artifact a reviewer cannot read in prose is one nobody
// reviews, and a policy a machine cannot parse is one nothing enforces.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { assertValidPolicy, validatePolicy, PolicyError } = require('./schema');

/** The canonical filenames. Both live in the data root's knowledge_base/. */
const POLICY_FILENAME = 'execution_safety_policy.json';
const POLICY_DOC_FILENAME = 'execution_safety_policy.md';

/** Where run-scoped authorizations live: inside the run folder, so they cannot outlive it. */
const AUTHORIZATIONS_FILENAME = 'SafetyAuthorizations.json';
const AUTHORIZATIONS_DOC_FILENAME = 'SafetyAuthorizations.md';
const PREFLIGHT_FILENAME = 'SafetyPreflight.md';

/**
 * Resolves the data root without hard-coding it, so an installed copy of the platform finds its own
 * `platform_core_data/` rather than this repository's.
 */
function resolveDataRoot(startDir) {
  // eslint-disable-next-line global-require
  const paths = require('../platform_paths/paths');
  const roots = paths.resolveRoots({ startDir: startDir || process.cwd(), fresh: true });
  return roots.dataRoot;
}

/** Absolute path to the machine-readable policy. */
function policyPath(dataRoot) {
  return path.join(dataRoot || resolveDataRoot(), 'knowledge_base', POLICY_FILENAME);
}

/** Absolute path to the human-readable companion. */
function policyDocPath(dataRoot) {
  return path.join(dataRoot || resolveDataRoot(), 'knowledge_base', POLICY_DOC_FILENAME);
}

/** Absolute path to a run's authorization store. */
function authorizationsPath(dataRoot, runFolder) {
  return path.join(dataRoot || resolveDataRoot(), 'runs', runFolder, 'metadata', AUTHORIZATIONS_FILENAME);
}

/** Absolute path to a run's preflight record. */
function preflightPath(dataRoot, runFolder) {
  return path.join(dataRoot || resolveDataRoot(), 'runs', runFolder, 'metadata', PREFLIGHT_FILENAME);
}

/**
 * A stable hash of the policy's CONTENT, not of its file bytes.
 *
 * Key order and whitespace change nothing; a decision changing changes everything. Recorded in run
 * metadata so a completed run can prove which policy it ran under, and so `same input + same policy
 * version => same decision` is a checkable claim rather than an assurance.
 */
function hashPolicy(policy) {
  return `sha256:${crypto.createHash('sha256').update(stableStringify(policy)).digest('hex').slice(0, 32)}`;
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

/**
 * Reads and validates the project policy.
 *
 * A MALFORMED POLICY THROWS. It is never partially applied and never silently replaced by a
 * default: a policy the loader half-understood would answer some questions correctly and quietly
 * drop the rules it could not parse, which is precisely how a `Forbidden` goes missing.
 *
 * @param {{dataRoot?: string, file?: string, startDir?: string}} [opts]
 * @returns {{policy: object, policyPath: string, policyHash: string, docPath: string, docExists: boolean}}
 */
function loadPolicy(opts = {}) {
  const file = opts.file || policyPath(opts.dataRoot || (opts.startDir ? resolveDataRoot(opts.startDir) : undefined));
  if (!fs.existsSync(file)) {
    throw new PolicyError(
      `No Execution Safety policy at ${file}.\n`
      + '  Without a policy nothing can be authorized, and nothing is assumed. Create it from '
      + 'platform_core/templates/execution_safety/execution_safety_policy.json, or pass --file.',
    );
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new PolicyError(`Execution Safety policy at ${file} is not valid JSON: ${err.message}`);
  }
  assertValidPolicy(raw);
  const docPath = path.join(path.dirname(file), POLICY_DOC_FILENAME);
  return {
    policy: raw,
    policyPath: file,
    policyHash: hashPolicy(raw),
    docPath,
    docExists: fs.existsSync(docPath),
  };
}

/**
 * Validates a policy file without loading it into an evaluator — the `--validate` path, and what
 * `doctor` calls. Returns a report rather than throwing, so a diagnostic can print every problem
 * at once instead of the first one.
 *
 * @returns {{ok: boolean, path: string, exists: boolean, problems: string[], policy: object|null, policyHash: string|null}}
 */
function validatePolicyFile(opts = {}) {
  const file = opts.file || policyPath(opts.dataRoot);
  if (!fs.existsSync(file)) {
    return { ok: false, path: file, exists: false, problems: ['Policy file not found.'], policy: null, policyHash: null };
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return { ok: false, path: file, exists: true, problems: [`Not valid JSON: ${err.message}`], policy: null, policyHash: null };
  }
  const { valid, problems } = validatePolicy(raw);
  return {
    ok: valid,
    path: file,
    exists: true,
    problems,
    policy: valid ? raw : null,
    policyHash: valid ? hashPolicy(raw) : null,
  };
}

/**
 * Loads a run's scoped authorizations.
 *
 * NO CROSS-RUN LEAKAGE, STRUCTURALLY. The store lives inside the run folder, so one run physically
 * cannot read another's — and every record still carries its own `runId`, which the evaluator
 * re-checks, so a copied file authorizes nothing either.
 *
 * A missing store is normal and means exactly what it says: this run has been granted nothing.
 *
 * @returns {{authorizations: object[], path: string, exists: boolean, foreign: object[]}}
 */
function loadAuthorizations({ dataRoot, runFolder, file } = {}) {
  const target = file || authorizationsPath(dataRoot, runFolder);
  if (!fs.existsSync(target)) return { authorizations: [], path: target, exists: false, foreign: [] };
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch (err) {
    throw new PolicyError(`Authorization store at ${target} is not valid JSON: ${err.message}`);
  }
  const all = Array.isArray(raw) ? raw : (raw.authorizations || []);
  // A record whose runId does not match the folder it sits in is discarded, not honoured. That is
  // the copied-file case, and honouring it would be exactly the leak this design forbids.
  const own = [];
  const foreign = [];
  for (const a of all) {
    if (runFolder && a && String(a.runId) !== String(runFolder)) foreign.push(a);
    else own.push(a);
  }
  return { authorizations: own, path: target, exists: true, foreign };
}

module.exports = {
  POLICY_FILENAME,
  POLICY_DOC_FILENAME,
  AUTHORIZATIONS_FILENAME,
  AUTHORIZATIONS_DOC_FILENAME,
  PREFLIGHT_FILENAME,
  resolveDataRoot,
  policyPath,
  policyDocPath,
  authorizationsPath,
  preflightPath,
  hashPolicy,
  stableStringify,
  loadPolicy,
  validatePolicyFile,
  loadAuthorizations,
};
