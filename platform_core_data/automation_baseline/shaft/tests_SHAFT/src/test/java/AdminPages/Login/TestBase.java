package AdminPages.Login;

import com.shaft.driver.SHAFT;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import AdminPages.Login.LogIn_Page;
import utilities.BrowserSession;

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
 */
public abstract class TestBase {
    protected SHAFT.GUI.WebDriver driver;

    /**
     * <p><b>2026-08-15:</b> driver construction moved to {@link BrowserSession#start()}. The browser
     * is no longer built with {@code new SHAFT.GUI.WebDriver()} here, because a bare SHAFT driver
     * leaves Chrome's password-manager leak detection on -- which raises a tab-modal
     * "Change your password" dialog over the application after login, invisible to WebDriver and
     * blocking every interaction underneath while SHAFT still logs each one as delivered. That is
     * the root cause of the long-standing Credential-dropdown intermittency. See
     * {@link BrowserSession} for the full mechanism. Do not reintroduce a direct
     * {@code new SHAFT.GUI.WebDriver()} call anywhere in this project.</p>
     */
    @BeforeMethod
    public void setUp() {
        driver = BrowserSession.start();
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
