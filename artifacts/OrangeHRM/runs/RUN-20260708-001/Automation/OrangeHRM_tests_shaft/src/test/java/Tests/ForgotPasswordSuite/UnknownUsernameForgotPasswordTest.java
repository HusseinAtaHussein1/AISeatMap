package Tests.ForgotPasswordSuite;

import Pages.ForgotPasswordPage;
import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-008 — Forgot Password with an unknown username returns the generic
 *   success message
 * Requirement Reference: PRD FR-3, §10 SR-3
 * Discovery Reference: discovery/forgot_password_flow.md
 * Finding Reference: N/A
 * Evidence Reference: N/A
 */
public class UnknownUsernameForgotPasswordTest extends BaseTest {

    @Test(description = "TC-LOGIN-008 — Forgot Password with unknown username returns generic success")
    @Severity(SeverityLevel.CRITICAL)
    @Description("The anti-enumeration behavior holds for a username that does not exist — the "
            + "generic success message is shown quickly, with no timeout.")
    public void unknownUsernameReturnsGenericSuccessMessage() {
        LoginPage loginPage = new LoginPage(driver);
        ForgotPasswordPage forgotPasswordPage = loginPage.navigateToLoginPage().clickForgotPassword();

        forgotPasswordPage.enterUsername(TestData.FORGOT_PASSWORD_UNKNOWN_USERNAME)
                .clickResetPassword();

        driver.assertThat().element(forgotPasswordPage.outcomeMessageLocator())
                .text().isEqualTo(TestData.MSG_RESET_PASSWORD_SUCCESS).perform();
    }
}
