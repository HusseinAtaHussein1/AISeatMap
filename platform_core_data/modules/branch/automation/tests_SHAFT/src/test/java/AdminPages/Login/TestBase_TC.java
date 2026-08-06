package AdminPages.Login;

import AdminPages.Admin.Branch.AddBranch_Page;

/**
 * Base class for the Create Branch suite: inherits the shared driver lifecycle and Super Admin login
 * from {@link TestBase} and adds the one thing specific to creating a branch — landing on the
 * Add Branch form before every test.
 *
 * <p>Behaviour is identical to this class's previous, self-contained form (driver → login → open Add
 * Branch), so {@code CreateBranch_Admin_TC} required no change when the lifecycle was extracted. The
 * lifecycle now lives in exactly one place; the Search and Update suites reuse it without inheriting
 * a navigation they do not want.</p>
 */
public class TestBase_TC extends TestBase {
    protected AddBranch_Page addBranchPage;

    @Override
    protected void navigateToStartScreen() {
        addBranchPage = new AddBranch_Page(driver).open();
    }
}
