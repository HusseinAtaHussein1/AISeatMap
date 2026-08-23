package AdminPages.Admin.Agency;

import AdminPages.Admin.Branch.Branch_Common;
import com.shaft.driver.SHAFT;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import utilities.EnvironmentConfig;
import utilities.PrimeNgHelper;

import java.io.File;
import java.time.Duration;
import java.util.List;

import static AdminPages.Admin.Agency.UpdateAgency_Locators.*;
import static AdminPages.Admin.Agency.AgencyForm_Locators.*;

/**
 * Page Object for Admin &rarr; Agency &rarr; Update Agency (US-4222), reached by clicking a row's edit
 * pen on the Agency list. Locators live in {@link UpdateAgency_Locators}; PrimeNG technical behaviour is
 * delegated to {@link PrimeNgHelper}.
 *
 * <h2>Four verified facts that drive this class's design</h2>
 *
 * <ol>
 *   <li><b>There is no constructor that navigates by URL, deliberately.</b> A direct visit to
 *       {@code /admin/agency/edit/{id}} renders an empty shell -- locators still resolve, values are
 *       blank. Entry is via {@link SearchAgency_Page#clickEditPen(String)} (REPAIR-004).
 *   <li><b>Readiness is spinner-clear plus field-visible, never field-populated.</b> See
 *       {@link #waitUntilLoaded()} / {@link PrimeNgHelper#waitUntilFormSettled}.
 *   <li><b>Branch is display-only on this screen</b> -- {@code readonly}, {@code disabled} and not
 *       visible. {@link #branchFieldIsEditable()} asserts that rather than assuming it.
 *   <li><b>Three ids repeat and four are malformed</b>, so positional and attribute addressing are used
 *       where a CSS id selector cannot express the real id.
 * </ol>
 *
 * <p><b>The PCC section is conditional</b> (FINDING-008): it renders only when the agency's parent
 * Branch carries suppliers with credentials. {@link #isPccSectionPresent()} returns a fact instead of
 * throwing.
 */
public class UpdateAgency_Page extends Branch_Common {

    private static final Duration LOAD_TIMEOUT = Duration.ofSeconds(40);
    /** REPAIR-AG-016: calibrated against this suite's own minimally-populated fixture Agency. */
    private static final int MIN_VISIBLE_INPUTS = 20;

    private final PrimeNgHelper prime;

    public UpdateAgency_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
        this.prime = new PrimeNgHelper(driver);
    }

    /**
     * Confirms the form has settled and that this really is the Update Agency screen rather than the
     * empty shell a deep link produces.
     */
    public UpdateAgency_Page waitUntilLoaded() {
        prime.waitUntilFormSettled(LOAD_TIMEOUT, MIN_VISIBLE_INPUTS);
        if (!prime.isVisible(AGENCY_NAME)) {
            throw new IllegalStateException(
                    "The Update Agency form settled but the Agency Name field is not visible. This is the "
                            + "empty-shell state a direct visit to " + EnvironmentConfig.editAgencyPath()
                            + "/{id} produces (REPAIR-004): locators resolve, values are blank. Reach this "
                            + "screen through SearchAgency_Page.clickEditPen(agencyCode) instead.");
        }
        return this;
    }

    // -- Reads ----------------------------------------------------------------------------------

    public String branch() {
        return valueOfInput(BRANCH);
    }

    public String agencyName() {
        return valueOfInput(AGENCY_NAME);
    }

    public String country() {
        return valueOfInput(COUNTRY);
    }

    public String state() {
        return textOf(PrimeNgHelper.dropdownLabel(STATE_ID));
    }

    public String city() {
        return textOf(PrimeNgHelper.dropdownLabel(CITY_ID));
    }

    public String postOfficeBox() {
        return valueOfInput(POST_OFFICE_BOX);
    }

    public String companyUrl() {
        return valueOfInput(COMPANY_URL);
    }

    public String faxNo() {
        return valueOfInput(FAX_NO);
    }

    public String address1() {
        return valueOfInput(ADDRESS_1);
    }

    public String address2() {
        return valueOfInput(ADDRESS_2);
    }

    public String phoneNoMaster() {
        return valueOfInput(PHONE_NO_MASTER);
    }

    public String contactPerson() {
        return valueOfInput(CONTACT_PERSON);
    }

    public String ownerEmailId() {
        return valueOfInput(OWNER_EMAIL_ID);
    }

    public String ownerPhoneNumber() {
        return valueOfInput(OWNER_PHONE_NUMBER);
    }

    public String salesContactName() {
        return valueOfInput(SALES_CONTACT_NAME);
    }

    public String salesEmailId() {
        return valueOfInput(SALES_EMAIL_ID);
    }

    public String salesPhoneNumber() {
        return valueOfInput(SALES_PHONE_NUMBER);
    }

    public String contractStartDate() {
        return valueOfInput(CONTRACT_START_DATE);
    }

    public String contractEndDate() {
        return valueOfInput(CONTRACT_END_DATE);
    }

    public String creditLimit() {
        return valueOfInput(CREDIT_LIMIT);
    }

    public String topUpLimit() {
        return valueOfInput(TOP_UP_LIMIT);
    }

    public String outstandingThreshold() {
        return valueOfInput(OUTSTANDING_THRESHOLD);
    }

    public String creditTermsDays() {
        return valueOfInput(CREDIT_TERMS_DAYS);
    }

    public String reachingPercentage() {
        return valueOfInput(REACHING_PERCENTAGE);
    }

    public String warningPromptDays() {
        return valueOfInput(WARNING_PROMPT_DAYS);
    }

    public String invoiceGeneration() {
        return textOf(PrimeNgHelper.dropdownLabel(INVOICE_GENERATION_ID));
    }

    public String remarks() {
        return valueOfInput(REMARKS);
    }

    // -- Read-only / editability assertions ----------------------------------------------------

    public boolean branchFieldIsEditable() {
        return prime.isVisible(BRANCH) && !prime.isReadOnly(BRANCH) && !prime.isDisabledAttribute(BRANCH);
    }

    public boolean isCountryReadOnly() {
        return prime.isReadOnly(COUNTRY);
    }

    public boolean isAgencyNameReadOnly() {
        return prime.isReadOnly(AGENCY_NAME);
    }

    // -- Edits ----------------------------------------------------------------------------------

    public UpdateAgency_Page setAgencyName(String value) {
        typeVia(AGENCY_NAME, value);
        return this;
    }

    public UpdateAgency_Page setPostOfficeBox(String value) {
        typeVia(POST_OFFICE_BOX, value);
        return this;
    }

    public UpdateAgency_Page setCompanyUrl(String value) {
        typeVia(COMPANY_URL, value);
        return this;
    }

    public UpdateAgency_Page setFaxNo(String value) {
        typeVia(FAX_NO, value);
        return this;
    }

    public UpdateAgency_Page setAddress1(String value) {
        typeVia(ADDRESS_1, value);
        return this;
    }

    public UpdateAgency_Page setAddress2(String value) {
        typeVia(ADDRESS_2, value);
        return this;
    }

    public UpdateAgency_Page setPhoneNoMaster(String value) {
        typeVia(PHONE_NO_MASTER, value);
        return this;
    }

    public UpdateAgency_Page setContactPerson(String value) {
        typeVia(CONTACT_PERSON, value);
        return this;
    }

    public UpdateAgency_Page setOwnerEmailId(String value) {
        typeVia(OWNER_EMAIL_ID, value);
        return this;
    }

    public UpdateAgency_Page setOwnerPhoneNumber(String value) {
        typeVia(OWNER_PHONE_NUMBER, value);
        return this;
    }

    public UpdateAgency_Page setSalesContactName(String value) {
        typeVia(SALES_CONTACT_NAME, value);
        return this;
    }

    public UpdateAgency_Page setSalesEmailId(String value) {
        typeVia(SALES_EMAIL_ID, value);
        return this;
    }

    public UpdateAgency_Page setSalesPhoneNumber(String value) {
        typeVia(SALES_PHONE_NUMBER, value);
        return this;
    }

    public UpdateAgency_Page setCreditLimit(String value) {
        typeVia(CREDIT_LIMIT, value);
        return this;
    }

    public UpdateAgency_Page setTopUpLimit(String value) {
        typeVia(TOP_UP_LIMIT, value);
        return this;
    }

    public UpdateAgency_Page setOutstandingThreshold(String value) {
        typeVia(OUTSTANDING_THRESHOLD, value);
        return this;
    }

    public UpdateAgency_Page setCreditTermsDays(String value) {
        typeVia(CREDIT_TERMS_DAYS, value);
        return this;
    }

    public UpdateAgency_Page setReachingPercentage(String value) {
        typeVia(REACHING_PERCENTAGE, value);
        return this;
    }

    public UpdateAgency_Page setWarningPromptDays(String value) {
        typeVia(WARNING_PROMPT_DAYS, value);
        return this;
    }

    public UpdateAgency_Page setContractStartDate(String value) {
        prime.typeRealKeystrokes(CONTRACT_START_DATE, value);
        return this;
    }

    public UpdateAgency_Page setContractEndDate(String value) {
        prime.typeRealKeystrokes(CONTRACT_END_DATE, value);
        return this;
    }

    public UpdateAgency_Page setRemarks(String value) {
        typeVia(REMARKS, value);
        return this;
    }

    /**
     * Empties a field via Selenium's {@code clear()} rather than typing an empty string -- typing ""
     * is not a reliable way to empty an input.
     */
    private UpdateAgency_Page clearField(org.openqa.selenium.By locator) {
        List<WebElement> elements = selenium().findElements(locator);
        if (!elements.isEmpty()) {
            elements.get(0).clear();
            typeVia(locator, "");
        }
        return this;
    }

    public UpdateAgency_Page clearAgencyName() {
        return clearField(AGENCY_NAME);
    }

    public UpdateAgency_Page clearContactPerson() {
        return clearField(CONTACT_PERSON);
    }

    public UpdateAgency_Page clearOwnerEmailId() {
        return clearField(OWNER_EMAIL_ID);
    }

    public UpdateAgency_Page clearRemarks() {
        return clearField(REMARKS);
    }

    // -- Dropdowns ------------------------------------------------------------------------------

    public UpdateAgency_Page selectState(String visibleText) {
        prime.selectFromDropdown(STATE_ID, visibleText);
        return this;
    }

    public UpdateAgency_Page selectCity(String visibleText) {
        prime.selectFromDropdown(CITY_ID, visibleText);
        return this;
    }

    public UpdateAgency_Page selectInvoiceGeneration(String visibleText) {
        prime.selectFromDropdown(INVOICE_GENERATION_ID, visibleText);
        return this;
    }

    // -- Checkboxes and radio buttons ----------------------------------------------------------

    public UpdateAgency_Page toggleCreditAgency() {
        prime.togglePrimeControl(CREDIT_AGENCY_ID, PrimeNgHelper.checkboxWrapper(CREDIT_AGENCY_ID));
        return this;
    }

    public boolean isCreditAgencyChecked() {
        return prime.isPrimeControlChecked(CREDIT_AGENCY_ID);
    }

    public UpdateAgency_Page togglePaymentOptionCash() {
        prime.togglePrimeControl(PAY_CASH_ID, PrimeNgHelper.checkboxWrapper(PAY_CASH_ID));
        return this;
    }

    public UpdateAgency_Page togglePaymentOptionWallet() {
        prime.togglePrimeControl(PAY_WALLET_ID, PrimeNgHelper.checkboxWrapper(PAY_WALLET_ID));
        return this;
    }

    public UpdateAgency_Page togglePaymentOptionCreditCard() {
        prime.togglePrimeControl(PAY_CREDIT_CARD_ID, PrimeNgHelper.checkboxWrapper(PAY_CREDIT_CARD_ID));
        return this;
    }

    public boolean isPaymentOptionCashChecked() {
        return prime.isPrimeControlChecked(PAY_CASH_ID);
    }

    public boolean isPaymentOptionWalletChecked() {
        return prime.isPrimeControlChecked(PAY_WALLET_ID);
    }

    public boolean isPaymentOptionCreditCardChecked() {
        return prime.isPrimeControlChecked(PAY_CREDIT_CARD_ID);
    }

    public UpdateAgency_Page toggleProductFlight() {
        prime.togglePrimeControl(PRODUCT_FLIGHT_ID, PrimeNgHelper.checkboxWrapper(PRODUCT_FLIGHT_ID));
        return this;
    }

    public boolean isProductFlightChecked() {
        return prime.isPrimeControlChecked(PRODUCT_FLIGHT_ID);
    }

    public boolean isProductOthersChecked() {
        return prime.isPrimeControlChecked(PRODUCT_OTHERS_ID);
    }

    public UpdateAgency_Page toggleImportPnrOption() {
        prime.togglePrimeControl(IMPORT_PNR_ID, PrimeNgHelper.checkboxWrapper(IMPORT_PNR_ID));
        return this;
    }

    public boolean isImportPnrOptionChecked() {
        return prime.isPrimeControlChecked(IMPORT_PNR_ID);
    }

    public UpdateAgency_Page selectBusinessTypeB2B() {
        prime.togglePrimeControl(BUSINESS_TYPE_B2B_ID, PrimeNgHelper.radioWrapper(BUSINESS_TYPE_B2B_ID));
        return this;
    }

    public UpdateAgency_Page selectBusinessTypeFreelancer() {
        prime.togglePrimeControl(BUSINESS_TYPE_FREELANCER_ID, PrimeNgHelper.radioWrapper(BUSINESS_TYPE_FREELANCER_ID));
        return this;
    }

    public boolean isBusinessTypeB2BSelected() {
        return prime.isPrimeControlChecked(BUSINESS_TYPE_B2B_ID);
    }

    public boolean isBusinessTypeFreelancerSelected() {
        return prime.isPrimeControlChecked(BUSINESS_TYPE_FREELANCER_ID);
    }

    public boolean isIataAgencyNoSelected() {
        return prime.isPrimeControlChecked(IATA_AGENCY_NO_ID);
    }

    // -- Product access table ------------------------------------------------------------------

    public boolean isProductAccessTablePresent() {
        return prime.isPresent(PRODUCT_ACCESS_TABLE);
    }

    public int productAccessRowCount() {
        return prime.countOf(PRODUCT_ACCESS_ROWS);
    }

    // -- Uploads --------------------------------------------------------------------------------

    private UpdateAgency_Page attach(org.openqa.selenium.By fileInput, String absolutePath) {
        File file = new File(absolutePath);
        if (!file.isFile()) {
            throw new IllegalArgumentException(
                    "Upload fixture not found: " + absolutePath + ". The test data files under "
                            + "src/test/resources/testDataFiles/agency/uploads/ must exist before an upload "
                            + "test runs.");
        }
        List<WebElement> inputs = selenium().findElements(fileInput);
        if (inputs.isEmpty()) {
            throw new IllegalStateException("No file input found for locator " + fileInput);
        }
        inputs.get(0).sendKeys(file.getAbsolutePath());
        return this;
    }

    public UpdateAgency_Page attachDocument(String absolutePath) {
        return attach(DOCUMENT_FILE_INPUT, absolutePath);
    }

    public UpdateAgency_Page attachLogo(String absolutePath) {
        return attach(LOGO_FILE_INPUT, absolutePath);
    }

    public String documentAcceptAttribute() {
        return attributeOf(DOCUMENT_FILE_INPUT, "accept");
    }

    public String logoAcceptAttribute() {
        return attributeOf(LOGO_FILE_INPUT, "accept");
    }

    private String attributeOf(org.openqa.selenium.By locator, String attribute) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            if (elements.isEmpty()) {
                return "";
            }
            String value = elements.get(0).getAttribute(attribute);
            return value == null ? "" : value;
        });
    }

    /** Used by TC-AGENCY-016, which asserts the uploaded document's name is displayed after reopening. */
    public List<String> uploadedFileNames() {
        return visibleTextsOf(UPLOADED_FILE_NAMES);
    }

    public boolean isFileNameDisplayed(String fileName) {
        for (String displayed : uploadedFileNames()) {
            if (displayed.contains(fileName)) {
                return true;
            }
        }
        return false;
    }

    /** AC-4 requires the logo be shown for review. */
    public boolean isLogoPreviewVisible() {
        return prime.isVisible(LOGO_PREVIEW);
    }

    // -- Airline Supplier credentials (PCC) ----------------------------------------------------

    public boolean isPccSectionPresent() {
        return prime.isPresent(PCC_SECTION_HEADING) && prime.isPresent(MANAGER_NAME);
    }

    public String managerName() {
        return valueOfInput(MANAGER_NAME);
    }

    public boolean isManagerNameReadOnly() {
        return prime.isReadOnly(MANAGER_NAME);
    }

    public boolean isManagerNameVisible() {
        return prime.isVisible(MANAGER_NAME);
    }

    public String supplierCredentialsDescription() {
        return valueOfInput(SUPPLIER_CREDENTIALS_DESCRIPTION);
    }

    public boolean isGenericSupplierPccWrapperVisible() {
        return prime.isVisible(GENERIC_SUPPLIER_PCC_WRAPPER);
    }

    public boolean isGenericSupplierPccInputReadOnly() {
        return prime.isReadOnly(GENERIC_SUPPLIER_PCC_INPUT);
    }

    // -- Actions --------------------------------------------------------------------------------

    /**
     * REPAIR-AG-017: waits for an outcome; never asserts one. Every persistence test reopening the
     * record immediately after this call must see the newly-submitted value, not the pre-submission one
     * -- but a caller submitting deliberately-invalid data expects the submission to be <em>blocked</em>
     * (TC-AGENCY-023, -037), so this has no way to know which outcome is wanted. It waits, bounded, for
     * either signal and leaves the caller's own assertion to judge which is correct.
     */
    public UpdateAgency_Page clickSendForApproval() {
        prime.scrollIntoView(SEND_FOR_APPROVAL_BUTTON);
        driver.element().click(SEND_FOR_APPROVAL_BUTTON);
        try {
            new WebDriverWait(driver.getDriver(), LOAD_TIMEOUT).until(d ->
                    !driver.browser().getCurrentURL().contains(EnvironmentConfig.editAgencyPath())
                            || !validationErrorMessages().isEmpty());
        } catch (TimeoutException noOutcomeObserved) {
            System.out.println("[DIAG-SYNC] clickSendForApproval: neither navigation away from "
                    + EnvironmentConfig.editAgencyPath() + " nor a validation message appeared within "
                    + LOAD_TIMEOUT.getSeconds() + "s. Leaving this to the caller's own assertion.");
        }
        return this;
    }

    public UpdateAgency_Page clickApprove() {
        prime.scrollIntoView(APPROVE_BUTTON);
        driver.element().click(APPROVE_BUTTON);
        return this;
    }

    public UpdateAgency_Page clickReject() {
        prime.scrollIntoView(REJECT_BUTTON);
        driver.element().click(REJECT_BUTTON);
        return this;
    }

    public UpdateAgency_Page clickCancel() {
        prime.scrollIntoView(CANCEL_BUTTON);
        driver.element().click(CANCEL_BUTTON);
        return this;
    }

    public boolean isSendForApprovalPresent() {
        return prime.isPresent(SEND_FOR_APPROVAL_BUTTON);
    }

    public boolean isApprovePresent() {
        return prime.isPresent(APPROVE_BUTTON);
    }

    public boolean isRejectPresent() {
        return prime.isPresent(REJECT_BUTTON);
    }

    // -- Post-action state ---------------------------------------------------------------------

    public boolean isStillOnUpdateScreen() {
        return driver.browser().getCurrentURL().contains(EnvironmentConfig.editAgencyPath());
    }

    public String currentUrl() {
        return driver.browser().getCurrentURL();
    }

    public boolean validationErrorShown() {
        return prime.anyVisibleTextAppears(AgencyForm_Locators.ANY_VALIDATION_MESSAGE);
    }

    public List<String> validationErrorMessages() {
        return visibleTextsOf(AgencyForm_Locators.ANY_VALIDATION_MESSAGE);
    }

    /** Messages belonging to Agency Name alone, so a form-wide message cannot satisfy the assertion. */
    public List<String> agencyNameValidationMessages() {
        return visibleTextsOf(AgencyForm_Locators.validationMessageFor(AGENCY_NAME_XPATH));
    }

    public boolean agencyNameValidationShown() {
        return prime.anyVisibleTextAppears(AgencyForm_Locators.validationMessageFor(AGENCY_NAME_XPATH));
    }

    public List<String> contactPersonValidationMessages() {
        return visibleTextsOf(AgencyForm_Locators.validationMessageFor(CONTACT_PERSON_XPATH));
    }

    public boolean contactPersonValidationShown() {
        return prime.anyVisibleTextAppears(AgencyForm_Locators.validationMessageFor(CONTACT_PERSON_XPATH));
    }

    public List<String> ownerEmailValidationMessages() {
        return visibleTextsOf(AgencyForm_Locators.validationMessageFor(OWNER_EMAIL_XPATH));
    }

    public boolean ownerEmailValidationShown() {
        return prime.anyVisibleTextAppears(AgencyForm_Locators.validationMessageFor(OWNER_EMAIL_XPATH));
    }

    public boolean confirmationShown() {
        return prime.anyVisibleTextAppears(AgencyForm_Locators.TOAST_MESSAGES);
    }

    public List<String> confirmationMessages() {
        return visibleTextsOf(AgencyForm_Locators.TOAST_MESSAGES);
    }
}
