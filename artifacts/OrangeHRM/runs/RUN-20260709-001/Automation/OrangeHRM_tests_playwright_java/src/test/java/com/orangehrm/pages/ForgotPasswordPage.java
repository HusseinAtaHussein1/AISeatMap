package com.orangehrm.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

/**
 * Page Object for the Forgot Password screen, reached from LoginPage.openForgotPassword().
 * Holds only locators and page-level interactions -- no assertions live here.
 */
public class ForgotPasswordPage {

    private final Page page;

    public ForgotPasswordPage(Page page) {
        this.page = page;
    }

    private Locator usernameInput() {
        return page.getByPlaceholder("Username");
    }

    private Locator resetPasswordButton() {
        return page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Reset Password"));
    }

    public Locator outcomeMessage() {
        return page.locator(".oxd-text--h6");
    }

    public void submit(String username) {
        usernameInput().fill(username);
        resetPasswordButton().click();
    }
}
