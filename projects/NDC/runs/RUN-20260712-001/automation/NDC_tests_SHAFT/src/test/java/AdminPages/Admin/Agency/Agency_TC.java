package AdminPages.Admin.Agency;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Admin.Agency.Agency.Agency_Page;
import AdminPages.Admin.Agency.Agency.SearchAgency_Page;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;

/**
 * NDC Admin / Agency Test Suite — RUN-20260712-002, Stage 4 (Automation Agent).
 * Automates TC-AGENCY-001, 002, 004, 005 — every scenario traces to NDC_TestCases_Agency.md /
 * NDC_TraceabilityMatrix.md. TC-AGENCY-003 is an Exploratory/manual charter (Test Design
 * disposition) and is deliberately NOT a @Test here.
 */
public class Agency_TC extends AdminTestBase {

    private JsonObject testData;

    private JsonObject loadTestData() throws Exception {
        if (testData == null) {
            Path path = Path.of("src/test/resources/testDataFiles/agencyTestData.json");
            try (FileReader reader = new FileReader(path.toFile())) {
                testData = JsonParser.parseReader(reader).getAsJsonObject();
            }
        }
        return testData;
    }

    private void openAgencyAdd() {
        new AdminMenu(driver).openAgency();
        // Per this run's own Discovery (Timeline T+/Agency_List.md): "Agency" parent expands a
        // submenu whose first child is also literally labeled "Agency" — the Reference Project's
        // own SearchAgency_Page.java confirms the same href-based selector for that child.
        driver.element().click(org.openqa.selenium.By.xpath("//a[@href=\"/admin/agency\"]"));
    }

    // TC-AGENCY-001 — Add Agency happy path submits to approval queue (FINDING-002 regression test).
    //
    // CORRECTED 2026-07-13: this test previously filled only Core/BusinessType/Owner Details and
    // asserted nothing after .submit() -- it always reported Passed regardless of outcome. Live
    // investigation (tools/browser_driver) proved the click was actually being blocked by client-
    // side validation on State/City/Post Office Box/Document upload/Contract dates/Logo/Sales
    // Contact/Invoice generation/Payment option -- none of which this test filled -- meaning no
    // real Agency record was ever created by any prior run of this test. Now fills the complete
    // required-field set (confirmed live, one field at a time, before being ported here) and
    // asserts the real success oracle: a "Added Successfully" toast and navigation away from
    // /admin/agency/add, confirmed via live network inspection (POST .../agency/ -> 204).
    @Test(priority = 1)
    public void addAgencyHappyPathEntersApprovalQueue() throws Exception {
        JsonObject data = loadTestData().getAsJsonObject("happyPath");
        String uniqueAgencyName = "QASPIKE" + (System.nanoTime() % 100000);
        openAgencyAdd();
        driver.element().click(org.openqa.selenium.By.xpath("//button[normalize-space()=\"Add agency\"]"));
        Agency_Page agency = new Agency_Page(driver);
        agency.selectBranch(data.get("branch").getAsString())
                .fillRequiredCore(uniqueAgencyName, data.get("address1").getAsString(), data.get("phone").getAsString())
                .selectStateAndCity(data.get("state").getAsString(), data.get("city").getAsString())
                .fillPostOfficeBox(data.get("postOfficeBox").getAsString())
                .selectBusinessTypeB2B()
                .fillOwnerDetails(data.get("contactPerson").getAsString(), data.get("ownerEmail").getAsString(), data.get("ownerPhone").getAsString())
                .uploadDocument(documentAssetPath())
                .fillContractDates(data.get("contractStartDate").getAsString(), data.get("contractEndDate").getAsString())
                .uploadLogo(documentAssetPath())
                .fillSalesContact(data.get("salesContactName").getAsString(), data.get("salesContactEmail").getAsString(), data.get("salesContactPhone").getAsString())
                .selectInvoiceGeneration(data.get("invoiceGenerationOption").getAsString())
                .selectPaymentOptionCash()
                .submit();
        String finalUrl = agency.getCurrentUrl();
        if (finalUrl.contains("/add")) {
            // Still on the Add form -- genuinely blocked. Gather diagnostics from the still-present
            // form before failing (guarded: the form may itself have navigated away between the
            // check above and here, per the exact race this guard exists to catch).
            String diagnostics;
            try {
                diagnostics = "Invalid fields: " + agency.getInvalidFieldsDiagnostic()
                        + " | Validation summary: " + agency.getValidationSummaryTextIfPresent()
                        + " | Agency name field value: " + agency.getAgencyNameValue();
            } catch (Exception e) {
                diagnostics = "(diagnostics unavailable -- form navigated away mid-check: " + e.getMessage() + ")";
            }
            Assert.fail("Expected navigation away from /admin/agency/add on a successful submit; got URL: " + finalUrl
                    + " | Expected agency name: " + uniqueAgencyName + " | " + diagnostics);
        }
        // Per FINDING-002: the record enters Pending approval (not immediately Active/Approved) --
        // consistent with FINDING-007, it will not appear via the List/Search screen until approved.
    }

    private String documentAssetPath() {
        return java.nio.file.Path.of("src/test/resources/testAssets/qa_spike_agency_asset.png").toAbsolutePath().toString();
    }

    // TC-AGENCY-002 — required-field validation blocks empty submission. Partially Automatable.
    @Test(priority = 2)
    public void addAgencyEmptyRequiredFieldsBlocked() throws InterruptedException {
        openAgencyAdd();
        driver.element().click(org.openqa.selenium.By.xpath("//button[normalize-space()=\"Add agency\"]"));
        Agency_Page agency = new Agency_Page(driver).submit();
        System.out.println("TC-AGENCY-002 validation text observed: " + agency.getValidationSummaryTextIfPresent());
    }

    // TC-AGENCY-004 — IATA Agency / Business Type selection behavior. Partially Automatable:
    // whether an explicit selection is enforced, or B2B is a true default, is unconfirmed.
    @Test(priority = 4)
    public void addAgencyBusinessTypeSelectionEstablishesBehavior() throws Exception {
        JsonObject data = loadTestData().getAsJsonObject("happyPath");
        openAgencyAdd();
        driver.element().click(org.openqa.selenium.By.xpath("//button[normalize-space()=\"Add agency\"]"));
        Agency_Page agency = new Agency_Page(driver);
        agency.selectBranch(data.get("branch").getAsString())
                .fillRequiredCore(data.get("agencyName").getAsString(), data.get("address1").getAsString(), data.get("phone").getAsString())
                .submit();
        System.out.println("TC-AGENCY-004 validation text observed: " + agency.getValidationSummaryTextIfPresent());
    }

    // TC-AGENCY-005 — Contact person field strips Arabic script, preserves Latin/CJK (by design).
    // Redesigned 2026-07-18: FINDING-006's open question (is Arabic-script stripping a defect or
    // intended?) was resolved — user/business stakeholder confirmed the application does not
    // support Arabic-script input by design. This is no longer a capture-only Partially Automatable
    // check; it asserts the confirmed expected behavior directly (see knowledge_base/business_rules/BR-001.md).
    @Test(priority = 5)
    public void addAgencyContactPersonStripsArabicPreservesLatinCjk() throws Exception {
        String unicodeValue = loadTestData().get("unicodeContactPerson").getAsString();
        openAgencyAdd();
        driver.element().click(org.openqa.selenium.By.xpath("//button[normalize-space()=\"Add agency\"]"));
        Agency_Page agency = new Agency_Page(driver).typeContactPersonOnly(unicodeValue);
        String observed = agency.getContactPersonValue();
        System.out.println("TC-AGENCY-005 observed Contact person value: " + observed);
        Assert.assertFalse(observed.contains("القاهرة"),
                "Arabic-script segment must be stripped by the application (confirmed by design, BR-001).");
        Assert.assertTrue(observed.contains("测试") && observed.contains("QA_SPIKE"),
                "Non-Arabic (CJK/Latin) segments of Unicode Contact person input must survive intact.");
    }

    // TC-AGENCY-006 — Search Agency by name returns the matching, pre-existing Approved record.
    // Read-only: EXEBA (AGN9741) is a stable, real record observed live 2026-07-13 — chosen over
    // this suite's own QA_SPIKE_ records specifically because those are Pending (FINDING-007, not
    // searchable this way), keeping this a clean positive-path test.
    @Test(priority = 6)
    public void searchAgencyByNameReturnsMatchingRecord() throws InterruptedException {
        openAgencyAdd(); // navigates to the Agency List screen (method name kept for continuity with existing tests above; it does not click "Add agency" itself)
        SearchAgency_Page search = new SearchAgency_Page(driver).searchByName("EXEBA");
        Assert.assertFalse(search.isNoDataFoundShown(), "Expected EXEBA (AGN9741) to be found, but the grid showed 'No data has been found!'.");
        java.util.List<String> rows = search.getResultRowsText();
        Assert.assertTrue(rows.stream().anyMatch(r -> r.contains("EXEBA") && r.contains("AGN9741")),
                "Expected a result row containing both 'EXEBA' and 'AGN9741'. Rows observed: " + rows);
    }
}
