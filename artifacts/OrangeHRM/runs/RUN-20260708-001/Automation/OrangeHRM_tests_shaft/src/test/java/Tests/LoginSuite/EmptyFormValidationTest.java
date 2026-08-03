package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-003 — Empty login form blocked by required-field validation
 * Requirement Reference: PRD FR-1
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: N/A
 * Evidence Reference: N/A
 */
public class EmptyFormValidationTest extends BaseTest {

    @Test(description = "TC-LOGIN-003 — Empty login form blocked by required-field validation")
    @Severity(SeverityLevel.NORMAL)
    @Description("Submitting the login form with both fields empty is blocked client-side; "
            + "a 'Required' message is shown under both fields and no request is sent.")
    public void emptyFormShowsRequiredOnBothFields() {
        LoginPage loginPage = new LoginPage(driver);

        loginPage.navigateToLoginPage().clickLogin();

        driver.assertThat().element(loginPage.requiredFieldMessagesLocator())
                .text().isEqualTo(TestData.MSG_REQUIRED).perform();
        driver.assertThat().browser().url().contains("/auth/login").perform();
    }
}
