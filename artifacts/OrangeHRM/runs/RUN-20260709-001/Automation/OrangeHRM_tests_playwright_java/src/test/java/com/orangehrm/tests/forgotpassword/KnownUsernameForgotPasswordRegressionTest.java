package com.orangehrm.tests.forgotpassword;

import com.microsoft.playwright.assertions.LocatorAssertions;
import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.ForgotPasswordPage;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;

import java.util.concurrent.TimeUnit;

/**
 * Test Case ID: TC-LOGIN-009 (REGRESSION)
 * Requirement Reference: PRD FR-3, Section 10 SR-3
 * Discovery Reference: discovery/forgot_password_flow.md
 * Finding Reference: FINDING-005
 * Evidence Reference: findings/FINDING-005_ForgotPasswordTimeoutKnownUser/failure.png
 *
 * Known Limitation: this test is expected to FAIL against the current, unfixed build
 * (FINDING-005, Status: Confirmed, Severity: High) -- the live demo currently hangs this
 * request to a 504 Gateway Time-out after the full reverse-proxy timeout window. The
 * outcome-message locator's default per-action timeout is overridden to the run's extended
 * timeout so this surfaces as a slow, clean assertion failure rather than an ambiguous
 * Playwright TimeoutError -- but a materially slower shared-environment response could still
 * produce a timeout exception instead. Either outcome confirms the defect, not an automation defect.
 */
public class KnownUsernameForgotPasswordRegressionTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-009 - Forgot Password with a valid username must not time out")
    @Timeout(value = 100, unit = TimeUnit.SECONDS)
    void knownUsernameMustNotTimeOut() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());
        loginPage.openForgotPassword();

        ForgotPasswordPage forgotPasswordPage = new ForgotPasswordPage(page);
        forgotPasswordPage.submit(TestData.FORGOT_PASSWORD_KNOWN_USERNAME);

        PlaywrightAssertions.assertThat(forgotPasswordPage.outcomeMessage())
                .hasText(TestData.EXPECTED_RESET_SUCCESS_MESSAGE,
                        new LocatorAssertions.HasTextOptions().setTimeout(extendedTimeoutMs()));
    }
}
