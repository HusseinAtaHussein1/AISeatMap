package AdminPages.Login;

import Drive_Factory.CommonMethod;
import com.shaft.driver.SHAFT;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

/**
 * Export package's Login test base. On merge into the Reference Project, prefer reusing its own
 * base class(es) instead of this one — see NDC_AutomationPlan_SHAFT.md "Existing Assets."
 * Per-method (not per-test-class) setup/teardown so each of the 8 Login test cases starts from a
 * clean, logged-out browser state — required since several are structural/no-submission checks
 * that must not inherit session state from a prior test.
 */
public class TestBase {
    protected SHAFT.GUI.WebDriver driver;

    @BeforeMethod
    public void setupDriver() {
        CommonMethod.setupDriver("CHROME");
        driver = CommonMethod.getDriver();
    }

    @AfterMethod
    public void teardownDriver() {
        CommonMethod.quitDriver();
    }
}
