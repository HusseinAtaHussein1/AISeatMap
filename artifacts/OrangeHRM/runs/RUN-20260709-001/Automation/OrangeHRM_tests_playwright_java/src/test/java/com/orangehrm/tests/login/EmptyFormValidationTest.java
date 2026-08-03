package com.orangehrm.tests.login;

import com.orangehrm.base.BaseTest;
import com.orangehrm.pages.LoginPage;
import com.orangehrm.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test Case ID: TC-LOGIN-003
 * Requirement Reference: PRD FR-1
 * Discovery Reference: discovery/login_validation_and_bruteforce.md
 * Finding Reference: N/A
 *
 * Known Limitation (carried forward from RUN-20260708-001's equivalent test): the page shows a
 * "Required" message under both the Username and Password fields simultaneously. This assertion
 * checks each of the two locator matches independently, rather than the group as a single value.
 */
public class EmptyFormValidationTest extends BaseTest {

    @Test
    @DisplayName("TC-LOGIN-003 - Empty login form blocked by required-field validation")
    void emptyFormShowsRequiredOnBothFields() {
        LoginPage loginPage = new LoginPage(page);
        loginPage.navigate(baseUrl(), loginPath());

        loginPage.login("", "");

        var messages = loginPage.requiredFieldMessages();
        assertEquals(2, messages.count(), "Expected a 'Required' message under both Username and Password");
        for (int i = 0; i < messages.count(); i++) {
            assertEquals(TestData.EXPECTED_REQUIRED_MESSAGE, messages.nth(i).textContent().trim());
        }
        assertTrue(page.url().contains("auth/login"), "Expected to remain on /auth/login");
    }
}
