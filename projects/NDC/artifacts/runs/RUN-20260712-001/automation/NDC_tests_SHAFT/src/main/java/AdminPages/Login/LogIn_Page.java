package AdminPages.Login;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import utilities.CredentialsLoader;

import java.io.IOException;

/**
 * Export package, Target = "compatible with the Reference Project"
 * (E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Login\LogIn_Page.java).
 * Locators below are reused verbatim from the Reference Project's real, confirmed-working
 * selectors where an equivalent test case exists here — never re-invented — per
 * agents/automation_agent.md §32.5. Two things from the Reference Project's own LogIn_Page were
 * deliberately NOT carried over:
 *   1. Btn_RememberMyInfoNextTime — confirmed absent from the live screen, FINDING-NDC-LOGIN-002.
 *   2. ClickSuperAdmin()/ClickAdmin() — hardcoded plaintext credentials (a flagged security
 *      antipattern, see reference_automation_project.md's Security Flag); replaced here with
 *      loginWithValidCredential(), which reads the real credential from the platform's own
 *      git-ignored credentials.json at execution time only.
 * On merge, this class's locators should be reconciled with (not blindly overwrite) the
 * Reference Project's real LogIn_Page.java — see NDC_AutomationPlan_SHAFT.md.
 */
public class LogIn_Page {
    SHAFT.GUI.WebDriver driver;

    // Locators — reused from the Reference Project verbatim (confirmed live 2026-07-12 by this
    // run's own Discovery), except Txt_LoginButtonAttribute which is new this run.
    private final By Txt_Username = By.id("id-Username");
    private final By Txt_Password = By.id("id-Password");
    private final By Btn_LogINButton = By.xpath("//button[@loadingicon=\"pi pi-spin pi-spinner\"]");
    public final By Txt_ErrorOfUserName = By.xpath("/html/body/ndc-root/ndc-login-page/ndc-auth-container/div/div/div[1]/ndc-auth-form-container/div/div[2]/ndc-fg-form-generator/form/ndc-fg-input[1]/span");
    public final By Txt_ErrorOfPassword = By.xpath("/html/body/ndc-root/ndc-login-page/ndc-auth-container/div/div/div[1]/ndc-auth-form-container/div/div[2]/ndc-fg-form-generator/form/ndc-fg-input[2]/span");
    // Repaired 2026-07-12 (Automation Repair Loop, TC-LOGIN-002 diagnosis): the original
    // aria-label-based locator never matched the real element (confirmed via DOM snapshot — the
    // message text was present in the page while this locator's element count was 0 at every
    // sampled timestamp). The message also auto-dismisses within ~5-7s. Text-based match on the
    // element's own direct text, not an ancestor's, to avoid a "not unique" multi-match.
    public final By Txt_InValidCred = By.xpath("//*[normalize-space(text())=\"Invalid credentials, Please try again.\"]");

    // Corrected 2026-07-13 (FINDING-001 resolution, confirmed by human): .80 is the actual current
    // STG environment; .70 was stale and had diverged into a separate dataset (a record created via
    // .70 was invisible when searched on .80 — proof they are not the same host/database).
    private static final String NDC_LOGIN_URL = "http://192.168.1.80/auth/login";

    public LogIn_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    public LogIn_Page navigateToLogin() {
        driver.browser().navigateToURL(NDC_LOGIN_URL);
        waitUntil(() -> {
            try {
                return "password".equals(getPasswordFieldType());
            } catch (Exception e) {
                return false;
            }
        }, 10);
        return this;
    }

    /**
     * Repair (2026-07-12, Automation Repair Loop — EXEC-20260712-001-001): the login form is
     * rendered client-side (Angular SPA); a raw post-click assertion with no wait can run before
     * the DOM update completes (TC-LOGIN-001's original failure — title checked ~314ms after
     * click). This polls a real, observable end-state instead of a fixed sleep.
     */
    private void waitUntil(java.util.function.BooleanSupplier condition, int timeoutSeconds) {
        long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L;
        while (System.currentTimeMillis() < deadline) {
            if (condition.getAsBoolean()) return;
            try {
                Thread.sleep(250);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    /** TC-LOGIN-001 repair: waits for the post-login page title to actually contain "Dashboard"
     *  instead of asserting immediately after the click. */
    public boolean waitForDashboardTitle(int timeoutSeconds) {
        final boolean[] found = {false};
        waitUntil(() -> {
            found[0] = driver.getDriver().getTitle().contains("Dashboard");
            return found[0];
        }, timeoutSeconds);
        return found[0];
    }

    public LogIn_Page enterUsername(String username) {
        driver.element().type(Txt_Username, username);
        return this;
    }

    public LogIn_Page enterPassword(String password) {
        driver.element().type(Txt_Password, password);
        return this;
    }

    public LogIn_Page clickLogin() {
        driver.element().click(Btn_LogINButton);
        return this;
    }

    /** TC-LOGIN-001: reads the real, existing NDC credential at execution time only (never hardcoded). */
    public LogIn_Page loginWithValidCredential() throws IOException {
        String[] creds = CredentialsLoader.loadValidCredential();
        return enterUsername(creds[0]).enterPassword(creds[1]).clickLogin();
    }

    /** TC-LOGIN-008 (anti-enumeration): real username, deliberately wrong password. */
    public LogIn_Page loginWithValidUsernameWrongPassword(String wrongPassword) throws IOException {
        String[] creds = CredentialsLoader.loadValidCredential();
        return enterUsername(creds[0]).enterPassword(wrongPassword).clickLogin();
    }

    /** TC-LOGIN-004: structural check, no submission needed. */
    public String getPasswordFieldType() {
        return driver.element().getAttribute(Txt_Password, "type");
    }

    /** TC-LOGIN-007: structural check, no submission needed. */
    public String getLoginButtonLoadingIconAttribute() {
        return driver.element().getAttribute(Btn_LogINButton, "loadingicon");
    }

    public String getInvalidCredentialsMessage() {
        return driver.element().getText(Txt_InValidCred);
    }

    /**
     * Repair v2 (2026-07-12, TC-LOGIN-002 diagnosis + locator fix): the previous version of this
     * method wrapped SHAFT's own `getText()` in `catch (Exception e)` — but SHAFT's `getText()`
     * runs its own ~60s internal FluentWait and then throws `AssertionError` directly (a
     * `Throwable`/`Error`, not an `Exception`), so that catch never fired and the polling loop
     * never actually got to loop. This version checks raw element presence (Selenium
     * `findElements`, which returns an empty list rather than throwing) before ever calling
     * SHAFT's own `getText()` — and only for as long as the message is known to render (~5-7s),
     * not SHAFT's much longer default. Combined with the corrected `Txt_InValidCred` locator
     * above, this should now reliably observe the message before it auto-dismisses.
     */
    public String waitForInvalidCredentialsMessage(int timeoutSeconds) {
        final String[] captured = {null};
        waitUntil(() -> {
            if (!driver.getDriver().findElements(Txt_InValidCred).isEmpty()) {
                captured[0] = driver.element().getText(Txt_InValidCred);
                return true;
            }
            return false;
        }, timeoutSeconds);
        return captured[0];
    }

    public String getUsernameRequiredMessage() {
        return driver.element().getText(Txt_ErrorOfUserName);
    }

    public String getPasswordRequiredMessage() {
        return driver.element().getText(Txt_ErrorOfPassword);
    }

    public String currentUrl() {
        return driver.getDriver().getCurrentUrl();
    }
}
