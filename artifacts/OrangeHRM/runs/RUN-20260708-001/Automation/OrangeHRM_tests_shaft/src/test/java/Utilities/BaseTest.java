package Utilities;

import com.shaft.driver.SHAFT;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

/**
 * Shared setup/teardown for every test class in the Login & Access Suite
 * (agents/automation_agent.md §10 "Shared Setup"/"Shared Teardown").
 * Every test starts logged out with a fresh driver session and ends with the
 * driver quit — independent and idempotent per §14, no cross-test state.
 */
public abstract class BaseTest {

    protected SHAFT.GUI.WebDriver driver;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        driver = new SHAFT.GUI.WebDriver();
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
