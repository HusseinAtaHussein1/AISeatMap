package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-002 — Invalid credentials rejected with generic message
 * Requirement Reference: PRD FR-1
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: N/A
 * Evidence Reference: N/A
 *
 * Data-driven per agents/automation_agent.md §8 (SHAFT data-driven testing) to cover both
 * combinations the test case's Test Data field specifies: a valid username with a wrong
 * password, and an unknown username with a wrong password — both must show the identical
 * generic message (no enumeration via the Login form).
 */
public class InvalidCredentialsTest extends BaseTest {

    @DataProvider(name = "invalidCredentialCombinations")
    public Object[][] invalidCredentialCombinations() {
        return new Object[][]{
                {TestData.VALID_USERNAME, TestData.INVALID_PASSWORD_FOR_VALID_USER},
                {TestData.UNKNOWN_USERNAME, TestData.WRONG_PASSWORD_FOR_UNKNOWN_USER}
        };
    }

    @Test(description = "TC-LOGIN-002 — Invalid credentials rejected with generic message",
            dataProvider = "invalidCredentialCombinations")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Any incorrect Username/Password combination is rejected with the standard "
            + "'Invalid credentials' message, identical whether the username itself is valid or not.")
    public void invalidCredentialsShowGenericMessage(String username, String password) {
        LoginPage loginPage = new LoginPage(driver);

        loginPage.navigateToLoginPage()
                .enterUsername(username)
                .enterPassword(password)
                .clickLogin();

        driver.assertThat().element(loginPage.alertMessageLocator())
                .text().isEqualTo(TestData.MSG_INVALID_CREDENTIALS).perform();
        driver.assertThat().browser().url().contains("/auth/login").perform();
    }
}
