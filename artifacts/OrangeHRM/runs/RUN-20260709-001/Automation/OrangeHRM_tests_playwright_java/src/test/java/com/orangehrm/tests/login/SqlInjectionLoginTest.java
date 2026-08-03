package com.orangehrm.tests.login;

import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test Case ID: TC-LOGIN-005
 * Requirement Reference: PRD Section 10 (Security Requirements, general input-handling expectation)
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: N/A
 *
 * Project Context v2 Section 5 explicitly authorizes this as an observation-only probe --
 * the payload is submitted as ordinary form input, never with intent to actually succeed.
 */
public class SqlInjectionLoginTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-005 - SQL-injection-style payload does not bypass authentication")
    void sqlInjectionPayloadIsRejectedAsOrdinaryInput() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());

        loginPage.login(TestData.SQLI_PAYLOAD, TestData.SQLI_PAYLOAD);

        PlaywrightAssertions.assertThat(loginPage.invalidCredentialsAlert())
                .hasText(TestData.EXPECTED_INVALID_CREDENTIALS_MESSAGE);
        assertTrue(page.url().contains("auth/login"), "Expected no authentication bypass");
    }
}
