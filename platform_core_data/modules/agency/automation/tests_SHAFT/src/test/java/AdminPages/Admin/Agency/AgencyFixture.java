package AdminPages.Admin.Agency;

import com.shaft.driver.SHAFT;

import java.io.File;
import java.net.URL;

/**
 * Builds and holds the <b>single</b> Branch + Agency pair the whole Agency suite shares.
 *
 * <h2>One Agency for the entire execution -- an operator decision, recorded</h2>
 *
 * <p>At the Stage 4A approval gate on 2026-08-18 the operator directed: <b>one Agency fixture for all
 * test cases, not one per test case</b> (Automation Plan §5.1). Every execution therefore creates
 * exactly <b>one</b> permanent Agency record on STG instead of the 34 that per-test provisioning would
 * have left behind. That matters because {@code PO-3} gives this environment no DELETE: every fixture
 * is permanent.
 *
 * <h2>The Branch beneath it is reused, not created, as of 2026-08-20</h2>
 *
 * <p>A second operator instruction, given after several executions had each built their own Branch:
 * settle on one already-created, already-working Branch and stop creating a new one per execution.
 * {@link SupplierBranchProvisioner#getOrCreateApprovedBranchWithSuppliers} now searches for the Branch
 * configured in {@code agency_baseline.properties} (<code>knownApprovedBranchCode</code>) and reuses it
 * read-only, falling back to building a fresh one only when no known Branch is configured.
 *
 * <h2>What that costs, stated rather than discovered later</h2>
 *
 * <p>The tests are <b>not mutually independent</b>, and two rules follow:
 *
 * <ol>
 *   <li><b>A test must not leave the shared Agency in a state another test depends on not being in.</b>
 *       Field-persistence and validation cases restore what they changed, or assert only on fields no
 *       other case writes. Suite order is explicit via TestNG {@code priority}, never declaration order.
 *   <li><b>Approve, Reject and Send For Approval are state transitions on the one record</b> -- not
 *       repeatable actions -- so the maker-checker cases chain rather than run in any order. Whether a
 *       <em>rejected</em> Agency can be resubmitted is an <b>unverified assumption</b>: confirming it
 *       read-only was impossible, because it would have required rejecting a record this run did not
 *       create, which the safety policy makes {@code Forbidden (absolute)}. The chain is ordered
 *       reject-before-approve, and if the record turns out to be terminal after rejection the approve
 *       case reports a <b>blocked precondition naming this assumption</b> -- it does not pass falsely,
 *       and it does not quietly provision a second Agency to work around the operator's instruction.
 * </ol>
 *
 * <h2>Why the fixture is held statically rather than in a {@code @BeforeSuite} field</h2>
 *
 * <p>{@code TestBase} builds a fresh WebDriver per test method, by design -- its Javadoc forbids
 * reintroducing a shared or warm-up driver, because a second driver construction made SHAFT's own
 * listener report every test {@code Skipped} while Surefire claimed they passed. The fixture therefore
 * cannot hold a driver. It holds the <b>identifiers</b>, which are plain strings and outlive any
 * session, and {@link #ensureBuilt(SHAFT.GUI.WebDriver)} builds them once using whichever driver calls
 * first.
 *
 * <p><b>A failed build is remembered, not retried.</b> Under §5.1 a provisioning failure fails all 17
 * tests; retrying it 17 times would turn one clear failure into seventeen slow ones and could leave
 * partial records behind on an environment that cannot delete them.
 */
public final class AgencyFixture {

    private static AgencyProvisioner.ProvisionedAgency agency;
    private static SupplierBranchProvisioner.ProvisionedBranch branch;
    private static Throwable buildFailure;
    private static boolean buildAttempted;

    private AgencyFixture() {
    }

    /**
     * Builds the fixture on first call and returns it; every later call returns the same records.
     * Re-throws the original failure on every later call if the first attempt failed.
     */
    public static synchronized AgencyProvisioner.ProvisionedAgency ensureBuilt(SHAFT.GUI.WebDriver driver) {
        if (buildAttempted) {
            if (buildFailure != null) {
                throw new IllegalStateException(
                        "The shared Agency fixture failed to build earlier in this execution and is not "
                                + "retried -- under Automation Plan §5.1 one Agency serves every test, so this "
                                + "failure is the same one for all of them. Original cause below.",
                        buildFailure);
            }
            if (agency == null) {
                // Defensive: buildAttempted is true and buildFailure is null, yet agency was never
                // assigned. Should be unreachable after REPAIR-AG-008, but fails loudly rather than
                // letting a caller NPE on a bare null return if it ever recurs for a new reason.
                throw new IllegalStateException(
                        "The shared Agency fixture finished its build attempt without error and without "
                                + "producing an Agency. This is a defect in AgencyFixture itself, not in the "
                                + "application under test.");
            }
            return agency;
        }
        buildAttempted = true;
        try {
            System.out.println("[FIXTURE] building the single shared Branch + Agency pair for this execution");
            branch = SupplierBranchProvisioner.getOrCreateApprovedBranchWithSuppliers(driver);
            System.out.println("[FIXTURE] branch ready: " + branch);
            agency = AgencyProvisioner.createAgency(driver, branch.branchName(),
                    validDocumentPath(), validLogoPath());
            System.out.println("[FIXTURE] agency ready: " + agency);
            System.out.println("[FIXTURE] records created on STG by this execution: 2 (1 branch, 1 agency)");
            return agency;
        } catch (Throwable failure) {
            // REPAIR-AG-008 (2026-08-19, Stage 5H): must catch Throwable, not RuntimeException.
            // org.testng.Assert -- used throughout AgencyProvisioner and SupplierBranchProvisioner --
            // throws AssertionError on a failed assertion, and AssertionError extends Error, not
            // Exception. Catching only RuntimeException let an assertion failure skip this block
            // entirely: buildAttempted stayed true (set above) but buildFailure was never recorded and
            // `agency` was never assigned, so every later test's ensureBuilt() call took the "already
            // succeeded" branch and returned null -- a NullPointerException at the call site, hiding the
            // real cause behind a misleading second failure.
            buildFailure = failure;
            if (failure instanceof RuntimeException) {
                throw (RuntimeException) failure;
            }
            if (failure instanceof Error) {
                throw (Error) failure;
            }
            throw new IllegalStateException("Fixture build failed", failure);
        }
    }

    /** The shared Agency. Throws if {@link #ensureBuilt} has not run -- never returns a null record. */
    public static AgencyProvisioner.ProvisionedAgency agency() {
        if (agency == null) {
            throw new IllegalStateException(
                    "The shared Agency fixture has not been built. A test must call ensureBuilt(driver) -- "
                            + "AgencyTestBase does this in its own setup -- before reading the fixture.");
        }
        return agency;
    }

    /** The shared Branch the Agency sits beneath, including the suppliers it carries. */
    public static SupplierBranchProvisioner.ProvisionedBranch branch() {
        if (branch == null) {
            throw new IllegalStateException("The shared Branch fixture has not been built.");
        }
        return branch;
    }

    // -- Upload fixture paths -------------------------------------------------------------------

    public static String validDocumentPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyContract_Doc1_valid.pdf");
    }

    public static String validLogoPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyLogo_valid.png");
    }

    /** TC-AGENCY-020: a .pdf filename whose bytes are plain text with no %PDF header. */
    public static String fakeExtensionDocumentPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyContract_fake_extension.pdf");
    }

    /** TC-AGENCY-023: ~3.16 MB, structurally valid, padded with random bytes so it is genuinely incompressible. */
    public static String oversizeLogoPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyLogo_oversize.png");
    }

    /**
     * Resolves a test-resource to an absolute filesystem path. Fails naming the missing file rather
     * than handing a driver a path that does not exist -- {@code sendKeys} on a non-existent file
     * produces an error about the browser, not about the fixture.
     */
    private static String resourcePath(String classpathRelative) {
        URL resource = AgencyFixture.class.getClassLoader().getResource(classpathRelative);
        if (resource == null) {
            throw new IllegalStateException(
                    "Upload fixture missing from the classpath: " + classpathRelative
                            + ". It must exist under src/test/resources/ before any upload test runs.");
        }
        return new File(resource.getFile()).getAbsolutePath();
    }
}
