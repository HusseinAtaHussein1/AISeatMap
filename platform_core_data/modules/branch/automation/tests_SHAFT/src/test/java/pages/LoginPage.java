package pages;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import utils.EnvironmentConfig;

/**
 * Page Object for the NDC login screen. First login flow ever automated for this platform
 * (Automation Plan §7 -- no existing asset to reuse).
 *
 * API confirmed live this run by inspecting the actual io.github.shafthq:shaft-engine:10.3.20260707
 * jar (javap against com.shaft.driver.SHAFT$GUI$WebDriver / ElementActionsContract /
 * BrowserActionsContract) after Context7 was unavailable -- see AutomationPlan_SHAFT.md §12/§14 and
 * StackDocumentationContext_SHAFT.md §6 for the full account of that substitution.
 */
public class LoginPage {
    private static final By USERNAME_FIELD = By.cssSelector("#id-Username");
    private static final By PASSWORD_FIELD = By.cssSelector("#id-Password");
    private static final By LOGIN_BUTTON = By.xpath("//button[contains(., 'Login')]");

    private final SHAFT.GUI.WebDriver driver;

    public LoginPage(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    public LoginPage open() {
        driver.browser().navigateToURL(EnvironmentConfig.baseUrl());
        return this;
    }

    public LoginPage loginAsSuperAdmin() {
        driver.element().type(USERNAME_FIELD, EnvironmentConfig.username());
        driver.element().typeSecure(PASSWORD_FIELD, EnvironmentConfig.password());
        driver.element().click(LOGIN_BUTTON);
        return this;
    }
}
