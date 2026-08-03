package Utilities;

/**
 * Shared test data for the Login & Access Suite.
 * Centralized per agents/automation_agent.md §14 (DRY) — no test class hardcodes these values directly.
 * Source: artifacts/OrangeHRM/runs/RUN-20260706-002/context/OrangeHRM_ProjectContext.v2.md §4,
 *         and OrangeHRM_TestCases_Login.md's individual "Test Data" fields.
 */
public class TestData {

    // Project Context v2 §4 — the only confirmed, usable role for this run.
    public static final String VALID_USERNAME = "Admin";
    public static final String VALID_PASSWORD = "admin123";

    // TC-LOGIN-002
    public static final String INVALID_PASSWORD_FOR_VALID_USER = "wrongpass";
    public static final String UNKNOWN_USERNAME = "UnknownUser_" + "shaft_run20260708";
    public static final String WRONG_PASSWORD_FOR_UNKNOWN_USER = "wrongpass";

    // TC-LOGIN-004 / FINDING-001
    public static final String EMOJI_USERNAME = "😀"; // single emoji character (grinning face)
    public static final String ANY_PASSWORD_FOR_EMOJI_CASE = "anyPassword123";

    // TC-LOGIN-005 — SQL-injection-style payload (input-handling probe only, per Project Context v2 §5;
    // never submitted with intent to actually bypass authentication).
    public static final String SQLI_PAYLOAD_USERNAME = "' OR '1'='1' -- ";
    public static final String SQLI_PAYLOAD_PASSWORD = "' OR '1'='1' -- ";

    // TC-LOGIN-007
    public static final String PROTECTED_URL_PATH = "/pim/viewEmployeeList";

    // TC-LOGIN-008 / TC-LOGIN-009 — Forgot Password
    public static final String FORGOT_PASSWORD_UNKNOWN_USERNAME = "nonexistent_user_shaft20260708";
    public static final String FORGOT_PASSWORD_KNOWN_USERNAME = VALID_USERNAME;

    // TC-LOGIN-011 — 259-character alphanumeric boundary value.
    public static final String LONG_USERNAME_259_CHARS = "a".repeat(259);

    // Expected messages (verbatim, per Discovery evidence — see individual test classes' header comments).
    public static final String MSG_INVALID_CREDENTIALS = "Invalid credentials";
    public static final String MSG_REQUIRED = "Required";
    public static final String MSG_RESET_PASSWORD_SUCCESS = "Reset Password link sent successfully";
    public static final String MSG_UNEXPECTED_ERROR_DEFECTIVE = "Unexpected error occurred";

    private TestData() {
    }
}
