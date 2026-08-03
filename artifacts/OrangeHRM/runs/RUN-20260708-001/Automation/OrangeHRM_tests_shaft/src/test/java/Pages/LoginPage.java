package Pages;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;

/**
 * Page Object for the OrangeHRM Login page.
 * Locators prefer stable name attributes and visible user-facing text over
 * positional CSS/XPath (agents/automation_agent.md §14 maintainability standard).
 * Discovery source: artifacts/OrangeHRM/runs/RUN-20260706-002/discovery/login_initial.md
 */
public class LoginPage {

    private final SHAFT.GUI.WebDriver driver;

    private final By usernameField = By.name("username");
    private final By passwordField = By.name("password");
    private final By loginButton = By.cssSelector("button[type='submit']");
    private final By forgotPasswordLink = By.xpath("//p[contains(text(),'Forgot your password?')]");
    private final By alertMessage = By.cssSelector(".oxd-alert-content-text");
    private final By requiredFieldMessages = By.cssSelector(".oxd-input-group .oxd-input-field-error-message");

    public LoginPage(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    public static final String LOGIN_URL = "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

    public LoginPage navigateToLoginPage() {
        driver.browser().navigateToURL(LOGIN_URL);
        return this;
    }

    public LoginPage enterUsername(String username) {
        driver.element().type(usernameField, username);
        return this;
    }

    public LoginPage enterPassword(String password) {
        driver.element().type(passwordField, password);
        return this;
    }

    public LoginPage clickLogin() {
        driver.element().click(loginButton);
        return this;
    }

    public ForgotPasswordPage clickForgotPassword() {
        driver.element().click(forgotPasswordLink);
        return new ForgotPasswordPage(driver);
    }

    public By alertMessageLocator() {
        return alertMessage;
    }

    public By requiredFieldMessagesLocator() {
        return requiredFieldMessages;
    }

    public String getCurrentUrl() {
        return driver.browser().getCurrentURL();
    }
}
