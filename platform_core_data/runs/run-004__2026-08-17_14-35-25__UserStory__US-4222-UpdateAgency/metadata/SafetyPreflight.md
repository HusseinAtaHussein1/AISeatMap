Execution Safety Preflight

Run:          run-004__2026-08-17_14-35-25__UserStory__US-4222-UpdateAgency
Environment:  Staging
Policy:       ndc-admin-portal-stg v1 (sha256:374508eece1cebbb084334ce1bdbcefe)

Planned operations:

UPDATE / agency / SelfCreated
  8 occurrences — TC-AGENCY-001, TC-AGENCY-011, TC-AGENCY-012, TC-AGENCY-044, TC-AGENCY-053, TC-AGENCY-002, +2 more
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.mutation.SelfCreated

UPLOAD / agency / SelfCreated
  4 occurrences — TC-AGENCY-016, TC-AGENCY-020, TC-AGENCY-022, TC-AGENCY-023
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.mutation.SelfCreated

SUBMIT / agency / SelfCreated
  3 occurrences — FIXTURE-AGENCY, TC-AGENCY-047, TC-AGENCY-050
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.approval.SelfCreated

APPROVE / agency / SelfCreated
  2 occurrences — FIXTURE-AGENCY, TC-AGENCY-049
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.approval.SelfCreated

READ / agency / SelfCreated
  2 occurrences — TC-AGENCY-055, TC-AGENCY-059
  Decision: Allowed
  Rule:     policy.categories.read.SelfCreated

CREATE / branch / SelfCreated
  1 occurrence — FIXTURE-BRANCH
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.mutation.SelfCreated

UPDATE / branch / SelfCreated
  1 occurrence — FIXTURE-BRANCH
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.mutation.SelfCreated

SUBMIT / branch / SelfCreated
  1 occurrence — FIXTURE-BRANCH
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.approval.SelfCreated

APPROVE / branch / SelfCreated
  1 occurrence — FIXTURE-BRANCH
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.approval.SelfCreated

CREATE / agency / SelfCreated
  1 occurrence — FIXTURE-AGENCY
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.mutation.SelfCreated

SEARCH / agency / Shared
  1 occurrence — TC-AGENCY-055
  Decision: Allowed
  Rule:     policy.categories.read.Shared

REJECT / agency / SelfCreated
  1 occurrence — TC-AGENCY-048
  Decision: Allowed — pre-authorized for this run
  Rule:     policy.categories.approval.SelfCreated

PAYMENT
  0 occurrences

TICKET
  0 occurrences

BOOK
  0 occurrences

REFUND
  0 occurrences

DELETE
  0 occurrences

Totals
  Operations planned:        26
  Mutating:                  23
  Allowed:                   26
  Approval Required:         0
  Already authorized:        23
  Forbidden:                 0
  Cleanup-required actions:  0

No operation was executed. This preflight is read-only.
