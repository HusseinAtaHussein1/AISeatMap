package AdminPages.Admin.Agency;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Admin.Agency.Agency.Agency_Page;
import AdminPages.Admin.Agency.Agency.AgencyActions_Page;
import AdminPages.Admin.Agency.Agency.SearchAgency_Page;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.nio.file.Path;
import java.util.List;

/**
 * NDC Admin / Agency — Actions suite. RUN-20260718-001, Stage 4 (new tests_SHAFT_Agency
 * package). Traces to TC-AGENCY-ACTIONS-001 through -009 (ACTIONS-010 is Manual Only, a
 * role/business clarification, not coded here — see AutomationPlan_SHAFT_Agency.md).
 *
 * Fully backed by runs/RUN-20260718-001/discovery/Agency_Actions.md — a live browser session
 * against http://192.168.1.70 that created disposable QASPIKE_ACT* fixtures and drove each of
 * Approve/Reject/empty-remark/pencil-navigation for real before any locator here was written.
 *
 * Each test creates its own fresh Pending fixture (openAgencyAdd + a minimal valid submission) so
 * tests don't depend on shared, mutable STG state / each other's execution order.
 */
public class Agency_Actions_TC extends AdminTestBase {

    private SearchAgency_Page openAgencyList() throws InterruptedException {
        new AdminMenu(driver).openAgency().openAgencyList();
        return new SearchAgency_Page(driver).showAll();
    }

    private Agency_Page openAgencyAdd() {
        new AdminMenu(driver).openAgency().openAgencyList();
        return new SearchAgency_Page(driver).clickAddAgency();
    }

    /** Creates one fresh, disposable Pending Agency and returns its unique name (== its Agency
     *  Code column's Agency Name cell, which every test below searches the grid for). */
    private String createFreshPendingFixture(String prefix) throws Exception {
        String uniqueName = prefix + (System.nanoTime() % 100000);
        Agency_Page agency = openAgencyAdd();
        agency.selectBranch("Test")
                .fillRequiredCore(uniqueName, "QA Spike Actions test address", "1009876543")
                .selectStateAndCity("Asyut", "Asyut")
                .fillPostOfficeBox("QASPIKEB")
                .selectBusinessTypeB2B()
                .fillOwnerDetails("QA Spike Actions Contact", "qa.spike.actions@example.com", "1009876544")
                .uploadDocument(Path.of("src/test/resources/testAssets/qa_spike_agency_asset.png").toAbsolutePath().toString())
                .fillContractDates("01/01/2026", "31/12/2027")
                .uploadLogo(Path.of("src/test/resources/testAssets/qa_spike_agency_asset.png").toAbsolutePath().toString())
                .fillSalesContact("QA Spike Actions Sales", "qa.spike.actions.sales@example.com", "1009876545")
                .selectFirstInvoiceGenerationOption()
                .selectPaymentOptionCash()
                .submit();
        return uniqueName;
    }

    /** Resolves the Agency Code (e.g. "AGN10200") for a given Agency Name by reading row 0 of a
     *  blank/Both search — confirmed live that a freshly-created record sorts to the top. */
    private String resolveCodeForName(String agencyName) throws InterruptedException {
        return openAgencyList().resolveCodeForName(agencyName);
    }

    // ---- TC-AGENCY-ACTIONS-001 ----
    @Test(priority = 1)
    public void actions001_PencilNavigatesToUpdateForCorrectRow() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA001_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        actions.clickPencilForCode(code);
        waitBriefly();
        Assert.assertTrue(actions.getCurrentUrl().contains("/admin/agency/edit/"),
                "Pencil should navigate to the Update Agency screen (/admin/agency/edit/{id}).");
        String storedName = new Agency_Page(driver).getAgencyNameValue();
        Assert.assertEquals(storedName, name, "The Update screen must be for the exact row clicked.");
    }

    // ---- TC-AGENCY-ACTIONS-002 (asserts the REAL observed behavior — see FINDING-008 point 6) ----
    @Test(priority = 2)
    public void actions002_ApproveRejectIconsVaryByApprovalStatus() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA002_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        List<String> pendingIcons = actions.getActionIconsForCode(code);
        Assert.assertTrue(pendingIcons.contains("pencil") && pendingIcons.contains("thumbs-up") && pendingIcons.contains("thumbs-down"),
                "A Pending row must show pencil + thumbs-up + thumbs-down. Observed: " + pendingIcons);

        actions.clickApproveForCode(code).fillRemarkAndSubmit("QA Spike automation - Actions suite approve.");
        waitBriefly();
        openAgencyList();
        List<String> approvedIcons = new AgencyActions_Page(driver).getActionIconsForCode(code);
        // Confirmed live (Agency_Actions.md): Approved rows show pencil + thumbs-down ONLY (no
        // thumbs-up) — this differs from the Test Design's literal "shown only for Pending"
        // wording, which is why this assertion checks the real behavior, not that wording.
        Assert.assertTrue(approvedIcons.contains("pencil") && approvedIcons.contains("thumbs-down") && !approvedIcons.contains("thumbs-up"),
                "An Approved row is expected to show pencil + thumbs-down only. Observed: " + approvedIcons);
    }

    // ---- TC-AGENCY-ACTIONS-003 ----
    @Test(priority = 3)
    public void actions003_ApproveRemarkPopupShownAndMandatory() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA003_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        actions.clickApproveForCode(code);
        Assert.assertTrue(actions.isRemarkFieldPresent(), "Expected the Remarks popup to appear on Approve click.");
        Assert.assertEquals(actions.getDialogTitle(), name, "The popup's title should be the Agency's own name.");

        actions.attemptSubmitWithEmptyRemark();
        waitBriefly();
        openAgencyList();
        String statusAfterEmptyAttempt = new AgencyActions_Page(driver).getApprovalStatusForCode(code);
        Assert.assertEquals(statusAfterEmptyAttempt, "Pending for approval",
                "Submitting Approve with an empty Remarks value must not change the Approval Status (confirmed blocked, live).");

        new AgencyActions_Page(driver).clickApproveForCode(code).fillRemarkAndSubmit("QA Spike automation - valid remark.");
        waitBriefly();
        openAgencyList();
        String statusAfterRealRemark = new AgencyActions_Page(driver).getApprovalStatusForCode(code);
        Assert.assertEquals(statusAfterRealRemark, "Approved", "A real remark should allow the Approve action to complete.");
    }

    // ---- TC-AGENCY-ACTIONS-004 ----
    @Test(priority = 4)
    public void actions004_ApproveCompletesAndStatusReflectionUpdates() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA004_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        actions.clickApproveForCode(code).fillRemarkAndSubmit("QA Spike automation - Actions suite approve #2.");
        waitBriefly();
        String toast = actions.getToastOrMessageTextIfPresent();
        Assert.assertNotNull(toast, "Expected a toast confirming the Approve action.");
        Assert.assertTrue(toast.contains("Approved"), "Toast should confirm the Agency is Approved. Got: " + toast);
        openAgencyList();
        AgencyActions_Page reload = new AgencyActions_Page(driver);
        Assert.assertEquals(reload.getStatusForCode(code), "Active");
        Assert.assertEquals(reload.getApprovalStatusForCode(code), "Approved");
    }

    // ---- TC-AGENCY-ACTIONS-005 ----
    @Test(priority = 5)
    public void actions005_RejectRemarkPopupShownAndMandatory() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA005_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        actions.clickRejectForCode(code);
        Assert.assertTrue(actions.isRemarkFieldPresent(), "Expected the Remarks popup to appear on Reject click.");

        actions.attemptSubmitWithEmptyRemark();
        waitBriefly();
        openAgencyList();
        String statusAfterEmptyAttempt = new AgencyActions_Page(driver).getApprovalStatusForCode(code);
        Assert.assertEquals(statusAfterEmptyAttempt, "Pending for approval",
                "Submitting Reject with an empty Remarks value must not change the Approval Status.");
    }

    // ---- TC-AGENCY-ACTIONS-006 ----
    @Test(priority = 6)
    public void actions006_RejectCompletesAndStatusReflectionUpdates() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA006_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        actions.clickRejectForCode(code).fillRemarkAndSubmit("QA Spike automation - Actions suite reject.");
        waitBriefly();
        String toast = actions.getToastOrMessageTextIfPresent();
        Assert.assertNotNull(toast, "Expected a toast confirming the Reject action.");
        Assert.assertTrue(toast.contains("Rejected"), "Toast should confirm the Agency is Rejected. Got: " + toast);
        openAgencyList();
        AgencyActions_Page reload = new AgencyActions_Page(driver);
        Assert.assertEquals(reload.getStatusForCode(code), "Inactive");
        Assert.assertEquals(reload.getApprovalStatusForCode(code), "Rejected");
    }

    // ---- TC-AGENCY-ACTIONS-007 ----
    @Test(priority = 7)
    public void actions007_NewlySubmittedAgencyReflectsInactivePending() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA007_");
        String code = resolveCodeForName(name);
        AgencyActions_Page actions = new AgencyActions_Page(driver);
        Assert.assertEquals(actions.getStatusForCode(code), "Inactive");
        Assert.assertEquals(actions.getApprovalStatusForCode(code), "Pending for approval");
    }

    // ---- TC-AGENCY-ACTIONS-008 ----
    @Test(priority = 8)
    public void actions008_PencilAndApproveRejectIconsAreDistinctNotConfusable() throws Exception {
        String name = createFreshPendingFixture("QASPIKE_ACTA008_");
        String code = resolveCodeForName(name);
        List<String> icons = new AgencyActions_Page(driver).getActionIconsForCode(code);
        Assert.assertEquals(icons.stream().filter(i -> i.equals("pencil")).count(), 1,
                "Expected exactly one pencil icon.");
        Assert.assertEquals(icons.stream().filter(i -> i.equals("thumbs-up")).count(), 1,
                "Expected exactly one thumbs-up icon on a Pending row.");
        Assert.assertEquals(icons.stream().filter(i -> i.equals("thumbs-down")).count(), 1,
                "Expected exactly one thumbs-down icon on a Pending row.");
        // Each is a structurally distinct <i class="pi pi-{name}"> element (confirmed live via
        // Agency_Actions.md's DOM dump) — no shared/ambiguous locator between them.
    }

    // ---- TC-AGENCY-ACTIONS-009 (consolidated Status Reflection matrix, all three states) ----
    @Test(priority = 9)
    public void actions009_StatusReflectionMatrixAllThreeStates() throws Exception {
        String pendingName = createFreshPendingFixture("QASPIKE_ACTA009P_");
        String pendingCode = resolveCodeForName(pendingName);
        Assert.assertEquals(new AgencyActions_Page(driver).getApprovalStatusForCode(pendingCode), "Pending for approval");

        String approvedName = createFreshPendingFixture("QASPIKE_ACTA009A_");
        String approvedCode = resolveCodeForName(approvedName);
        new AgencyActions_Page(driver).clickApproveForCode(approvedCode).fillRemarkAndSubmit("QA Spike automation - matrix approve.");
        waitBriefly();
        openAgencyList();
        Assert.assertEquals(new AgencyActions_Page(driver).getApprovalStatusForCode(approvedCode), "Approved");

        String rejectedName = createFreshPendingFixture("QASPIKE_ACTA009R_");
        String rejectedCode = resolveCodeForName(rejectedName);
        new AgencyActions_Page(driver).clickRejectForCode(rejectedCode).fillRemarkAndSubmit("QA Spike automation - matrix reject.");
        waitBriefly();
        openAgencyList();
        Assert.assertEquals(new AgencyActions_Page(driver).getApprovalStatusForCode(rejectedCode), "Rejected");
    }
}
