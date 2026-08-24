package AdminPages.Admin.Agency;

import org.openqa.selenium.By;
import utilities.PrimeNgHelper;

/**
 * {@code By} declarations specific to Admin &rarr; Agency &rarr; Update Agency (US-4222) -- fields also
 * present on Add Agency with the identical selector live in {@link AgencyForm_Locators} instead, so no
 * locator is defined twice. Locator definitions and dynamic locator builders only. Every locator here
 * was verified live and headless against the STG build this suite targets, on 2026-08-18
 * (automation-skill §11A); 47 of 49 resolved uniquely. {@code #id-AccountNumber} and
 * {@code #id-Bankname} are absent from this build's Update form and are therefore not represented here.
 */
public final class UpdateAgency_Locators {

    private UpdateAgency_Locators() {
    }

    /** Display-only on Update: verified readonly + disabled + not visible. Never typed into. */
    public static final By BRANCH = By.cssSelector("#id-Branch");
    public static final String AGENCY_NAME_XPATH = "//input[@id='id-Agency']";

    /** Remarks is found by placeholder, never by index; mandatory on Update, absent from Add. */
    public static final By REMARKS = By.cssSelector("textarea[placeholder='remarks...']");

    /** {@code id-EmailID} is not unique: [1] is the owner's, [2] is the sales contact's. */
    public static final String OWNER_EMAIL_XPATH = "(//input[@id='id-EmailID'])[1]";
    public static final String CONTACT_PERSON_XPATH = "//input[@id='id-Contactperson']";

    // -- Radio groups ---------------------------------------------------------------------------

    public static final String IATA_AGENCY_NO_ID = "id-IATAAgency-No";
    public static final String BUSINESS_TYPE_B2B_ID = "id-AgencyBusinessType-B2B";
    public static final String BUSINESS_TYPE_FREELANCER_ID = "id-AgencyBusinessType-Freelancer";

    // -- Documents and logo (display, Update-only) -----------------------------------------------

    /**
     * <b>REPAIR-AG-018 (2026-08-20, Stage 5H): verified live, replacing a disclosed guess.</b> The real
     * element is {@code <ndc-fg-file-input>...<div class="file exception-buttons"><p class="name">the
     * filename.pdf</p>...</div></ndc-fg-file-input>}, scoped to that component's own {@code p.name}.
     */
    public static final By UPLOADED_FILE_NAMES = By.cssSelector("ndc-fg-file-input .file p.name");
    public static final By LOGO_PREVIEW = By.cssSelector(
            "img[src*='logo'], img[src^='data:image'], img[src*='/upload'], .logo-preview img");

    // -- Credit and payment (Update-only controls) -----------------------------------------------

    /** Double-dash id, exactly as the application emits it. Not a typo in this file. */
    public static final String CREDIT_AGENCY_ID = "id--Creditagency";
    public static final String IMPORT_PNR_ID = "id--ImportPNROption";

    public static final String PAY_CASH_ID = "id-Paymentoption-Cash";
    public static final String PAY_WALLET_ID = "id-Paymentoption-Wallet";
    public static final String PAY_CREDIT_CARD_ID = "id-Paymentoption-CreditCard";

    public static final String PRODUCT_FLIGHT_ID = "id-SelectProduct-Flight";
    public static final String PRODUCT_OTHERS_ID = "id-SelectProduct-Others";

    public static final By PRODUCT_ACCESS_TABLE = By.tagName("table");

    // -- Airline Supplier credentials (PCC) -- conditional, FINDING-008, Update-only -------------

    public static final By GENERIC_SUPPLIER_PCC_INPUT =
            By.cssSelector("[id='id-Genericsuppliercredentials(PCC)']");
    /** The interactive multi-select wrapper; the id above is a hidden, readonly accessibility input. */
    public static final By GENERIC_SUPPLIER_PCC_WRAPPER =
            PrimeNgHelper.multiSelectWrapper("id-Genericsuppliercredentials(PCC)");
    /** FINDING-009: rendered as mandatory yet verified {@code readonly}, carrying an inherited value. */
    public static final By MANAGER_NAME = By.cssSelector("#id-ManagerName");
    public static final By SUPPLIER_CREDENTIALS_DESCRIPTION =
            By.cssSelector("#id-SupplierCredentialsDescription");
    /** Section heading text, used to decide presence rather than inferring it from a missing field. */
    public static final By PCC_SECTION_HEADING =
            By.xpath("//*[contains(normalize-space(.),'Airline Supplier credential')]");

    // -- Action buttons that exist only on Update ------------------------------------------------

    public static final By APPROVE_BUTTON = By.xpath("//button[normalize-space(.)='Approve']");
    public static final By REJECT_BUTTON = By.xpath("//button[normalize-space(.)='Reject']");
}
