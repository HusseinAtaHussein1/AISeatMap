package com.orangehrm.tests.login;

import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Test Case ID: TC-LOGIN-004 (REGRESSION)
 * Requirement Reference: Not defined in Project Context (Missing Requirement -- see FINDING-001)
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: FINDING-001
 * Evidence Reference: findings/FINDING-001_EmojiUsernameUnexpectedError/failure.png
 *
 * Known Limitation: this test is expected to FAIL against the current, unfixed build
 * (FINDING-001, Status: Needs Human Review). It asserts the CORRECTED behavior
 * ("Invalid credentials"), not the currently-observed "Unexpected error occurred" --
 * a genuine, informative failure here confirms the defect, it is not an automation defect.
 */
public class EmojiUsernameRegressionTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-004 - Emoji username must not surface a generic server error")
    void emojiUsernameIsTreatedAsOrdinaryInvalidCredential() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());

        loginPage.login(TestData.EMOJI_USERNAME, TestData.WRONG_PASSWORD);

        PlaywrightAssertions.assertThat(loginPage.invalidCredentialsAlert())
                .hasText(TestData.EXPECTED_INVALID_CREDENTIALS_MESSAGE);
    }
}
