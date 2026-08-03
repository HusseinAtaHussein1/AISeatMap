package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-001 — Valid login redirects successfully
 * Requirement Reference: PRD FR-1
 * Discovery Reference: discovery/login_deeplink_and_successful_login.md
 * Finding Reference: N/A
 * Evidence Reference: N/A
 */
public class ValidLoginTest extends BaseTest {

    @Test(description = "TC-LOGIN-001 — Valid login redirects successfully")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Submitting correct credentials logs the user in and redirects away from the login page.")
    public void validLoginRedirectsAwayFromLoginPage() {
        LoginPage loginPage = new LoginPage(driver);

        loginPage.navigateToLoginPage()
                .enterUsername(TestData.VALID_USERNAME)
                .enterPassword(TestData.VALID_PASSWORD)
                .clickLogin();

        driver.assertThat().browser().url().doesNotContain("/auth/login").perform();
    }
}
