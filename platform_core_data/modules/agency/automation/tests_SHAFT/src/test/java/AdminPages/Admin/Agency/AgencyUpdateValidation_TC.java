package AdminPages.Admin.Agency;

import org.testng.Assert;
import org.testng.annotations.Test;
import utilities.AgencyDataFactory;

import java.util.List;

/**
 * Agency Update &mdash; Validation. Covers TC-AGENCY-002, 021 and 037.
 *
 * <h2>The expected message is {@code Required}, and that is a decision, not a shortcut</h2>
 *
 * <p>US-4222 specifies per-field messages such as <i>"Please enter a valid Agency Name."</i>. The
 * application renders the platform-wide {@code Required} instead -- capital {@code R}, no full stop --
 * confirmed by run-004 across <b>23</b> instances on an empty create form, and traced to PRD XC-17
 * (FINDING-001). Project Context §1.1 disposes the story's wording as outdated, so these tests assert the
 * observed string.
 *
 * <p><b>A per-field message appearing instead is a finding to report, not a pass.</b> The assertions
 * below therefore check for {@code Required} exactly, and their failure messages say what a different
 * string would mean, so Stage 5A does not have to guess.
 *
 * <p><b>Nothing here submits</b> except TC-AGENCY-037, which submits deliberately and expects to be
 * blocked. Two of the three cases are safe on any agency and their original 2026-08-02 review approval
 * still stands.
 */
public class AgencyUpdateValidation_TC extends AgencyTestBase {

    /** The one message string this application actually renders for an empty mandatory field. */
    private static final String REQUIRED_MESSAGE = "Required";

    /**
     * TC-AGENCY-002 &mdash; Mandatory Agency Master fields block submission when cleared.
     *
     * <p>The suite clears six fields one at a time, restoring each before the next. This test covers the
     * three that are plain text inputs on the Update form -- {@code Agency}, {@code Post office box} and
     * the first {@code Address} -- plus {@code Phone No}.
     *
     * <p><b>{@code State} and {@code City} are deliberately not cleared here.</b> Both are PrimeNG
     * dropdowns with no clear affordance: there is no verified way to return one to an empty state
     * without inventing an interaction, and a test that cannot perform its own step honestly should not
     * pretend to. Those two are reported as a partial-coverage gap in the Automation Coverage Report
     * rather than silently dropped or faked.
     */
    @Test(priority = 60, description = "TC-AGENCY-002 Mandatory Agency Master fields block submission when cleared")
    public void tc002_mandatoryAgencyMasterFieldsShowRequired() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        assertClearingShowsRequired(form, "Agency", form.agencyName(),
                () -> form.clearAgencyName(), form::agencyNameValidationShown,
                form::agencyNameValidationMessages, value -> form.setAgencyName(value));

        // Post office box and Address 1 have no field-scoped accessor of their own, so the form-wide
        // message set is used and the field is restored immediately afterwards.
        String originalPostOfficeBox = form.postOfficeBox();
        form.setPostOfficeBox("");
        Assert.assertTrue(form.validationErrorShown(),
                "Clearing Post office box should render a validation message. Expected the platform-wide \""
                        + REQUIRED_MESSAGE + "\" (FINDING-001, PRD XC-17); none appeared at all.");
        assertMessagesAreRequired("Post office box", form.validationErrorMessages());
        form.setPostOfficeBox(originalPostOfficeBox);

        String originalAddress1 = form.address1();
        form.setAddress1("");
        Assert.assertTrue(form.validationErrorShown(),
                "Clearing the first Address field should render a validation message; none appeared.");
        assertMessagesAreRequired("Address", form.validationErrorMessages());
        form.setAddress1(originalAddress1);

        String originalPhone = form.phoneNoMaster();
        form.setPhoneNoMaster("");
        Assert.assertTrue(form.validationErrorShown(),
                "Clearing Phone No should render a validation message; none appeared.");
        assertMessagesAreRequired("Phone No", form.validationErrorMessages());
        form.setPhoneNoMaster(originalPhone);
    }

    /**
     * TC-AGENCY-021 &mdash; Contract dates block submission when cleared.
     *
     * <p>Nothing is submitted, so this case is safe on any agency.
     */
    @Test(priority = 70, description = "TC-AGENCY-021 Contract dates block submission when cleared")
    public void tc021_contractDatesShowRequiredWhenCleared() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        String originalStart = form.contractStartDate();
        form.setContractStartDate("");
        Assert.assertTrue(form.validationErrorShown(),
                "Clearing Contract Start Date should render \"" + REQUIRED_MESSAGE
                        + "\" beneath the field; no validation message appeared.");
        assertMessagesAreRequired("Contract Start Date", form.validationErrorMessages());
        form.setContractStartDate(originalStart);

        String originalEnd = form.contractEndDate();
        form.setContractEndDate("");
        Assert.assertTrue(form.validationErrorShown(),
                "Clearing Contract End Date should render \"" + REQUIRED_MESSAGE
                        + "\" beneath the field; no validation message appeared.");
        assertMessagesAreRequired("Contract End Date", form.validationErrorMessages());
        form.setContractEndDate(originalEnd);
    }

    /**
     * TC-AGENCY-037 &mdash; Payment option blocks submission when none is selected.
     *
     * <p><b>The assertion names the behaviour, not a literal string, and that is the suite's own
     * instruction.</b> run-004 measured {@code Required} for 23 empty mandatory fields, but the Payment
     * option <em>group</em> was not one of them -- so asserting that exact text here would be asserting an
     * unverified literal. This test therefore requires that a validation message appears and that
     * submission is blocked, and <b>prints the exact text observed</b> so Stage 5A can record it.
     *
     * <p>It must not be confused with {@code "Please select at least one supplier."}, which belongs to
     * Product Access. That string is checked for explicitly and rejected as the wrong message.
     */
    @Test(priority = 80, description = "TC-AGENCY-037 Payment option blocks submission when none is selected")
    public void tc037_paymentOptionRequiredWhenNoneSelected() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        boolean cashWasChecked = form.isPaymentOptionCashChecked();
        boolean walletWasChecked = form.isPaymentOptionWalletChecked();
        boolean creditCardWasChecked = form.isPaymentOptionCreditCardChecked();
        System.out.println("[TC-037] payment options before: cash=" + cashWasChecked + " wallet="
                + walletWasChecked + " creditCard=" + creditCardWasChecked);

        if (cashWasChecked) {
            form.togglePaymentOptionCash();
        }
        if (walletWasChecked) {
            form.togglePaymentOptionWallet();
        }
        if (creditCardWasChecked) {
            form.togglePaymentOptionCreditCard();
        }

        form.setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-037 no payment option selected"))
                .clickSendForApproval();

        List<String> messages = form.validationErrorMessages();
        System.out.println("[TC-037] observed validation messages = " + messages);

        boolean blocked = form.isStillOnUpdateScreen();
        boolean messageShown = !messages.isEmpty();

        // Restore whatever was selected before, so no later case inherits an agency with no payment
        // option -- which would make its own submission fail for this case's reason.
        UpdateAgency_Page restore = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);
        if (cashWasChecked && !restore.isPaymentOptionCashChecked()) {
            restore.togglePaymentOptionCash();
        }
        if (walletWasChecked && !restore.isPaymentOptionWalletChecked()) {
            restore.togglePaymentOptionWallet();
        }
        if (creditCardWasChecked && !restore.isPaymentOptionCreditCardChecked()) {
            restore.togglePaymentOptionCreditCard();
        }
        restore.setRemarks(AgencyDataFactory.uniqueRemarks("TC-AGENCY-037 restoring payment options"))
                .clickSendForApproval();

        Assert.assertTrue(messageShown,
                "Submitting with no Payment option selected should render a validation message against the "
                        + "Payment option group; none appeared. The application marks \"Payment option *\" "
                        + "mandatory, so no message means the rule is not enforced on this form.");
        Assert.assertFalse(messages.contains("Please select at least one supplier."),
                "The message rendered was \"Please select at least one supplier.\", which belongs to Product "
                        + "Access, not to Payment option. A Payment option violation reporting the supplier "
                        + "message is a defect in the validation wiring -- record it as such.");
        Assert.assertTrue(blocked,
                "The agency should not have been submitted with no Payment option selected, but the browser "
                        + "left the Update screen. Observed messages: " + messages);
    }

    // -- helpers --------------------------------------------------------------------------------

    private void assertClearingShowsRequired(UpdateAgency_Page form,
                                             String fieldLabel,
                                             String originalValue,
                                             Runnable clear,
                                             java.util.function.BooleanSupplier messageShown,
                                             java.util.function.Supplier<List<String>> messages,
                                             java.util.function.Consumer<String> restore) {
        clear.run();
        boolean shown = messageShown.getAsBoolean();
        List<String> observed = messages.get();
        restore.accept(originalValue);

        Assert.assertTrue(shown,
                "Clearing " + fieldLabel + " should render \"" + REQUIRED_MESSAGE
                        + "\" beneath the field (FINDING-001, PRD XC-17); no field-scoped validation message "
                        + "appeared at all.");
        assertMessagesAreRequired(fieldLabel, observed);
    }

    /**
     * Requires at least one rendered message to be exactly {@code Required}. A different string is a
     * finding, so the failure message says so rather than reporting a bare mismatch.
     */
    private void assertMessagesAreRequired(String fieldLabel, List<String> observed) {
        boolean sawRequired = false;
        for (String message : observed) {
            if (REQUIRED_MESSAGE.equals(message.trim())) {
                sawRequired = true;
                break;
            }
        }
        Assert.assertTrue(sawRequired,
                "Expected the platform-wide message \"" + REQUIRED_MESSAGE + "\" for the empty " + fieldLabel
                        + " field, but observed " + observed + ". US-4222's per-field wording (for example "
                        + "\"Please enter a valid Agency Name.\") is outdated specification -- run-004 measured "
                        + "\"" + REQUIRED_MESSAGE + "\" across 23 instances. If a per-field message really is "
                        + "rendered now, that is a change to report as a finding, not a passing result.");
    }
}
