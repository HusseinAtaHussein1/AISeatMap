package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-005 — SQL-injection-style payload does not bypass authentication
 * Requirement Reference: PRD §10 (Security Requirements, general input-handling expectation)
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: N/A
 * Evidence Reference: N/A
 *
 * Per Project Context v2 §5: this is an input-handling/error-message observation only —
 * the payload is never submitted with intent to actually achieve a bypass.
 */
public class SqlInjectionLoginTest extends BaseTest {

    @Test(description = "TC-LOGIN-005 — SQL-injection-style payload is treated as ordinary invalid input")
    @Severity(SeverityLevel.BLOCKER)
    @Description("A SQL-injection-style string in either credential field is treated as ordinary "
            + "invalid input, with no authentication bypass and no database error exposed.")
    public void sqlInjectionPayloadDoesNotBypassAuthentication() {
        LoginPage loginPage = new LoginPage(driver);

        loginPage.navigateToLoginPage()
                .enterUsername(TestData.SQLI_PAYLOAD_USERNAME)
                .enterPassword(TestData.SQLI_PAYLOAD_PASSWORD)
                .clickLogin();

        driver.assertThat().element(loginPage.alertMessageLocator())
                .text().isEqualTo(TestData.MSG_INVALID_CREDENTIALS).perform();
        driver.assertThat().browser().url().contains("/auth/login").perform();
    }
}
