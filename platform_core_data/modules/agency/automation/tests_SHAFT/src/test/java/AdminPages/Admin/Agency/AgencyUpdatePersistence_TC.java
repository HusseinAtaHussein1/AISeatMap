package AdminPages.Admin.Agency;

import org.testng.Assert;
import org.testng.annotations.Test;
import utilities.AgencyDataFactory;

/**
 * Agency Update &mdash; Field Persistence. Covers TC-AGENCY-001, 011, 012, 044 and 053.
 *
 * <p>Every case here follows the same shape the Stage 3 suite specifies: record the current value,
 * change it, submit, <b>reopen the record</b>, and assert the reopened form shows the new value.
 * Reopening is the point -- asserting on the still-open form would prove only that the browser holds
 * what was typed into it, not that the application stored anything.
 *
 * <p><b>Ordering is explicit, because the fixture is shared.</b> Automation Plan §5.1 gives the whole
 * suite one Agency, so these cases run in {@code priority} order and each writes only the fields its own
 * assertion reads. Where a case changes a field another case also uses, it restores it.
 *
 * <p><b>{@code Remarks} is mandatory on the Update form and is filled by every submitting case.</b>
 * Without it no submission succeeds, and the failure would look like the field under test being
 * rejected.
 */
public class AgencyUpdatePersistence_TC extends AgencyTestBase {

    /**
     * TC-AGENCY-001 &mdash; Update Agency Master fields successfully.
     *
     * <p>The suite's Test Data names a fixed agency name ({@code QA_AGENCY_US4222}), but this test uses a
     * generated one. The reason is provenance, not preference: a fixed name would collide with a prior
     * execution's permanent record on an environment that cannot delete, and the run must be able to
     * prove which record it owns. The <em>assertion</em> is unchanged -- the reopened form must show
     * exactly what was submitted.
     */
    @Test(priority = 10, description = "TC-AGENCY-001 Update Agency Master fields successfully")
    public void tc001_agencyMasterFieldsPersist() {
        UpdateAgency_Page form = openUpdateForm();

        String originalName = form.agencyName();
        String originalPostOfficeBox = form.postOfficeBox();
        String originalCompanyUrl = form.companyUrl();
        String originalAddress1 = form.address1();
        System.out.println("[TC-001] originals name=\"" + originalName + "\" pob=\"" + originalPostOfficeBox
                + "\" url=\"" + originalCompanyUrl + "\" address1=\"" + originalAddress1 + "\"");

        String newName = AgencyDataFactory.uniqueAgencyName();
        String newPostOfficeBox = "12345";
        String newCompanyUrl = "https://qa.example.com";
        String newAddress1 = "12 QA Street";

        form.setAgencyName(newName)
                .setPostOfficeBox(newPostOfficeBox)
                .setCompanyUrl(newCompanyUrl)
                .setAddress1(newAddress1)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-001 agency master persistence"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = openUpdateForm();
        Assert.assertEquals(reopened.agencyName(), newName,
                "Agency name should persist the value submitted by TC-AGENCY-001.");
        Assert.assertEquals(reopened.postOfficeBox(), newPostOfficeBox,
                "Post office box should persist the value submitted by TC-AGENCY-001.");
        Assert.assertEquals(reopened.companyUrl(), newCompanyUrl,
                "Company URL should persist the value submitted by TC-AGENCY-001.");
        Assert.assertEquals(reopened.address1(), newAddress1,
                "The first Address field should persist the value submitted by TC-AGENCY-001.");
    }

    /**
     * TC-AGENCY-011 &mdash; Agency Business Type selection persists.
     *
     * <p>Asserts <b>persistence only</b>. The suite is explicit that the field is undocumented in
     * US-4222 (FINDING-005) and that the business meaning of each value is unconfirmed, so this test must
     * not judge whether the <em>right</em> value is set -- only that the value chosen is the value
     * returned.
     */
    @Test(priority = 20, description = "TC-AGENCY-011 Agency Business Type selection persists")
    public void tc011_agencyBusinessTypePersists() {
        UpdateAgency_Page form = openUpdateForm();

        boolean wasB2B = form.isBusinessTypeB2BSelected();
        boolean wasFreelancer = form.isBusinessTypeFreelancerSelected();
        System.out.println("[TC-011] original B2B=" + wasB2B + " Freelancer=" + wasFreelancer);
        Assert.assertTrue(wasB2B || wasFreelancer,
                "Agency Business Type should already hold one of its two values before this case toggles "
                        + "it; neither B2B nor Freelancer was selected, so there is no \"opposite value\" to "
                        + "choose and the case cannot run meaningfully.");

        // Select the opposite of whatever is currently set, as the suite's step 2 specifies.
        if (wasB2B) {
            form.selectBusinessTypeFreelancer();
        } else {
            form.selectBusinessTypeB2B();
        }
        boolean expectedB2BAfter = !wasB2B;

        form.setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-011 business type persistence"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = openUpdateForm();
        Assert.assertEquals(reopened.isBusinessTypeB2BSelected(), expectedB2BAfter,
                "Agency Business Type should persist the selection made by TC-AGENCY-011. This case asserts "
                        + "persistence only -- the business meaning of each value is undocumented "
                        + "(FINDING-005) and is deliberately not judged here.");
    }

    /** TC-AGENCY-012 &mdash; Update Agency Owner Details successfully. */
    @Test(priority = 30, description = "TC-AGENCY-012 Update Agency Owner Details successfully")
    public void tc012_agencyOwnerDetailsPersist() {
        UpdateAgency_Page form = openUpdateForm();

        System.out.println("[TC-012] originals contact=\"" + form.contactPerson() + "\" email=\""
                + form.ownerEmailId() + "\" phone=\"" + form.ownerPhoneNumber() + "\"");

        String newContactPerson = "QA Owner";
        String newEmail = "qa.owner@example.com";
        String newPhone = "1000000001";

        form.setContactPerson(newContactPerson)
                .setOwnerEmailId(newEmail)
                .setOwnerPhoneNumber(newPhone)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-012 owner details persistence"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = openUpdateForm();
        Assert.assertEquals(reopened.contactPerson(), newContactPerson,
                "Contact person should persist the value submitted by TC-AGENCY-012.");
        Assert.assertEquals(reopened.ownerEmailId(), newEmail,
                "Owner Email ID should persist the value submitted by TC-AGENCY-012.");
        Assert.assertEquals(reopened.ownerPhoneNumber(), newPhone,
                "Owner Phone Number should persist the value submitted by TC-AGENCY-012.");
    }

    /**
     * TC-AGENCY-044 &mdash; Import PNR Option persists.
     *
     * <p><b>Touches only Import PNR Option.</b> The suite forbids touching {@code Transfer Pnr Option} or
     * {@code Blue Command Screen}: {@code PO-13} puts both out of scope, and Blue Command Screen is
     * verified {@code disabled} anyway (FINDING-012). Neither is referenced by this test.
     */
    @Test(priority = 40, description = "TC-AGENCY-044 Import PNR Option persists")
    public void tc044_importPnrOptionPersists() {
        UpdateAgency_Page form = openUpdateForm();

        boolean before = form.isImportPnrOptionChecked();
        System.out.println("[TC-044] Import PNR Option before=" + before);

        form.toggleImportPnrOption()
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-044 import PNR persistence"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = openUpdateForm();
        Assert.assertEquals(reopened.isImportPnrOptionChecked(), !before,
                "Import PNR Option should persist the state set by TC-AGENCY-044 (toggled from " + before
                        + " to " + !before + ").");
    }

    /**
     * TC-AGENCY-053 &mdash; Agency name accepts a space between words.
     *
     * <p><b>The expected result is stated definitely, and that is deliberate.</b> The reviewer reported
     * the field allows letters, digits and underscore only, which read literally excludes a space -- but
     * run-004 observed the stored name {@code Test Egypt} on an existing record. Existing data proves a
     * space must be storable, so rejection here is a defect, not an undocumented rule. This assertion is
     * therefore not softened to "record what happens".
     *
     * <p>Runs last in this class and restores a space-free name afterwards, so no later case inherits a
     * name the rest of the suite did not expect.
     */
    @Test(priority = 50, description = "TC-AGENCY-053 Agency name accepts a space between words")
    public void tc053_agencyNameAcceptsSpace() {
        UpdateAgency_Page form = openUpdateForm();
        String nameWithSpace = "QA Test Agency";

        form.clearAgencyName();
        form.setAgencyName(nameWithSpace)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-053 space in agency name"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = openUpdateForm();
        String actual = reopened.agencyName();

        // Restore a space-free name before asserting, so the shared fixture is left in a predictable
        // state whether this assertion passes or fails.
        String restored = AgencyDataFactory.uniqueAgencyName();
        reopened.clearAgencyName();
        reopened.setAgencyName(restored)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-053 restoring a space-free name"))
                .clickSendForApproval();

        Assert.assertEquals(actual, nameWithSpace,
                "The agency name should be redisplayed exactly as entered, space included. Existing records "
                        + "already store names containing a space (run-004 observed \"Test Egypt\"), so a "
                        + "rejection here is a defect rather than an undocumented character-set rule -- and "
                        + "would mean no agency whose name contains a space could be resubmitted at all.");
    }
}
