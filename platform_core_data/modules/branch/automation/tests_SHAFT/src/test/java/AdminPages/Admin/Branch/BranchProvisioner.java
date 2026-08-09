package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.testng.Assert;
import AdminPages.Admin.Branch.AddBranch_Page;
import AdminPages.Admin.Branch.SearchBranch_Page;

import java.util.HashSet;

/**
 * Creates a Branch record for a test to act on, and returns the identifier that proves the record
 * belongs to this run.
 *
 * <p><b>Why this class exists.</b> This run's mutation authorisation (ProjectContext §5) permits
 * creating new Branch records and performing the full action set <em>on records this run created</em>
 * — and forbids any action on a Branch it did not create. That has a hard operational consequence:
 * a test cannot act on a record unless it can name that record, and it must be able to name it
 * <em>before</em> acting, or the authorisation is unprovable after the fact. Every mutating test in
 * this suite therefore provisions its own record here and scopes every subsequent action through the
 * returned Branch Code.</p>
 *
 * <p><b>Why the name is generated here rather than by {@link BranchDataFactory}.</b> That factory
 * produces unique values so repeated runs do not collide — a different concern from provenance
 * tagging, which needs the run to be identifiable in the record itself. The two are kept separate
 * rather than overloading the factory with a run identifier it has no other reason to know.</p>
 *
 * <p><b>Why the Branch Code is discovered rather than chosen.</b> The Branch Code is assigned by the
 * application, not supplied on the form. The only identifier this suite controls is the Branch Name,
 * so provisioning creates the record under a run-tagged name and then searches for that name to read
 * back the code the application assigned. The search runs with Status = Both, because a newly created
 * branch is awaiting approval and must not be assumed to fall under the default Active filter.</p>
 */
public final class BranchProvisioner {

    /**
     * Provenance tag written into every Branch Name this run creates. Digits and underscores only --
     * the shape already proven acceptable by this suite's existing Create Branch tests, so the
     * still-unresolved question of the Branch Name character set (RISK-BR-7) is not on the path of
     * any test that merely needs a record to act on.
     */
    private static final String RUN_TAG = "QA";

    private BranchProvisioner() {
    }

    /** A Branch this run created, identified by both the name it was given and the code it was assigned. */
    public static final class ProvisionedBranch {
        private final String branchCode;
        private final String branchName;

        private ProvisionedBranch(String branchCode, String branchName) {
            this.branchCode = branchCode;
            this.branchName = branchName;
        }

        public String branchCode() {
            return branchCode;
        }

        public String branchName() {
            return branchName;
        }

        @Override
        public String toString() {
            return branchName + " (" + branchCode + ")";
        }
    }

    private static String runTaggedBranchName() {
        return RUN_TAG + "_" + System.nanoTime();
    }

    /**
     * Creates one Branch with a run-tagged name, submits it for approval, and returns it together
     * with the Branch Code the application assigned. The returned record is in
     * {@code Pending for approval} — the starting state every approve/reject/update test needs.
     *
     * <p>Fails the calling test immediately if the record cannot be found afterwards: continuing
     * without a confirmed, run-owned Branch Code would mean the next action could not be shown to be
     * authorised.</p>
     */
    public static ProvisionedBranch createPendingBranch(SHAFT.GUI.WebDriver driver) {
        String branchName = runTaggedBranchName();

        AddBranch_Page addBranchPage = new AddBranch_Page(driver).open();
        // Fill every mandatory field except the name, then set the run-tagged name explicitly --
        // fillMandatoryBaseline generates its own unique name, which the caller could not predict.
        HashSet<String> skipName = new HashSet<>();
        skipName.add("name");
        addBranchPage.fillMandatoryBaseline(skipName);
        addBranchPage.setBranchName(branchName);
        addBranchPage.clickSubmit();
        addBranchPage.assertSubmissionSucceeded();

        SearchBranch_Page searchBranchPage = new SearchBranch_Page(driver).open();
        searchBranchPage.searchByName(branchName, SearchBranch_Page.Status.BOTH);

        Assert.assertTrue(searchBranchPage.rowCount() > 0,
                "Provisioning failed: no Branch named \"" + branchName + "\" was found after creating it. "
                        + "No test may proceed, because acting on any other record would be outside this "
                        + "run's mutation authorisation.");

        String branchCode = searchBranchPage.branchCodeInRow(1);
        Assert.assertFalse(branchCode.isEmpty(),
                "Provisioning failed: the Branch named \"" + branchName
                        + "\" was found but its Branch Code cell was empty, so no action can be scoped to it.");

        return new ProvisionedBranch(branchCode, branchName);
    }
}
