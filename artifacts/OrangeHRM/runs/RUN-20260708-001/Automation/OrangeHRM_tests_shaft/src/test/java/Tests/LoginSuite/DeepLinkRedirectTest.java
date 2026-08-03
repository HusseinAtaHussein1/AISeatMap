package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-007 — Unauthenticated deep-link redirects to login and returns to the
 *   original URL after login
 * Requirement Reference: PRD FR-2, §10 SR-1
 * Discovery Reference: discovery/login_deeplink_and_successful_login.md
 * Finding Reference: N/A
 * Evidence Reference: N/A
 */
public class DeepLinkRedirectTest extends BaseTest {

    @Test(description = "TC-LOGIN-007 — Unauthenticated deep link redirects to login, then returns after login")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Requesting a protected URL while logged out redirects to Login; a subsequent "
            + "successful login returns the user to that original URL, not a default landing page.")
    public void deepLinkRedirectsToLoginThenReturnsAfterLogin() {
        String protectedUrl = LoginPage.LOGIN_URL.replace("/auth/login", "") + TestData.PROTECTED_URL_PATH;
        driver.browser().navigateToURL(protectedUrl);

        driver.assertThat().browser().url().contains("/auth/login").perform();

        LoginPage loginPage = new LoginPage(driver);
        loginPage.enterUsername(TestData.VALID_USERNAME)
                .enterPassword(TestData.VALID_PASSWORD)
                .clickLogin();

        driver.assertThat().browser().url().contains(TestData.PROTECTED_URL_PATH).perform();
    }
}
