package com.orangehrm.utils;

import java.util.List;

/**
 * Shared test data for the Login & Access Suite (RUN-20260709-001).
 * No credential/payload literal is hardcoded inside a test class -- every value lives here.
 */
public final class TestData {

    private TestData() {
    }

    public static final String VALID_USERNAME = "Admin";
    public static final String VALID_PASSWORD = "admin123";

    public static final String WRONG_PASSWORD = "wrongpass_20260709";
    public static final String UNKNOWN_USERNAME = "unknown_user_20260709";

    public static final String EMOJI_USERNAME = "😀"; // single emoji character (TC-LOGIN-004 / FINDING-001)

    public static final String SQLI_PAYLOAD = "' OR '1'='1' -- ";

    public static final String LONG_USERNAME = "a".repeat(259); // TC-LOGIN-011 boundary value

    public static final String PROTECTED_URL_PATH = "/web/index.php/pim/viewEmployeeList";

    public static final String FORGOT_PASSWORD_UNKNOWN_USERNAME = "nonexistent_user_20260709";
    public static final String FORGOT_PASSWORD_KNOWN_USERNAME = VALID_USERNAME;

    public static final String EXPECTED_INVALID_CREDENTIALS_MESSAGE = "Invalid credentials";
    public static final String EXPECTED_REQUIRED_MESSAGE = "Required";
    public static final String EXPECTED_RESET_SUCCESS_MESSAGE = "Reset Password link sent successfully";

    /**
     * TC-LOGIN-002 data set: {username, password} pairs, both expected to be rejected
     * with the identical generic "Invalid credentials" message (no enumeration via the Login form).
     */
    public static List<String[]> invalidCredentialCombinations() {
        return List.of(
                new String[]{VALID_USERNAME, WRONG_PASSWORD},
                new String[]{UNKNOWN_USERNAME, WRONG_PASSWORD}
        );
    }
}
