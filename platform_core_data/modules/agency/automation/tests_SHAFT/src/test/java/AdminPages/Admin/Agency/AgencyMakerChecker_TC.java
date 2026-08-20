package AdminPages.Admin.Agency;

import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.Test;
import utilities.AgencyDataFactory;

/**
 * Agency Maker&ndash;Checker. Covers TC-AGENCY-047, 049, 048 and 050, <b>in that order</b>.
 *
 * <h2>Why the order is reject-before-approve, and why it is not arbitrary</h2>
 *
 * <p>Automation Plan §5.1 gives the whole suite <b>one</b> Agency. {@code Send For Approval},
 * {@code Approve} and {@code Reject} are state <em>transitions</em> on that single record, not repeatable
 * actions, so these cases must chain:
 *
 * <pre>
 *   Draft --Send For Approval--&gt; Pending --Reject--&gt; ? --Send For Approval--&gt; Pending --Approve--&gt; Approved
 * </pre>
 *
 * <p><b>The {@code ?} is an unverified assumption</b> -- whether a rejected Agency returns to a
 * resubmittable state. It could not be verified during selector verification, because confirming it would
 * have required rejecting a record this run did not create, which the Execution Safety policy makes
 * {@code Forbidden (absolute)}. Reject therefore runs <em>first</em>, and if the record turns out to be
 * terminal afterwards, TC-AGENCY-048 <b>skips with a blocked precondition naming this assumption</b>. It
 * does not pass falsely, and it does not provision a second Agency to work around the operator's
 * instruction -- unblocking it is a decision for a human, taken on this evidence.
 *
 * <p>The Stage 3 suite notes TC-AGENCY-048 and 049 must run on <b>separate submissions</b>, because
 * approving and rejecting the same pending record is impossible. Each case below makes its own submission
 * rather than inheriting one.
 *
 * <p><b>Every action here is on a record this run created.</b> That is not incidental: approving or
 * rejecting a record the run does not own is {@code Forbidden (absolute)}, and {@link AgencyProvisioner}
 * proved this Agency's identity per row before any test in this class ran.
 */
public class AgencyMakerChecker_TC extends AgencyTestBase {

    private static final String PENDING = "Pending";
    private static final String APPROVED = "Approved";
    private static final String REJECTED = "Rejected";

    /**
     * TC-AGENCY-047 &mdash; Cancel discards unsaved changes.
     *
     * <p>Runs first and saves nothing, so it cannot disturb the chain below. run-004 verified this
     * behaviour directly on the live form: a field was changed, {@code Cancel} was clicked, the browser
     * returned to {@code /admin/agency}, and reopening showed the original value.
     */
    @Test(priority = 200, description = "TC-AGENCY-047 Cancel discards unsaved changes")
    public void tc047_cancelDiscardsUnsavedChanges() {
        UpdateAgency_Page form = openUpdateForm();

        String originalName = form.agencyName();
        System.out.println("[TC-047] original agency name = \"" + originalName + "\"");

        form.setAgencyName("QA_CANCEL_TEST");
        form.clickCancel();

        UpdateAgency_Page reopened = openUpdateForm();
        Assert.assertEquals(reopened.agencyName(), originalName,
                "Cancelling must discard the unsaved change: the agency name should still be \"" + originalName
                        + "\". Cancel-must-not-persist is an established platform pattern (PRD GEO-09, "
                        + "SUP-10), and run-004 verified it directly on this form.");
    }

    /**
     * TC-AGENCY-049 &mdash; Reject a pending agency update with a reason.
     *
     * <p><b>Disabled 2026-08-20 by explicit operator direction: this is confirmed system behaviour, not
     * a defect.</b> The operator reviewed this finding (a rejection correctly transitions Approval Status
     * to Rejected but leaves the submitted value in place rather than reverting it) and determined it is
     * intended, not a bug -- so the assertion that the value reverts is wrong for this application and is
     * not weakened, it is retired.
     *
     * <p><b>Stage 3 follow-up, not yet done:</b> {@code TestCases_Agency.md}'s TC-AGENCY-049 still
     * documents value-reversion as the expected result. This automation change corrects the automation
     * only -- the Manual Test Suite is a Stage 3 artifact this stage has no write access to
     * (self-healing-skill §17) and should be updated separately to match the operator's confirmation, so
     * the two do not drift apart silently.
     */
    @Test(priority = 210, description = "TC-AGENCY-049 Reject a pending agency update with a reason",
            enabled = false)
    public void tc049_rejectPendingUpdateWithReason() {
        UpdateAgency_Page form = openUpdateForm();

        String storedCompanyUrl = form.companyUrl();
        String submittedCompanyUrl = "https://qa-rejected-" + System.nanoTime() + ".example.com";
        System.out.println("[TC-049] stored URL = \"" + storedCompanyUrl + "\", submitting \""
                + submittedCompanyUrl + "\" then rejecting");

        form.setCompanyUrl(submittedCompanyUrl)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-049 change submitted for rejection"))
                .clickSendForApproval();

        SearchAgency_Page list = agencyList();
        Assert.assertTrue(list.isRowPresent(agencyCode),
                "Agency " + agencyCode + " should be listed after submission.");
        System.out.println("[TC-049] approval status after submission = \"" + list.approvalStatusOf(agencyCode)
                + "\"");

        UpdateAgency_Page pending = openUpdateForm();
        Assert.assertTrue(pending.isRejectPresent(),
                "The Reject action should be available on a pending agency update. It is absent, so the "
                        + "rejection path cannot be exercised on this record.");

        String rejectionReason = AgencyDataFactory.uniqueRemarks("TC-AGENCY-049 rejection reason");
        pending.setRemarks(rejectionReason).clickReject();

        // Bounded wait, not an immediate read (REPAIR-001): the transition is applied asynchronously, so
        // reading the Approval Status the instant clickReject() returns observes the pre-transition value.
        SearchAgency_Page afterReject = new SearchAgency_Page(driver);
        boolean becameRejected = afterReject.waitForApprovalStatusContaining(agencyCode, REJECTED);
        String statusAfterReject = afterReject.approvalStatusOf(agencyCode);
        System.out.println("[TC-049] approval status after rejection = \"" + statusAfterReject + "\"");

        UpdateAgency_Page reopened = openUpdateForm();
        String urlAfterReject = reopened.companyUrl();

        Assert.assertTrue(becameRejected,
                "The agency's Approval Status should read as rejected after the rejection; after a bounded "
                        + "wait it reads \"" + statusAfterReject + "\".");
        Assert.assertEquals(urlAfterReject, storedCompanyUrl,
                "A rejected update must leave the previously stored value in place. Company URL was \""
                        + storedCompanyUrl + "\" before submission and reads \"" + urlAfterReject
                        + "\" after rejection. If it holds the submitted value \"" + submittedCompanyUrl
                        + "\", the rejection applied the change anyway -- a serious maker-checker defect.");
    }

    /**
     * TC-AGENCY-048 &mdash; Approve a pending agency update.
     *
     * <p><b>This is where the §5.1 assumption is tested in practice.</b> It needs its own pending
     * submission, which means resubmitting the Agency that TC-AGENCY-049 just rejected. If a rejected
     * Agency cannot be resubmitted, this case <b>skips with the assumption named</b> rather than failing:
     * a fixture that cannot reach the required state is a blocked precondition, not a defect in Approve.
     */
    @Test(priority = 220, description = "TC-AGENCY-048 Approve a pending agency update")
    public void tc048_approvePendingUpdate() {
        UpdateAgency_Page form = openUpdateForm();

        if (!form.isSendForApprovalPresent()) {
            throw new SkipException(
                    "BLOCKED PRECONDITION, not a failure: agency " + agencyCode + " offers no Send For "
                            + "Approval action after being rejected by TC-AGENCY-049, so no pending submission "
                            + "can be created for Approve to act on. This is the unverified assumption recorded "
                            + "in Automation Plan §5.1 -- that a rejected Agency returns to a resubmittable "
                            + "state -- now shown to be FALSE on this build. It could not be checked "
                            + "beforehand: doing so would have required rejecting a record this run did not "
                            + "create, which the Execution Safety policy makes Forbidden (absolute). Unblocking "
                            + "this case is an operator decision: allow one additional Agency for the approve "
                            + "path. A second Agency was deliberately NOT provisioned here, because the "
                            + "operator's instruction is one Agency for all cases.");
        }

        String submittedPostOfficeBox = "54321";
        System.out.println("[TC-048] submitting Post office box = \"" + submittedPostOfficeBox
                + "\" then approving");

        form.setPostOfficeBox(submittedPostOfficeBox)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-048 change submitted for approval"))
                .clickSendForApproval();

        SearchAgency_Page list = new SearchAgency_Page(driver);
        boolean becamePending = list.waitForApprovalStatusContaining(agencyCode, PENDING);
        String statusAfterSubmission = list.approvalStatusOf(agencyCode);
        System.out.println("[TC-048] approval status after submission = \"" + statusAfterSubmission + "\"");
        Assert.assertTrue(becamePending,
                "The agency should be in a pending-approval state after submission, but its Approval Status "
                        + "reads \"" + statusAfterSubmission + "\". Approve cannot be exercised meaningfully "
                        + "against a record that is not pending.");

        UpdateAgency_Page pending = openUpdateForm();
        Assert.assertTrue(pending.isApprovePresent(),
                "The Approve action should be available on a pending agency update; it is absent.");

        pending.setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-048 approval remarks"))
                .clickApprove();

        SearchAgency_Page afterApproval = new SearchAgency_Page(driver);
        boolean becameApproved = afterApproval.waitForApprovalStatusContaining(agencyCode, APPROVED);
        String statusAfterApproval = afterApproval.approvalStatusOf(agencyCode);
        System.out.println("[TC-048] approval status after approval = \"" + statusAfterApproval + "\"");

        UpdateAgency_Page reopened = openUpdateForm();

        Assert.assertEquals(reopened.postOfficeBox(), submittedPostOfficeBox,
                "Approving a pending update must apply the submitted change: Post office box should read \""
                        + submittedPostOfficeBox + "\" after approval.");
        Assert.assertTrue(becameApproved,
                "The agency should move out of the pending state once approved; after a bounded wait its "
                        + "Approval Status reads \"" + statusAfterApproval + "\".");
    }

    /**
     * TC-AGENCY-050 &mdash; Agency update end to end: edit, submit, approve.
     *
     * <p>Runs last, as the suite directs: it leaves the fixture in an approved state with test values
     * applied. It is <b>additive</b> to the atomic cases, not a replacement -- what it establishes, and
     * none of them does, is that a multi-section edit <em>composes</em> across the full maker-checker
     * round trip.
     *
     * <p>Depends on TC-AGENCY-048 having reached an approved state: if the record could not be
     * resubmitted, this case is blocked for the same named reason.
     */
    @Test(priority = 230, description = "TC-AGENCY-050 Agency update end to end: edit, submit, approve")
    public void tc050_endToEndEditSubmitApprove() {
        UpdateAgency_Page form = openUpdateForm();

        if (!form.isSendForApprovalPresent()) {
            throw new SkipException(
                    "BLOCKED PRECONDITION, not a failure: agency " + agencyCode + " offers no Send For "
                            + "Approval action, so the end-to-end journey cannot be started. Same cause as "
                            + "TC-AGENCY-048 -- see Automation Plan §5.1's recorded assumption about whether a "
                            + "rejected Agency is resubmittable.");
        }

        // One field in each of three sections: Agency Master, Agency Owner Details, Payment Settings.
        String newFaxNo = "0100" + String.valueOf(System.nanoTime()).substring(10);
        String newOwnerEmail = AgencyDataFactory.uniqueEmail("e2e.owner");
        String newTopUpLimit = "11000";
        System.out.println("[TC-050] submitting fax=\"" + newFaxNo + "\" ownerEmail=\"" + newOwnerEmail
                + "\" topUpLimit=\"" + newTopUpLimit + "\"");

        form.setFaxNo(newFaxNo)
                .setOwnerEmailId(newOwnerEmail)
                .setTopUpLimit(newTopUpLimit)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-050 end-to-end multi-section edit"))
                .clickSendForApproval();

        SearchAgency_Page list = new SearchAgency_Page(driver);
        boolean becamePending = list.waitForApprovalStatusContaining(agencyCode, PENDING);
        String pendingStatus = list.approvalStatusOf(agencyCode);
        System.out.println("[TC-050] approval status after submission = \"" + pendingStatus + "\"");
        Assert.assertTrue(becamePending,
                "The Agency list should show the agency in a pending-approval state after submission, but its "
                        + "Approval Status reads \"" + pendingStatus + "\".");

        UpdateAgency_Page pending = openUpdateForm();
        pending.setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-050 approval remarks"))
                .clickApprove();

        SearchAgency_Page afterApproval = new SearchAgency_Page(driver);
        boolean becameApproved = afterApproval.waitForApprovalStatusContaining(agencyCode, APPROVED);
        String approvedStatus = afterApproval.approvalStatusOf(agencyCode);
        System.out.println("[TC-050] approval status after approval = \"" + approvedStatus + "\"");

        UpdateAgency_Page reopened = openUpdateForm();

        Assert.assertEquals(reopened.faxNo(), newFaxNo,
                "TC-AGENCY-050: the Agency Master change (Fax No) should survive the full maker-checker round "
                        + "trip.");
        Assert.assertEquals(reopened.ownerEmailId(), newOwnerEmail,
                "TC-AGENCY-050: the Agency Owner Details change (Email ID) should survive the full "
                        + "maker-checker round trip.");
        Assert.assertEquals(reopened.topUpLimit(), newTopUpLimit,
                "TC-AGENCY-050: the Payment Settings change (Top up limit) should survive the full "
                        + "maker-checker round trip.");
        Assert.assertTrue(becameApproved,
                "The agency's Approval Status should read as approved at the end of the journey; after a "
                        + "bounded wait it reads \"" + approvedStatus + "\".");
    }
}
