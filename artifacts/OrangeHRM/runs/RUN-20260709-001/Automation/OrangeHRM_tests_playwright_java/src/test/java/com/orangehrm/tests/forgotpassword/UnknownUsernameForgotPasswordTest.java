package com.orangehrm.tests.forgotpassword;

import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.ForgotPasswordPage;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Test Case ID: TC-LOGIN-008
 * Requirement Reference: PRD FR-3, Section 10 SR-3
 * Discovery Reference: discovery/forgot_password_flow.md
 * Finding Reference: N/A
 */
public class UnknownUsernameForgotPasswordTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-008 - Forgot Password with an unknown username returns the generic success message")
    void unknownUsernameReturnsGenericSuccessMessage() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());
        loginPage.openForgotPassword();

        ForgotPasswordPage forgotPasswordPage = new ForgotPasswordPage(page);
        forgotPasswordPage.submit(TestData.FORGOT_PASSWORD_UNKNOWN_USERNAME);

        PlaywrightAssertions.assertThat(forgotPasswordPage.outcomeMessage())
                .hasText(TestData.EXPECTED_RESET_SUCCESS_MESSAGE);
    }
}
