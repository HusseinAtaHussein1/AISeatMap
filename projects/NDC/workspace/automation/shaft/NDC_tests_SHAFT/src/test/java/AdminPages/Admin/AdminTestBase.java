package AdminPages.Admin;

import AdminPages.Login.LogIn_Page;
import Drive_Factory.CommonMethod;
import com.shaft.driver.SHAFT;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

/**
 * Shared base for Branch/Agency/Staff test classes (RUN-20260712-002) — logs in as Admin before
 * every test method, per-method (not per-class) setup/teardown, matching the existing
 * AdminPages.Login.TestBase convention already established in this package for the Login suite.
 * Each in-scope module's own test class opens its own module from the Admin tab after this runs.
 */
public class AdminTestBase {
    protected SHAFT.GUI.WebDriver driver;

    @BeforeMethod
    public void setupDriverAndLogin() throws Exception {
        CommonMethod.setupDriver("CHROME");
        driver = CommonMethod.getDriver();
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.loginWithValidCredential();
        Assert.assertTrue(login.waitForDashboardTitle(15), "Login must succeed before any Admin test can proceed.");
        new AdminMenu(driver).openSubAdmin();
    }

    @AfterMethod
    public void teardownDriver() {
        CommonMethod.quitDriver();
    }

    /** Short, fixed pause for Angular-async-render gaps that don't expose a reliable poll target
     *  (e.g. a toast fade-in). Centralized 2026-07-25 — was duplicated identically across
     *  Agency_Actions_TC/Agency_Search_TC/Agency_Update_TC. Prefer a real poll (see Agency_Page's
     *  own submit()/Branch_Page's waitForOptionPanel()) over this wherever a concrete end-state
     *  exists to wait for. */
    protected void waitBriefly() {
        try {
            Thread.sleep(1200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
