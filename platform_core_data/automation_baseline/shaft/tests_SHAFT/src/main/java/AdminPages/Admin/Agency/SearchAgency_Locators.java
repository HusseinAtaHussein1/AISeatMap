package AdminPages.Admin.Agency;

import org.openqa.selenium.By;
import utilities.PrimeNgHelper;

/**
 * Every {@code By} declaration for the Agency list at {@code /admin/agency} -- the grid, row identity,
 * the row action icons, and the mandatory Remarks confirmation dialog. Locator definitions and dynamic
 * locator builders only.
 *
 * <p>Column order, verified live 2026-08-18, is <em>not</em> the same as the Branch list's:
 * <pre>1 Code | 2 Agency Name | 3 Country Name | 4 City | 5 Status | 6 Approval Status | 7 Branch Name | 8 Actions</pre>
 */
public final class SearchAgency_Locators {

    private SearchAgency_Locators() {
    }

    public static final By GRID_ROWS = By.cssSelector("table tbody tr");
    public static final By GRID_HEADERS = By.cssSelector("table thead th");

    public static final int COLUMN_CODE = 1;
    public static final int COLUMN_AGENCY_NAME = 2;
    public static final int COLUMN_COUNTRY_NAME = 3;
    public static final int COLUMN_CITY = 4;
    public static final int COLUMN_STATUS = 5;
    public static final int COLUMN_APPROVAL_STATUS = 6;
    public static final int COLUMN_BRANCH_NAME = 7;

    /** Row action icons, identified by their PrimeIcons class. */
    public enum RowAction {
        EDIT("pi-pencil"),
        APPROVE("pi-thumbs-up"),
        REJECT("pi-thumbs-down");

        private final String iconClass;

        RowAction(String iconClass) {
            this.iconClass = iconClass;
        }

        public String iconClass() {
            return iconClass;
        }
    }

    // -- Search filter (REPAIR-AG-012, 2026-08-19, Stage 5H) ------------------------------------

    public static final By AGENCY_NAME_FILTER = By.cssSelector("#id-Agencyname");
    public static final By AGENCY_CODE_FILTER = By.cssSelector("#id-Agencycode");
    public static final By SEARCH_BUTTON = By.xpath("//button[normalize-space(.)='Search in grid']");
    /** REPAIR-AG-014: this grid's Status filter defaults to Active, hiding not-yet-Active records. */
    public static final By STATUS_BOTH = PrimeNgHelper.radioWrapper("id-Status-Both");

    // -- Remarks confirmation dialog (REPAIR-AG-015, 2026-08-19, Stage 5H) ----------------------

    public static final By REMARKS_TEXTAREA = By.cssSelector("textarea[placeholder='remarks...']");
    public static final By REMARKS_DIALOG = By.cssSelector("div.p-dialog");
    public static final By REMARKS_DIALOG_SUBMIT_BUTTON = By.xpath(
            "//div[contains(concat(' ', normalize-space(@class), ' '), ' p-dialog ')]"
                    + "//button[normalize-space()='Submit']");

    // -- Dynamic row/cell/action locator builders ------------------------------------------------

    public static By cellIn(int rowIndex, int columnIndex) {
        return By.xpath("(//table/tbody/tr)[" + rowIndex + "]/td[" + columnIndex + "]");
    }

    /** The row carrying exactly this Agency Code. Matched on cell text, never on position. */
    public static By rowByCode(String agencyCode) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + PrimeNgHelper.xpathLiteral(agencyCode) + "]]");
    }

    public static By cellOf(String agencyCode, int columnIndex) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + PrimeNgHelper.xpathLiteral(agencyCode) + "]]/td[" + columnIndex + "]");
    }

    public static By actionIconOf(String agencyCode, RowAction action) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + PrimeNgHelper.xpathLiteral(agencyCode) + "]]//i[contains(@class,'" + action.iconClass() + "')]");
    }

    public static By rowCellsOf(String agencyCode) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + PrimeNgHelper.xpathLiteral(agencyCode) + "]]/td");
    }

    public static By nthRowCells(int rowIndex) {
        return By.xpath("(//table/tbody/tr)[" + rowIndex + "]/td");
    }
}
