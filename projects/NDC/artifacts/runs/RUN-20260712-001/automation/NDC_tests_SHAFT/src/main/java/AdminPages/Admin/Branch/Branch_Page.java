package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Export package, Target = "compatible with the Reference Project"
 * (E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Admin\Branch\Branch_Page.java).
 * RUN-20260712-002 (Stage 4). Locators for the Add-form fields, List grid, and the Search/Status
 * radios are reused verbatim from the Reference Project's Branch_Page.java — its IDs
 * (id-Operatingcountry, id-Name, id-CreditLimit, id-PaymentOption-Cash, etc.) matched exactly what
 * this run's own Discovery observed live (Branch_Add.md), so they are trusted, not re-derived from
 * scratch.
 *
 * Btn_Edit and Icn_ThumbDown are NEW this run, not present in the Reference Project's Branch_Page
 * (it only defined Btn_ThumbUp). They are added by direct analogy to the Reference Project's own
 * Staff_Page.java, which already distinguishes Btn_Edit ("pi pi-pencil") from Btn_ThumpUp/Btn_ThumpDown
 * ("pi pi-thumbs-up"/"pi pi-thumbs-down") by icon class rather than DOM position — the same PrimeNG
 * icon set is used site-wide per this project's architecture.md. This directly addresses
 * FINDING-004 (Actions-column ambiguity): reusing a named, class-based locator instead of a
 * positional guess. This has NOT yet been independently confirmed live against Branch's own Actions
 * column by this platform's own Discovery — Execution (Stage 5) is this locator's first live test
 * against Branch specifically, per TC-BRANCH-006's exploratory charter (NDC_TestCases_Branch.md).
 */
public class Branch_Page {
    public Branch_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    // ---- List screen ----
    By Btn_CreateBranch = By.xpath("//button[@routerlink=\"add\"]");
    By Rbtn_Both = By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]");
    By Txt_BranchNameFilter = By.xpath("//input[@id=\"id-Name\"]");
    By Btn_Search = By.xpath("//button[@type=\"submit\"]");
    By Tbl_Rows = By.xpath("//table/tbody/tr");

    // ---- Actions column (FINDING-004) ----
    By Btn_Edit = By.xpath("//i[@class=\"pi pi-pencil\"]");
    // Repair (2026-07-12, EXEC-20260712-002-001): the original, unscoped
    // //i[@class="pi pi-thumbs-down"] matched every row's icon (~149) — SHAFT correctly refused
    // the ambiguous match rather than guessing (no unintended click occurred). Row-scoped now,
    // matching the row-scoping pattern the Reference Project's own Branch_Page.selectSupplier()
    // already uses elsewhere in this codebase.
    By Txt_Remarks = By.xpath("//textarea[@placeholder=\"remarks...\"]");
    By Btn_SubmitApprove = By.xpath("(//button[@type=\"submit\"])[2]");
    By Btn_CancelApprove = By.xpath("//button[normalize-space()=\"Cancel\"]");

    // ---- Add Branch form ----
    By Txt_OperatingCountry = By.xpath("//input[@id=\"id-Operatingcountry\"]");
    By Txt_Name = By.xpath("(//input[@id=\"id-Name\"])[1]");
    By Txt_PhoneNo = By.xpath("(//input[@id=\"Phone Number\"])[1]");
    By Txt_CreditLimit = By.xpath("//input[@id=\"id-CreditLimit\"]");
    By Cbox_Cash = By.xpath("//p-checkbox[.//input[@id=\"id-PaymentOption-Cash\"]]");
    By Btn_SendForApproval = By.xpath("//button[@type=\"submit\"]");
    By Txt_ValidationSummary = By.xpath("//*[contains(@class,'p-error') or contains(@class,'invalid-feedback')]");

    // ---- List screen actions ----
    public void openBranchList() {
        // Navigated to via AdminMenu.openBranch(); this class only interacts once there.
    }

    /**
     * TC-BRANCH-005: grid row count observed without clicking Search (auto-load check).
     * Repair (2026-07-12, Automation Repair Loop — EXEC-20260712-002-001): the original version
     * checked the row count immediately after navigation, before the Angular grid's async render
     * completed (0 rows observed, despite Discovery directly confirming 149 rows do auto-load).
     * Now polls for a real end-state instead of a fixed-timing assumption, mirroring the
     * waitUntil pattern already used in AdminPages.Login.LogIn_Page.
     */
    public int getVisibleRowCountWithoutSearch() {
        long deadline = System.currentTimeMillis() + 8000L;
        int count = 0;
        while (System.currentTimeMillis() < deadline) {
            count = driver.getDriver().findElements(Tbl_Rows).size();
            if (count > 0) return count;
            try {
                Thread.sleep(250);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return count;
            }
        }
        return count;
    }

    // ---- Add Branch ----
    public Branch_Page openAddBranch() {
        driver.element().click(Btn_CreateBranch);
        return this;
    }

    public Branch_Page fillRequiredCore(String operatingCountry, String name, String phone) {
        driver.element().type(Txt_OperatingCountry, operatingCountry);
        driver.element().select(Txt_OperatingCountry, operatingCountry);
        driver.element().type(Txt_Name, name);
        driver.element().type(Txt_PhoneNo, phone);
        return this;
    }

    /** TC-BRANCH-003/004: types directly into Name without the rest of the required fields, to
     *  observe boundary/security-probe input handling in isolation. */
    public Branch_Page typeNameOnly(String value) {
        driver.element().type(Txt_Name, value);
        return this;
    }

    public Branch_Page submit() {
        driver.element().click(Btn_SendForApproval);
        return this;
    }

    /** TC-BRANCH-002/003/004 (Partially Automatable, per Test Design assumption-based framing):
     *  captures whatever validation text is present rather than asserting an invented message. */
    public String getValidationSummaryTextIfPresent() {
        List<WebElement> els = driver.getDriver().findElements(Txt_ValidationSummary);
        return els.isEmpty() ? null : els.get(0).getText();
    }

    public String currentUrl() {
        return driver.getDriver().getCurrentUrl();
    }

    /** Filters the List grid down to a single Branch name, so its row is on the visible page
     *  (149 records paginate 10/page) before an Actions-column action targets it. */
    public Branch_Page searchByName(String branchName) {
        driver.element().type(Txt_BranchNameFilter, branchName);
        driver.element().click(Btn_Search);
        return this;
    }

    // ---- Actions column (TC-BRANCH-007) ----
    /** Row-scoped to the given Branch name, so the click can never land on a different,
     *  pre-existing record's Reject icon (Repair, EXEC-20260712-002-001). */
    public Branch_Page openReject(String branchName) {
        By icnThumbDownForRow = By.xpath(
                "//tr[td[contains(text(),'" + branchName + "')]]//i[@class=\"pi pi-thumbs-down\"]");
        driver.element().click(icnThumbDownForRow);
        return this;
    }

    public boolean attemptSubmitWithEmptyRemark() {
        // Deliberately does not type into Txt_Remarks first.
        List<WebElement> submitBtn = driver.getDriver().findElements(Btn_SubmitApprove);
        if (submitBtn.isEmpty()) return false;
        boolean enabledBefore = submitBtn.get(0).isEnabled();
        return enabledBefore; // false/disabled == the safety control is working
    }

    public Branch_Page submitRejectWithRemark(String remark) {
        driver.element().type(Txt_Remarks, remark);
        driver.element().click(Btn_SubmitApprove);
        return this;
    }
}
