package com.orangehrm.tests.login;

import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;

/**
 * Test Case ID: TC-LOGIN-001
 * Requirement Reference: PRD FR-1
 * Discovery Reference: discovery/login_deeplink_and_successful_login.md
 * Finding Reference: N/A
 */
public class ValidLoginTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-001 - Valid login redirects successfully")
    void validLoginRedirectsAwayFromLoginPage() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());

        loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
        page.waitForURL(url -> !url.contains("auth/login"));

        assertFalse(page.url().contains("auth/login"),
                "Expected redirect away from /auth/login after a valid login");
    }
}
