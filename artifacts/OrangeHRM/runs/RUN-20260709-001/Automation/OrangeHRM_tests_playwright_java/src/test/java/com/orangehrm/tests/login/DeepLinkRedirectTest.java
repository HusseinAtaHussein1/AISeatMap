package com.orangehrm.tests.login;

import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test Case ID: TC-LOGIN-007
 * Requirement Reference: PRD FR-2, Section 10 SR-1
 * Discovery Reference: discovery/login_deeplink_and_successful_login.md
 * Finding Reference: N/A
 */
public class DeepLinkRedirectTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-007 - Unauthenticated deep-link redirects to login, then back to the original URL")
    void deepLinkRedirectsToLoginThenBackToOriginalUrl() {
        // Step 1-2: while logged out, request the protected URL directly.
        page.navigate(baseUrl() + TestData.PROTECTED_URL_PATH);
        page.waitForURL(url -> url.contains("auth/login"));
        assertTrue(page.url().contains("auth/login"), "Expected redirect to /auth/login while unauthenticated");

        // Step 3: log in with valid credentials.
        LoginPage loginPage = new LoginPage(page);
        loginPage.login(TestData.VALID_USERNAME, TestData.VALID_PASSWORD);
        page.waitForURL(url -> url.contains(TestData.PROTECTED_URL_PATH));

        assertTrue(page.url().contains(TestData.PROTECTED_URL_PATH),
                "Expected redirect back to the originally-requested PIM URL, not a default landing page");
    }
}
