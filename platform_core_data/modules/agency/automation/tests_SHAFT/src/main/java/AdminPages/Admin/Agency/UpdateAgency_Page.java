package AdminPages.Admin.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import utilities.EnvironmentConfig;

import java.io.File;
import java.util.List;

/**
 * Page Object for Admin &rarr; Agency &rarr; Update Agency (US-4222), reached by clicking a row's edit
 * pen on the Agency list.
 *
 * <p><b>Every locator in this class was verified live and headless against the STG build this suite
 * targets, on 2026-08-18</b> (automation-skill §11A). 47 of 49 resolved uniquely. The two that did not
 * are {@code #id-AccountNumber} and {@code #id-Bankname}, which are absent from this build's form and
 * are therefore <em>not represented here at all</em> rather than carried as hopeful locators -- no
 * in-scope test case needs them, and the omission is disclosed in the Selector Verification Report.
 *
 * <h2>Four verified facts that drive this class's design</h2>
 *
 * <ol>
 *   <li><b>There is no constructor that navigates by URL, deliberately.</b> A direct visit to
 *       {@code /admin/agency/edit/{id}} renders an empty shell -- 246 characters of body text, every
 *       field blank, no product-access table -- while <em>every locator still resolves</em>. That
 *       combination is what makes it dangerous: a deep-linked test reads blank values without error and
 *       reports a false defect. Entry is via {@link SearchAgency_Page#clickEditPen(String)}
 *       (REPAIR-004).
 *   <li><b>Readiness is spinner-clear plus field-visible, never field-populated.</b> Values bind about
 *       1.5 seconds before the UI becomes visible. See {@link Agency_Common#waitUntilFormSettled()};
 *       this is the one place Agency diverges from {@code UpdateBranch_Page}, on measured evidence.
 *   <li><b>Branch is display-only on this screen.</b> {@code #id-Branch} is
 *       {@code readonly}, {@code disabled} <em>and</em> not visible -- three independent signals that
 *       it is not an editable control. {@link #branchFieldIsEditable()} exists so a test can assert
 *       that rather than assume it.
 *   <li><b>Three ids repeat and four are malformed, so positional and attribute addressing are
 *       mandatory.</b> {@code id-EmailID} appears twice (owner, then sales) and there are three
 *       {@code input[type=tel]} controls; {@code id--Creditagency}, {@code id--ImportPNROption} and
 *       {@code id--TransferPnrOption} carry a double dash, and {@code id-CreditTerms(Days)} and
 *       {@code id-WarningPrompt(Days)} carry parentheses, which is why those five are addressed by
 *       {@code [id='...']} attribute match rather than by CSS id selector.
 * </ol>
 *
 * <h2>The PCC section is conditional</h2>
 *
 * <p>FINDING-008: the Airline Supplier credentials (PCC) section renders only when the agency's parent
 * Branch carries suppliers with credentials. Four of five agencies sampled during verification did not
 * render it at all. {@link #isPccSectionPresent()} therefore returns a fact rather than throwing, so a
 * test can distinguish "the field is wrong" from "the section is absent" -- two different results that
 * a plain locator failure would collapse into one.
 */
public class UpdateAgency_Page extends Agency_Common {

    // -- Agency Details -------------------------------------------------------------------------

    /** Display-only: verified readonly + disabled + not visible. Never typed into. */
    private static final By BRANCH = By.cssSelector("#id-Branch");
    private static final By AGENCY_NAME = By.cssSelector("#id-Agency");
    /** Verified {@code readonly} -- inherited from the parent Branch, not editable here. */
    private static final By COUNTRY = By.cssSelector("#id-Country");
    /** Lower-case "officebox" -- Branch uses {@code #id-PostOfficeBox}. The casing does not transfer. */
    private static final By POST_OFFICE_BOX = By.cssSelector("#id-Postofficebox");
    private static final By COMPANY_URL = By.cssSelector("#id-CompanyURL");
    private static final By FAX_NO = By.cssSelector("#id-FaxNo");

    private static final String STATE_ID = "id-State";
    private static final String CITY_ID = "id-City";

    /** Address 1 and 2 are the first two textareas; Remarks is found by placeholder, never by index. */
    private static final By ADDRESS_1 = By.xpath("(//textarea)[1]");
    private static final By ADDRESS_2 = By.xpath("(//textarea)[2]");
    private static final By REMARKS = By.cssSelector("textarea[placeholder='remarks...']");

    /** Three tel inputs in DOM order: agency master, owner, sales contact. */
    private static final By PHONE_NO_MASTER = By.xpath("(//input[@type='tel'])[1]");
    private static final By OWNER_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[2]");
    private static final By SALES_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[3]");

    /** {@code id-EmailID} is not unique: [1] is the owner's, [2] is the sales contact's. */
    private static final By OWNER_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[1]");
    private static final By SALES_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[2]");
    private static final String OWNER_EMAIL_XPATH = "(//input[@id='id-EmailID'])[1]";

    private static final By CONTACT_PERSON = By.cssSelector("#id-Contactperson");
    private static final By SALES_CONTACT_NAME = By.cssSelector("#id-Name");
    private static final String CONTACT_PERSON_XPATH = "//input[@id='id-Contactperson']";
    private static final String AGENCY_NAME_XPATH = "//input[@id='id-Agency']";

    // -- Radio groups ---------------------------------------------------------------------------

    private static final String IATA_AGENCY_NO_ID = "id-IATAAgency-No";
    private static final String BUSINESS_TYPE_B2B_ID = "id-AgencyBusinessType-B2B";
    private static final String BUSINESS_TYPE_FREELANCER_ID = "id-AgencyBusinessType-Freelancer";

    // -- Documents and logo ---------------------------------------------------------------------

    /**
     * Both file inputs are verified present and <b>not visible</b> -- the visible control is a styled
     * wrapper. A file is attached with {@code sendKeys} on the input itself, which works on a hidden
     * input; clicking the wrapper would open the OS file dialog, which no driver can complete.
     */
    private static final By DOCUMENT_FILE_INPUT = By.xpath("(//input[@type='file'])[1]");
    private static final By LOGO_FILE_INPUT = By.xpath("(//input[@type='file'])[2]");

    private static final By CONTRACT_START_DATE = By.cssSelector("#id-ContractStartDate");
    private static final By CONTRACT_END_DATE = By.cssSelector("#id-ContractEndDate");

    // -- Credit and payment ---------------------------------------------------------------------

    private static final String INVOICE_GENERATION_ID = "id-Invoicegeneration";
    private static final By CREDIT_LIMIT = By.cssSelector("#id-Creditlimit");
    private static final By TOP_UP_LIMIT = By.cssSelector("#id-Topuplimit");
    private static final By OUTSTANDING_THRESHOLD = By.cssSelector("#id-OutstandingThreshold");
    private static final By REACHING_PERCENTAGE = By.cssSelector("#id-ReachingPercentage");

    /** Parenthesised ids -- addressed by attribute match because they are not valid CSS id selectors. */
    private static final By CREDIT_TERMS_DAYS = By.cssSelector("[id='id-CreditTerms(Days)']");
    private static final By WARNING_PROMPT_DAYS = By.cssSelector("[id='id-WarningPrompt(Days)']");

    /** Double-dash id, exactly as the application emits it. Not a typo in this file. */
    private static final String CREDIT_AGENCY_ID = "id--Creditagency";
    private static final String IMPORT_PNR_ID = "id--ImportPNROption";

    private static final String PAY_CASH_ID = "id-Paymentoption-Cash";
    private static final String PAY_WALLET_ID = "id-Paymentoption-Wallet";
    private static final String PAY_CREDIT_CARD_ID = "id-Paymentoption-CreditCard";

    private static final String PRODUCT_FLIGHT_ID = "id-SelectProduct-Flight";
    private static final String PRODUCT_OTHERS_ID = "id-SelectProduct-Others";

    private static final By PRODUCT_ACCESS_TABLE = By.tagName("table");
    private static final By PRODUCT_ACCESS_ROWS = By.cssSelector("table tbody tr");

    // -- Airline Supplier credentials (PCC) -- conditional, FINDING-008 -------------------------

    private static final By GENERIC_SUPPLIER_PCC_INPUT =
            By.cssSelector("[id='id-Genericsuppliercredentials(PCC)']");
    /** The interactive multi-select wrapper; the id above is a hidden, readonly accessibility input. */
    private static final By GENERIC_SUPPLIER_PCC_WRAPPER =
            multiSelectWrapper("id-Genericsuppliercredentials(PCC)");
    /** FINDING-009: rendered as mandatory yet verified {@code readonly}, carrying an inherited value. */
    private static final By MANAGER_NAME = By.cssSelector("#id-ManagerName");
    private static final By SUPPLIER_CREDENTIALS_DESCRIPTION =
            By.cssSelector("#id-SupplierCredentialsDescription");
    /** Section heading text, used to decide presence rather than inferring it from a missing field. */
    private static final By PCC_SECTION_HEADING =
            By.xpath("//*[contains(normalize-space(.),'Airline Supplier credential')]");

    // -- Action buttons -- each verified n=1 and visible ----------------------------------------

    private static final By SEND_FOR_APPROVAL_BUTTON =
            By.xpath("//button[normalize-space(.)='Send For Approval']");
    private static final By APPROVE_BUTTON = By.xpath("//button[normalize-space(.)='Approve']");
    private static final By REJECT_BUTTON = By.xpath("//button[normalize-space(.)='Reject']");
    private static final By CANCEL_BUTTON = By.xpath("//button[normalize-space(.)='Cancel']");

    public UpdateAgency_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    /**
     * Confirms the form has settled and that this really is the Update Agency screen rather than the
     * empty shell a deep link produces. Both checks matter: the shell satisfies a URL test.
     */
    public UpdateAgency_Page waitUntilLoaded() {
        waitUntilFormSettled();
        if (!isVisible(AGENCY_NAME)) {
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
        return textOf(dropdownLabel(STATE_ID));
    }

    public String city() {
        return textOf(dropdownLabel(CITY_ID));
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
        return textOf(dropdownLabel(INVOICE_GENERATION_ID));
    }

    public String remarks() {
        return valueOfInput(REMARKS);
    }

    // -- Read-only / editability assertions ----------------------------------------------------

    /**
     * Whether Branch is offered as an editable control. Verified {@code readonly}, {@code disabled} and
     * not visible, so this is expected to be {@code false}; it is read rather than assumed so the
     * assertion belongs to the test, not to this locator's comment.
     */
    public boolean branchFieldIsEditable() {
        return isVisible(BRANCH) && !isReadOnly(BRANCH) && !isDisabledAttribute(BRANCH);
    }

    public boolean isCountryReadOnly() {
        return isReadOnly(COUNTRY);
    }

    public boolean isAgencyNameReadOnly() {
        return isReadOnly(AGENCY_NAME);
    }

    // -- Edits ----------------------------------------------------------------------------------

    /**
     * All text entry goes through {@code typeVia} (REPAIR-BR-013), never SHAFT's or the driver's own
     * typing. Directly observed on this application: the driver reports the text as delivered while the
     * input's {@code value} stays empty and the control stays {@code ng-pristine}, so Angular never
     * registers the change and the submitted form silently carries the old value.
     */
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
        typeRealKeystrokes(CONTRACT_START_DATE, value);
        return this;
    }

    public UpdateAgency_Page setContractEndDate(String value) {
        typeRealKeystrokes(CONTRACT_END_DATE, value);
        return this;
    }

    public UpdateAgency_Page setRemarks(String value) {
        typeVia(REMARKS, value);
        return this;
    }

    /**
     * Empties a field. Uses Selenium's {@code clear()} rather than typing an empty string, because
     * typing "" is not a reliable way to empty an input -- the same reason
     * {@code UpdateBranch_Page.clearRemarks} exists. Mandatory-field tests depend on this: the Update
     * form arrives pre-filled, so a test that does not clear first submits a populated field and passes
     * without ever exercising the rule.
     */
    private UpdateAgency_Page clearField(By locator) {
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
        selectFromDropdown(STATE_ID, visibleText);
        return this;
    }

    public UpdateAgency_Page selectCity(String visibleText) {
        selectFromDropdown(CITY_ID, visibleText);
        return this;
    }

    public UpdateAgency_Page selectInvoiceGeneration(String visibleText) {
        selectFromDropdown(INVOICE_GENERATION_ID, visibleText);
        return this;
    }

    // -- Checkboxes and radio buttons ----------------------------------------------------------

    public UpdateAgency_Page toggleCreditAgency() {
        togglePrimeControl(CREDIT_AGENCY_ID, checkboxWrapper(CREDIT_AGENCY_ID));
        return this;
    }

    public boolean isCreditAgencyChecked() {
        return isPrimeControlChecked(CREDIT_AGENCY_ID);
    }

    public UpdateAgency_Page togglePaymentOptionCash() {
        togglePrimeControl(PAY_CASH_ID, checkboxWrapper(PAY_CASH_ID));
        return this;
    }

    public UpdateAgency_Page togglePaymentOptionWallet() {
        togglePrimeControl(PAY_WALLET_ID, checkboxWrapper(PAY_WALLET_ID));
        return this;
    }

    public UpdateAgency_Page togglePaymentOptionCreditCard() {
        togglePrimeControl(PAY_CREDIT_CARD_ID, checkboxWrapper(PAY_CREDIT_CARD_ID));
        return this;
    }

    public boolean isPaymentOptionCashChecked() {
        return isPrimeControlChecked(PAY_CASH_ID);
    }

    public boolean isPaymentOptionWalletChecked() {
        return isPrimeControlChecked(PAY_WALLET_ID);
    }

    public boolean isPaymentOptionCreditCardChecked() {
        return isPrimeControlChecked(PAY_CREDIT_CARD_ID);
    }

    public UpdateAgency_Page toggleProductFlight() {
        togglePrimeControl(PRODUCT_FLIGHT_ID, checkboxWrapper(PRODUCT_FLIGHT_ID));
        return this;
    }

    public boolean isProductFlightChecked() {
        return isPrimeControlChecked(PRODUCT_FLIGHT_ID);
    }

    public boolean isProductOthersChecked() {
        return isPrimeControlChecked(PRODUCT_OTHERS_ID);
    }

    public UpdateAgency_Page toggleImportPnrOption() {
        togglePrimeControl(IMPORT_PNR_ID, checkboxWrapper(IMPORT_PNR_ID));
        return this;
    }

    public boolean isImportPnrOptionChecked() {
        return isPrimeControlChecked(IMPORT_PNR_ID);
    }

    public UpdateAgency_Page selectBusinessTypeB2B() {
        togglePrimeControl(BUSINESS_TYPE_B2B_ID, radioWrapper(BUSINESS_TYPE_B2B_ID));
        return this;
    }

    public UpdateAgency_Page selectBusinessTypeFreelancer() {
        togglePrimeControl(BUSINESS_TYPE_FREELANCER_ID, radioWrapper(BUSINESS_TYPE_FREELANCER_ID));
        return this;
    }

    public boolean isBusinessTypeB2BSelected() {
        return isPrimeControlChecked(BUSINESS_TYPE_B2B_ID);
    }

    public boolean isBusinessTypeFreelancerSelected() {
        return isPrimeControlChecked(BUSINESS_TYPE_FREELANCER_ID);
    }

    public boolean isIataAgencyNoSelected() {
        return isPrimeControlChecked(IATA_AGENCY_NO_ID);
    }

    // -- Product access table ------------------------------------------------------------------

    public boolean isProductAccessTablePresent() {
        return isPresent(PRODUCT_ACCESS_TABLE);
    }

    public int productAccessRowCount() {
        return countOf(PRODUCT_ACCESS_ROWS);
    }

    // -- Uploads --------------------------------------------------------------------------------

    /**
     * Attaches a file by writing its absolute path to the hidden {@code input[type=file]}. The visible
     * control is a styled wrapper; clicking it opens the OS file dialog, which no WebDriver can
     * complete. {@code sendKeys} on a hidden file input is the supported mechanism and needs no
     * visibility.
     *
     * <p>Fails loudly if the fixture file is missing, rather than attaching nothing and letting the
     * assertion fail later with a misleading message about the application.
     */
    private UpdateAgency_Page attach(By fileInput, String absolutePath) {
        File file = new File(absolutePath);
        if (!file.isFile()) {
            throw new IllegalArgumentException(
                    "Upload fixture not found: " + absolutePath + ". The test data files under "
                            + "src/test/resources/testDataFiles/agency/uploads/ must exist before an upload "
                            + "test runs; attaching nothing would fail the assertion for the wrong reason.");
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

    /** The {@code accept} attribute the control advertises, or {@code ""} when it sets none. */
    public String documentAcceptAttribute() {
        return attributeOf(DOCUMENT_FILE_INPUT, "accept");
    }

    public String logoAcceptAttribute() {
        return attributeOf(LOGO_FILE_INPUT, "accept");
    }

    private String attributeOf(By locator, String attribute) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            if (elements.isEmpty()) {
                return "";
            }
            String value = elements.get(0).getAttribute(attribute);
            return value == null ? "" : value;
        });
    }

    /**
     * <b>REPAIR-AG-018 (2026-08-20, Stage 5H): verified live, replacing a disclosed guess.</b> None of
     * the five originally-guessed selectors ({@code a[href*='.pdf']}, {@code a[download]},
     * {@code .file-name}, {@code .uploaded-file}, {@code .attachment-name}) exist anywhere on this form --
     * the same "guessed locators are guesses" lesson the Branch suite already recorded for its own
     * validation-message classes. The real element, confirmed live on a record with a genuinely attached
     * document: {@code <ndc-fg-file-input>...<div class="file exception-buttons">
     * <p class="name">the-filename.pdf</p>...</div></ndc-fg-file-input>}. This scopes to that
     * component's own {@code p.name}, which the (guessed) generic {@code td a} could also have
     * false-matched on an unrelated table cell elsewhere on the form.
     */
    private static final By UPLOADED_FILE_NAMES = By.cssSelector("ndc-fg-file-input .file p.name");
    private static final By LOGO_PREVIEW = By.cssSelector(
            "img[src*='logo'], img[src^='data:image'], img[src*='/upload'], .logo-preview img");

    /**
     * Text of anything on the form that looks like an attached file's name. Used by TC-AGENCY-016,
     * which asserts the uploaded document's name is displayed after reopening the record.
     */
    public List<String> uploadedFileNames() {
        return visibleTextsOf(UPLOADED_FILE_NAMES);
    }

    /** True when any uploaded-file label contains this filename. */
    public boolean isFileNameDisplayed(String fileName) {
        for (String displayed : uploadedFileNames()) {
            if (displayed.contains(fileName)) {
                return true;
            }
        }
        return false;
    }

    /** True when a logo image is rendered -- AC-4 requires the logo be shown for review. */
    public boolean isLogoPreviewVisible() {
        return isVisible(LOGO_PREVIEW);
    }

    // -- Airline Supplier credentials (PCC) ----------------------------------------------------

    /**
     * Whether the conditional PCC section is rendered at all (FINDING-008). Returns a fact instead of
     * throwing so a test can tell "the section is absent" apart from "the field is wrong" -- a plain
     * locator failure collapses those two different results into one.
     */
    public boolean isPccSectionPresent() {
        return isPresent(PCC_SECTION_HEADING) && isPresent(MANAGER_NAME);
    }

    public String managerName() {
        return valueOfInput(MANAGER_NAME);
    }

    /** FINDING-009: verified {@code readonly} while still being presented as a mandatory field. */
    public boolean isManagerNameReadOnly() {
        return isReadOnly(MANAGER_NAME);
    }

    public boolean isManagerNameVisible() {
        return isVisible(MANAGER_NAME);
    }

    public String supplierCredentialsDescription() {
        return valueOfInput(SUPPLIER_CREDENTIALS_DESCRIPTION);
    }

    public boolean isGenericSupplierPccWrapperVisible() {
        return isVisible(GENERIC_SUPPLIER_PCC_WRAPPER);
    }

    /** The hidden accessibility input behind the multi-select -- verified readonly, as PrimeNG renders it. */
    public boolean isGenericSupplierPccInputReadOnly() {
        return isReadOnly(GENERIC_SUPPLIER_PCC_INPUT);
    }

    // -- Actions --------------------------------------------------------------------------------

    /**
     * REPAIR-AG-017 (2026-08-20, Stage 5H). Previously fired the click with no confirmation at all --
     * the same shape of gap {@code AddAgency_Page} had before REPAIR-AG-013. Live evidence: every
     * persistence test that reopens the record immediately after this call reads back a value from
     * <em>before</em> this submission, not the one just submitted -- yet a manually-paced reproduction
     * (real navigation, a few seconds' incidental delay) reopens to the correct, newly-submitted value
     * every time. The submission is real (a live capture confirmed a {@code 204} on the update PUT); the
     * gap is purely that nothing here ever waited for it to land before the caller reopens the record.
     *
     * <p><b>Waits for an outcome; never asserts one.</b> A first version of this fix hard-asserted
     * navigation away from the edit URL and broke every test that submits deliberately-invalid data
     * expecting the submission to be <em>blocked</em> (TC-AGENCY-023, -037: {@code isStillOnUpdateScreen()}
     * should stay {@code true}) -- this method has no way to know which outcome a given caller wants, so
     * it must not assume success is the only legitimate one. It instead waits, bounded, for <em>either</em>
     * signal -- navigation away (success), or a validation message appearing while still on the form
     * (blocked) -- and leaves the caller's own assertion, exactly as before, to judge which one is
     * correct for that test. If neither signal appears within the timeout, that is genuinely unconfirmed
     * and is worth the caller seeing a slow, real page state rather than a silent race.
     */
    public UpdateAgency_Page clickSendForApproval() {
        scrollIntoView(SEND_FOR_APPROVAL_BUTTON);
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
        scrollIntoView(APPROVE_BUTTON);
        driver.element().click(APPROVE_BUTTON);
        return this;
    }

    public UpdateAgency_Page clickReject() {
        scrollIntoView(REJECT_BUTTON);
        driver.element().click(REJECT_BUTTON);
        return this;
    }

    public UpdateAgency_Page clickCancel() {
        scrollIntoView(CANCEL_BUTTON);
        driver.element().click(CANCEL_BUTTON);
        return this;
    }

    public boolean isSendForApprovalPresent() {
        return isPresent(SEND_FOR_APPROVAL_BUTTON);
    }

    public boolean isApprovePresent() {
        return isPresent(APPROVE_BUTTON);
    }

    public boolean isRejectPresent() {
        return isPresent(REJECT_BUTTON);
    }

    // -- Post-action state ---------------------------------------------------------------------

    /** True while the browser is still on the Update screen -- i.e. submission was blocked. */
    public boolean isStillOnUpdateScreen() {
        return driver.browser().getCurrentURL().contains(EnvironmentConfig.editAgencyPath());
    }

    public String currentUrl() {
        return driver.browser().getCurrentURL();
    }

    public boolean validationErrorShown() {
        return anyVisibleTextAppears(ANY_VALIDATION_MESSAGE);
    }

    public List<String> validationErrorMessages() {
        return visibleTextsOf(ANY_VALIDATION_MESSAGE);
    }

    /** Messages belonging to Agency Name alone, so a form-wide message cannot satisfy the assertion. */
    public List<String> agencyNameValidationMessages() {
        return visibleTextsOf(validationMessageFor(AGENCY_NAME_XPATH));
    }

    public boolean agencyNameValidationShown() {
        return anyVisibleTextAppears(validationMessageFor(AGENCY_NAME_XPATH));
    }

    public List<String> contactPersonValidationMessages() {
        return visibleTextsOf(validationMessageFor(CONTACT_PERSON_XPATH));
    }

    public boolean contactPersonValidationShown() {
        return anyVisibleTextAppears(validationMessageFor(CONTACT_PERSON_XPATH));
    }

    public List<String> ownerEmailValidationMessages() {
        return visibleTextsOf(validationMessageFor(OWNER_EMAIL_XPATH));
    }

    public boolean ownerEmailValidationShown() {
        return anyVisibleTextAppears(validationMessageFor(OWNER_EMAIL_XPATH));
    }

    public boolean confirmationShown() {
        return anyVisibleTextAppears(TOAST_MESSAGES);
    }

    public List<String> confirmationMessages() {
        return visibleTextsOf(TOAST_MESSAGES);
    }
}
