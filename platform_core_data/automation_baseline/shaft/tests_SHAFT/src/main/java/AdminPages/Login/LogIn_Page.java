package AdminPages.Login;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.WebDriverWait;
import utilities.EnvironmentConfig;

import java.time.Duration;

/**
 * Page Object for the NDC login screen. First login flow ever automated for this platform
 * (Automation Plan §7 -- no existing asset to reuse).
 *
 * API confirmed live this run by inspecting the actual io.github.shafthq:shaft-engine:10.3.20260707
 * jar (javap against com.shaft.driver.SHAFT$GUI$WebDriver / ElementActionsContract /
 * BrowserActionsContract) after Context7 was unavailable -- see AutomationPlan_SHAFT.md §12/§14 and
 * StackDocumentationContext_SHAFT.md §6 for the full account of that substitution.
 */
public class LogIn_Page {
    private static final By USERNAME_FIELD = By.cssSelector("#id-Username");
    private static final By PASSWORD_FIELD = By.cssSelector("#id-Password");
    private static final By LOGIN_BUTTON = By.xpath("//button[contains(., 'Login')]");
    private static final Duration LOGIN_REDIRECT_TIMEOUT = Duration.ofSeconds(30);

    private final SHAFT.GUI.WebDriver driver;

    public LogIn_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    public LogIn_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.baseUrl());
        return this;
    }

    /**
     * 2026-08-05 fix: clicking Login used to return immediately, with nothing waiting for the
     * resulting redirect off {@code /auth/login}. Every caller then went straight on to navigate
     * elsewhere, racing the login request -- on a slow/cold first request in a fresh browser session
     * that race was lost, the app's route guard bounced the next navigation straight back to
     * {@code /auth/login}, and every following wait was for a page that had already silently failed
     * to log in. Waiting here for the URL to actually leave the login screen removes the race.
     */
    public LogIn_Page loginAsSuperAdmin() {
        driver.element().type(USERNAME_FIELD, EnvironmentConfig.username());
        driver.element().typeSecure(PASSWORD_FIELD, EnvironmentConfig.password());
        driver.element().click(LOGIN_BUTTON);
        new WebDriverWait(driver.getDriver(), LOGIN_REDIRECT_TIMEOUT)
                .until(d -> !d.getCurrentUrl().contains("/auth/login"));
        return this;
    }
}
