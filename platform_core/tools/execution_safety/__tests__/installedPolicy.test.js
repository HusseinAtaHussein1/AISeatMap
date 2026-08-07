// Execution Safety — invariants the INSTALLED project policy must satisfy, whatever it says.
//
// WHY THESE ARE INVARIANTS AND NOT EXPECTED VALUES
// This file lives in platform_core/, which must contain no project rule. So it never asserts
// "PAYMENT is Forbidden on STG" — that would hardcode one project's permissions into reusable code,
// the exact coupling the platform_core / platform_core_data split exists to prevent.
//
// What it asserts instead are properties that must hold for ANY project policy this platform loads.
// A future project could legitimately permit shared updates; none may legitimately make Unknown data
// safer than self-created data, or let a payment inherit a CRUD default. Those are the bugs a policy
// edit can introduce silently, and these are the tests that catch them.
//
// The project's own decisions, with the evidence behind each, are documented and reviewed in
// platform_core_data/knowledge_base/execution_safety_policy.md.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const { validatePolicyFile, policyPath, policyDocPath } = require('../policyLoader');
const { evaluate } = require('../evaluator');
const {
  ACTIONS, OWNERSHIPS, ACTION_CATEGORIES, NON_MUTATING_ACTIONS, DECISION_SEVERITY,
} = require('../schema');

const installed = validatePolicyFile({});
const present = installed.exists;

/** Skips cleanly where no policy is installed — a fresh clone of the tool has data but no project. */
function withPolicy(name, fn) {
  test(name, { skip: present ? false : 'no installed project policy' }, () => fn(installed.policy));
}

test('the installed policy, if present, is schema-valid', { skip: present ? false : 'no installed project policy' }, () => {
  assert.equal(installed.ok, true, `Policy is invalid:\n  - ${installed.problems.join('\n  - ')}`);
});

withPolicy('the policy has a human-readable companion a reviewer can actually read', () => {
  assert.ok(fs.existsSync(policyDocPath()), `Expected a companion at ${policyDocPath()}. `
    + 'A governance artifact only a machine can read is one nobody reviews.');
});

withPolicy('every action in the vocabulary resolves to a decision — none is unanswerable', (policy) => {
  for (const action of ACTIONS) {
    for (const ownership of OWNERSHIPS) {
      const r = evaluate({ policy, action, ownership });
      assert.ok(['Allowed', 'Approval Required', 'Forbidden'].includes(r.decision),
        `${action} + ${ownership} produced "${r.decision}"`);
      assert.ok(r.matchedRule, `${action} + ${ownership} matched no rule and gave no reason`);
      assert.ok(r.reason, `${action} + ${ownership} has no explanation`);
    }
  }
});

withPolicy('no financial or booking action is ever Allowed by default', (policy) => {
  const highRisk = [...ACTION_CATEGORIES.financial, ...ACTION_CATEGORIES.booking, ...ACTION_CATEGORIES.privileged];
  for (const action of highRisk) {
    for (const ownership of OWNERSHIPS) {
      const r = evaluate({ policy, action, ownership });
      assert.notEqual(r.decision, 'Allowed',
        `${action} on ${ownership} is Allowed. A high-risk action must never inherit a permissive `
        + 'ordinary-mutation default; if this is intended, it needs an explicit, evidenced rule and this '
        + 'invariant needs revisiting with the reviewer.');
    }
  }
});

withPolicy('Unknown ownership is never more permissive than SelfCreated', (policy) => {
  for (const action of ACTIONS) {
    const self = evaluate({ policy, action, ownership: 'SelfCreated' }).decision;
    const unknown = evaluate({ policy, action, ownership: 'Unknown' }).decision;
    assert.ok(DECISION_SEVERITY[unknown] >= DECISION_SEVERITY[self],
      `${action}: Unknown resolves to "${unknown}" while SelfCreated resolves to "${self}". `
      + 'Data whose ownership cannot be proven must never be treated more permissively than data '
      + 'this run demonstrably created.');
  }
});

withPolicy('Shared ownership is never more permissive than SelfCreated for a mutating action', (policy) => {
  for (const action of ACTIONS.filter((a) => !NON_MUTATING_ACTIONS.includes(a))) {
    const self = evaluate({ policy, action, ownership: 'SelfCreated' }).decision;
    const shared = evaluate({ policy, action, ownership: 'Shared' }).decision;
    assert.ok(DECISION_SEVERITY[shared] >= DECISION_SEVERITY[self],
      `${action}: Shared resolves to "${shared}" while SelfCreated resolves to "${self}".`);
  }
});

withPolicy('DELETE is never more permissive than UPDATE for the same ownership', (policy) => {
  for (const ownership of OWNERSHIPS) {
    const update = evaluate({ policy, action: 'UPDATE', ownership }).decision;
    const del = evaluate({ policy, action: 'DELETE', ownership }).decision;
    assert.ok(DECISION_SEVERITY[del] >= DECISION_SEVERITY[update],
      `${ownership}: DELETE is "${del}" while UPDATE is "${update}". Permission to update never `
      + 'implies permission to delete.');
  }
});

withPolicy('the policy is not authoritative for any environment other than its own', (policy) => {
  for (const env of ['Production', 'QA', 'Local', 'Development']) {
    if (env === policy.environment) continue;
    const r = evaluate({ policy, action: 'READ', ownership: 'Shared', environment: env });
    assert.equal(r.decision, 'Forbidden', `${env} should be refused, not evaluated`);
  }
});

withPolicy('no run-scoped authorization can lift anything the policy Forbids', (policy) => {
  for (const action of ACTIONS) {
    for (const ownership of OWNERSHIPS) {
      const bare = evaluate({ policy, action, ownership, module: 'agency' });
      if (bare.decision !== 'Forbidden') continue;
      const withAuth = evaluate({
        policy, action, ownership, module: 'agency', runId: 'run-test',
        authorizations: [{
          authorizationId: 'AUTH-TEST',
          runId: 'run-test',
          environment: policy.environment,
          module: 'agency',
          action,
          ownership,
          approvedAt: '2026-08-07T00:00:00Z',
          approvedBy: 'test',
        }],
      });
      assert.equal(withAuth.decision, 'Forbidden',
        `${action} + ${ownership} was lifted from Forbidden by a run authorization. `
        + 'Forbidden is absolute (HD-SAFETY-001).');
    }
  }
});

withPolicy('the policy contains no credential, token, or other secret', () => {
  const raw = fs.readFileSync(policyPath(), 'utf8');
  for (const pattern of [
    /"password"\s*:/i, /"token"\s*:/i, /"apiKey"\s*:/i, /"secret"\s*:/i, /"sessionId"\s*:/i,
    /\b\d{13,19}\b/, // a card-length digit run
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  ]) {
    assert.ok(!pattern.test(raw), `The policy appears to contain a secret matching ${pattern}.`);
  }
});

withPolicy('every rule states where it came from — migrated evidence or a flagged default', (policy) => {
  const missing = [];
  const walk = (table, where) => {
    for (const [key, rule] of Object.entries(table)) {
      if (typeof rule === 'string' || !rule.source) missing.push(`${where}.${key}`);
    }
  };
  walk(policy.defaults, 'defaults');
  for (const [cat, table] of Object.entries(policy.categories || {})) walk(table, `categories.${cat}`);
  for (const [act, table] of Object.entries(policy.actions || {})) walk(table, `actions.${act}`);
  assert.deepEqual(missing, [],
    'These rules carry no `source`. Every permission must be traceable to project evidence or '
    + 'labelled a conservative default — a rule with neither was invented.');
});
