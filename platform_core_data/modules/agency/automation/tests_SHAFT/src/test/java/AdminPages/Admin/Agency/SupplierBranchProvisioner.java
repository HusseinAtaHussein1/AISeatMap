package AdminPages.Admin.Agency;

import AdminPages.Admin.Agency.BranchSupplierGrid;
import AdminPages.Admin.Branch.AddBranch_Page;
import AdminPages.Admin.Branch.ApprovalStatus;
import AdminPages.Admin.Branch.BranchTestData;
import AdminPages.Admin.Branch.SearchBranch_Page;
import com.shaft.driver.SHAFT;
import org.testng.Assert;
import utilities.AgencyDataFactory;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * Creates the <b>approved Branch carrying two or more suppliers</b> that the Agency fixture is built
 * beneath, and returns the identifiers proving the record belongs to this run.
 *
 * <h2>Why the Agency suite needs its own Branch provisioner</h2>
 *
 * <p>{@code BranchProvisioner.createPendingBranch} leaves a Branch in {@code Pending for approval} with
 * one supplier row, which is exactly what the Branch suite needs. The Agency fixture needs something
 * different on both counts:
 *
 * <ul>
 *   <li><b>Approved, not pending.</b> {@code PO-14}: an Agency is created beneath a usable Branch.
 *   <li><b>Two or more suppliers with credentials.</b> {@code BR-006} makes that the precondition for
 *       the Agency form's Airline Supplier credentials (PCC) section existing at all -- and
 *       {@code FINDING-008} confirmed it experimentally, with four of five sampled agencies not
 *       rendering the section because their Branch did not qualify. Without it, TC-AGENCY-055 has
 *       nothing to assert against.
 * </ul>
 *
 * <p><b>Nothing in the Branch module is modified.</b> This class composes {@code AddBranch_Page},
 * {@code SearchBranch_Page} and {@link BranchSupplierGrid} rather than editing any of them, so the
 * Branch suite's tests are untouched by construction rather than by careful review.
 *
 * <h2>Provenance, and why it is proven rather than assumed</h2>
 *
 * <p>The pattern is {@code BranchProvisioner}'s, deliberately unchanged: create under a run-tagged
 * name, then search for that exact name to read back the code the application assigned, matching
 * identity <b>per row</b>. A record's code is assigned by the application, so the only identifier this
 * suite controls is the name. Accepting row 1 of a result set would risk approving a Branch this run
 * does not own -- the precise action this run's mutation authorisation forbids absolutely.
 */
public final class SupplierBranchProvisioner {

    /** Provenance tag, matching {@code BranchProvisioner}'s so both are recognisable on STG. */
    private static final String RUN_TAG = "QA";

    /** Bounded attempt count for the post-create lookup -- an attempt count, never a pause. */
    private static final int LOOKUP_ATTEMPTS = 4;

    /** {@code BR-006}'s threshold: the PCC section requires two or more credentialled suppliers. */
    private static final int REQUIRED_SUPPLIER_ROWS = 2;

    private SupplierBranchProvisioner() {
    }

    /** A Branch this run created, approved, and knows the suppliers of. */
    public static final class ProvisionedBranch {
        private final String branchCode;
        private final String branchName;
        private final List<String> supplierNames;

        private ProvisionedBranch(String branchCode, String branchName, List<String> supplierNames) {
            this.branchCode = branchCode;
            this.branchName = branchName;
            this.supplierNames = supplierNames;
        }

        public String branchCode() {
            return branchCode;
        }

        public String branchName() {
            return branchName;
        }

        /** The suppliers this Branch carries -- named so a PCC failure can say which they were. */
        public List<String> supplierNames() {
            return supplierNames;
        }

        @Override
        public String toString() {
            return branchName + " (" + branchCode + ") suppliers=" + supplierNames;
        }
    }

    private static String runTaggedBranchName() {
        return RUN_TAG + "_" + System.nanoTime();
    }

    /**
     * Returns the fixture beneath the operator's configured, already-approved Branch (2026-08-20) when
     * one is configured, so the whole Agency suite reuses one Branch instead of creating and permanently
     * leaving behind a new one every execution (PO-3: no DELETE on this environment). Falls back to
     * {@link #createApprovedBranchWithSuppliers} when no known Branch is configured.
     *
     * <p><b>Read-only.</b> This never creates, edits, or re-approves the known Branch -- only searches
     * for it and confirms it is still the Branch the operator named, still Approved. A record that no
     * longer matches is an environment data gap to report, never a reason to fall back to creating a new
     * one silently -- that would defeat the operator's instruction one search away from success.
     */
    public static ProvisionedBranch getOrCreateApprovedBranchWithSuppliers(SHAFT.GUI.WebDriver driver) {
        String knownCode = AgencyTestData.knownApprovedBranchCode();
        if (knownCode.isEmpty()) {
            return createApprovedBranchWithSuppliers(driver);
        }

        String knownName = AgencyTestData.knownApprovedBranchName();
        List<String> knownSuppliers = AgencyTestData.knownApprovedBranchSuppliers();

        SearchBranch_Page searchBranchPage = new SearchBranch_Page(driver).open();
        searchBranchPage.searchByCode(knownCode, SearchBranch_Page.Status.BOTH);

        Assert.assertTrue(searchBranchPage.isRowPresent(knownCode),
                "The configured known Branch \"" + knownCode + "\" (agency_baseline.properties:"
                        + "knownApprovedBranchCode) could not be found. This is an environment data gap, not "
                        + "an application defect: either it was removed from this shared environment, or the "
                        + "configured code no longer matches. Point knownApprovedBranchCode at a different "
                        + "known-good Branch, or remove it so the suite falls back to creating a fresh one.");

        String actualName = searchBranchPage.branchNameOf(knownCode);
        Assert.assertEquals(actualName, knownName,
                "The configured known Branch \"" + knownCode + "\" now carries the name \"" + actualName
                        + "\", not the configured \"" + knownName + "\" (agency_baseline.properties). Someone "
                        + "else may have renamed this shared record. Update the configured name to match, or "
                        + "point at a different known-good Branch.");

        String actualStatus = searchBranchPage.approvalStatusOf(knownCode);
        Assert.assertEquals(actualStatus, ApprovalStatus.APPROVED.label(),
                "The configured known Branch \"" + knownCode + "\" is no longer \""
                        + ApprovalStatus.APPROVED.label() + "\" -- its Approval Status now reads \""
                        + actualStatus + "\". An Agency cannot be created beneath it in this state (PO-14). "
                        + "This suite never re-approves the known Branch itself; point at a different "
                        + "known-good Branch, or remove the configuration so a fresh one is built.");

        System.out.println("[PROVISION] reusing known approved Branch " + knownCode + " (\"" + knownName
                + "\") suppliers=" + knownSuppliers + " -- no new Branch created");
        return new ProvisionedBranch(knownCode, knownName, knownSuppliers);
    }

    /**
     * Creates one Branch with a run-tagged name and two credentialled suppliers, submits it, reads back
     * its Branch Code, approves it, and confirms the approval landed.
     *
     * <p>Every step fails the calling test immediately rather than continuing, because a fixture that is
     * "probably fine" cannot support a mutation the run has to be able to prove it was authorised to
     * make.
     */
    public static ProvisionedBranch createApprovedBranchWithSuppliers(SHAFT.GUI.WebDriver driver) {
        String branchName = runTaggedBranchName();

        AddBranch_Page addBranchPage = new AddBranch_Page(driver).open();
        HashSet<String> skipName = new HashSet<>();
        skipName.add("name");
        addBranchPage.fillMandatoryBaseline(skipName);
        addBranchPage.setBranchName(branchName);

        // fillMandatoryBaseline already populated supplier row 1. Add the rows needed to reach BR-006's
        // threshold, each with a credential -- a ticked row without one leaves the grid invalid and
        // blocks submission entirely (REPAIR-BR-002).
        BranchSupplierGrid supplierGrid = new BranchSupplierGrid(driver);
        int availableRows = supplierGrid.rowCount();
        Assert.assertTrue(availableRows >= REQUIRED_SUPPLIER_ROWS,
                "Provisioning failed: the Add Branch form's Product Access grid offers only " + availableRows
                        + " supplier row(s), but BR-006 requires a Branch carrying at least "
                        + REQUIRED_SUPPLIER_ROWS + " credentialled suppliers before an Agency beneath it "
                        + "renders the Airline Supplier credentials (PCC) section. This is an environment "
                        + "data gap on STG, not an application defect: without more suppliers configured, "
                        + "TC-AGENCY-055 cannot be exercised at all.");

        List<String> supplierNames = new ArrayList<>();
        supplierNames.add(supplierGrid.supplierNameInRow(1));
        for (int rowIndex = 2; rowIndex <= REQUIRED_SUPPLIER_ROWS; rowIndex++) {
            supplierNames.add(supplierGrid.populateRow(rowIndex,
                    BranchTestData.credentialName(),
                    BranchTestData.productAccessDescription()));
        }

        addBranchPage.clickSubmit();
        addBranchPage.assertSubmissionSucceeded();

        SearchBranch_Page searchBranchPage = new SearchBranch_Page(driver);

        // A just-submitted record is not immediately returnable by search (REPAIR-BR-014). Bounded by
        // attempt count; each attempt re-opens and re-searches, and every wait inside the search is
        // already bounded. Status INACTIVE because a freshly submitted Branch is not under Active.
        String branchCode = "";
        for (int attempt = 1; attempt <= LOOKUP_ATTEMPTS && branchCode.isEmpty(); attempt++) {
            searchBranchPage.open();
            searchBranchPage.searchByName(branchName, SearchBranch_Page.Status.INACTIVE);
            branchCode = codeOfExactlyThisBranch(searchBranchPage, branchName);
        }

        Assert.assertFalse(branchCode.isEmpty(),
                "Provisioning failed: no Branch named \"" + branchName + "\" was found after creating it, "
                        + "across " + LOOKUP_ATTEMPTS + " searches. No Agency may be created beneath an "
                        + "unconfirmed Branch, and no action may be taken on any other record.");

        // Identity re-proven against the exact code every later action is addressed by.
        Assert.assertEquals(searchBranchPage.branchNameOf(branchCode), branchName,
                "Provisioning failed: Branch Code \"" + branchCode + "\" belongs to a different record than "
                        + "the one this run created. Approving it is exactly what this run's mutation "
                        + "authorisation forbids.");

        approve(searchBranchPage, branchCode, branchName);

        return new ProvisionedBranch(branchCode, branchName, supplierNames);
    }

    /**
     * Approves this run's own Branch and confirms the status actually changed.
     *
     * <p>The Remarks dialog is completed only when it appears. It is mandatory on the Branch screen, but
     * whether it is raised is the application's behaviour to state, not this fixture's to presume --
     * {@code remarksPromptShown()} is non-throwing precisely so absence is an observation.
     */
    private static void approve(SearchBranch_Page searchBranchPage, String branchCode, String branchName) {
        searchBranchPage.open();
        searchBranchPage.searchByCode(branchCode, SearchBranch_Page.Status.INACTIVE);
        Assert.assertTrue(searchBranchPage.isRowPresent(branchCode),
                "Provisioning failed: Branch \"" + branchCode + "\" could not be found to approve it.");

        searchBranchPage.clickThumbsUp(branchCode);
        if (searchBranchPage.remarksPromptShown()) {
            searchBranchPage.completeRemarksPrompt(
                    AgencyDataFactory.uniqueRemarks("approving this run's fixture Branch " + branchName));
        }

        Assert.assertTrue(
                searchBranchPage.waitForApprovalStatus(branchCode, ApprovalStatus.APPROVED.label()),
                "Provisioning failed: Branch \"" + branchCode + "\" was approved but its Approval Status "
                        + "never became \"" + ApprovalStatus.APPROVED.label() + "\". PO-14 requires an "
                        + "approved Branch before an Agency is created beneath it, so the fixture cannot be "
                        + "treated as ready.");
    }

    /**
     * The Branch Code of the row whose Branch Name is exactly {@code branchName}, or {@code ""}.
     * Checked per row, never by position -- see the class note.
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
