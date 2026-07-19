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
}
