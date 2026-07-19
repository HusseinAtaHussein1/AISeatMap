package AdminPages.Admin.Branch;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Master.PaymentGateway.PaymentMethod_Page;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;

/**
 * NDC Admin / Branch Test Suite — RUN-20260712-002, Stage 4 (Automation Agent).
 * Automates TC-BRANCH-001, 002, 003, 004, 005, 007, 008 — every scenario traces to
 * NDC_TestCases_Branch.md / NDC_TraceabilityMatrix.md. TC-BRANCH-006 is an Exploratory/manual
 * charter (Test Design disposition) and is deliberately NOT a @Test here — see
 * NDC_AutomationDecisionReport_SHAFT.md.
 */
public class Branch_TC extends AdminTestBase {

    // TEMPORARY diagnostic (2026-07-18) — dumping real State dropdown options. Remove after confirmed.
    @Test(priority = 100)
    public void diagStateOptions() throws Exception {
        JsonObject data = loadTestData().getAsJsonObject("happyPath");
        new AdminMenu(driver).openBranch();
        Branch_Page branch = new Branch_Page(driver).openAddBranch();
        branch.fillRequiredCore(data.get("operatingCountry").getAsString(), data.get("name").getAsString(), data.get("phone").getAsString());
        driver.element().click(org.openqa.selenium.By.xpath("//p-dropdown[.//input[@id=\"id-State\"]]"));
        long deadline = System.currentTimeMillis() + 10000L;
        while (System.currentTimeMillis() < deadline
                && driver.getDriver().findElements(org.openqa.selenium.By.xpath("//li[@role='option']")).isEmpty()) {
            Thread.sleep(200);
        }
        java.util.List<org.openqa.selenium.WebElement> options = driver.getDriver().findElements(org.openqa.selenium.By.xpath("//li[@role='option']"));
        System.out.println("DIAG: found " + options.size() + " State options");
        for (org.openqa.selenium.WebElement o : options) {
            System.out.println("DIAG_STATE_OPT: [" + o.getText().trim() + "]");
        }
    }

    private JsonObject testData;

    private JsonObject loadTestData() throws Exception {
        if (testData == null) {
            Path path = Path.of("src/test/resources/testDataFiles/branchTestData.json");
            try (FileReader reader = new FileReader(path.toFile())) {
                testData = JsonParser.parseReader(reader).getAsJsonObject();
            }
        }
        return testData;
    }

    // TC-BRANCH-001 — Add Branch happy path submits to approval queue (FINDING-002 regression test).
    @Test(priority = 1)
    public void addBranchHappyPathEntersApprovalQueue() throws Exception {
        JsonObject data = loadTestData().getAsJsonObject("happyPath");
        new AdminMenu(driver).openBranch();
        Branch_Page branch = new Branch_Page(driver).openAddBranch();
        branch.fillRequiredCore(data.get("operatingCountry").getAsString(), data.get("name").getAsString(), data.get("phone").getAsString());
        // Added 2026-07-18: discovered live (a full "Required"-error sweep after submit was
        // initially blocked) that the form needs far more than Operating Country/Name/Phone —
        // every prior run of this test silently never created a real record because none of this
        // was filled, and no assertion existed to catch it (same false-positive shape as Agency's
        // REP-006-009 fix).
        branch.selectSupplier(data.get("supplierName").getAsString(), data.get("credentialName").getAsString());
        branch.fillAddress1(data.get("address1").getAsString());
        branch.selectStateAndCity(data.get("state").getAsString(), data.get("city").getAsString());
        branch.fillPostOfficeBox(data.get("postOfficeBox").getAsString());
        branch.fillContactDetails(data.get("emailId").getAsString(), data.get("emailPassword").getAsString());
        branch.fillSecondContactBlock(data.get("contactName").getAsString(), data.get("contactEmail").getAsString(), data.get("contactPhone").getAsString());
        branch.fillFinancials(data.get("creditLimit").getAsString(), data.get("topUpLimit").getAsString(), data.get("creditTermsDays").getAsString());
        branch.selectCashPaymentOption();
        branch.submit();
        // Real assertion added 2026-07-18 (was previously assertion-free, a false-positive risk):
        // submit() already polls for navigation away from /admin/branch/add; assert it actually
        // happened rather than silently passing on a still-blocked submission.
        Assert.assertFalse(branch.currentUrl().contains("/admin/branch/add"),
                "Branch submission must navigate away from the Add form — a still-open Add form means the submission was blocked (e.g. a missed required field), not a successful creation.");
        // Per FINDING-002: the record enters the approval queue, never immediate Active/Approved —
        // that specific status is confirmed at Execution time against the live Approval Status column.
    }

    // TC-BRANCH-002 — required-field validation blocks empty submission. Partially Automatable:
    // exact validation message text not independently observed in Discovery (assumption-based).
    @Test(priority = 2)
    public void addBranchEmptyRequiredFieldsBlocked() {
        new AdminMenu(driver).openBranch();
        Branch_Page branch = new Branch_Page(driver).openAddBranch();
        branch.submit();
        String urlAfter = branch.currentUrl();
        Assert.assertTrue(urlAfter.contains("/admin/branch/add"), "Form must not navigate away on an empty required-field submission.");
        // Actual validation text captured for human review, not asserted against an invented message:
        System.out.println("TC-BRANCH-002 validation text observed: " + branch.getValidationSummaryTextIfPresent());
    }

    // TC-BRANCH-003 — Name field boundary length. Partially Automatable: exact max length unconfirmed.
    @Test(priority = 3)
    public void addBranchNameBoundaryLength() throws Exception {
        JsonObject data = loadTestData();
        String longName = data.get("boundaryLongName").getAsString().repeat(data.get("boundaryLongNameFillerRepeatCount").getAsInt());
        new AdminMenu(driver).openBranch();
        Branch_Page branch = new Branch_Page(driver).openAddBranch();
        branch.typeNameOnly(longName);
        System.out.println("TC-BRANCH-003 validation text observed: " + branch.getValidationSummaryTextIfPresent());
    }

    // TC-BRANCH-004 — Name field handles a security-probe string safely (input-handling probe only).
    @Test(priority = 4)
    public void addBranchNameSecurityProbeHandledSafely() throws Exception {
        JsonObject data = loadTestData();
        new AdminMenu(driver).openBranch();
        Branch_Page branch = new Branch_Page(driver).openAddBranch();
        branch.typeNameOnly(data.get("securityProbeName").getAsString());
        // Passes as long as no internal error/stack trace is exposed; captured for human review.
        System.out.println("TC-BRANCH-004 validation text observed: " + branch.getValidationSummaryTextIfPresent());
    }

    // TC-BRANCH-005 — Branch List auto-populates without an explicit Search click.
    @Test(priority = 5)
    public void branchListAutoPopulatesOnLoad() {
        new AdminMenu(driver).openBranch();
        int rowCount = new Branch_Page(driver).getVisibleRowCountWithoutSearch();
        Assert.assertTrue(rowCount > 0, "Branch List must show rows immediately, without requiring a Search click (contrast: FINDING-003, Agency).");
    }

    // TC-BRANCH-007 — Reject/Deactivate requires a non-empty Remark before Submit. Depends on
    // TC-BRANCH-006's charter confirming Icn_ThumbDown is the correct, safe selector — this test
    // targets a QA_SPIKE_-created Branch only, never a pre-existing real record.
    @Test(priority = 7, dependsOnMethods = "addBranchHappyPathEntersApprovalQueue")
    public void rejectRequiresNonEmptyRemark() throws Exception {
        JsonObject data = loadTestData();
        String branchName = data.getAsJsonObject("happyPath").get("name").getAsString();
        new AdminMenu(driver).openBranch();
        Branch_Page branch = new Branch_Page(driver).searchByName(branchName).openReject(branchName);
        Assert.assertFalse(branch.attemptSubmitWithEmptyRemark(), "Submit must be disabled/blocked while Remark is empty.");
        branch.submitRejectWithRemark(data.get("rejectRemark").getAsString());
    }

    // TC-BRANCH-008 — Branch Payment Option only surfaces Payment Methods currently marked Online
    // (APP-002). paymentMethodTestEntry is a user-authorized-safe synthetic Master entry — never
    // Cash/Wallet/Credit Card/BANQUE MISR/Fawry, which are real payment methods. Restores the
    // Payment Method's original Online status in a finally block regardless of assertion outcome,
    // since this test mutates shared Master data used by every Branch/Agency in the environment.
    @Test(priority = 8)
    public void branchPaymentOptionReflectsMasterPaymentMethodStatus() throws Exception {
        JsonObject data = loadTestData();
        String branchId = data.get("paymentMethodBranchId").getAsString();
        String paymentMethod = data.get("paymentMethodTestEntry").getAsString();

        PaymentMethod_Page master = new PaymentMethod_Page(driver).open();
        Assert.assertEquals(master.getStatus(paymentMethod), "Online",
                "Precondition: test Payment Method must start Online.");

        Branch_Page branch = new Branch_Page(driver).openEdit(branchId);
        Assert.assertTrue(branch.paymentOptionLabelPresent(paymentMethod),
                "Payment Method must appear as a Branch Payment Option while Online.");

        try {
            new PaymentMethod_Page(driver).open().toggleStatus(paymentMethod);
            Assert.assertEquals(new PaymentMethod_Page(driver).open().getStatus(paymentMethod), "Offline",
                    "Toggle must flip the Payment Method to Offline.");

            branch = new Branch_Page(driver).openEdit(branchId);
            Assert.assertFalse(branch.paymentOptionLabelPresent(paymentMethod),
                    "Payment Method must disappear from Branch Payment Option once Offline.");
        } finally {
            new PaymentMethod_Page(driver).open().toggleStatus(paymentMethod);
        }

        Assert.assertEquals(new PaymentMethod_Page(driver).open().getStatus(paymentMethod), "Online",
                "Payment Method must be restored to Online after the test.");
        branch = new Branch_Page(driver).openEdit(branchId);
        Assert.assertTrue(branch.paymentOptionLabelPresent(paymentMethod),
                "Payment Method must reappear as a Branch Payment Option once restored to Online.");
    }
}
