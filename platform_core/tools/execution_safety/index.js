// Execution Safety — the platform's deterministic answer to one question:
//
//     Is this specific action authorized on this specific environment, against this type of data,
//     for this run?
//
// Three independent governance concerns, and this is the third:
//
//     Review           Is the Test Case accepted?          (test-design-skill §6.3)
//     Automation       Should it be automated?             (test-design-skill §6.3.2)
//     Execution Safety May this action execute here, now?  (this module)
//
// They never substitute for one another. `Allowed` cannot make an unreviewed case executable, and
// `Review = Approved` + `Automation = Approved` authorizes generation, never mutation.
//
// See README.md for the model and the precedence algorithm.

'use strict';

const schema = require('./schema');
const evaluator = require('./evaluator');
const policyLoader = require('./policyLoader');
const authorizations = require('./authorizations');
const preflightModule = require('./preflight');

module.exports = {
  // Primary surface
  evaluate: evaluator.evaluate,
  explain: evaluator.explain,
  preflight: preflightModule.preflight,
  renderPreflight: preflightModule.renderPreflight,
  renderPreflightDoc: preflightModule.renderPreflightDoc,

  // Policy
  loadPolicy: policyLoader.loadPolicy,
  validatePolicyFile: policyLoader.validatePolicyFile,
  validatePolicy: schema.validatePolicy,
  assertValidPolicy: schema.assertValidPolicy,
  hashPolicy: policyLoader.hashPolicy,
  policyPath: policyLoader.policyPath,
  policyDocPath: policyLoader.policyDocPath,

  // Run-scoped authorization
  loadAuthorizations: policyLoader.loadAuthorizations,
  authorizationsPath: policyLoader.authorizationsPath,
  preflightPath: policyLoader.preflightPath,
  createAuthorization: authorizations.createAuthorization,
  saveAuthorizations: authorizations.saveAuthorizations,
  renderApprovalPrompt: authorizations.renderApprovalPrompt,
  renderAuthorizationsDoc: authorizations.renderAuthorizationsDoc,
  findAuthorization: evaluator.findAuthorization,

  // Vocabulary
  DECISIONS: schema.DECISIONS,
  ACTIONS: schema.ACTIONS,
  ACTION_CATEGORIES: schema.ACTION_CATEGORIES,
  NON_MUTATING_ACTIONS: schema.NON_MUTATING_ACTIONS,
  OWNERSHIPS: schema.OWNERSHIPS,
  ENVIRONMENTS: schema.ENVIRONMENTS,
  normalizeAction: schema.normalizeAction,
  normalizeOwnership: schema.normalizeOwnership,
  normalizeEnvironment: schema.normalizeEnvironment,
  isMutating: schema.isMutating,
  categoryOf: schema.categoryOf,
  PolicyError: schema.PolicyError,

  // Filenames, for a caller that needs to locate artifacts itself
  POLICY_FILENAME: policyLoader.POLICY_FILENAME,
  POLICY_DOC_FILENAME: policyLoader.POLICY_DOC_FILENAME,
  AUTHORIZATIONS_FILENAME: policyLoader.AUTHORIZATIONS_FILENAME,
  PREFLIGHT_FILENAME: policyLoader.PREFLIGHT_FILENAME,
};
