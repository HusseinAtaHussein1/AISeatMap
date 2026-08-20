package AdminPages.Admin.Agency;

import AdminPages.Admin.Agency.AddAgency_Page;
import AdminPages.Admin.Agency.AgencyTestData;
import AdminPages.Admin.Agency.SearchAgency_Page;
import com.shaft.driver.SHAFT;
import org.testng.Assert;
import utilities.AgencyDataFactory;

import java.util.HashSet;

/**
 * Creates the one Agency record this run is authorised to act on, and returns the identifier that
 * proves it belongs to this run.
 *
 * <h2>Why every mutating test depends on this class</h2>
 *
 * <p>This run's mutation authorisation permits acting on Agency records <em>this run created</em> and
 * forbids any action on one it did not. {@code PO-2} makes that concrete, and the Execution Safety
 * policy makes Approve/Reject on a record the run did not create {@code Forbidden (absolute)}. That has
 * an operational consequence: a test cannot act on a record unless it can <b>name</b> that record, and
 * it must be able to name it <em>before</em> acting, or the authorisation is unprovable afterwards.
 *
 * <p>The Agency Code is assigned by the application, not chosen on the form. The only identifier this
 * suite controls is the Agency Name, so provisioning creates the record under a run-tagged name and then
 * searches for that exact name to read back the assigned code. <b>Identity is matched per row.</b> A
 * result set may hold other records -- or a filter may have failed to narrow at all -- so accepting row
 * 1 could hand back a code this run does not own, and the very next step would approve or reject a
 * stranger's agency.
 */
public final class AgencyProvisioner {

    /** Bounded attempt count for the post-create lookup. An attempt count, not a pause. */
    private static final int LOOKUP_ATTEMPTS = 4;

    private AgencyProvisioner() {
    }

    /** An Agency this run created, identified by both the name it was given and the code it was assigned. */
    public static final class ProvisionedAgency {
        private final String agencyCode;
        private final String agencyName;
        private final String branchName;

        private ProvisionedAgency(String agencyCode, String agencyName, String branchName) {
            this.agencyCode = agencyCode;
            this.agencyName = agencyName;
            this.branchName = branchName;
        }

        public String agencyCode() {
            return agencyCode;
        }

        public String agencyName() {
            return agencyName;
        }

        /** The run-created Branch this Agency sits beneath. */
        public String branchName() {
            return branchName;
        }

        @Override
        public String toString() {
            return agencyName + " (" + agencyCode + ") under branch " + branchName;
        }
    }

    /**
     * Creates one Agency beneath the given run-created Branch and returns it with the Agency Code the
     * application assigned.
     *
     * @param documentPath absolute path to the mandatory upload document
     * @param logoPath     absolute path to the mandatory logo
     */
    public static ProvisionedAgency createAgency(SHAFT.GUI.WebDriver driver,
                                                 String branchName,
                                                 String documentPath,
                                                 String logoPath) {
        String agencyName = AgencyDataFactory.uniqueAgencyName();

        AddAgency_Page addAgencyPage = new AddAgency_Page(driver).open().usingBranch(branchName);
        HashSet<String> skipName = new HashSet<>();
        // Skip the generated name so the run-tagged one this method can predict is used instead --
        // fillMandatoryBaseline would otherwise generate its own, which the caller could not name.
        skipName.add("name");
        addAgencyPage.fillMandatoryBaseline(skipName, documentPath, logoPath);
        addAgencyPage.setAgencyName(agencyName);

        // Country is readonly and derives from the selected Branch. Asserted, not entered: if the
        // cascade did not fire, every downstream test would fail on a mandatory field with no
        // indication that the Branch selection was the cause.
        String derivedCountry = addAgencyPage.country().trim();
        Assert.assertFalse(derivedCountry.isEmpty(),
                "Provisioning failed: Country never auto-filled after selecting Branch \"" + branchName
                        + "\". Country is readonly on this form and derives from the Branch, so an empty "
                        + "value means the Branch selection did not take effect -- not that a field was "
                        + "missed.");
        Assert.assertEquals(derivedCountry, AgencyTestData.country(),
                "Provisioning failed: the Branch cascade produced Country \"" + derivedCountry
                        + "\" but the fixture expects \"" + AgencyTestData.country() + "\". The two must "
                        + "agree, because branch_baseline.properties creates the fixture Branch under "
                        + "operatingCountry=EgyptUAT which maps to Egypt. A mismatch means the two baseline "
                        + "files have drifted apart, not that Add Agency is wrong.");

        addAgencyPage.clickSendForApproval();
        addAgencyPage.assertSubmissionSucceeded(agencyName);

        SearchAgency_Page searchAgencyPage = new SearchAgency_Page(driver);

        // A just-submitted record is not immediately returnable (the REPAIR-BR-014 lesson, which is
        // about this application's read-after-write timing rather than about Branch specifically).
        String agencyCode = "";
        String lastSearchBoxValue = "";
        for (int attempt = 1; attempt <= LOOKUP_ATTEMPTS && agencyCode.isEmpty(); attempt++) {
            searchAgencyPage.open();
            searchAgencyPage.searchByName(agencyName); // REPAIR-AG-012: the unfiltered view is capped
            // at 10 rows and does not reliably include a just-created record.
            lastSearchBoxValue = searchAgencyPage.agencyNameFilterValue();
            agencyCode = searchAgencyPage.codeOfExactlyThisAgency(agencyName);
            System.out.println("[PROVISION] lookup attempt " + attempt + "/" + LOOKUP_ATTEMPTS
                    + ": search box holds \"" + lastSearchBoxValue + "\", rows returned="
                    + searchAgencyPage.rowCount() + ", matched=" + !agencyCode.isEmpty());
        }

        if (agencyCode.isEmpty()) {
            // Diagnostics added 2026-08-19 (Stage 5H): every prior attempt to explain this failure from
            // outside the real execution proved unreliable, so the evidence now comes from inside it.
            searchAgencyPage.open();
            System.out.println("[PROVISION] unfiltered top rows at failure time = "
                    + searchAgencyPage.topRowsRaw(10));
        }

        Assert.assertFalse(agencyCode.isEmpty(),
                "Provisioning failed: no Agency named \"" + agencyName + "\" was found after creating it, "
                        + "across " + LOOKUP_ATTEMPTS + " reads of the Agency list (search box last held \""
                        + lastSearchBoxValue + "\"). No test may proceed, because acting on any other record "
                        + "would fall outside this run's mutation authorisation. See [PROVISION] diagnostics "
                        + "above for the unfiltered grid's actual contents at failure time.");

        // Identity re-proven against the exact code every later action is addressed by.
        Assert.assertEquals(searchAgencyPage.agencyNameOf(agencyCode), agencyName,
                "Provisioning failed: Agency Code \"" + agencyCode + "\" belongs to a different record than "
                        + "the one this run created. No action may be taken on it -- approving or rejecting "
                        + "another team's agency is exactly what this run's mutation authorisation forbids.");

        System.out.println("[PROVISION] created agency " + agencyCode + " (\"" + agencyName
                + "\") under branch \"" + branchName + "\"");

        // REPAIR-AG-015 (2026-08-19, Stage 5H). Live evidence: a just-created Agency's Update screen
        // never crosses UpdateAgency_Page's own "is this form actually loaded" threshold while the
        // record is Pending -- confirmed by opening it directly: the edit URL loads, but the render
        // this application produces for a Pending record does not match what an Approved record's edit
        // form produces, so every downstream test's openUpdateForm() times out after 40s regardless of
        // which test runs first, including AgencyMakerChecker_TC's own cases -- they too must open the
        // record before they can exercise a *second*, edited-record approval cycle. The fixture
        // therefore clears this one approval gate on the *creation* itself, exactly as
        // SupplierBranchProvisioner already does for the Branch it builds
        // (createApprovedBranchWithSuppliers). Approving here is a distinct action from
        // AgencyMakerChecker_TC's later approve/reject cases, which act on a subsequently-*edited*
        // record -- this step only establishes that the record can be opened at all.
        searchAgencyPage.clickThumbsUp(agencyCode);
        if (searchAgencyPage.remarksPromptShown()) {
            searchAgencyPage.completeRemarksPrompt(
                    AgencyDataFactory.uniqueRemarks("approving this run's fixture Agency " + agencyName));
        }
        boolean approved = searchAgencyPage.waitForApprovalStatusContaining(agencyCode, "approved");
        Assert.assertTrue(approved,
                "Provisioning failed: Agency \"" + agencyCode + "\" was created but never reached an "
                        + "\"Approved\" status after this run approved it. No downstream test can open a "
                        + "Pending record -- see [DIAG-SYNC] above for the last observed status.");
        System.out.println("[PROVISION] approved agency " + agencyCode + " -- fixture is now open-able");

        return new ProvisionedAgency(agencyCode, agencyName, branchName);
    }
}
