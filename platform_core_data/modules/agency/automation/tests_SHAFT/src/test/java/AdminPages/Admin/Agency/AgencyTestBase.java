package AdminPages.Admin.Agency;

import AdminPages.Login.TestBase;
import org.testng.annotations.BeforeMethod;

/**
 * Common setup for every Agency test class: the inherited driver + Super Admin login from
 * {@link TestBase}, plus the one shared Branch/Agency fixture this suite operates on.
 *
 * <p><b>{@code @BeforeMethod} is not re-declared for the lifecycle.</b> {@link TestBase}'s Javadoc
 * records why: TestNG annotation inheritance makes an overridden-and-re-annotated setup easy to run
 * twice or not at all, so exactly one annotated lifecycle method exists in the hierarchy. The fixture
 * hook below is a <em>separate</em> {@code @BeforeMethod}, which TestNG runs after the superclass's --
 * it constructs no driver and does not touch the lifecycle.
 *
 * <p><b>The fixture is built once per execution, not once per method.</b>
 * {@link AgencyFixture#ensureBuilt} is idempotent; the first test that runs pays for provisioning and
 * every later test reuses the same two records. That is the operator's §5.1 instruction expressed in
 * code: one Agency for all cases.
 */
public abstract class AgencyTestBase extends TestBase {

    /** The Agency Code every test in this suite acts on. */
    protected String agencyCode;

    /** The run-created Agency Name, needed where a test asserts row identity. */
    protected String agencyName;

    @BeforeMethod(dependsOnMethods = "setUp")
    public void prepareSharedFixture() {
        AgencyProvisioner.ProvisionedAgency provisioned = AgencyFixture.ensureBuilt(driver);
        agencyCode = provisioned.agencyCode();
        agencyName = provisioned.agencyName();
    }

    /**
     * Opens the shared Agency's Update form the only sanctioned way -- via the list row's edit pen.
     *
     * <b>REPAIR-AG-012 (2026-08-19, Stage 5H).</b> Searches by the fixture's own code before opening it.
     * The unfiltered {@code /admin/agency} view renders only 10 rows in an order unrelated to creation
     * time, so a freshly created (or otherwise not-page-1) Agency is not reliably present without
     * searching -- confirmed live, the exact same lesson {@code SearchBranch_Page.searchByName} already
     * encodes for Branch.
     */
    protected UpdateAgency_Page openUpdateForm() {
        return new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);
    }

    /** Same correction as {@link #openUpdateForm()} -- see REPAIR-AG-012. */
    protected SearchAgency_Page agencyList() {
        return new SearchAgency_Page(driver).open().searchByCode(agencyCode);
    }
}
