package AdminPages.Login;

import com.shaft.driver.SHAFT;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import AdminPages.Login.LogIn_Page;

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
 * <p>{@link TestBase_TC} extends this class and supplies the Add Branch navigation the pre-existing
 * {@code CreateBranch_Admin_TC} has always relied on, so that suite's behaviour is unchanged by this
 * extraction.</p>
 *
 * <p><b>2026-08-05:</b> a speculative "JVM warm-up" (an extra throwaway WebDriver/login cycle before
 * the first real test) was tried here and reverted the same day. It made things worse, not better:
 * SHAFT's own listener started reporting all 13 tests as {@code Skipped} (confirmed via its
 * "Test Execution Summary Results" tally), while Surefire's separate TestNG summary kept claiming
 * "12 PASS" -- a direct contradiction that only appeared after adding the second WebDriver
 * construction. The extra driver instance was interfering with SHAFT's own internal per-test driver
 * tracking. Removed; do not reintroduce this pattern without first explaining that contradiction.</p>
 */
public abstract class TestBase {
    protected SHAFT.GUI.WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = new SHAFT.GUI.WebDriver();
        new LogIn_Page(driver).open().loginAsSuperAdmin();
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
