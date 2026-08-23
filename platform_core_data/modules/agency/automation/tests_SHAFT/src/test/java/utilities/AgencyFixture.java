package utilities;

import AdminPages.Admin.Agency.AddAgency_Page;
import AdminPages.Admin.Agency.SearchAgency_Page;
import AdminPages.Admin.Branch.ApprovalStatus;
import AdminPages.Admin.Branch.SearchBranch_Page;
import Generic_Classes.JsonDataReader;
import com.shaft.driver.SHAFT;

import java.io.File;
import java.net.URL;
import java.util.HashSet;
import java.util.List;

/**
 * The single Agency test fixture: confirms the known, already-approved Branch is present and usable,
 * creates one Agency beneath it, reads back the code the application assigned, approves the record so
 * its Update form becomes openable, and hands the result to {@code AgencyTestBase}.
 *
 * <h2>Consolidated from four classes (2026-08-23 refactor)</h2>
 *
 * <p>Replaces {@code AgencyTestBase} (Page-helper part) + {@code AgencyFixture} (the old stateless
 * builder in {@code AdminPages.Admin.Agency}) + {@code AgencyProvisioner} + {@code SupplierBranchProvisioner}.
 * Moved into {@code utilities} because a Fixture is test-support plumbing, not a Test Class, and does not
 * belong under a Page Object's own package. It may call Add Agency Page, Search Agency Page, the Branch
 * Page only for read-only validation, {@link JsonDataReader}, and {@link AgencyDataFactory}. It contains
 * no normal Agency test scenario, no final Test Case assertion, and no locator.
 *
 * <h2>The Branch beneath every Agency is reused, never created</h2>
 *
 * <p>The known approved Branch is configured in {@code agency-data.json}'s {@code knownApprovedBranch}
 * object. This class only <b>searches</b> for it and confirms it is still present, still carries the
 * configured name, and is still Approved -- it never creates, edits, or re-approves it. If the record no
 * longer matches, the fixture fails naming the exact configured value: an environment data gap to
 * report, never a reason to fall back to silently creating a new, permanent Branch on an environment that
 * has no DELETE (PO-3).
 *
 * <h2>Per-class fixture, remembered rather than retried</h2>
 *
 * <p>Each of the five Agency test classes builds its own Agency once, the first time any of its test
 * methods runs (via {@code AgencyTestBase#prepareClassFixture}) -- so five classes cost five new
 * Agencies and zero new Branches, not five of each. This class itself holds no state between calls; the
 * "build once per class, remember a failure, never retry" behaviour lives in {@code AgencyTestBase},
 * scoped to that class's own instance.
 */
public final class AgencyFixture {

    private static final String DATA_FILE = "testDataFiles/agency/agency-data.json";

    /** Bounded attempt count for the post-create lookup. An attempt count, not a pause. */
    private static final int LOOKUP_ATTEMPTS = 4;

    private AgencyFixture() {
    }

    /** The known, reused Branch beneath which the Agency was created. */
    public record ApprovedBranch(String branchCode, String branchName, List<String> supplierNames) {
    }

    /** The Agency this call created, and the Branch it sits beneath. */
    public record Built(String agencyCode, String agencyName, ApprovedBranch branch) {
    }

    /**
     * Builds one fresh Agency beneath the reused, known-approved Branch, and returns both.
     *
     * @throws IllegalStateException naming the precondition that failed -- never a TestNG {@code Assert}
     */
    public static Built build(SHAFT.GUI.WebDriver driver, String callerLabel) {
        System.out.println("[FIXTURE] " + callerLabel + ": building this class's own Agency"
                + " (beneath the reused, known-approved Branch)");

        ApprovedBranch branch = confirmKnownApprovedBranch(driver);
        System.out.println("[FIXTURE] " + callerLabel + ": branch confirmed (reused, not created): " + branch);

        String agencyName = AgencyDataFactory.uniqueAgencyName();
        String agencyCode = createAgency(driver, branch.branchName(), agencyName);
        System.out.println("[FIXTURE] " + callerLabel + ": agency ready: " + agencyName + " (" + agencyCode
                + ") under branch " + branch.branchName());

        return new Built(agencyCode, agencyName, branch);
    }

    // -- Branch confirmation (read-only) ---------------------------------------------------------

    /**
     * Confirms the JSON-configured known Branch is present, still carries the configured name, and is
     * still Approved. Read-only: never creates, edits, or re-approves it -- there is no create-a-new-
     * Branch fallback (2026-08-23 refactor: the old {@code createApprovedBranchWithSuppliers} fallback
     * is retired; the known Branch is a standing environment precondition now, not an optional one).
     */
    private static ApprovedBranch confirmKnownApprovedBranch(SHAFT.GUI.WebDriver driver) {
        JsonDataReader branchData = JsonDataReader.fromClasspath(DATA_FILE).object("knownApprovedBranch");
        String knownCode = branchData.getString("code");
        String knownName = branchData.getString("name");
        List<String> knownSuppliers = branchData.getStringList("suppliers");

        SearchBranch_Page searchBranchPage = new SearchBranch_Page(driver).open();
        searchBranchPage.searchByCode(knownCode, SearchBranch_Page.Status.BOTH);

        if (!searchBranchPage.isRowPresent(knownCode)) {
            throw new IllegalStateException(
                    "The configured known Branch \"" + knownCode + "\" (agency-data.json:"
                            + "knownApprovedBranch.code) could not be found. This is an environment data gap, "
                            + "not an application defect: either it was removed from this shared environment, "
                            + "or the configured code no longer matches. Point knownApprovedBranch at a "
                            + "different known-good Branch.");
        }

        String actualName = searchBranchPage.branchNameOf(knownCode);
        if (!actualName.equals(knownName)) {
            throw new IllegalStateException(
                    "The configured known Branch \"" + knownCode + "\" now carries the name \"" + actualName
                            + "\", not the configured \"" + knownName + "\" (agency-data.json). Someone else "
                            + "may have renamed this shared record. Update the configured name to match, or "
                            + "point at a different known-good Branch.");
        }

        String actualStatus = searchBranchPage.approvalStatusOf(knownCode);
        if (!actualStatus.equals(ApprovalStatus.APPROVED.label())) {
            throw new IllegalStateException(
                    "The configured known Branch \"" + knownCode + "\" is no longer \""
                            + ApprovalStatus.APPROVED.label() + "\" -- its Approval Status now reads \""
                            + actualStatus + "\". An Agency cannot be created beneath it in this state (PO-14). "
                            + "This fixture never re-approves the known Branch itself; point at a different "
                            + "known-good Branch instead.");
        }

        return new ApprovedBranch(knownCode, knownName, knownSuppliers);
    }

    // -- Agency creation --------------------------------------------------------------------------

    /**
     * Creates one Agency under {@code agencyName} beneath {@code branchName}, fills every mandatory
     * field with the JSON baseline plus dynamic {@link AgencyDataFactory} values, submits, reads back the
     * assigned Agency Code by an identity-proven lookup, and approves the record so its Update form
     * becomes openable (REPAIR-AG-015).
     */
    private static String createAgency(SHAFT.GUI.WebDriver driver, String branchName, String agencyName) {
        JsonDataReader data = JsonDataReader.fromClasspath(DATA_FILE);

        AddAgency_Page addAgencyPage = new AddAgency_Page(driver).open();
        addAgencyPage.selectBranch(branchName);
        addAgencyPage.setAgencyName(agencyName);
        addAgencyPage.selectState(data.getString("state"));
        addAgencyPage.selectCity(data.getString("city"));
        addAgencyPage.setAddress1(data.getString("address1"));
        addAgencyPage.setPostOfficeBox(data.getString("postOfficeBox"));
        addAgencyPage.setPhoneNoMaster(AgencyDataFactory.uniquePhoneNumber());
        addAgencyPage.setContactPerson(AgencyDataFactory.uniqueContactPerson());
        addAgencyPage.setOwnerEmailId(AgencyDataFactory.uniqueEmail("owner"));
        addAgencyPage.setOwnerPhoneNumber(AgencyDataFactory.uniquePhoneNumber());
        addAgencyPage.attachDocument(validDocumentPath());
        addAgencyPage.setContractStartDate(data.getString("contractStartDate"));
        addAgencyPage.setContractEndDate(data.getString("contractEndDate"));
        addAgencyPage.attachLogo(validLogoPath());
        addAgencyPage.setSalesContactName(AgencyDataFactory.uniqueSalesContactName());
        addAgencyPage.setSalesEmailId(AgencyDataFactory.uniqueEmail("sales"));
        addAgencyPage.setSalesPhoneNumber(AgencyDataFactory.uniquePhoneNumber());
        addAgencyPage.selectInvoiceGeneration(data.getString("invoiceGeneration"));
        addAgencyPage.setCreditLimit(data.getString("creditLimit"));
        addAgencyPage.setTopUpLimit(data.getString("topUpLimit"));
        addAgencyPage.setCreditTermsDays(data.getString("creditTermsDays"));
        addAgencyPage.tickPaymentOption(data.getString("paymentOption"));
        addAgencyPage.tickFirstSupplierRow();

        // Country is readonly and derives from the selected Branch. Asserted, not entered: if the
        // cascade did not fire, every downstream test would fail on a mandatory field with no
        // indication that the Branch selection was the cause.
        String derivedCountry = addAgencyPage.country().trim();
        if (derivedCountry.isEmpty()) {
            throw new IllegalStateException(
                    "Provisioning failed: Country never auto-filled after selecting Branch \"" + branchName
                            + "\". Country is readonly on this form and derives from the Branch, so an empty "
                            + "value means the Branch selection did not take effect.");
        }
        String expectedCountry = data.getString("country");
        if (!derivedCountry.equals(expectedCountry)) {
            throw new IllegalStateException(
                    "Provisioning failed: the Branch cascade produced Country \"" + derivedCountry
                            + "\" but the fixture expects \"" + expectedCountry + "\" (agency-data.json). A "
                            + "mismatch means the configured Branch and the configured country have drifted "
                            + "apart, not that Add Agency is wrong.");
        }

        addAgencyPage.clickSendForApproval();
        boolean succeeded = addAgencyPage.submissionSucceeded(agencyName);
        if (!succeeded) {
            throw new IllegalStateException(
                    "Provisioning failed: the Add Agency form did not submit \"" + agencyName + "\" "
                            + "successfully. No test may proceed, because every mutating test may act only on "
                            + "an Agency this run created. Still-invalid mandatory field(s): "
                            + addAgencyPage.stillInvalidMandatoryFields() + ". Rendered messages: "
                            + addAgencyPage.submissionMessages());
        }

        String agencyCode = lookUpCreatedAgencyCode(driver, agencyName);
        approveNewlyCreatedAgency(driver, agencyCode, agencyName);
        return agencyCode;
    }

    /**
     * A just-submitted record is not immediately returnable (the REPAIR-BR-014 lesson). Bounded attempt
     * count, no fixed sleeps. Identity is matched per row: a result set may hold other records, so
     * accepting row 1 could hand back a code this run does not own.
     */
    private static String lookUpCreatedAgencyCode(SHAFT.GUI.WebDriver driver, String agencyName) {
        SearchAgency_Page searchAgencyPage = new SearchAgency_Page(driver);
        String agencyCode = "";
        String lastSearchBoxValue = "";
        for (int attempt = 1; attempt <= LOOKUP_ATTEMPTS && agencyCode.isEmpty(); attempt++) {
            searchAgencyPage.open();
            searchAgencyPage.searchByName(agencyName); // REPAIR-AG-012: the unfiltered view is capped at 10 rows
            lastSearchBoxValue = searchAgencyPage.agencyNameFilterValue();
            agencyCode = searchAgencyPage.codeOfExactlyThisAgency(agencyName);
            System.out.println("[PROVISION] lookup attempt " + attempt + "/" + LOOKUP_ATTEMPTS
                    + ": search box holds \"" + lastSearchBoxValue + "\", rows returned="
                    + searchAgencyPage.rowCount() + ", matched=" + !agencyCode.isEmpty());
        }

        if (agencyCode.isEmpty()) {
            searchAgencyPage.open();
            System.out.println("[PROVISION] unfiltered top rows at failure time = "
                    + searchAgencyPage.topRowsRaw(10));
            throw new IllegalStateException(
                    "Provisioning failed: no Agency named \"" + agencyName + "\" was found after creating it, "
                            + "across " + LOOKUP_ATTEMPTS + " reads of the Agency list (search box last held \""
                            + lastSearchBoxValue + "\"). No test may proceed, because acting on any other "
                            + "record would fall outside this run's mutation authorisation.");
        }

        String matchedName = searchAgencyPage.agencyNameOf(agencyCode);
        if (!matchedName.equals(agencyName)) {
            throw new IllegalStateException(
                    "Provisioning failed: Agency Code \"" + agencyCode + "\" belongs to a different record "
                            + "than the one this run created (\"" + matchedName + "\" != \"" + agencyName
                            + "\"). No action may be taken on it.");
        }
        System.out.println("[PROVISION] created agency " + agencyCode + " (\"" + agencyName + "\")");
        return agencyCode;
    }

    /**
     * REPAIR-AG-015 (2026-08-19, Stage 5H): a just-created Agency's Update screen never crosses its own
     * "is this form actually loaded" threshold while the record is Pending, so every downstream test's
     * first {@code openUpdateForm()} would time out regardless of which test runs first. The fixture
     * clears this one approval gate on the creation itself -- distinct from
     * {@code AgencyMakerChecker_TC}'s later approve/reject cases, which act on a subsequently-edited
     * record; this step only establishes that the record can be opened at all.
     */
    private static void approveNewlyCreatedAgency(SHAFT.GUI.WebDriver driver, String agencyCode, String agencyName) {
        SearchAgency_Page searchAgencyPage = new SearchAgency_Page(driver);
        searchAgencyPage.clickThumbsUp(agencyCode);
        if (searchAgencyPage.remarksPromptShown()) {
            searchAgencyPage.completeRemarksPrompt(
                    AgencyDataFactory.uniqueRemarks("approving this run's fixture Agency " + agencyName));
        }
        boolean approved = searchAgencyPage.waitForApprovalStatusContaining(agencyCode, "approved");
        if (!approved) {
            throw new IllegalStateException(
                    "Provisioning failed: Agency \"" + agencyCode + "\" was created but never reached an "
                            + "\"Approved\" status after this run approved it. No downstream test can open a "
                            + "Pending record.");
        }
        System.out.println("[PROVISION] approved agency " + agencyCode + " -- fixture is now open-able");
    }

    // -- Upload fixture paths -------------------------------------------------------------------

    public static String validDocumentPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyContract_Doc1_valid.pdf");
    }

    public static String validLogoPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyLogo_valid.png");
    }

    /** TC-AGENCY-020: a .pdf filename whose bytes are plain text with no %PDF header. */
    public static String fakeExtensionDocumentPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyContract_fake_extension.pdf");
    }

    /** TC-AGENCY-023: ~3.16 MB, structurally valid, padded with random bytes so it is genuinely incompressible. */
    public static String oversizeLogoPath() {
        return resourcePath("testDataFiles/agency/uploads/AgencyLogo_oversize.png");
    }

    /**
     * Resolves a test-resource to an absolute filesystem path. Fails naming the missing file rather than
     * handing a driver a path that does not exist.
     */
    private static String resourcePath(String classpathRelative) {
        URL resource = AgencyFixture.class.getClassLoader().getResource(classpathRelative);
        if (resource == null) {
            throw new IllegalStateException(
                    "Upload fixture missing from the classpath: " + classpathRelative
                            + ". It must exist under src/test/resources/ before any upload test runs.");
        }
        return new File(resource.getFile()).getAbsolutePath();
    }
}
