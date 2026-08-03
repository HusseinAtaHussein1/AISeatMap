package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-011 — Long input in Username field does not degrade login handling
 * Requirement Reference: PRD FR-1
 * Discovery Reference: Not independently verified in Discovery this run — confirmed clean under
 *   RUN-20260706-001's exploration (see Manual Test Suite's Discovery Reference note for this case).
 * Finding Reference: N/A
 * Evidence Reference: N/A
 */
public class LongUsernameBoundaryTest extends BaseTest {

    @Test(description = "TC-LOGIN-011 — 259-character Username handled without error or crash")
    @Severity(SeverityLevel.MINOR)
    @Description("An unusually long Username value is handled the same as any other invalid "
            + "credential, without error, crash, or a client-side max-length block.")
    public void longUsernameShowsInvalidCredentialsNormally() {
        LoginPage loginPage = new LoginPage(driver);

        loginPage.navigateToLoginPage()
                .enterUsername(TestData.LONG_USERNAME_259_CHARS)
                .enterPassword(TestData.ANY_PASSWORD_FOR_EMOJI_CASE)
                .clickLogin();

        driver.assertThat().element(loginPage.alertMessageLocator())
                .text().isEqualTo(TestData.MSG_INVALID_CREDENTIALS).perform();
    }
}
