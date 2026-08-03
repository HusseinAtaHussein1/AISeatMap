package Tests.LoginSuite;

import Pages.LoginPage;
import Utilities.BaseTest;
import Utilities.TestData;
import io.qameta.allure.Description;
import io.qameta.allure.Link;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.annotations.Test;

/**
 * Test Case ID: TC-LOGIN-004 — REGRESSION — Emoji in Username must not surface a generic server error
 * Requirement Reference: Not defined in Project Context (Missing Requirement — see FINDING-001)
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: FINDING-001 (Emoji in Username field triggers generic server error instead of
 *   "Invalid credentials" — Status: Needs Human Review)
 * Evidence Reference: findings/FINDING-001_EmojiUsernameUnexpectedError/failure.png
 *
 * This test asserts the CORRECTED behavior per Test Design's regression-test intent
 * (agents/test_design_agent.md §5.3). It is expected to FAIL against the current,
 * unfixed build, which instead shows "Unexpected error occurred" — see
 * OrangeHRM_AutomationDecisionReport.md for this test case's Known Limitations.
 */
public class EmojiUsernameRegressionTest extends BaseTest {

    @Test(description = "TC-LOGIN-004 — Emoji Username must show 'Invalid credentials', not a generic server error")
    @Severity(SeverityLevel.NORMAL)
    @Link(name = "FINDING-001", url = "artifacts/OrangeHRM/runs/RUN-20260706-002/findings/FINDING-001_EmojiUsernameUnexpectedError/metadata.md")
    @Description("An emoji-containing Username must be handled the same as any other invalid "
            + "username — 'Invalid credentials' — not a distinct 'Unexpected error occurred' message.")
    public void emojiUsernameShowsInvalidCredentialsNotServerError() {
        LoginPage loginPage = new LoginPage(driver);

        loginPage.navigateToLoginPage()
                .enterUsername(TestData.EMOJI_USERNAME)
                .enterPassword(TestData.ANY_PASSWORD_FOR_EMOJI_CASE)
                .clickLogin();

        driver.assertThat().element(loginPage.alertMessageLocator())
                .text().isEqualTo(TestData.MSG_INVALID_CREDENTIALS).perform();
    }
}
