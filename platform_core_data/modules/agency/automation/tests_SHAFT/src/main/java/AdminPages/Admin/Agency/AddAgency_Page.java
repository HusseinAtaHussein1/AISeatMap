package AdminPages.Admin.Agency;

import AdminPages.Admin.Branch.Branch_Common;
import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import utilities.EnvironmentConfig;
import utilities.PrimeNgHelper;

import java.io.File;
import java.time.Duration;
import java.util.List;

import static AdminPages.Admin.Agency.AddAgency_Locators.*;
import static AdminPages.Admin.Agency.AgencyForm_Locators.*;

/**
 * Page Object for Admin &rarr; Agency &rarr; Add Agency.
 *
 * <p>Contains only page-specific UI interactions, state reads, synchronization and navigation for this
 * screen. Locators live in {@link AddAgency_Locators}; PrimeNG technical behaviour is delegated to
 * {@link PrimeNgHelper}; test data and the bulk provisioning flow live in {@code utilities.AgencyFixture}.
 *
 * <h2>Verified live and headless, read-only, 2026-08-18</h2>
 *
 * <p>The full 74-control inventory of this form was enumerated with zero non-GET requests issued
 * (evidence {@code addform_locator_verification_run004.json}). Notable, still-relevant facts:
 * Country is {@code readonly} and derives from the selected Branch; Branch/State/City/Invoice
 * generation are readonly inputs driven through their PrimeNG dropdown wrappers; the three phone
 * fields and the two {@code id-EmailID} fields are addressed positionally; the Product Access grid is
 * empty until a Branch is selected, because its rows are that Branch's own suppliers (PO-14 / BR-006).
 */
public class AddAgency_Page extends Branch_Common {

    /**
     * <b>REPAIR-AG-020 (2026-08-23, Stage 5H).</b> Widened from 15 to 30 seconds. Live timing evidence
     * across a full-suite execution (run-004, exec2) showed the fixture's Add Agency submission taking
     * ~9.6-10.9s on 3 of 5 attempts and ~20.6-21.1s on the other 2. Both failing attempts eventually
     * succeeded on Surefire's automatic rerun with no code change -- a legitimate synchronization
     * widening, not a tolerance for a broken operation.
     */
    private static final Duration SUBMIT_OUTCOME_TIMEOUT = Duration.ofSeconds(30);

    private final PrimeNgHelper prime;

    public AddAgency_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
        this.prime = new PrimeNgHelper(driver);
    }

    /**
     * Opens the blank Add Agency form. Unlike the Update screen this <em>is</em> reachable by URL: it
     * needs no record id, and the verification pass confirmed it renders fully (~500ms, no spinners).
     */
    public AddAgency_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.addAgencyUrl());
        waitFor(Duration.ofSeconds(40)).until(d -> prime.busyIndicatorCount() == 0 && prime.isVisible(AGENCY_NAME));
        return this;
    }

    // -- Individual field setters ---------------------------------------------------------------

    public AddAgency_Page setAgencyName(String value) {
        typeVia(AGENCY_NAME, value);
        return this;
    }

    public AddAgency_Page setPostOfficeBox(String value) {
        typeVia(POST_OFFICE_BOX, value);
        return this;
    }

    public AddAgency_Page setCompanyUrl(String value) {
        typeVia(COMPANY_URL, value);
        return this;
    }

    public AddAgency_Page setFaxNo(String value) {
        typeVia(FAX_NO, value);
        return this;
    }

    public AddAgency_Page setAddress1(String value) {
        typeVia(ADDRESS_1, value);
        return this;
    }

    public AddAgency_Page setAddress2(String value) {
        typeVia(ADDRESS_2, value);
        return this;
    }

    public AddAgency_Page setPhoneNoMaster(String value) {
        typeVia(PHONE_NO_MASTER, value);
        return this;
    }

    public AddAgency_Page setContactPerson(String value) {
        typeVia(CONTACT_PERSON, value);
        return this;
    }

    public AddAgency_Page setOwnerEmailId(String value) {
        typeVia(OWNER_EMAIL_ID, value);
        return this;
    }

    public AddAgency_Page setOwnerPhoneNumber(String value) {
        typeVia(OWNER_PHONE_NUMBER, value);
        return this;
    }

    public AddAgency_Page setSalesContactName(String value) {
        typeVia(SALES_CONTACT_NAME, value);
        return this;
    }

    public AddAgency_Page setSalesEmailId(String value) {
        typeVia(SALES_EMAIL_ID, value);
        return this;
    }

    public AddAgency_Page setSalesPhoneNumber(String value) {
        typeVia(SALES_PHONE_NUMBER, value);
        return this;
    }

    /** REPAIR-AG-011: real keystrokes, not {@code typeVia} -- see {@link PrimeNgHelper#typeRealKeystrokes}. */
    public AddAgency_Page setContractStartDate(String value) {
        prime.typeRealKeystrokes(CONTRACT_START_DATE, value);
        return this;
    }

    public AddAgency_Page setContractEndDate(String value) {
        prime.typeRealKeystrokes(CONTRACT_END_DATE, value);
        return this;
    }

    public AddAgency_Page setCreditLimit(String value) {
        typeVia(CREDIT_LIMIT, value);
        return this;
    }

    public AddAgency_Page setTopUpLimit(String value) {
        typeVia(TOP_UP_LIMIT, value);
        return this;
    }

    public AddAgency_Page setOutstandingThreshold(String value) {
        typeVia(OUTSTANDING_THRESHOLD, value);
        return this;
    }

    public AddAgency_Page setCreditTermsDays(String value) {
        typeVia(CREDIT_TERMS_DAYS, value);
        return this;
    }

    public AddAgency_Page setReachingPercentage(String value) {
        typeVia(REACHING_PERCENTAGE, value);
        return this;
    }

    public AddAgency_Page setWarningPromptDays(String value) {
        typeVia(WARNING_PROMPT_DAYS, value);
        return this;
    }

    public String country() {
        return valueOfInput(COUNTRY);
    }

    public boolean isCountryReadOnly() {
        return prime.isReadOnly(COUNTRY);
    }

    public boolean isAccountNumberPresent() {
        return prime.isPresent(ACCOUNT_NUMBER);
    }

    public boolean isBankNamePresent() {
        return prime.isPresent(BANK_NAME);
    }

    // -- Dropdowns and cascade ------------------------------------------------------------------

    /**
     * <b>REPAIR-AG-006 (2026-08-19, Stage 5H).</b> Does not use {@link PrimeNgHelper#selectFromDropdown}
     * because the Branch dropdown's option text is {@code "{Branch Name} ({Branch Code})"}, not the bare
     * name -- see {@link AddAgency_Locators#branchOption(String)}.
     */
    public AddAgency_Page selectBranch(String branchName) {
        By wrapper = PrimeNgHelper.dropdownWrapper(BRANCH_ID);
        prime.scrollIntoView(wrapper);
        clickVia(wrapper);
        By option = branchOption(branchName);
        waitFor(Duration.ofSeconds(8)).until(d -> prime.isVisible(option));
        clickVia(option);
        waitFor(Duration.ofSeconds(8)).until(
                d -> textOf(PrimeNgHelper.dropdownLabel(BRANCH_ID)).trim().startsWith(branchName + " ("));
        waitFor(Duration.ofSeconds(40)).until(d -> !valueOfInput(COUNTRY).isEmpty());
        return this;
    }

    public AddAgency_Page selectState(String visibleText) {
        prime.selectFromDropdown(STATE_ID, visibleText);
        return this;
    }

    public AddAgency_Page selectCity(String visibleText) {
        prime.selectFromDropdown(CITY_ID, visibleText);
        return this;
    }

    public AddAgency_Page selectInvoiceGeneration(String visibleText) {
        prime.selectFromDropdown(INVOICE_GENERATION_ID, visibleText);
        return this;
    }

    // -- Payment option -------------------------------------------------------------------------

    /**
     * Ticks one Payment option checkbox by its option name, e.g. {@code "Cash"}. FINDING-011: only
     * {@code Cash}, {@code Wallet} and {@code CreditCard} of the form's 29 checkboxes name a real payment
     * method; the rest are personal names, confirmed live and left untouched.
     */
    public AddAgency_Page tickPaymentOption(String optionName) {
        String optionId = "id-Paymentoption-" + optionName;
        prime.togglePrimeControl(optionId, PrimeNgHelper.checkboxWrapper(optionId));
        return this;
    }

    public int paymentOptionCount() {
        return prime.countOf(PAYMENT_OPTION_CHECKBOXES);
    }

    // -- Product Access -------------------------------------------------------------------------

    public int productAccessRowCount() {
        return prime.countOf(PRODUCT_ACCESS_ROWS);
    }

    /**
     * Ticks the first supplier row in the Product Access grid, satisfying
     * {@code "Please select at least one supplier."} Fails with an explicit precondition message when
     * the grid is empty -- an empty grid means the selected Branch carries no suppliers (PO-14 / BR-006),
     * not a defect in this form.
     */
    public AddAgency_Page tickFirstSupplierRow() {
        waitFor(Duration.ofSeconds(40)).until(d -> prime.countOf(PRODUCT_ACCESS_ROWS) > 0);
        List<WebElement> checkboxes = selenium().findElements(PRODUCT_ACCESS_ROW_CHECKBOXES);
        if (checkboxes.isEmpty()) {
            throw new IllegalStateException(
                    "The Product Access grid rendered " + productAccessRowCount() + " row(s) but no "
                            + "selectable supplier checkbox. \"Please select at least one supplier.\" is a "
                            + "mandatory rule on this form, so no Agency can be created until a supplier row "
                            + "can be ticked. The selected Branch must carry suppliers with credentials "
                            + "(PO-14 / BR-006) -- this is a fixture precondition, not a defect in Add Agency.");
        }
        // REPAIR-AG-007: a native checkbox, unlike the Branch grid's PrimeNG one -- clicked and verified
        // directly via the DOM `checked` property, no wrapper/box indirection needed or possible.
        boolean before = prime.readBooleanProperty(FIRST_ROW_CHECKBOX, "checked");
        clickVia(FIRST_ROW_CHECKBOX);
        try {
            waitFor(Duration.ofSeconds(8)).until(d -> prime.readBooleanProperty(FIRST_ROW_CHECKBOX, "checked") != before);
        } catch (TimeoutException stateNeverChanged) {
            throw new IllegalStateException(
                    "Clicked the first Product Access row's checkbox but its checked property stayed "
                            + before + " -- the click was accepted and had no effect (REPAIR-BR-010 "
                            + "no-op-click failure mode).");
        }
        return this;
    }

    // -- Uploads --------------------------------------------------------------------------------

    /**
     * Attaches a file to a hidden {@code input[type=file]} with {@code sendKeys}. Both file inputs are
     * verified present and not visible; the visible control is a styled wrapper whose click opens the
     * OS dialog, which no driver can complete.
     */
    private AddAgency_Page attach(By fileInput, String absolutePath) {
        File file = new File(absolutePath);
        if (!file.isFile()) {
            throw new IllegalArgumentException("Upload fixture not found: " + absolutePath);
        }
        List<WebElement> inputs = selenium().findElements(fileInput);
        if (inputs.isEmpty()) {
            throw new IllegalStateException("No file input found for locator " + fileInput);
        }
        inputs.get(0).sendKeys(file.getAbsolutePath());
        return this;
    }

    public AddAgency_Page attachDocument(String absolutePath) {
        return attach(DOCUMENT_FILE_INPUT, absolutePath);
    }

    public AddAgency_Page attachLogo(String absolutePath) {
        return attach(LOGO_FILE_INPUT, absolutePath);
    }

    // -- Submit ---------------------------------------------------------------------------------

    /**
     * Plain driver click, not {@code clickVia} -- see {@link PrimeNgHelper#clickNative}. Live inspection
     * confirmed "Send For Approval" is a genuine native {@code <button type="submit">}.
     */
    public AddAgency_Page clickSendForApproval() {
        prime.clickNative(SEND_FOR_APPROVAL_BUTTON);
        return this;
    }

    public AddAgency_Page clickCancel() {
        prime.scrollIntoView(CANCEL_BUTTON);
        clickVia(CANCEL_BUTTON);
        return this;
    }

    /** Every mandatory field Angular currently marks invalid -- see {@link PrimeNgHelper#stillInvalidMandatoryFields()}. */
    public List<String> stillInvalidMandatoryFields() {
        return prime.stillInvalidMandatoryFields();
    }

    /** Rendered validation messages on the form, whichever field they belong to. */
    public List<String> submissionMessages() {
        return visibleTextsOf(AgencyForm_Locators.ANY_VALIDATION_MESSAGE);
    }

    /** True while the browser is still on the Add Agency URL -- i.e. submission was blocked. */
    public boolean submissionBlocked() {
        return driver.browser().getCurrentURL().contains(EnvironmentConfig.addAgencyPath());
    }

    /**
     * Whether the just-submitted Agency was actually saved: either the browser navigated away from the
     * Add Agency URL, or -- if it did navigate -- an immediate name search confirms the record exists
     * (REPAIR-AG-013: navigation away is not proof of a successful save; a create call can 400 after the
     * browser has already been sent to the list, with no client-side error shown). Bounded and polled
     * (REPAIR-001): reading either signal immediately after the click observes the pre-navigation state.
     *
     * @param agencyName the exact name just submitted, so a navigated-but-not-saved outcome is caught
     *                    here instead of surfacing several lookup attempts later (REPAIR-AG-013)
     */
    public boolean submissionSucceeded(String agencyName) {
        boolean navigatedAway;
        try {
            navigatedAway = new WebDriverWait(driver.getDriver(), SUBMIT_OUTCOME_TIMEOUT)
                    .until(d -> !driver.browser().getCurrentURL().contains(EnvironmentConfig.addAgencyPath()));
        } catch (TimeoutException notObserved) {
            navigatedAway = false;
        }

        if (!navigatedAway) {
            System.out.println("[PROVISION] still on " + driver.browser().getCurrentURL());
            System.out.println("[PROVISION] validation messages = " + submissionMessages());
            System.out.println("[PROVISION] still-invalid mandatory fields = " + stillInvalidMandatoryFields());
            System.out.println("[PROVISION] productAccessRows = " + productAccessRowCount());
            return false;
        }

        SearchAgency_Page searchAgencyPage = new SearchAgency_Page(driver);
        searchAgencyPage.open().searchByName(agencyName);
        boolean succeeded = searchAgencyPage.isAgencyNamePresent(agencyName);
        if (succeeded) {
            System.out.println("[PROVISION] submission navigated to " + driver.browser().getCurrentURL()
                    + " and an immediate name search confirmed the record exists.");
        } else {
            System.out.println("[PROVISION] navigated to " + driver.browser().getCurrentURL()
                    + " but an immediate name search found no record for \"" + agencyName + "\" -- "
                    + "treating as a failed submission the app did not report client-side (REPAIR-AG-013).");
        }
        return succeeded;
    }
}
