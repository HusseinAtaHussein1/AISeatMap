package Pages;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;

/**
 * Page Object for the OrangeHRM Forgot Password page.
 * Discovery source: artifacts/OrangeHRM/runs/RUN-20260706-002/discovery/forgot_password_flow.md
 */
public class ForgotPasswordPage {

    private final SHAFT.GUI.WebDriver driver;

    private final By usernameField = By.name("username");
    private final By resetPasswordButton = By.cssSelector("button[type='submit']");
    private final By outcomeMessage = By.cssSelector(".oxd-alert-content-text, .oxd-text--h6");

    public ForgotPasswordPage(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    public ForgotPasswordPage enterUsername(String username) {
        driver.element().type(usernameField, username);
        return this;
    }

    public ForgotPasswordPage clickResetPassword() {
        driver.element().click(resetPasswordButton);
        return this;
    }

    public By outcomeMessageLocator() {
        return outcomeMessage;
    }
}
