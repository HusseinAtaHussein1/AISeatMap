package com.orangehrm.tests.login;

import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Test Case ID: TC-LOGIN-011
 * Requirement Reference: PRD FR-1
 * Discovery Reference: Not independently verified this run -- confirmed clean under
 * RUN-20260706-001's exploration of the same Login form (see that run's login_validation_states.md).
 * Finding Reference: N/A
 *
 * Known Limitation: the underlying behavior's currency is one run older than the rest of this
 * suite's evidence -- the automation itself is unaffected, carried forward unchanged from
 * RUN-20260708-001's equivalent test.
 */
public class LongUsernameBoundaryTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-011 - Long username input does not degrade login handling")
    void longUsernameIsHandledAsOrdinaryInvalidCredential() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());

        loginPage.login(TestData.LONG_USERNAME, TestData.WRONG_PASSWORD);

        PlaywrightAssertions.assertThat(loginPage.invalidCredentialsAlert())
                .hasText(TestData.EXPECTED_INVALID_CREDENTIALS_MESSAGE);
    }
}
