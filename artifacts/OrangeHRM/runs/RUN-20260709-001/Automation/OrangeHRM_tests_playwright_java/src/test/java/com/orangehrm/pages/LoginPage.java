package com.orangehrm.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

/**
 * Page Object for the Login screen (/web/index.php/auth/login).
 * Holds only locators and page-level interactions -- no assertions live here.
 */
public class LoginPage {

    private final Page page;

    public LoginPage(Page page) {
        this.page = page;
    }

    private Locator usernameInput() {
        return page.getByPlaceholder("Username");
    }

    private Locator passwordInput() {
        return page.getByPlaceholder("Password");
    }

    private Locator loginButton() {
        return page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Login"));
    }

    private Locator forgotPasswordLink() {
        return page.getByText("Forgot your password?");
    }

    public Locator invalidCredentialsAlert() {
        return page.locator(".oxd-alert-content-text");
    }

    public Locator requiredFieldMessages() {
        return page.locator(".oxd-input-group .oxd-input-field-error-message");
    }

    public void navigate(String baseUrl, String loginPath) {
        page.navigate(baseUrl + loginPath);
    }

    public void login(String username, String password) {
        usernameInput().fill(username);
        passwordInput().fill(password);
        loginButton().click();
    }

    public void openForgotPassword() {
        forgotPasswordLink().click();
    }
}
