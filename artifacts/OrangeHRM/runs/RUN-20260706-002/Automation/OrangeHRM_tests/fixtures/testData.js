// Shared test data — Automation Knowledge Base asset (agents/automation_agent.md §11).
// Reused across both the Login and PIM suites rather than inlining duplicate literals.
module.exports = {
  validCredentials: { username: 'Admin', password: 'admin123' },
  invalidPassword: 'wrongpass1',
  unknownUsernameForResetProbe: 'nonexistent_user_run002',
  boundaryValues: {
    emoji: '😀',
    sqlInjectionPayload: "' OR '1'='1' -- ",
    longAlphaNumeric259: 'A'.repeat(259),
    employeeId10Chars: 'AAAAAAAAAA', // known-good boundary (FINDING-003)
    employeeId11Chars: 'AAAAAAAAAAA', // known-bad boundary (FINDING-003)
    numericNonexistentEmployeeId: '999999',
  },
  protectedDeepLinkUrl: '/web/index.php/pim/viewEmployeeList',
  knownExistingEmpNumber: '104', // used by TC-PIM-008/009/010 — see Automation Plan's Assumptions re: shared-demo drift risk
};
