package AdminPages.Admin.Agency;

import org.openqa.selenium.By;
import utilities.PrimeNgHelper;

/**
 * {@code By} declarations specific to Admin &rarr; Agency &rarr; Add Agency -- fields also present on
 * Update Agency with the identical selector live in {@link AgencyForm_Locators} instead, so no locator
 * is defined twice. Locator definitions and dynamic locator builders only. See {@link AddAgency_Page}
 * for the verified live findings that shaped these (74-control inventory, 2026-08-18, evidence
 * {@code addform_locator_verification_run004.json}).
 */
public final class AddAgency_Locators {

    private AddAgency_Locators() {
    }

    public static final String BRANCH_ID = "id-Branch";

    /** Present on Add but absent from Update. Optional; the fixture does not fill them. */
    public static final By ACCOUNT_NUMBER = By.cssSelector("#id-AccountNumber");
    public static final By BANK_NAME = By.cssSelector("#id-Bankname");

    /**
     * <b>REPAIR-AG-007 (2026-08-19, Stage 5H).</b> This form's Product Access grid uses a plain
     * <em>native</em> {@code input[type=checkbox]} with no PrimeNG wrapper -- structurally different from
     * the Branch form's Product Access grid.
     */
    public static final By PRODUCT_ACCESS_ROW_CHECKBOXES =
            By.xpath("//table/tbody/tr//input[@type='checkbox']");
    public static final By FIRST_ROW_CHECKBOX =
            By.xpath("(//table/tbody/tr//input[@type='checkbox'])[1]");

    public static final By PAYMENT_OPTION_CHECKBOXES =
            By.xpath("//input[starts-with(@id,'id-Paymentoption-')]");

    /**
     * <b>REPAIR-AG-006 (2026-08-19, Stage 5H).</b> The Branch dropdown's option text is
     * {@code "{Branch Name} ({Branch Code})"}, e.g. {@code "AAAAA (BRN384)"} -- never the bare name.
     * Matched by <b>prefix</b>, since the code is not known ahead of time.
     */
    public static By branchOption(String branchName) {
        return By.xpath("//div[contains(@class,'p-dropdown-panel')]"
                + "//li[contains(@class,'p-dropdown-item') and starts-with(normalize-space(.),"
                + PrimeNgHelper.xpathLiteral(branchName + " (") + ")]");
    }
}
