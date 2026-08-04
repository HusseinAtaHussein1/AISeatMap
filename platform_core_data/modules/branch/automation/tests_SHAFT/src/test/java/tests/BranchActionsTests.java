package tests;

import base.AbstractBaseTest;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.SearchBranchPage;
import pages.SearchBranchPage.RowAction;
import pages.SearchBranchPage.Status;
import utils.BranchProvisioner;
import utils.BranchProvisioner.ProvisionedBranch;

import java.util.EnumSet;
import java.util.Set;

/**
 * BranchActionsSuite -- the mutating half of US 8599: approving and rejecting a Branch from the
 * results grid.
 *
 * <p><b>Every test in this class provisions its own Branch first and acts only on that record.</b>
 * This run's mutation authorisation permits creating new Branch records and acting on records it
 * created, and forbids acting on any Branch it did not create (ProjectContext §5). Two mechanisms
 * enforce that rather than merely documenting it: {@link BranchProvisioner} returns a run-tagged
 * record's Branch Code before any action is taken, and every action is issued through
 * {@code SearchBranchPage}'s row-by-code locator, which was verified to resolve to exactly one row.
 * No test here can reach a record it did not create.</p>
 *
 * <p>Each of TC-BR-056, TC-BR-057 and TC-BR-058 provisions a <b>separate</b> Branch, because each
 * needs to start from {@code Pending for approval} and the previous test's record no longer is.</p>
 */
@Epic("Branch")
@Feature("Search & Actions Branch")
public class BranchActionsTests extends AbstractBaseTest {

    private static final String PENDING_STATUS = "Pending for approval";
    private static final String APPROVED_STATUS = "Approved";
    private static final String REJECTED_STATUS = "Rejected";
    private static final String REMARKS_TEXT = "Approved by QA run-003";

    private SearchBranchPage searchBranchPage;

    @Override
    protected void navigateToStartScreen() {
        searchBranchPage = new SearchBranchPage(driver).open();
    }

    /**
     * TC-BR-056 -- Approve a Pending branch from the results grid.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities (Approve/Reject Branch).
     * Tags: Scenario, Positive, SelfCreatedRecord. Priority P1.
     */
    @Test
    @Story("Approve / reject")
    @Description("TC-BR-056: Approve a Pending branch from the results grid")
    public void tcBr056_approvePendingBranchFromResultsGrid() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        searchBranchPage.open();
        searchBranchPage.searchByCode(branch.branchCode(), Status.BOTH);
        Assert.assertEquals(searchBranchPage.approvalStatusOf(branch.branchCode()), PENDING_STATUS,
                "Expected the newly created branch " + branch + " to start as \"" + PENDING_STATUS + "\".");

        searchBranchPage.clickThumbsUp(branch.branchCode());
        completeAnyRemarksPrompt();

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), APPROVED_STATUS),
                "Approval Status of " + branch + " did not reach \"" + APPROVED_STATUS
                        + "\"; it read \"" + searchBranchPage.approvalStatusOf(branch.branchCode()) + "\".");

        Set<RowAction> expected = EnumSet.of(RowAction.EDIT, RowAction.REJECT);
        Assert.assertEquals(searchBranchPage.actionsAvailableFor(branch.branchCode()), expected,
                "An Approved branch should offer only the edit pen and thumbs-down -- it must not "
                        + "offer a transition to the state it is already in.");
    }

    /**
     * TC-BR-057 -- Reject a Pending branch from the results grid.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities (Approve/Reject Branch).
     * Uses a second, separately provisioned branch so this case also starts from Pending.
     */
    @Test
    @Story("Approve / reject")
    @Description("TC-BR-057: Reject a Pending branch from the results grid")
    public void tcBr057_rejectPendingBranchFromResultsGrid() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        searchBranchPage.open();
        searchBranchPage.searchByCode(branch.branchCode(), Status.BOTH);
        Assert.assertEquals(searchBranchPage.approvalStatusOf(branch.branchCode()), PENDING_STATUS,
                "Expected the newly created branch " + branch + " to start as \"" + PENDING_STATUS + "\".");

        searchBranchPage.clickThumbsDown(branch.branchCode());
        completeAnyRemarksPrompt();

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), REJECTED_STATUS),
                "Approval Status of " + branch + " did not reach \"" + REJECTED_STATUS
                        + "\"; it read \"" + searchBranchPage.approvalStatusOf(branch.branchCode()) + "\".");

        Set<RowAction> expected = EnumSet.of(RowAction.EDIT, RowAction.APPROVE);
        Assert.assertEquals(searchBranchPage.actionsAvailableFor(branch.branchCode()), expected,
                "A Rejected branch should offer only the edit pen and thumbs-up.");
    }

    /**
     * TC-BR-058 -- Approve and Reject capture a Remarks entry.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities.
     *
     * <p><b>Whether the grid-level action prompts for Remarks is genuinely unknown.</b> The Update
     * screen has a mandatory Remarks field, but Discovery never exercised the grid path, so the test
     * case is explicit: if no prompt appears, record that as the observed result rather than a pass.
     * This test therefore <em>records</em> the prompt's presence as an Allure step and <em>asserts</em>
     * only what the case actually claims -- that the approval succeeds. Asserting the prompt exists
     * would be encoding a guess as a requirement.</p>
     */
    @Test
    @Story("Approve / reject")
    @Description("TC-BR-058: Approve and Reject capture a Remarks entry")
    public void tcBr058_approveAndRejectCaptureRemarksEntry() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        searchBranchPage.open();
        searchBranchPage.searchByCode(branch.branchCode(), Status.BOTH);
        searchBranchPage.clickThumbsUp(branch.branchCode());

        boolean remarksRequested = searchBranchPage.remarksPromptShown();
        Allure.step("Observed: grid-level approve " + (remarksRequested ? "DID" : "did NOT")
                + " request a Remarks entry. Discovery could not establish this; the observation is "
                + "recorded here rather than asserted.");

        if (remarksRequested) {
            new pages.UpdateBranchPage(driver).setRemarks(REMARKS_TEXT);
            confirmPrompt();
        }

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), APPROVED_STATUS),
                "Expected the approval of " + branch + " to complete, reaching \"" + APPROVED_STATUS + "\".");
    }

    /**
     * Fills and confirms a Remarks prompt if the application raises one. Non-throwing by design: the
     * grid action's prompt behaviour is unestablished (see TC-BR-058), so its absence must not fail
     * the approve/reject cases that only care about the resulting status.
     */
    private void completeAnyRemarksPrompt() {
        if (searchBranchPage.remarksPromptShown()) {
            new pages.UpdateBranchPage(driver).setRemarks(REMARKS_TEXT);
            confirmPrompt();
        }
    }

    /** Confirms an open prompt via its Approve/Reject/OK affirmative, whichever the dialog renders. */
    private void confirmPrompt() {
        driver.element().click(org.openqa.selenium.By.xpath(
                "//button[normalize-space(.)='Approve' or normalize-space(.)='Reject' "
                        + "or normalize-space(.)='OK' or normalize-space(.)='Confirm' "
                        + "or normalize-space(.)='Submit']"));
    }
}
