package AdminPages.Admin.Agency;

import org.testng.Assert;
import org.testng.annotations.Test;
import utilities.AgencyDataFactory;
import utilities.AgencyFixture;

import java.util.List;

/**
 * Agency Update &mdash; Documents &amp; Logo. Covers TC-AGENCY-016, 020, 022 and 023.
 *
 * <h2>Two of these cases are expected to fail, and that failure is the deliverable</h2>
 *
 * <p>The Stage 3 suite is explicit (disposition row 5): the AC-3 / AC-4 upload cases assert the
 * <b>requirement</b> rather than observed behaviour, and are expected to fail. TC-AGENCY-020 in
 * particular notes that with <em>no {@code accept} attribute on the input at all</em> -- confirmed by
 * run-004 -- the likeliest outcome is that both a real PDF and a fake one are accepted.
 *
 * <p><b>These assertions must not be weakened to make the suite green.</b> An upload that should be
 * rejected and is not is a finding; softening the assertion to "record what happens" would delete the
 * finding and leave a test that can never fail. The failure messages below state what the observed
 * behaviour means, so Stage 5A records a defect rather than a broken test.
 */
public class AgencyDocumentsAndLogo_TC extends AgencyTestBase {

    /**
     * TC-AGENCY-016 &mdash; Upload a valid PDF document with contract dates.
     *
     * <p>The filename-display assertion rests on an <b>unverified locator</b>: no file was uploaded
     * during live verification, because doing so would have mutated a record this run did not create.
     * It is disclosed as unverified in the Selector Verification Report. It is anchored on rendered,
     * visible text containing the fixture's own filename -- never on page source, which would make the
     * assertion unfalsifiable.
     */
    @Test(priority = 90, description = "TC-AGENCY-016 Upload a valid PDF document with contract dates")
    public void tc016_uploadValidPdfWithContractDates() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        String startDate = "01/01/2026";
        String endDate = "31/12/2027";

        form.attachDocument(AgencyFixture.validDocumentPath())
                .setContractStartDate(startDate)
                .setContractEndDate(endDate)
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-016 valid PDF upload"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);
        List<String> displayedNames = reopened.uploadedFileNames();
        System.out.println("[TC-016] displayed uploaded-file labels = " + displayedNames);

        Assert.assertEquals(reopened.contractStartDate(), startDate,
                "Contract Start Date should persist the value entered by TC-AGENCY-016.");
        Assert.assertEquals(reopened.contractEndDate(), endDate,
                "Contract End Date should persist the value entered by TC-AGENCY-016.");
        Assert.assertTrue(reopened.isFileNameDisplayed("AgencyContract_Doc1_valid"),
                "The uploaded document's file name should be displayed in the Upload Document section after "
                        + "reopening the agency. Observed labels: " + displayedNames + ". Note that this "
                        + "locator is disclosed as UNVERIFIED -- no upload could be performed during "
                        + "read-only selector verification -- so if the file really was stored, this is a "
                        + "locator to repair in Stage 5H rather than an application defect.");
    }

    /**
     * TC-AGENCY-020 &mdash; File named {@code .pdf} with non-PDF content.
     *
     * <p><b>Disabled 2026-08-20 by explicit operator direction: this is confirmed system behaviour, not
     * a defect.</b> The operator reviewed this finding (document content is accepted without inspecting
     * it against the declared file type) and determined it is intended, not a bug -- so the assertion
     * that content is rejected is simply wrong for this application and is not weakened, it is retired.
     *
     * <p><b>Stage 3 follow-up, not yet done:</b> {@code TestCases_Agency.md}'s TC-AGENCY-020 / AC-3 still
     * documents rejection as the expected result. This automation change corrects the automation only --
     * the Manual Test Suite is a Stage 3 artifact this stage has no write access to (self-healing-skill
     * §17) and should be updated separately to match the operator's confirmation, so the two do not drift
     * apart silently.
     */
    @Test(priority = 100, description = "TC-AGENCY-020 File named .pdf with non-PDF content is rejected",
            enabled = false)
    public void tc020_fakePdfExtensionIsRejected() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        form.attachDocument(AgencyFixture.fakeExtensionDocumentPath())
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-020 fake .pdf content"))
                .clickSendForApproval();

        List<String> messages = form.validationErrorMessages();
        boolean blocked = form.isStillOnUpdateScreen();
        System.out.println("[TC-020] acceptAttribute=\"" + form.documentAcceptAttribute()
                + "\" blocked=" + blocked + " messages=" + messages);

        Assert.assertTrue(blocked && !messages.isEmpty(),
                "A file named .pdf whose content is plain text with no %PDF header should be rejected with a "
                        + "message about the file format. Observed: blocked=" + blocked + ", messages="
                        + messages + ", accept attribute=\"" + form.documentAcceptAttribute() + "\". "
                        + "If it was accepted, document validation does not inspect content -- report that as "
                        + "a finding. THIS ASSERTION MUST NOT BE WEAKENED to make the suite pass: the Stage 3 "
                        + "suite records this case as asserting the requirement (AC-3), and its failure is the "
                        + "finding it exists to produce.");
    }

    /**
     * TC-AGENCY-022 &mdash; Upload a valid agency logo.
     *
     * <p>AC-4 requires the logo be displayed for review <em>before</em> final submission, so the preview
     * is checked at that point as well as after reopening -- the suite's step 3. The preview locator is
     * also disclosed as unverified, for the same reason as TC-AGENCY-016's.
     */
    @Test(priority = 110, description = "TC-AGENCY-022 Upload a valid agency logo")
    public void tc022_uploadValidLogo() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        form.attachLogo(AgencyFixture.validLogoPath());

        boolean previewBeforeSubmission = form.isLogoPreviewVisible();
        System.out.println("[TC-022] logo preview visible before submission = " + previewBeforeSubmission);

        form.setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-022 valid logo upload"))
                .clickSendForApproval();

        UpdateAgency_Page reopened = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);
        boolean previewAfterReopen = reopened.isLogoPreviewVisible();
        System.out.println("[TC-022] logo preview visible after reopening = " + previewAfterReopen);

        Assert.assertTrue(previewBeforeSubmission,
                "AC-4 requires the uploaded logo be displayed for review before final submission, but no "
                        + "logo preview was visible after attaching the file. Note the preview locator is "
                        + "disclosed as UNVERIFIED.");
        Assert.assertTrue(previewAfterReopen,
                "The uploaded logo should be displayed in the Agency Logo section after reopening the "
                        + "agency; no preview was visible.");
    }

    /**
     * TC-AGENCY-023 &mdash; Logo larger than 2 MB is rejected.
     *
     * <p>The fixture is a genuine, uncorrupted PNG made incompressible on purpose -- its padding is random
     * bytes -- so a rejection can only be about size, never about the file being malformed.
     *
     * <p><b>The 2 MB threshold is story-sourced and never verified</b> (Project Context ASM-009). The
     * observed behaviour is printed so that, if a different threshold is enforced, Stage 5A records the
     * real one instead of this test silently encoding an assumption as fact.
     */
    @Test(priority = 120, description = "TC-AGENCY-023 Logo larger than 2 MB is rejected")
    public void tc023_oversizeLogoIsRejected() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        form.attachLogo(AgencyFixture.oversizeLogoPath())
                .setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-023 oversize logo"))
                .clickSendForApproval();

        List<String> messages = form.validationErrorMessages();
        boolean blocked = form.isStillOnUpdateScreen();
        System.out.println("[TC-023] oversize logo (~3.16 MB) blocked=" + blocked + " messages=" + messages);

        Assert.assertTrue(blocked && !messages.isEmpty(),
                "A ~3.16 MB logo should be rejected with a validation message, and the agency should not be "
                        + "saved with it. Observed: blocked=" + blocked + ", messages=" + messages + ". The "
                        + "2 MB limit comes from US-4222 and is recorded as never verified (ASM-009) -- if a "
                        + "different threshold is enforced, record the observed one rather than assuming this "
                        + "test is wrong. The fixture is a structurally valid PNG padded with random bytes, "
                        + "so a rejection cannot be about corruption.");
    }
}
