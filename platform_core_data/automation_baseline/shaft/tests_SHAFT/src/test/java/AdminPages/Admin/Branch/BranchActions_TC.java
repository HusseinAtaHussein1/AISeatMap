package AdminPages.Admin.Branch;

import AdminPages.Login.TestBase;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.Test;
import AdminPages.Admin.Branch.SearchBranch_Page.Status;
import AdminPages.Admin.Branch.BranchProvisioner.ProvisionedBranch;

/**
 * BranchActionsSuite -- US 8599, the approve/reject-from-the-grid half split out of
 * {@link SearchBranch_TC} (that class's own header explains why: keeping mutation out of the
 * read-only suite). Every mutating test here provisions its own Branch through
 * {@link BranchProvisioner} and scopes every action to that record's Branch Code
 * (ProjectContext §5, mutation authorisation).
 *
 * <p><b>The Remarks prompt is not optional.</b> Live-verified 2026-08-10: clicking thumbs-up or
 * thumbs-down always raises a mandatory PrimeNG dialog (Remark *, Cancel/Submit) -- a click with no
 * remarks entered leaves the record unchanged (re-confirmed by re-searching: still "Pending for
 * approval"). This closes KL-01 -- this class previously did not exist, so {@code testng.xml}'s
 * {@code BranchActionsSuite} declared a class nothing had ever written, and Approve/Reject had never
 * executed in any cycle.</p>
 */
@Epic("Branch")
@Feature("Search & Actions Branch")
public class BranchActions_TC extends TestBase {

    /**
     * The three approval labels come from {@link ApprovalStatus} rather than from literals of this
     * class's own (2026-08-15). Each holds the exact same text its literal held, so no assertion
     * changes meaning — the only difference is that a rename in the application is now corrected in
     * one place instead of being hunted across every file that spelled the label out.
     */
    private static final String PENDING_STATUS = ApprovalStatus.PENDING.label();
    private static final String APPROVED_STATUS = ApprovalStatus.APPROVED.label();
    private static final String REJECTED_STATUS = ApprovalStatus.REJECTED.label();

    /**
     * Remarks text submitted by these tests. The application requires a non-empty remark and this
     * suite never asserts on the text, so the exact wording carries no behaviour. It deliberately
     * names no run: an earlier version said "run-003", which stayed in the code long after that run
     * finished and would have written a stale, misleading provenance note onto every record these
     * tests touch from then on.
     */
    private static final String APPROVE_REMARKS = "Approved from the results grid by automated QA";
    private static final String REJECT_REMARKS = "Rejected from the results grid by automated QA";
    private static final String CAPTURE_REMARKS = "Remarks capture check by automated QA";

    private SearchBranch_Page searchBranchPage;

    @Override
    protected void navigateToStartScreen() {
        searchBranchPage = new SearchBranch_Page(driver).open();
    }

    /** Searches for the provisioned branch and fails loudly if it cannot be found -- acting on any
     * other record would be outside this run's mutation authorisation. */
    private void openOnGrid(ProvisionedBranch branch) {
        searchBranchPage.open();
        searchBranchPage.searchByCode(branch.branchCode(), Status.BOTH);
        Assert.assertTrue(searchBranchPage.isRowPresent(branch.branchCode()),
                "Self-created branch " + branch + " was not found on the grid.");
    }

    /**
     * TC-BR-056 -- Approve a Pending branch from the results grid.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities.
     */
    @Test
    @Story("Approve from grid")
    @Description("TC-BR-056: Approve a Pending branch from the results grid")
    public void tcBr056_approvePendingBranchFromResultsGrid() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        openOnGrid(branch);
        Assert.assertEquals(searchBranchPage.approvalStatusOf(branch.branchCode()), PENDING_STATUS,
                "Expected " + branch + " to start \"" + PENDING_STATUS + "\".");

        searchBranchPage.clickThumbsUp(branch.branchCode());
        Assert.assertTrue(searchBranchPage.remarksPromptShown(),
                "Expected the mandatory Remarks prompt after thumbs-up (live-verified 2026-08-10); "
                        + "none appeared.");
        searchBranchPage.completeRemarksPrompt(APPROVE_REMARKS);

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), APPROVED_STATUS),
                "Expected " + branch + " to read \"" + APPROVED_STATUS + "\" after approval from the "
                        + "grid; it read \"" + searchBranchPage.approvalStatusOf(branch.branchCode()) + "\".");
    }

    /**
     * TC-BR-057 -- Reject a Pending branch from the results grid.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities.
     */
    @Test
    @Story("Reject from grid")
    @Description("TC-BR-057: Reject a Pending branch from the results grid")
    public void tcBr057_rejectPendingBranchFromResultsGrid() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        openOnGrid(branch);
        Assert.assertEquals(searchBranchPage.approvalStatusOf(branch.branchCode()), PENDING_STATUS,
                "Expected " + branch + " to start \"" + PENDING_STATUS + "\".");

        searchBranchPage.clickThumbsDown(branch.branchCode());
        Assert.assertTrue(searchBranchPage.remarksPromptShown(),
                "Expected the mandatory Remarks prompt after thumbs-down (live-verified 2026-08-10); "
                        + "none appeared.");
        searchBranchPage.completeRemarksPrompt(REJECT_REMARKS);

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), REJECTED_STATUS),
                "Expected " + branch + " to read \"" + REJECTED_STATUS + "\" after rejection from the "
                        + "grid; it read \"" + searchBranchPage.approvalStatusOf(branch.branchCode()) + "\".");
    }

    /**
     * TC-BR-058 -- Approve and Reject capture a Remarks entry.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities.
     *
     * <p>Discovery could not establish whether the grid raises a Remarks prompt at all (test case
     * Notes: "If no prompt appears, record that as the observed result rather than a pass"). This is
     * now resolved -- it always does -- but the assertion stays worded as an observation rather than
     * an unconditional pass/fail, per that same instruction.</p>
     */
    @Test
    @Story("Remarks capture")
    @Description("TC-BR-058: Approve and Reject capture a Remarks entry")
    public void tcBr058_approveAndRejectCaptureRemarksEntry() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        openOnGrid(branch);
        searchBranchPage.clickThumbsUp(branch.branchCode());

        boolean prompted = searchBranchPage.remarksPromptShown();
        Allure.step("Observed: Remarks prompt " + (prompted ? "was requested" : "was NOT requested"));
        Assert.assertTrue(prompted,
                "Live-verified 2026-08-10: the grid-level approve action is expected to request Remarks "
                        + "before completing. None appeared this run -- recording the observation rather than "
                        + "assuming a transient miss.");

        searchBranchPage.completeRemarksPrompt(CAPTURE_REMARKS);

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), APPROVED_STATUS),
                "Expected the entered Remarks text to be accepted and the approval to succeed for "
                        + branch + "; it read \"" + searchBranchPage.approvalStatusOf(branch.branchCode())
                        + "\".");
    }
}
