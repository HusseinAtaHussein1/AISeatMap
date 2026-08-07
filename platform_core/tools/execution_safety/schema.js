// Execution Safety — the vocabulary, and the validator that keeps a policy inside it.
//
// WHY THIS FILE IS SEPARATE FROM THE EVALUATOR
// The evaluator answers "is this action authorized?". This file answers "is this policy even a
// policy?". Keeping them apart is what lets a malformed policy fail at load time with a list of
// specific complaints, instead of failing at execution time as a surprising `Forbidden` — or, far
// worse, as an accidental `Allowed` produced by a key nobody spelled correctly.
//
// NOTHING PROJECT-SPECIFIC LIVES HERE. No NDC rule, no STG rule, no module name. This file knows
// that `PAYMENT` is a financial action; it does not know whether payments are permitted anywhere.
// That separation is the whole point of platform_core/ vs platform_core_data/ (pipeline.md §1.1).
//
// See README.md in this folder for the model, and
// platform_core_data/knowledge_base/execution_safety_policy.md for the current project's policy.

'use strict';

// ---------------------------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------------------------

/**
 * The three canonical policy decisions. These are POLICY outcomes, not test results — a run that
 * cannot proceed because of one is recorded with the execution taxonomy's existing `Skipped` /
 * `Blocked`, never as an Application Failure (manual-execution-skill §8, automation-execution-skill
 * §17).
 */
const DECISIONS = ['Allowed', 'Approval Required', 'Forbidden'];

/** Restrictiveness order. Used when two equally-specific rules disagree — safety wins (§17). */
const DECISION_SEVERITY = { Allowed: 0, 'Approval Required': 1, Forbidden: 2 };

// ---------------------------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------------------------

/**
 * Action classification. Deliberately NOT reduced to CRUD: `UPDATE` an agency name and `PAYMENT`
 * are both state-changing, and the whole reason this platform needs a policy at all is that they
 * must be governable differently.
 */
const ACTIONS = [
  // read-shaped
  'READ', 'SEARCH', 'DOWNLOAD',
  // ordinary data mutation
  'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'OTHER_MUTATION',
  // approval workflow
  'SUBMIT', 'APPROVE', 'REJECT',
  // outbound side effects
  'SEND_NOTIFICATION',
  // booking lifecycle — materially different business effects, never collapsed into UPDATE
  'BOOK', 'HOLD', 'TICKET', 'CANCEL_BOOKING', 'VOID',
  // money
  'PAYMENT', 'TOP_UP', 'WALLET_CHARGE', 'REFUND',
  // identity and access
  'CREDENTIAL_CHANGE', 'ROLE_PERMISSION_CHANGE',
];

/**
 * Category → member actions. A policy may write a rule against a category (`financial`) or against
 * one action (`PAYMENT`); the action-level rule is the more specific of the two (§7 precedence).
 */
const ACTION_CATEGORIES = {
  read: ['READ', 'SEARCH', 'DOWNLOAD'],
  mutation: ['CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'OTHER_MUTATION'],
  approval: ['SUBMIT', 'APPROVE', 'REJECT'],
  notification: ['SEND_NOTIFICATION'],
  booking: ['BOOK', 'HOLD', 'TICKET', 'CANCEL_BOOKING', 'VOID'],
  financial: ['PAYMENT', 'TOP_UP', 'WALLET_CHARGE', 'REFUND'],
  privileged: ['CREDENTIAL_CHANGE', 'ROLE_PERMISSION_CHANGE'],
};

const CATEGORY_NAMES = Object.keys(ACTION_CATEGORIES);

/** Reverse index, built once. */
const CATEGORY_OF = (() => {
  const out = {};
  for (const [cat, members] of Object.entries(ACTION_CATEGORIES)) {
    for (const a of members) out[a] = cat;
  }
  return out;
})();

/**
 * Actions that change no state in the application under test. Everything else is a mutation for
 * the purposes of this policy, including anything unrecognised (see normalizeAction).
 */
const NON_MUTATING_ACTIONS = ['READ', 'SEARCH', 'DOWNLOAD'];

/** The action an unrecognised verb becomes. Never `READ` — an unknown verb is not a safe one. */
const UNKNOWN_ACTION_FALLBACK = 'OTHER_MUTATION';

// ---------------------------------------------------------------------------------------------
// Data ownership
// ---------------------------------------------------------------------------------------------

/**
 * Who the record belongs to. This axis exists because "may I update a record?" has no answer
 * without it: updating a record this run created and updating a record another team is mid-way
 * through approving are different acts that happen to use the same button.
 */
const OWNERSHIPS = ['SelfCreated', 'DedicatedTestData', 'Shared', 'ProductionLike', 'Unknown'];

/**
 * What an unprovable ownership becomes. `Unknown` MUST NEVER silently become `SelfCreated` — that
 * inversion is the single most dangerous mistake this model can make, because SelfCreated is the
 * most permissive class and Unknown is the one you reach when you cannot prove anything.
 */
const UNKNOWN_OWNERSHIP_FALLBACK = 'Unknown';

// ---------------------------------------------------------------------------------------------
// Environments
// ---------------------------------------------------------------------------------------------

/**
 * Environment identity comes from authoritative run/project configuration — NEVER from the URL.
 * A `192.168.x.x` address is not evidence of a safe test environment; it is evidence of a private
 * network, which is a different claim.
 */
const ENVIRONMENTS = [
  'Local', 'Development', 'QA', 'Test', 'Staging', 'PreProduction', 'Production', 'Unknown',
];

// ---------------------------------------------------------------------------------------------
// Rule-shape constants
// ---------------------------------------------------------------------------------------------

/** The ownership wildcard key permitted inside a rule table. */
const OWNERSHIP_WILDCARD = '*';

/** Keys a single rule object may carry when written in long form. */
const RULE_KEYS = ['decision', 'absolute', 'cleanupRequired', 'reason', 'source'];

/** Top-level policy keys. Anything else is rejected — a typo'd key is a silently missing rule. */
const POLICY_KEYS = [
  '$schema', 'policyId', 'policyVersion', 'effectiveFrom', 'description',
  'environment', 'environmentAliases', 'defaults', 'categories', 'actions', 'modules', 'notes',
];

/** Keys a module (or entity) override block may carry. */
const SCOPE_KEYS = ['categories', 'actions', 'entities', 'notes'];

class PolicyError extends Error {
  /** @param {string} message @param {string[]} [problems] */
  constructor(message, problems) {
    super(problems && problems.length ? `${message}\n  - ${problems.join('\n  - ')}` : message);
    this.name = 'PolicyError';
    this.problems = problems || [];
  }
}

// ---------------------------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------------------------

/**
 * Maps a caller's action string onto the canonical vocabulary.
 *
 * An unrecognised verb is NOT an error and is NOT rejected — it becomes `OTHER_MUTATION` and is
 * reported. Rejecting it outright would mean a Skill that meets a novel operation has no policy
 * answer at all, and "no answer" is how something executes unchecked.
 *
 * @returns {{action: string, recognised: boolean}}
 */
function normalizeAction(value) {
  const raw = String(value == null ? '' : value).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (ACTIONS.includes(raw)) return { action: raw, recognised: true };
  return { action: UNKNOWN_ACTION_FALLBACK, recognised: false };
}

/**
 * Maps a caller's ownership string onto the canonical vocabulary.
 *
 * Anything unrecognised — including an empty value — becomes `Unknown`, never `SelfCreated`.
 *
 * @returns {{ownership: string, recognised: boolean}}
 */
function normalizeOwnership(value) {
  const raw = String(value == null ? '' : value).trim().toLowerCase();
  const hit = OWNERSHIPS.find((o) => o.toLowerCase() === raw);
  if (hit) return { ownership: hit, recognised: true };
  return { ownership: UNKNOWN_OWNERSHIP_FALLBACK, recognised: false };
}

/**
 * Maps an environment name (or one of the policy's declared aliases, e.g. `STG`) onto the
 * canonical vocabulary. Unrecognised becomes `Unknown` — which no policy should permit anything on.
 *
 * @param {string} value
 * @param {object} [policy] consulted only for `environmentAliases`
 * @returns {{environment: string, recognised: boolean}}
 */
function normalizeEnvironment(value, policy) {
  const raw = String(value == null ? '' : value).trim();
  const lower = raw.toLowerCase();
  const hit = ENVIRONMENTS.find((e) => e.toLowerCase() === lower);
  if (hit) return { environment: hit, recognised: true };
  const aliases = (policy && policy.environmentAliases) || [];
  if (aliases.some((a) => String(a).trim().toLowerCase() === lower)) {
    return { environment: policy.environment, recognised: true };
  }
  return { environment: 'Unknown', recognised: false };
}

/** True when the action changes no state in the application under test. */
function isMutating(action) {
  return !NON_MUTATING_ACTIONS.includes(action);
}

/** The category an action belongs to, or `null` for an action outside the vocabulary. */
function categoryOf(action) {
  return CATEGORY_OF[action] || null;
}

// ---------------------------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------------------------

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Normalises a rule written in either supported form into its long form.
 *
 *   "Forbidden"                                          → short form
 *   { decision: "Forbidden", absolute: true, ... }        → long form
 *
 * @returns {{rule: object|null, problems: string[]}}
 */
function coerceRule(value, where) {
  const problems = [];
  if (typeof value === 'string') {
    if (!DECISIONS.includes(value)) {
      problems.push(`${where}: "${value}" is not a decision. Use one of: ${DECISIONS.join(' | ')}.`);
      return { rule: null, problems };
    }
    return { rule: { decision: value, absolute: false, cleanupRequired: false, reason: null }, problems };
  }
  if (!isPlainObject(value)) {
    problems.push(`${where}: expected a decision string or a rule object, got ${Array.isArray(value) ? 'an array' : typeof value}.`);
    return { rule: null, problems };
  }
  for (const key of Object.keys(value)) {
    if (!RULE_KEYS.includes(key)) {
      problems.push(`${where}: unsupported rule key "${key}". Supported: ${RULE_KEYS.join(', ')}.`);
    }
  }
  if (!DECISIONS.includes(value.decision)) {
    problems.push(`${where}.decision: "${value.decision}" is not a decision. Use one of: ${DECISIONS.join(' | ')}.`);
    return { rule: null, problems };
  }
  if (value.absolute !== undefined && typeof value.absolute !== 'boolean') {
    problems.push(`${where}.absolute: must be true or false.`);
  }
  if (value.absolute === true && value.decision !== 'Forbidden') {
    problems.push(`${where}: only a Forbidden rule may be absolute — "${value.decision}" cannot be. `
      + 'Absolute means "no other rule, at any scope, overrides this", which is meaningless for a permission.');
  }
  if (value.cleanupRequired !== undefined && typeof value.cleanupRequired !== 'boolean') {
    problems.push(`${where}.cleanupRequired: must be true or false.`);
  }
  if (value.reason !== undefined && value.reason !== null && typeof value.reason !== 'string') {
    problems.push(`${where}.reason: must be a string.`);
  }
  return {
    rule: {
      decision: value.decision,
      absolute: value.absolute === true,
      cleanupRequired: value.cleanupRequired === true,
      reason: value.reason || null,
      source: value.source || null,
    },
    problems,
  };
}

/** Validates one `{ownership: rule}` table. */
function validateOwnershipTable(table, where, problems) {
  if (!isPlainObject(table)) {
    problems.push(`${where}: expected an object keyed by ownership (${OWNERSHIPS.join(' | ')}) or "${OWNERSHIP_WILDCARD}".`);
    return;
  }
  const keys = Object.keys(table);
  if (!keys.length) problems.push(`${where}: empty. Remove it, or give it at least one ownership entry.`);
  for (const key of keys) {
    if (key !== OWNERSHIP_WILDCARD && !OWNERSHIPS.includes(key)) {
      problems.push(`${where}.${key}: "${key}" is not an ownership class. Use one of: ${OWNERSHIPS.join(' | ')}, or "${OWNERSHIP_WILDCARD}".`);
      continue;
    }
    problems.push(...coerceRule(table[key], `${where}.${key}`).problems);
  }
}

/** Validates a `categories` / `actions` block at any scope. */
function validateRuleBlocks(scope, where, problems) {
  if (scope.categories !== undefined) {
    if (!isPlainObject(scope.categories)) {
      problems.push(`${where}.categories: expected an object keyed by category name (${CATEGORY_NAMES.join(' | ')}).`);
    } else {
      for (const cat of Object.keys(scope.categories)) {
        if (!CATEGORY_NAMES.includes(cat)) {
          problems.push(`${where}.categories.${cat}: "${cat}" is not a category. Use one of: ${CATEGORY_NAMES.join(' | ')}.`);
          continue;
        }
        validateOwnershipTable(scope.categories[cat], `${where}.categories.${cat}`, problems);
      }
    }
  }
  if (scope.actions !== undefined) {
    if (!isPlainObject(scope.actions)) {
      problems.push(`${where}.actions: expected an object keyed by action name.`);
    } else {
      for (const act of Object.keys(scope.actions)) {
        if (!ACTIONS.includes(act)) {
          problems.push(`${where}.actions.${act}: "${act}" is not an action. Use one of: ${ACTIONS.join(', ')}.`);
          continue;
        }
        validateOwnershipTable(scope.actions[act], `${where}.actions.${act}`, problems);
      }
    }
  }
}

/**
 * Validates a policy document against the vocabulary above.
 *
 * A malformed policy FAILS — it is never partially applied. A policy the evaluator half-understands
 * is worse than no policy at all: it would answer some questions correctly and silently skip the
 * rules it could not parse, which is exactly how a `Forbidden` goes missing.
 *
 * @param {object} policy
 * @returns {{valid: boolean, problems: string[]}}
 */
function validatePolicy(policy) {
  const problems = [];
  if (!isPlainObject(policy)) {
    return { valid: false, problems: ['Policy must be a JSON object.'] };
  }

  for (const key of Object.keys(policy)) {
    if (!POLICY_KEYS.includes(key)) {
      problems.push(`Unsupported top-level key "${key}". Supported: ${POLICY_KEYS.join(', ')}.`);
    }
  }

  if (typeof policy.policyId !== 'string' || !policy.policyId.trim()) {
    problems.push('policyId: required, a non-empty string.');
  }
  if (!Number.isInteger(policy.policyVersion) || policy.policyVersion < 1) {
    problems.push('policyVersion: required, an integer >= 1.');
  }
  if (policy.effectiveFrom !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(policy.effectiveFrom))) {
    problems.push('effectiveFrom: must be an ISO date (YYYY-MM-DD).');
  }
  if (!ENVIRONMENTS.includes(policy.environment)) {
    problems.push(`environment: "${policy.environment}" is not an environment. Use one of: ${ENVIRONMENTS.join(' | ')}.`);
  }
  if (policy.environment === 'Unknown') {
    problems.push('environment: "Unknown" cannot be a policy\'s own environment — a policy must state '
      + 'which named environment it governs, or it authorizes nothing anywhere.');
  }
  if (policy.environmentAliases !== undefined) {
    if (!Array.isArray(policy.environmentAliases) || policy.environmentAliases.some((a) => typeof a !== 'string')) {
      problems.push('environmentAliases: must be an array of strings.');
    }
  }

  if (policy.defaults === undefined) {
    problems.push('defaults: required. Without it an action nobody wrote a rule for has no answer, '
      + 'and "no answer" is how something executes unchecked.');
  } else {
    validateOwnershipTable(policy.defaults, 'defaults', problems);
    if (isPlainObject(policy.defaults) && policy.defaults[OWNERSHIP_WILDCARD] === undefined) {
      problems.push(`defaults."${OWNERSHIP_WILDCARD}": required — the catch-all every unmatched operation lands on.`);
    }
  }

  validateRuleBlocks(policy, 'policy', problems);

  if (policy.modules !== undefined) {
    if (!isPlainObject(policy.modules)) {
      problems.push('modules: expected an object keyed by module slug.');
    } else {
      for (const mod of Object.keys(policy.modules)) {
        const block = policy.modules[mod];
        const where = `modules.${mod}`;
        if (!isPlainObject(block)) { problems.push(`${where}: expected an object.`); continue; }
        for (const key of Object.keys(block)) {
          if (!SCOPE_KEYS.includes(key)) {
            problems.push(`${where}: unsupported key "${key}". Supported: ${SCOPE_KEYS.join(', ')}.`);
          }
        }
        validateRuleBlocks(block, where, problems);
        if (block.entities !== undefined) {
          if (!isPlainObject(block.entities)) {
            problems.push(`${where}.entities: expected an object keyed by entity name.`);
          } else {
            for (const ent of Object.keys(block.entities)) {
              const eBlock = block.entities[ent];
              const eWhere = `${where}.entities.${ent}`;
              if (!isPlainObject(eBlock)) { problems.push(`${eWhere}: expected an object.`); continue; }
              for (const key of Object.keys(eBlock)) {
                if (key === 'entities') {
                  problems.push(`${eWhere}.entities: entities do not nest. Scope depth is global → module → entity.`);
                } else if (!SCOPE_KEYS.includes(key)) {
                  problems.push(`${eWhere}: unsupported key "${key}". Supported: categories, actions, notes.`);
                }
              }
              validateRuleBlocks(eBlock, eWhere, problems);
            }
          }
        }
      }
    }
  }

  return { valid: problems.length === 0, problems };
}

/** Throws a PolicyError listing every problem, or returns the policy unchanged. */
function assertValidPolicy(policy) {
  const { valid, problems } = validatePolicy(policy);
  if (!valid) throw new PolicyError('Execution Safety policy is not valid.', problems);
  return policy;
}

module.exports = {
  DECISIONS,
  DECISION_SEVERITY,
  ACTIONS,
  ACTION_CATEGORIES,
  CATEGORY_NAMES,
  NON_MUTATING_ACTIONS,
  UNKNOWN_ACTION_FALLBACK,
  OWNERSHIPS,
  UNKNOWN_OWNERSHIP_FALLBACK,
  ENVIRONMENTS,
  OWNERSHIP_WILDCARD,
  POLICY_KEYS,
  RULE_KEYS,
  SCOPE_KEYS,
  PolicyError,
  normalizeAction,
  normalizeOwnership,
  normalizeEnvironment,
  isMutating,
  categoryOf,
  coerceRule,
  validatePolicy,
  assertValidPolicy,
};
