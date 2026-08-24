package AdminPages.Admin.Agency;

import AdminPages.Login.TestBase;
import org.testng.annotations.BeforeMethod;
import utilities.AgencyFixture;

/**
 * Common setup for every Agency test class: the inherited driver + Super Admin login from
 * {@link TestBase}, plus <b>this class's own</b> Agency fixture.
 *
 * <p>Contains lifecycle/fixture state only -- no Page action helper methods. Tests call Page Objects
 * directly, e.g. {@code new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode)}.
 *
 * <p><b>{@code @BeforeMethod} is not re-declared for the driver lifecycle.</b> {@link TestBase}'s
 * Javadoc records why: TestNG annotation inheritance makes an overridden-and-re-annotated setup easy to
 * run twice or not at all, so exactly one annotated lifecycle method exists in the hierarchy. The fixture
 * hook below is a <em>separate</em> {@code @BeforeMethod}, which TestNG runs after the superclass's.
 *
 * <p><b>Per-class fixture.</b> Every subclass builds <b>its own</b> Agency, once, the first time any of
 * its test methods runs -- the fields below are <b>instance</b> fields, so a fixture failure in one class
 * does not affect the other four. The Branch beneath every class's Agency is the one known, pre-approved
 * Branch, reused read-only ({@link AgencyFixture#build}) -- so five classes cost five new Agencies and
 * zero new Branches.
 *
 * <p><b>A failed build is remembered for this class's own instance, not retried.</b> TestNG runs every
 * test method in a class on the same instance by default, so an instance field set the first time
 * {@link #prepareClassFixture()} runs is visible to every later method in that same class, and a first
 * failure is reported to every later method rather than re-attempted. Catches {@code Throwable}, not just
 * {@code RuntimeException}, because {@code org.testng.Assert} throws {@link AssertionError}, an
 * {@link Error} (REPAIR-AG-008).
 */
public abstract class AgencyTestBase extends TestBase {

    /** The Agency Code every test in this class acts on. */
    protected String agencyCode;

    /** This class's run-created Agency Name, needed where a test asserts row identity. */
    protected String agencyName;

    private AgencyFixture.Built classFixture;
    private Throwable classFixtureBuildFailure;
    private boolean classFixtureBuildAttempted;

    @BeforeMethod(dependsOnMethods = "setUp")
    public void prepareClassFixture() {
        if (!classFixtureBuildAttempted) {
            classFixtureBuildAttempted = true;
            try {
                classFixture = AgencyFixture.build(driver, getClass().getSimpleName());
            } catch (Throwable failure) {
                classFixtureBuildFailure = failure;
                if (failure instanceof RuntimeException) {
                    throw (RuntimeException) failure;
                }
                if (failure instanceof Error) {
                    throw (Error) failure;
                }
                throw new IllegalStateException("Fixture build failed for " + getClass().getSimpleName(), failure);
            }
        } else if (classFixtureBuildFailure != null) {
            throw new IllegalStateException(
                    getClass().getSimpleName() + "'s own Agency fixture failed to build earlier in this "
                            + "execution and is not retried -- under the per-class fixture strategy, this "
                            + "failure affects only this class's own tests, not the other four Agency test "
                            + "classes. Original cause below.",
                    classFixtureBuildFailure);
        }
        agencyCode = classFixture.agencyCode();
        agencyName = classFixture.agencyName();
    }

    /** The Branch this class's own Agency sits beneath (reused, not created by this run). */
    protected AgencyFixture.ApprovedBranch branch() {
        return classFixture.branch();
    }
}
