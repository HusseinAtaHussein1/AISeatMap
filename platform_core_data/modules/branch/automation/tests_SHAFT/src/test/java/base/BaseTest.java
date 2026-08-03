package base;

import com.shaft.driver.SHAFT;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import pages.AddBranchPage;
import pages.LoginPage;

/**
 * Shared Setup/Teardown (Automation Plan §5): DriverFactory init + login as Super Admin + navigate
 * to the Add Branch form before every test; DriverFactory teardown after every test. Every test
 * class in this suite extends this one rather than re-authoring the lifecycle per class.
 */
public class BaseTest {
    protected SHAFT.GUI.WebDriver driver;
    protected AddBranchPage addBranchPage;

    @BeforeMethod
    public void setUp() {
        driver = new SHAFT.GUI.WebDriver();
        new LoginPage(driver).open().loginAsSuperAdmin();
        addBranchPage = new AddBranchPage(driver).open();
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
