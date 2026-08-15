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

    /**
     * REPAIR-BR-014: how many times the post-create lookup may be re-issued while waiting for a
     * just-submitted record to become returnable by a search. Bounded on purpose — a record that
     * genuinely was not created still fails the calling test rather than looping. This is an attempt
     * count, not a pause: nothing sleeps between attempts, and each attempt's own waits are already
     * bounded inside {@link SearchBranch_Page}.
     */
    private static final int LOOKUP_ATTEMPTS = 4;

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

        SearchBranch_Page searchBranchPage = new SearchBranch_Page(driver);

        // REPAIR-BR-014, adapted 2026-08-15. Two separate faults were fixed here:
        //
        // 1. A single search straight after submitting is too early. The record is created — the
        //    browser navigates to /admin/branch and the success message shows — but a search issued
        //    immediately afterwards does not yet return it. Verified 2026-08-10: a `QA_` prefix search
        //    run after a "failing" suite returned 39 QA records, including every one that suite had
        //    just reported it could not find. The lookup is now re-issued, bounded.
        //
        // 2. Reading row 1 of the result set is unsafe on its own. It assumes the only row returned is
        //    ours. Identity is now proven per row by reading each candidate's Branch Name and matching
        //    it against the exact name this call generated, so an unrelated record can never be handed
        //    back and then approved or rejected by the caller.
        //
        // Status INACTIVE, not BOTH (business clarification 2026-08-10): a freshly submitted Branch is
        // expected under Inactive and explicitly not under Active. If INACTIVE returns the record while
        // BOTH does not, that is a defect in the BOTH filter and must be raised as a finding — it is
        // not something this change quietly works around.
        //
        // Bounded by attempt count, not by any fixed pause: each attempt re-opens and re-searches, and
        // every wait inside that search is already bounded by SearchBranch_Page.
        String branchCode = "";
        for (int attempt = 1; attempt <= LOOKUP_ATTEMPTS && branchCode.isEmpty(); attempt++) {
            searchBranchPage.open();
            searchBranchPage.searchByName(branchName, SearchBranch_Page.Status.INACTIVE);
            branchCode = codeOfExactlyThisBranch(searchBranchPage, branchName);
        }

        Assert.assertFalse(branchCode.isEmpty(),
                "Provisioning failed: no Branch named \"" + branchName + "\" was found after creating it, "
                        + "across " + LOOKUP_ATTEMPTS + " searches on the " + SearchBranch_Page.Status.INACTIVE.label()
                        + " filter. No test may proceed, because acting on any other record would be outside "
                        + "this run's mutation authorisation.");

        // Final confirmation, scoped to the exact code the caller will act on: search by that code and
        // require the record it returns to still be the branch this call created. Everything the caller
        // does is addressed by this code, so this is the identity that has to hold.
        searchBranchPage.open();
        searchBranchPage.searchByCode(branchCode, SearchBranch_Page.Status.INACTIVE);
        Assert.assertTrue(searchBranchPage.isRowPresent(branchCode),
                "Provisioning failed: Branch Code \"" + branchCode + "\" was read from the grid but a search "
                        + "for that exact code returned no row, so the record the caller would act on cannot "
                        + "be confirmed.");
        Assert.assertEquals(searchBranchPage.branchNameOf(branchCode), branchName,
                "Provisioning failed: Branch Code \"" + branchCode + "\" belongs to a different record than the "
                        + "one this run created. No action may be taken on it — approving or rejecting another "
                        + "team's branch is exactly what this run's mutation authorisation forbids.");

        return new ProvisionedBranch(branchCode, branchName);
    }

    /**
     * The Branch Code of the row whose Branch Name is exactly {@code branchName}, or {@code ""} when
     * the current result set holds no such row.
     *
     * <p>Every candidate is checked by name. A row is never accepted because of its position, so a
     * result set that happens to contain other records — or one the filter failed to narrow at all —
     * cannot yield a code this run does not own.</p>
     */
    private static String codeOfExactlyThisBranch(SearchBranch_Page searchBranchPage, String branchName) {
        for (String candidateCode : searchBranchPage.branchCodesOnCurrentPage()) {
            if (candidateCode.isEmpty()) {
                continue;
            }
            if (branchName.equals(searchBranchPage.branchNameOf(candidateCode))) {
                return candidateCode;
            }
        }
        return "";
    }
}
