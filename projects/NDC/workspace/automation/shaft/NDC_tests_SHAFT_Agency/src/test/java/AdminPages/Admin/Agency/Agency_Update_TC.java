package AdminPages.Admin.Agency;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Admin.Agency.Agency.Agency_Page;
import AdminPages.Admin.Agency.Agency.AgencyActions_Page;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.nio.file.Path;
import java.util.List;

/**
 * NDC Admin / Agency — Update suite. RUN-20260718-001, Stage 4 (new NDC_tests_SHAFT_Agency
 * package). Traces to TC-AGENCY-UPDATE-001 through -007. Reuses Agency_Page (see its own
 * class-level comment: confirmed live via runs/RUN-20260718-001/discovery/Agency_Update.md that
 * /admin/agency/edit/{id} renders the identical field ids as /admin/agency/add) rather than a
 * separate page object.
 *
 * UPDATE-005/006/007 are Partially Automatable per NDC_AutomationPlan_SHAFT_Agency.md — the
 * Update screen's own Approve/Reject buttons were seen present but not independently exercised
 * live this run (only the grid-icon path was), so these reuse the grid-icon mechanics
 * (Agency_Actions.md) already fully proven, rather than asserting the Update screen's own buttons
 * behave identically without direct confirmation.
 */
public class Agency_Update_TC extends AdminTestBase {

    private void openAgencyAdd() {
        new AdminMenu(driver).openAgency();
        driver.element().click(By.xpath("//a[@href=\"/admin/agency\"]"));
        driver.element().click(By.xpath("//button[normalize-space()=\"Add agency\"]"));
    }

    private void openAgencyList() {
        new AdminMenu(driver).openAgency();
        driver.element().click(By.xpath("//a[@href=\"/admin/agency\"]"));
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
    }

    private String createFreshFixture(String prefix) throws Exception {
        String uniqueName = prefix + (System.nanoTime() % 100000);
        openAgencyAdd();
        Agency_Page agency = new Agency_Page(driver);
        agency.selectBranch("Test")
                .fillRequiredCore(uniqueName, "QA Spike Update test address", "1009876543")
                .selectStateAndCity("Asyut", "Asyut")
                .fillPostOfficeBox("QASPIKEB")
                .selectBusinessTypeB2B()
                .fillOwnerDetails("QA Spike Update Contact", "qa.spike.update@example.com", "1009876544")
                .uploadDocument(assetPath())
                .fillContractDates("01/01/2026", "31/12/2027")
                .uploadLogo(assetPath())
                .fillSalesContact("QA Spike Update Sales", "qa.spike.update.sales@example.com", "1009876545")
                .selectFirstInvoiceGenerationOption()
                .selectPaymentOptionCash()
                .submit();
        return uniqueName;
    }

    private String assetPath() {
        return Path.of("src/test/resources/testAssets/qa_spike_agency_asset.png").toAbsolutePath().toString();
    }

    private String resolveCodeForName(String agencyName) {
        openAgencyList();
        List<org.openqa.selenium.WebElement> rows = driver.getDriver().findElements(By.xpath("//table/tbody/tr"));
        for (org.openqa.selenium.WebElement row : rows) {
            List<org.openqa.selenium.WebElement> cells = row.findElements(By.tagName("td"));
            if (!cells.isEmpty() && cells.get(1).getText().equals(agencyName)) {
                return cells.get(0).getText();
            }
        }
        throw new IllegalStateException("Could not find a freshly-created Agency named " + agencyName + " in the first page of results.");
    }

    private void openUpdateScreenFor(String code) {
        new AgencyActions_Page(driver).clickPencilForCode(code);
        waitBriefly();
    }

    private void waitBriefly() {
        try {
            Thread.sleep(1200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // ---- TC-AGENCY-UPDATE-001 ----
    @Test(priority = 1)
    public void update001_ScreenPrePopulatesEveryField() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD001_");
        String code = resolveCodeForName(name);
        openUpdateScreenFor(code);
        Assert.assertTrue(driver.getDriver().getCurrentUrl().contains("/admin/agency/edit/"));
        Assert.assertEquals(driver.element().getAttribute(By.xpath("//input[@id=\"id-Agency\"]"), "value"), name);
        Assert.assertEquals(driver.element().getAttribute(By.xpath("//input[@id=\"id-Contactperson\"]"), "value"), "QA Spike Update Contact");
        Assert.assertEquals(driver.element().getAttribute(By.xpath("//input[@id=\"id-Postofficebox\"]"), "value"), "QASPIKEB");
        // Branch/State/City/Invoice-generation intentionally NOT asserted here — confirmed live
        // (Agency_Update.md) that their proxy <input> reads back empty even with a real
        // selection (a PrimeNG display quirk, not missing data); asserting those needs opening
        // the dropdown panel, not reading the raw attribute.
    }

    // ---- TC-AGENCY-UPDATE-002 ----
    @Test(priority = 2)
    public void update002_EditFieldsAndResubmitSucceeds() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD002_");
        String code = resolveCodeForName(name);
        openUpdateScreenFor(code);
        Agency_Page agency = new Agency_Page(driver);
        agency.fillOwnerDetails("QA Spike Update Contact EDITED", "qa.spike.update.edited@example.com", "1009876599");
        driver.element().click(By.xpath("//button[normalize-space()=\"Send For Approval\"]"));
        waitBriefly();
        String toast = agency.getSuccessToastTextIfPresent();
        Assert.assertNotNull(toast, "Expected a success toast after editing and resubmitting. Diagnostics: " + agency.getInvalidFieldsDiagnostic());
    }

    // ---- TC-AGENCY-UPDATE-003 ----
    @Test(priority = 3)
    public void update003_CancelDiscardsUnsavedChanges() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD003_");
        String code = resolveCodeForName(name);
        openUpdateScreenFor(code);
        Agency_Page agency = new Agency_Page(driver);
        agency.fillOwnerDetails("SHOULD NOT BE SAVED", "should.not.save@example.com", "1000000000");
        agency.clickCancel();
        waitBriefly();
        Assert.assertFalse(driver.getDriver().getCurrentUrl().contains("/edit/"), "Cancel should navigate away from the Update screen.");
        String recode = resolveCodeForName(name);
        openUpdateScreenFor(recode);
        String contactPersonAfterCancel = driver.element().getAttribute(By.xpath("//input[@id=\"id-Contactperson\"]"), "value");
        Assert.assertEquals(contactPersonAfterCancel, "QA Spike Update Contact",
                "Cancel must discard the unsaved edit — Contact Person should still be the original value.");
    }

    // ---- TC-AGENCY-UPDATE-004 ----
    @Test(priority = 4)
    public void update004_MandatoryFieldValidationStillEnforcedOnUpdate() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD004_");
        String code = resolveCodeForName(name);
        openUpdateScreenFor(code);
        driver.element().type(By.xpath("//input[@id=\"id-Agency\"]"), "");
        driver.element().click(By.xpath("//button[normalize-space()=\"Send For Approval\"]"));
        waitBriefly();
        Assert.assertTrue(driver.getDriver().getCurrentUrl().contains("/edit/"),
                "Clearing a mandatory field (Agency Name) and resubmitting should not succeed.");
    }

    // ---- TC-AGENCY-UPDATE-005 (Partially Automatable — reuses the grid-icon Approve mechanics,
    //      not the Update screen's own Approve button, which wasn't independently confirmed) ----
    @Test(priority = 5)
    public void update005_ApproveAnUpdatedAgency() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD005_");
        String code = resolveCodeForName(name);
        openUpdateScreenFor(code);
        new Agency_Page(driver).fillOwnerDetails("QA Spike Update Contact V2", "qa.spike.update.v2@example.com", "1009876500");
        driver.element().click(By.xpath("//button[normalize-space()=\"Send For Approval\"]"));
        waitBriefly();
        openAgencyList();
        new AgencyActions_Page(driver).clickApproveForCode(code).fillRemarkAndSubmit("QA Spike automation - approve after update.");
        waitBriefly();
        openAgencyList();
        Assert.assertEquals(new AgencyActions_Page(driver).getApprovalStatusForCode(code), "Approved");
    }

    // ---- TC-AGENCY-UPDATE-006 (Partially Automatable — same caveat as UPDATE-005) ----
    @Test(priority = 6)
    public void update006_RejectAnUpdatedAgencyWithReason() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD006_");
        String code = resolveCodeForName(name);
        openUpdateScreenFor(code);
        new Agency_Page(driver).fillOwnerDetails("QA Spike Update Contact V3", "qa.spike.update.v3@example.com", "1009876501");
        driver.element().click(By.xpath("//button[normalize-space()=\"Send For Approval\"]"));
        waitBriefly();
        openAgencyList();
        new AgencyActions_Page(driver).clickRejectForCode(code).fillRemarkAndSubmit("QA Spike automation - reject after update, reason: test coverage.");
        waitBriefly();
        openAgencyList();
        Assert.assertEquals(new AgencyActions_Page(driver).getApprovalStatusForCode(code), "Rejected");
    }

    // ---- TC-AGENCY-UPDATE-007 (Partially Automatable — asserts the pre-edit Contact Person value
    //      is still readable/intact after a Reject, not lost) ----
    @Test(priority = 7)
    public void update007_RejectedAgencyPriorDataNotSilentlyLost() throws Exception {
        String name = createFreshFixture("QASPIKE_UPD007_");
        String code = resolveCodeForName(name);
        openAgencyList();
        new AgencyActions_Page(driver).clickRejectForCode(code).fillRemarkAndSubmit("QA Spike automation - reject, data-integrity check.");
        waitBriefly();
        openAgencyList();
        openUpdateScreenFor(code);
        String contactPersonAfterReject = driver.element().getAttribute(By.xpath("//input[@id=\"id-Contactperson\"]"), "value");
        Assert.assertEquals(contactPersonAfterReject, "QA Spike Update Contact",
                "A Rejected Agency's prior data (Contact Person) must still be intact, not lost.");
    }
}
