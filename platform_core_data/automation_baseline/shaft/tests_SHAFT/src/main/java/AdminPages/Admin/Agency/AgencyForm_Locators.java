package AdminPages.Admin.Agency;

import org.openqa.selenium.By;

/**
 * Locators genuinely shared by the Add and Update Agency forms -- the same field, same selector, on
 * both screens (verified live 2026-08-18) -- plus the application-wide validation-message and toast
 * markup. Kept as one small shared class, per the "no duplicate locator definitions" rule, rather than
 * duplicated into each page's own Locator class or promoted into a general component layer.
 *
 * <p>Contains locator definitions and dynamic locator builders only -- no UI actions, no assertions, no
 * driver operations beyond building locators, no test data, no setup, no business logic.
 *
 * <p>Fields that differ between the two forms -- or exist on only one of them -- stay in
 * {@link AddAgency_Locators} / {@link UpdateAgency_Locators}: e.g. {@code Branch} is a live dropdown on
 * Add and a display-only readonly field on Update; {@code AccountNumber}/{@code Bankname} exist only on
 * Add; {@code Remarks}, the business-type radios, and the PCC section exist only on Update.
 */
public final class AgencyForm_Locators {

    private AgencyForm_Locators() {
    }

    public static final String STATE_ID = "id-State";
    public static final String CITY_ID = "id-City";
    public static final String INVOICE_GENERATION_ID = "id-Invoicegeneration";

    public static final By AGENCY_NAME = By.cssSelector("#id-Agency");
    /** Readonly on both forms, auto-filled from Branch. Asserted, never entered. */
    public static final By COUNTRY = By.cssSelector("#id-Country");
    public static final By POST_OFFICE_BOX = By.cssSelector("#id-Postofficebox");
    public static final By COMPANY_URL = By.cssSelector("#id-CompanyURL");
    public static final By FAX_NO = By.cssSelector("#id-FaxNo");

    public static final By ADDRESS_1 = By.xpath("(//textarea)[1]");
    public static final By ADDRESS_2 = By.xpath("(//textarea)[2]");

    /** Three tel inputs in DOM order: agency master, owner, sales contact. Ids contain spaces. */
    public static final By PHONE_NO_MASTER = By.xpath("(//input[@type='tel'])[1]");
    public static final By OWNER_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[2]");
    public static final By SALES_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[3]");

    public static final By CONTACT_PERSON = By.cssSelector("#id-Contactperson");
    public static final By OWNER_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[1]");
    public static final By SALES_CONTACT_NAME = By.cssSelector("#id-Name");
    public static final By SALES_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[2]");

    public static final By DOCUMENT_FILE_INPUT = By.xpath("(//input[@type='file'])[1]");
    public static final By LOGO_FILE_INPUT = By.xpath("(//input[@type='file'])[2]");
    public static final By CONTRACT_START_DATE = By.cssSelector("#id-ContractStartDate");
    public static final By CONTRACT_END_DATE = By.cssSelector("#id-ContractEndDate");

    public static final By CREDIT_LIMIT = By.cssSelector("#id-Creditlimit");
    public static final By TOP_UP_LIMIT = By.cssSelector("#id-Topuplimit");
    public static final By OUTSTANDING_THRESHOLD = By.cssSelector("#id-OutstandingThreshold");
    /** Parenthesised id -- addressed by attribute match, not a valid CSS id selector otherwise. */
    public static final By CREDIT_TERMS_DAYS = By.cssSelector("[id='id-CreditTerms(Days)']");
    public static final By REACHING_PERCENTAGE = By.cssSelector("#id-ReachingPercentage");
    public static final By WARNING_PROMPT_DAYS = By.cssSelector("[id='id-WarningPrompt(Days)']");

    public static final By PRODUCT_ACCESS_ROWS = By.cssSelector("table tbody tr");

    public static final By CANCEL_BUTTON = By.xpath("//button[normalize-space(.)='Cancel']");
    public static final By SEND_FOR_APPROVAL_BUTTON =
            By.xpath("//button[normalize-space(.)='Send For Approval']");

    /**
     * Validation message belonging to <em>one specific field</em>. This application's required-field
     * markup is {@code ndc-fg-input > span.fg-error.has-error > ul.error-list > li} -- reused from the
     * Branch suite's live-verified finding, not guessed. {@code fg-error} alone is insufficient: it is a
     * generic wrapper present, usually empty, on every field; only combined with {@code has-error} does
     * it signal an active message. Anchoring on the field's own nearest {@code ndc-fg-input} ancestor
     * means this can never match a different field's message.
     */
    public static By validationMessageFor(String fieldXpath) {
        return By.xpath(fieldXpath + "/ancestor::ndc-fg-input[1]"
                + "//span[contains(concat(' ',normalize-space(@class),' '),' fg-error ')"
                + " and contains(concat(' ',normalize-space(@class),' '),' has-error ')]"
                + "//ul[contains(concat(' ',normalize-space(@class),' '),' error-list ')]//li");
    }

    /** Every currently rendered validation message on the form, whichever field it belongs to. */
    public static final By ANY_VALIDATION_MESSAGE = By.xpath(
            "//span[contains(concat(' ',normalize-space(@class),' '),' fg-error ')"
                    + " and contains(concat(' ',normalize-space(@class),' '),' has-error ')]"
                    + "//ul[contains(concat(' ',normalize-space(@class),' '),' error-list ')]//li");

    public static final By TOAST_MESSAGES = By.cssSelector(
            ".p-toast-message, .p-message, .toast, .alert-success, .snackbar");
}
