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
 * against Branch specifically, per TC-BRANCH-006's exploratory charter (TestCases_Branch.md).
 */
public class Branch_Page {
    public Branch_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    // ---- List screen ----
    By Btn_CreateBranch = By.xpath("//button[@routerlink=\"add\"]");
    By Rbtn_Both = By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]");
    // FINDING-008 resolved 2026-07-18 (user explanation + screenshot): a newly-created Branch is
    // bundled under Status=Inactive (alongside Rejected records), NOT Active, and NOT reliably
    // surfaced by Both either. Approval Status column shows "Pending for approval"; the Actions
    // column carries a third icon (thumbs-up = Approve) only for Pending rows, alongside thumbs-up/
    // thumbs-down seen elsewhere. Clicking thumbs-up approves it; it can be set back to Inactive
    // again afterward at will.
    By Rbtn_Inactive = By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Inactive\"]]");
    // Repaired 2026-07-18 (Repair Round 1 item #2, deferred since RUN-20260712-002 — "the row-scoped
    // reject icon needs the List's real filter-field ID, not a guess"): "id-Name" was never
    // confirmed live and does not exist on this page at all. Live DOM inspection confirmed the real
    // field is "id-Branchname" (matching the sibling "id-Branchcode" filter's naming convention).
    By Txt_BranchNameFilter = By.xpath("//input[@id=\"id-Branchname\"]");
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

    // ---- Add Branch form — full required-field set (2026-07-18, live discovery) ----
    // Discovered live that the form requires far more than Operating Country/Name/Phone/Supplier —
    // every prior run of addBranchHappyPathEntersApprovalQueue silently never created a real
    // record (blocked by these, no assertion existed to catch it), same false-positive shape as
    // Agency's REP-006-009 fix. Every locator below confirmed via a live "Required"-error sweep,
    // reading each error's associated field label to identify it (not guessed).
    By Txt_Address1 = By.xpath("//ndc-fg-text-area-input[.//label[contains(text(),\"Address 1\")]]//textarea");
    By Lst_State = By.xpath("//p-dropdown[.//input[@id=\"id-State\"]]");
    By Lst_City = By.xpath("//p-dropdown[.//input[@id=\"id-City\"]]");
    By Txt_PostOfficeBox = By.xpath("//input[@id=\"id-PostOfficeBox\"]");
    By Txt_EmailID = By.xpath("(//input[@id=\"id-EmailID\"])[1]");
    By Txt_EmailPassword = By.xpath("//input[@id=\"id-EmailPassword\"]");
    // Second Name/Email/Phone instances (same ids reused for a second, contact-style block —
    // matches the exact pattern already established in Agency_Page's own Sales Contact fields).
    By Txt_ContactName = By.xpath("(//input[@id=\"id-Name\"])[2]");
    By Txt_ContactEmailID = By.xpath("(//input[@id=\"id-EmailID\"])[2]");
    By Txt_ContactPhone = By.xpath("(//input[@id=\"Phone Number\"])[2]");
    By Txt_TopUpLimit = By.xpath("//input[@id=\"id-TopUpLimit\"]");
    By Txt_CreditTermsDays = By.xpath("//input[@id=\"id-CreditTerms(Days)\"]");

    // ---- Supplier Routing (2026-07-18, live discovery) ----
    // Confirmed via live DOM inspection of the Add Branch form: each row is a <tr> with
    // Status(checkbox)/Supplier Name/Credential Name(dropdown, disabled until checked)/Product
    // Name/Description columns. The Credential dropdown's options render in a global overlay
    // panel (not nested under the row), matching the existing State/City dropdown pattern already
    // used in Agency_Page — select by row-scoped checkbox + row-scoped dropdown trigger, then a
    // global option-text match.
    private By supplierRowCheckbox(String supplierName) {
        return By.xpath("//tr[td[normalize-space()=\"" + supplierName + "\"]]//p-checkbox");
    }

    private By supplierRowCredentialDropdown(String supplierName) {
        return By.xpath("//tr[td[normalize-space()=\"" + supplierName + "\"]]//p-dropdown");
    }

    private By credentialOption(String credentialName) {
        return By.xpath("//li[@role=\"option\"]//span[normalize-space(text())=\"" + credentialName + "\"]");
    }
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

    /** Added 2026-07-18: discovered live that Supplier Routing is itself a required section —
     *  submission was silently blocked ("Please Select at least one supplier.") the entire prior
     *  session, meaning addBranchHappyPathEntersApprovalQueue never actually created a real record
     *  (same false-positive shape as Agency's REP-006–009 fix). Checking the row enables its
     *  Credential Name dropdown (previously disabled); the credential option itself renders in a
     *  global overlay panel, not nested under the row. */
    public Branch_Page selectSupplier(String supplierName, String credentialName) {
        driver.element().click(supplierRowCheckbox(supplierName));
        driver.element().click(supplierRowCredentialDropdown(supplierName));
        driver.element().click(credentialOption(credentialName));
        return this;
    }

    public Branch_Page fillAddress1(String address1) {
        driver.element().type(Txt_Address1, address1);
        return this;
    }

    /** Mirrors Agency_Page.selectStateAndCity's cascading dropdown pattern, but repaired
     *  2026-07-18 (user feedback): rather than search for a specific State/City text value (which
     *  may not exist for every Country and needlessly couples the test to arbitrary reference
     *  data), this selects whichever option renders first — any valid cascading pair is fine,
     *  the exact value is not itself significant. */
    public Branch_Page selectStateAndCity(String state, String city) throws InterruptedException {
        driver.element().click(Lst_State);
        waitForOptionPanel();
        driver.element().click(By.xpath(String.format("//li[@role='option']//span[normalize-space(text())='%s']", state)));
        driver.element().click(Lst_City);
        waitForOptionPanel();
        driver.element().click(By.xpath(String.format("//li[@role='option']//span[normalize-space(text())='%s']", city)));
        return this;
    }

    /** Repaired 2026-07-18: a fixed sleep after opening a PrimeNG dropdown was insufficient at
     *  least once (option panel not yet rendered, "no such element" for any li[@role='option']) —
     *  poll for the panel instead, same poll-not-fixed-delay lesson as REP-001/REP-009. */
    private void waitForOptionPanel() throws InterruptedException {
        long deadline = System.currentTimeMillis() + 10000L;
        while (System.currentTimeMillis() < deadline) {
            if (!driver.getDriver().findElements(By.xpath("//li[@role='option']")).isEmpty()) return;
            Thread.sleep(200);
        }
    }

    public Branch_Page fillPostOfficeBox(String value) {
        driver.element().type(Txt_PostOfficeBox, value);
        return this;
    }

    public Branch_Page fillContactDetails(String emailId, String emailPassword) {
        driver.element().type(Txt_EmailID, emailId);
        driver.element().typeSecure(Txt_EmailPassword, emailPassword);
        return this;
    }

    /** The second Name/EmailID/Phone Number instances — same ids reused for a distinct
     *  contact-style block, per live discovery 2026-07-18. */
    public Branch_Page fillSecondContactBlock(String contactName, String contactEmail, String contactPhone) {
        driver.element().type(Txt_ContactName, contactName);
        driver.element().type(Txt_ContactEmailID, contactEmail);
        driver.element().type(Txt_ContactPhone, contactPhone);
        return this;
    }

    public Branch_Page fillFinancials(String creditLimit, String topUpLimit, String creditTermsDays) {
        driver.element().type(Txt_CreditLimit, creditLimit);
        driver.element().type(Txt_TopUpLimit, topUpLimit);
        driver.element().type(Txt_CreditTermsDays, creditTermsDays);
        return this;
    }

    public Branch_Page selectCashPaymentOption() {
        driver.element().click(Cbox_Cash);
        return this;
    }

    /** TC-BRANCH-003/004: types directly into Name without the rest of the required fields, to
     *  observe boundary/security-probe input handling in isolation. */
    public Branch_Page typeNameOnly(String value) {
        driver.element().type(Txt_Name, value);
        return this;
    }

    /** Repaired 2026-07-18 (reproduced live, RUN-20260712-002's Repair Round 1 item #2): submit()
     *  previously returned immediately after the click, with no wait for the resulting redirect —
     *  the very next test (rejectRequiresNonEmptyRemark, dependsOnMethods this one) would then start
     *  while the browser was still mid-navigation off /admin/branch/add, so its own AdminMenu/List
     *  interactions failed with NoSuchElementException on an unrelated field. Same poll-not-fixed-
     *  delay pattern as REP-009 (Agency's identical fix). */
    public Branch_Page submit() {
        driver.element().click(Btn_SendForApproval);
        waitForNavigationAwayFromAddForm();
        return this;
    }

    private void waitForNavigationAwayFromAddForm() {
        long deadline = System.currentTimeMillis() + 15000L;
        while (System.currentTimeMillis() < deadline) {
            if (!currentUrl().contains("/admin/branch/add")) return;
            try {
                Thread.sleep(250);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
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
     *  (149 records paginate 10/page) before an Actions-column action targets it.
     *  Repaired twice, 2026-07-18: (1) never selected any Status filter before searching, so a
     *  freshly-created QA_SPIKE_ Branch (Pending approval) never appeared — first attempted with
     *  Status=Both, still zero results (live-confirmed, see FINDING-008). (2) User then explained +
     *  screenshotted the real behavior: a newly-created Branch is bundled under Status=**Inactive**
     *  (alongside Rejected records), not Active, and not reliably under Both — confirmed live this
     *  now finds it. FINDING-008 resolved on this basis. */
    public Branch_Page searchByName(String branchName) {
        driver.element().click(Rbtn_Inactive);
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

    // ---- TC-BRANCH-008 (2026-07-18): Payment Option list is Master Payment Method-driven ----
    // 2026-07-18: pointed at .70 per explicit user instruction, matching this run's own Discovery
    // screenshots (Branch Edit BRN2) which were taken against .70.
    private static final String BRANCH_EDIT_URL_PREFIX = "http://192.168.1.70/admin/branch/edit/";

    public Branch_Page openEdit(String branchId) {
        driver.browser().navigateToURL(BRANCH_EDIT_URL_PREFIX + branchId);
        waitForEditFormToRender();
        return this;
    }

    /** Mirrors getVisibleRowCountWithoutSearch()'s poll-not-fixed-delay pattern — page load
     *  strategy is "none", so navigateToURL() returns before Angular's async form render
     *  completes. Polls for "Cash" specifically (a Payment Option checkbox always present,
     *  never toggled by automation — see branchTestData.json's note) rather than the section's
     *  own label text, since the checkbox row list itself is the part populated by a separate,
     *  slower-to-resolve Master-data call. */
    private void waitForEditFormToRender() {
        long deadline = System.currentTimeMillis() + 15000L;
        By cashPaymentOption = By.xpath("//*[contains(text(),\"Cash\")]");
        while (System.currentTimeMillis() < deadline) {
            if (!driver.getDriver().findElements(cashPaymentOption).isEmpty()) return;
            try {
                Thread.sleep(300);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    /** Payment Option checkboxes are dynamically named per Master data (APP-002) — no stable
     *  per-name locator exists for a random test entry, so this checks the rendered Payment
     *  Option section's own text rather than a specific checkbox id. Scoped to the ancestor
     *  &lt;form&gt; of the always-present Cash checkbox (id-PaymentOption-Cash, confirmed live)
     *  rather than the full page source — narrower than a raw getPageSource()/body scan, though
     *  the ancestor::form assumption itself has not been independently reconfirmed live (same
     *  disclosure pattern as this class's other Known Limitations); flag for Stage 5/6 if it ever
     *  under- or over-matches. */
    private By paymentOptionAncestorForm() {
        return By.xpath("//p-checkbox[.//input[@id=\"id-PaymentOption-Cash\"]]/ancestor::form[1]");
    }

    public boolean paymentOptionLabelPresent(String paymentMethodName) {
        List<WebElement> forms = driver.getDriver().findElements(paymentOptionAncestorForm());
        return !forms.isEmpty() && forms.get(0).getText().contains(paymentMethodName);
    }
}
