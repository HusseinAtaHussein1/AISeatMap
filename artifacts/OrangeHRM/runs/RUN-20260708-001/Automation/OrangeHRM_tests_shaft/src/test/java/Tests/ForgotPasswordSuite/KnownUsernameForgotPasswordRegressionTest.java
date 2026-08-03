package Tests.ForgotPasswordSuite;

import Pages.ForgotPasswordPage;
import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Link;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-009 — REGRESSION — Forgot Password with a valid username must not time out
 * Requirement Reference: PRD FR-3, §10 SR-3
 * Discovery Reference: discovery/forgot_password_flow.md
 * Finding Reference: FINDING-005 (Forgot Password times out (504) for a valid, existing username —
 *   Status: Confirmed, Severity: High)
 * Evidence Reference: findings/FINDING-005_ForgotPasswordTimeoutKnownUser/failure.png
 *
 * This test asserts the CORRECTED behavior. It is expected to FAIL (or throw a timeout
 * exception rather than a clean assertion failure — see OrangeHRM_AutomationPlan.md §12)
 * against the current, unfixed build, which instead hangs to a 504 Gateway Time-out.
 */
public class KnownUsernameForgotPasswordRegressionTest extends BaseTest {

    @Test(description = "TC-LOGIN-009 — Forgot Password with a valid username must not time out")
    @Severity(SeverityLevel.BLOCKER)
    @Link(name = "FINDING-005", url = "artifacts/OrangeHRM/runs/RUN-20260706-002/findings/FINDING-005_ForgotPasswordTimeoutKnownUser/metadata.md")
    @Description("A corrected build must return the generic success message for a real, existing "
            + "username within a reasonable time — not a 504 Gateway Time-out.")
    public void knownUsernameReturnsGenericSuccessMessageWithoutTimeout() {
        LoginPage loginPage = new LoginPage(driver);
        ForgotPasswordPage forgotPasswordPage = loginPage.navigateToLoginPage().clickForgotPassword();

        forgotPasswordPage.enterUsername(TestData.FORGOT_PASSWORD_KNOWN_USERNAME)
                .clickResetPassword();

        driver.assertThat().element(forgotPasswordPage.outcomeMessageLocator())
                .text().isEqualTo(TestData.MSG_RESET_PASSWORD_SUCCESS).perform();
    }
}
