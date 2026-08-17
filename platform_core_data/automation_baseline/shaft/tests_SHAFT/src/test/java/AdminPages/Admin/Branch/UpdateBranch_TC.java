package AdminPages.Admin.Branch;

import AdminPages.Login.TestBase;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.Test;
import AdminPages.Admin.Branch.SearchBranch_Page;
import AdminPages.Admin.Branch.SearchBranch_Page.Status;
import AdminPages.Admin.Branch.UpdateBranch_Page;
import AdminPages.Admin.Branch.BranchProvisioner;
import AdminPages.Admin.Branch.BranchProvisioner.ProvisionedBranch;

/**
 * UpdateBranchSuite -- US 8606.
 *
 * <p><b>TC-BR-065 is read-only</b> and opens whichever record happens to be first in the grid: it
 * only reads the form, so it needs no self-created record. <b>Every other test here mutates</b> and
 * therefore provisions its own Branch through {@link BranchProvisioner}, acting solely on that
 * record's Branch Code (ProjectContext §5, mutation authorisation).</p>
 *
 * <p><b>The Update screen is never read on a fixed delay.</b> Every entry point routes through
 * {@code UpdateBranch_Page.waitUntilLoaded()}, which polls the Branch Name field until it holds a
 * value. Discovery twice produced a false "the form does not pre-fill" reading -- nearly published as
 * a high-severity defect -- purely from sampling the page mid-render.</p>
 */
@Epic("Branch")
@Feature("Update Branch")
public class UpdateBranch_TC extends TestBase {

    private static final String UPDATED_ADDRESS = "2 Test Street";
    private static final String UPDATE_REMARKS = "Address corrected";
    private static final String APPROVAL_REMARKS = "Update approved by QA run-003";
    /** Expected approval states, read from {@link ApprovalStatus} (2026-08-15) rather than repeated as
     * literals here -- the same two labels are asserted in {@code SearchBranch_TC} and matched in
     * {@code AddBranch_Page}, and the label text is unchanged by that move. */
    private static final String PENDING_STATUS = ApprovalStatus.PENDING.label();
    private static final String APPROVED_STATUS = ApprovalStatus.APPROVED.label();

    private SearchBranch_Page searchBranchPage;

    @Override
    protected void navigateToStartScreen() {
        searchBranchPage = new SearchBranch_Page(driver).open();
    }

    /** Opens a self-created Branch on the Update screen, scoped strictly to its own Branch Code. */
    private UpdateBranch_Page openForUpdate(ProvisionedBranch branch) {
        searchBranchPage.open();
        searchBranchPage.searchByCode(branch.branchCode(), Status.BOTH);
        Assert.assertTrue(searchBranchPage.isRowPresent(branch.branchCode()),
                "Self-created branch " + branch + " was not found, so it cannot be opened for update.");
        return searchBranchPage.clickEditPen(branch.branchCode());
    }

    /**
     * TC-BR-065 -- Update Branch pre-fills every stored value.
     * Requirement: PRD_UserStories.md US 8. Priority P1. Read-only.
     */
    @Test
    @Story("Pre-fill")
    @Description("TC-BR-065: Update Branch pre-fills every stored value")
    public void tcBr065_updateBranchPreFillsEveryStoredValue() {
        System.out.println("[DIAG-SYNC] tcBr065 before clickSearch rowCount=" + searchBranchPage.rowCount());
        searchBranchPage.clickSearch();
        System.out.println("[DIAG-SYNC] tcBr065 after clickSearch rowCount=" + searchBranchPage.rowCount());
        Assert.assertTrue(searchBranchPage.rowCount() > 0, "Expected results to open a record from.");

        UpdateBranch_Page updateBranchPage = searchBranchPage.clickEditPenInRow(1);

        assertPopulated("Operating Country", updateBranchPage.operatingCountry());
        assertPopulated("Name", updateBranchPage.branchName());
        assertPopulated("Country", updateBranchPage.country());
        assertPopulated("State", updateBranchPage.state());
        assertPopulated("City", updateBranchPage.city());
        assertPopulated("Post Office Box", updateBranchPage.postOfficeBox());
        assertPopulated("Email ID", updateBranchPage.branchEmailId());
        assertPopulated("Credit Limit", updateBranchPage.creditLimit());
        assertPopulated("Top Up Limit", updateBranchPage.topUpLimit());
        assertPopulated("Outstanding Threshold", updateBranchPage.outstandingThreshold());

        Assert.assertFalse(updateBranchPage.isStateShowingPlaceholder(),
                "State shows an unselected placeholder rather than the record's stored value.");
        Assert.assertFalse(updateBranchPage.isCityShowingPlaceholder(),
                "City shows an unselected placeholder rather than the record's stored value.");
    }

    private void assertPopulated(String fieldLabel, String value) {
        Assert.assertFalse(value == null || value.isEmpty(),
                "Expected \"" + fieldLabel + "\" to show the branch's stored value, but it was blank.");
    }

    /**
     * TC-BR-066 -- Update a branch and submit it for approval.
     * Requirement: PRD_UserStories.md US 8. Finding: FINDING-011 (the button reads "Send For
     * Approval", not the AC's "Submit for Approval" -- this test drives the label that actually
     * exists; the label mismatch itself is covered by its own case, not silently absorbed here).
     */
    @Test
    @Story("Submit for approval")
    @Description("TC-BR-066: Update a branch and submit it for approval")
    public void tcBr066_updateBranchAndSubmitForApproval() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        UpdateBranch_Page updateBranchPage = openForUpdate(branch);
        updateBranchPage.setAddress1(UPDATED_ADDRESS);
        updateBranchPage.setRemarks(UPDATE_REMARKS);
        updateBranchPage.clickSendForApproval();

        boolean confirmed = updateBranchPage.confirmationShown();
        Allure.step("Observed: success confirmation " + (confirmed ? "shown" : "not detected")
                + ". Messages: " + updateBranchPage.confirmationMessages());

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), PENDING_STATUS),
                "Expected " + branch + " to read \"" + PENDING_STATUS + "\" after the update was submitted; "
                        + "it read \"" + searchBranchPage.approvalStatusOf(branch.branchCode()) + "\".");
    }

    /**
     * TC-BR-067 -- Remarks is mandatory before any Update action.
     * Requirement: PRD_UserStories.md US 8. Tags: Negative-EmptyValues, SelfCreatedRecord.
     *
     * <p><b>The clear is the test.</b> Remarks arrives pre-filled with the record's previous remark,
     * so submitting without clearing it would send a populated field and pass without ever exercising
     * the mandatory-field rule.</p>
     */
    @Test
    @Story("Negative - empty values")
    @Description("TC-BR-067: Remarks is mandatory before any Update action")
    public void tcBr067_remarksIsMandatoryBeforeAnyUpdateAction() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        UpdateBranch_Page updateBranchPage = openForUpdate(branch);
        updateBranchPage.setAddress1(UPDATED_ADDRESS);
        updateBranchPage.clearRemarks();
        Assert.assertTrue(updateBranchPage.remarks().isEmpty(),
                "Remarks must be empty before submitting, or this case cannot test that it is mandatory.");

        updateBranchPage.clickSendForApproval();

        Assert.assertTrue(updateBranchPage.isStillOnUpdateScreen(),
                "Expected submission to be blocked while Remarks is empty, but the screen was left. "
                        + "Current URL: " + updateBranchPage.currentUrl());
        Assert.assertTrue(updateBranchPage.remarks().isEmpty(),
                "Expected Remarks to remain empty after the blocked submission; value=\""
                        + updateBranchPage.remarks() + "\"");
        Assert.assertTrue(updateBranchPage.isRemarksMarkedInvalidAndTouched(),
                "Expected Remarks to carry ng-invalid and ng-touched after the blocked submission; classes=\""
                        + updateBranchPage.remarksClassAttribute() + "\"");
        Assert.assertTrue(updateBranchPage.remarksValidationMessageVisible(),
                "Expected a visible Remarks-specific required-field validation message "
                        + "(locator live-verified 2026-08-14 against <li> inside .fg-error.has-error "
                        + ".error-list, scoped to Remarks' own ndc-fg-input ancestor). "
                        + "Current URL: " + updateBranchPage.currentUrl()
                        + ". Remarks value=\"" + updateBranchPage.remarks() + "\", classes=\""
                        + updateBranchPage.remarksClassAttribute() + "\". "
                        + "Matched message count: " + updateBranchPage.remarksValidationMessageCount()
                        + ". Rendered texts: " + updateBranchPage.remarksValidationMessageTexts()
                        + ". Remarks wrapper: " + updateBranchPage.remarksWrapperOuterHtmlSnippet());
        Assert.assertEquals(updateBranchPage.remarksValidationMessageText(), "Required",
                "Expected the Remarks validation message text to equal \"Required\"; got: \""
                        + updateBranchPage.remarksValidationMessageText() + "\"");
    }

    /**
     * TC-BR-068 -- Cancel discards unsaved changes on Update Branch.
     * Requirement: PRD_UserStories.md US 8.
     */
    @Test
    @Story("Cancel")
    @Description("TC-BR-068: Cancel discards unsaved changes on Update Branch")
    public void tcBr068_cancelDiscardsUnsavedChanges() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        UpdateBranch_Page updateBranchPage = openForUpdate(branch);
        String originalAddress = updateBranchPage.address1();

        updateBranchPage.setAddress1(UPDATED_ADDRESS);
        updateBranchPage.clickCancel();

        UpdateBranch_Page reopened = openForUpdate(branch);
        Assert.assertEquals(reopened.address1(), originalAddress,
                "Cancel did not discard the edit -- Address 1 should still read its original value.");
    }

    /**
     * TC-BR-069 -- Approve a branch update request from the Update screen.
     * Requirement: PRD_UserStories.md US 8.
     *
     * <p>The provisioned branch is already {@code Pending for approval} on creation, which is the
     * pending request this case approves. Note that a single account stands in for both Admin and
     * Super Admin this run, so this exercises the self-approval configuration deliberately.</p>
     */
    @Test
    @Story("Approve from Update screen")
    @Description("TC-BR-069: Approve a branch update request from the Update screen")
    public void tcBr069_approveBranchUpdateRequestFromUpdateScreen() {
        ProvisionedBranch branch = BranchProvisioner.createPendingBranch(driver);
        Allure.step("Acting on self-created branch " + branch);

        UpdateBranch_Page updateBranchPage = openForUpdate(branch);
        updateBranchPage.setRemarks(APPROVAL_REMARKS);
        updateBranchPage.clickApprove();

        boolean confirmed = updateBranchPage.confirmationShown();
        Allure.step("Observed: success confirmation " + (confirmed ? "shown" : "not detected")
                + ". Messages: " + updateBranchPage.confirmationMessages());

        Assert.assertTrue(searchBranchPage.waitForApprovalStatus(branch.branchCode(), APPROVED_STATUS),
                "Expected " + branch + " to read \"" + APPROVED_STATUS + "\" after approval from the "
                        + "Update screen; it read \""
                        + searchBranchPage.approvalStatusOf(branch.branchCode()) + "\".");
    }
}
