package base;

import com.shaft.driver.SHAFT;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import pages.LoginPage;

/**
 * Shared WebDriver lifecycle and authentication for every test class in this suite
 * (Automation Plan §5 "Shared Setup/Teardown"; automation-skill §14.1 "Reusable Actions").
 *
 * <p>This class owns exactly two things — driver construction/teardown, and login as Super Admin —
 * and nothing else. Where a test class needs to <em>start</em> on a particular screen, it overrides
 * {@link #navigateToStartScreen()} rather than re-declaring the lifecycle. That hook exists instead
 * of an overridden {@code @BeforeMethod} so there is only ever one annotated setup method in the
 * hierarchy: TestNG's annotation inheritance makes an overridden-and-re-annotated setup easy to run
 * twice or not at all, and this shape removes the question entirely.</p>
 *
 * <p>{@link BaseTest} extends this class and supplies the Add Branch navigation the pre-existing
 * {@code CreateBranchTests} has always relied on, so that suite's behaviour is unchanged by this
 * extraction.</p>
 */
public abstract class AbstractBaseTest {
    protected SHAFT.GUI.WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = new SHAFT.GUI.WebDriver();
        new LoginPage(driver).open().loginAsSuperAdmin();
        navigateToStartScreen();
    }

    /**
     * Lands the browser on the screen this test class starts from. The default is deliberately a
     * no-op — a test class that navigates for itself inherits nothing it has to undo.
     */
    protected void navigateToStartScreen() {
        // Intentionally empty: the post-login landing page is the default start screen.
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
