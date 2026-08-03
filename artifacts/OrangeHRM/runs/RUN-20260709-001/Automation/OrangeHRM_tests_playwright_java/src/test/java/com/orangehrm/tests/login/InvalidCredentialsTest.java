package com.orangehrm.tests.login;

import com.microsoft.playwright.assertions.PlaywrightAssertions;
import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test Case ID: TC-LOGIN-002
 * Requirement Reference: PRD FR-1
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: N/A
 *
 * Both Test Data combinations (valid username/wrong password, unknown username/wrong password)
 * are covered via a single parameterized test, matching the identical generic-message assertion
 * both must satisfy (no enumeration via the Login form).
 */
public class InvalidCredentialsTest extends BaseTest {

    static Stream<String[]> invalidCredentials() {
        return TestData.invalidCredentialCombinations().stream();
    }

    @ParameterizedTest(name = "TC-LOGIN-002 - Invalid credentials rejected: username={0}")
    @MethodSource("invalidCredentials")
    void invalidCredentialsShowGenericMessage(String username, String password) {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());

        loginPage.login(username, password);

        PlaywrightAssertions.assertThat(loginPage.invalidCredentialsAlert())
                .hasText(TestData.EXPECTED_INVALID_CREDENTIALS_MESSAGE);
        assertTrue(page.url().contains("auth/login"), "Expected to remain on /auth/login");
    }
}
