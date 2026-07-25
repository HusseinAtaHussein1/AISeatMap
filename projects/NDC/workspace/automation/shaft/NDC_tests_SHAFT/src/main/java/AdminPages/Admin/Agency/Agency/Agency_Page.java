package AdminPages.Admin.Agency.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Export package, Target = "compatible with the Reference Project" — RUN-20260712-002 (Stage 4).
 *
 * UNLIKE Branch_Page and Staff_Page, this class is authored FRESH from this run's own live
 * Discovery (Agency_Add.md, agency_add.png), not reused from the Reference Project. Inspection of
 * the Reference Project's own Agency Add page objects found them unsuitable for reuse:
 *   - AddAgencyCore_Page.java targets a materially different, older form (ids like "groupId",
 *     "agencyphone", "orgModal.address", jQuery-UI-style ".ui-datepicker-year") that does not match
 *     any field this run's own live Discovery observed (which found PrimeNG-style
 *     "id-Branch"/"id-Agency"/"id-Country" etc.) — a Reference Project staleness gap, not something
 *     to reuse or silently "fix" in place (agents/automation_agent.md §32.2/§32.4).
 *   - AddAgency_Page.java is an empty stub (constructor only, no locators/methods at all).
 * This gap is recorded in AutomationPlan_SHAFT.md's Known Limitations / Assumptions.
 *
 * SearchAgency_Page.java (List/Search), by contrast, WAS current and reusable — but this run's
 * automated test cases don't need it (TC-AGENCY-003, the List auto-load question, is an
 * Exploratory/manual charter per Test Design, not automated this run), so it is not duplicated here.
 *
 * EXTENDED 2026-07-18 (RUN-20260718-001, Stage 4 — new tests_SHAFT_Agency package): this same
 * class now doubles as the Update Agency page object too — live discovery
 * (runs/RUN-20260718-001/discovery/Agency_Update.md) confirmed /admin/agency/edit/{id} renders the
 * identical field ids as /admin/agency/add, just pre-populated. Every locator/method added below is
 * backed by that same discovery pass (input-id DOM dump) plus Agency_Add.md's/the live full-page
 * screenshot's field inventory — never fabricated. Fields the discovery pass could NOT confirm a
 * real id for (Bank Account Details, Sales Contact "Designation", document remove/replace, "Enable
 * Search Limit"'s own checkbox, the entire PCC/Airline Supplier Credential section, "Save as Draft")
 * are deliberately NOT given locators here — see FINDING-008 and AutomationPlan_SHAFT_Agency.md
 * "Blocked"/"Deferred" tables.
 */
public class Agency_Page {
    public Agency_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    // ---- Add Agency form (locators from this run's own Discovery, Agency_Add.md) ----
    By Lst_Branch = By.xpath("//p-dropdown[.//input[@id=\"id-Branch\"]]");
    By Txt_BranchFilter = By.xpath("//input[contains(@class,'p-dropdown-filter')]");
    By Txt_Agency = By.xpath("//input[@id=\"id-Agency\"]");
    By Txt_Country = By.xpath("//input[@id=\"id-Country\"]");
    By Txt_Address1 = By.xpath("//textarea[@placeholder=\"Address 1\"]");
    By Txt_PhoneNo = By.xpath("(//input[@id=\"Phone No\"])[1]");
    // Repair Round 2, follow-on #2 (2026-07-13): same hidden-proxy-input pattern as Lst_Branch —
    // exposed only once selectBranch() itself started working and the flow reached this far.
    // Wrapped in its p-radiobutton container, matching Branch_Page.java's own
    // Btn_Active/Btn_Inactive/Btn_Both convention for PrimeNG radio buttons.
    By Rbtn_BusinessTypeB2B = By.xpath("//p-radiobutton[.//input[@id=\"id-AgencyBusinessType-B2B\"]]");
    By Txt_ContactPerson = By.xpath("//input[@id=\"id-Contactperson\"]");
    By Txt_OwnerEmailID = By.xpath("(//input[@id=\"id-EmailID\"])[1]");
    By Txt_OwnerPhone = By.xpath("(//input[@id=\"Phone Number\"])[1]");
    By Btn_SendForApproval = By.xpath("//button[normalize-space()=\"Send For Approval\"]");
    By Txt_ValidationSummary = By.xpath("//*[contains(@class,'p-error') or contains(@class,'invalid-feedback')]");

    // ---- Full-form required fields (2026-07-13) ----
    // Discovered live via tools/browser_driver that TC-AGENCY-001/004's original scope (Core +
    // BusinessType + Owner Details only) never actually submitted: clicking "Send For Approval"
    // with these fields still empty left the form ng-invalid and blocked (silently, since the
    // original test asserted nothing after .submit() — see ExecutionResults.md's Repair Round 2
    // correction). Every locator/interaction below was individually confirmed live before porting.
    By Lst_State = By.xpath("//p-dropdown[.//input[@id=\"id-State\"]]");
    By Lst_City = By.xpath("//p-dropdown[.//input[@id=\"id-City\"]]");
    By Txt_PostOfficeBox = By.xpath("//input[@id=\"id-Postofficebox\"]");
    // Country is intentionally NOT a locator here -- it auto-fills (disabled) from the selected
    // Branch and is never user-interactable.
    By File_UploadDocument = By.xpath("(//input[@type=\"file\"])[1]");
    By Dpick_ContractStartDate = By.xpath("//input[@id=\"id-ContractStartDate\"]");
    By Dpick_ContractEndDate = By.xpath("//input[@id=\"id-ContractEndDate\"]");
    // Scoped by proximity to its own "Upload logo" button text, NOT a raw positional file-input
    // index -- the Document section's file input count can change (see fillDocumentSection's own
    // note), which would silently shift a purely positional index onto the wrong field.
    By File_UploadLogo = By.xpath("(//button[contains(normalize-space(.),\"Upload logo\")]/following::input[@type=\"file\"])[1]");
    By Txt_SalesContactName = By.xpath("//input[@id=\"id-Name\"]");
    By Txt_SalesContactEmail = By.xpath("(//input[@id=\"id-EmailID\"])[2]");
    By Txt_SalesContactPhone = By.xpath("(//input[@id=\"Phone Number\"])[2]");
    By Lst_InvoiceGeneration = By.xpath("//p-dropdown[.//input[@id=\"id-Invoicegeneration\"]]");
    By Cbox_PaymentOptionCash = By.xpath("//p-checkbox[.//input[@id=\"id-Paymentoption-Cash\"]]");
    By Txt_SuccessToast = By.xpath("//*[contains(@class,'p-toast') or @role='alert' or contains(@class,'p-message')]");

    /**
     * Repair Round 1 (2026-07-12, EXEC-20260712-002-001): the original type()+select() failed with
     * InvalidElementStateException — id-Branch is a PrimeNG-style dropdown (click-to-open,
     * pick-from-list), not a native &lt;select&gt;. Rewritten to click-open then click-matching-option,
     * same pattern as the Reference Project's Branch_Page.Lst_StateCreate(). That still failed with
     * ElementNotInteractableException, because Lst_Branch clicked the hidden proxy &lt;input&gt; itself.
     *
     * Repair Round 2 (2026-07-13, Repair Summary #3): Lst_Branch now targets the visible
     * `p-dropdown` wrapper element (`//p-dropdown[.//input[@id="id-Branch"]]`), not the raw input —
     * matching this same package's own Branch_Page.java convention (Lst_Country/Lst_State/Lst_City
     * all wrap their input in a `p-dropdown[...]` selector rather than selecting the input directly).
     *
     * Repair Round 2, follow-on (2026-07-13, discovered live once the dropdown-open click itself
     * started working): the option locator was `//span[contains(text(), '%s')]` — completely
     * unscoped, so a common test-data value like "Test" matched every span containing that
     * substring anywhere on the page (MultipleElementsFoundException). Scoping to
     * `li[@role='option']` alone was still insufficient: live DOM inspection
     * (scratchpad/agency_branch_dropdown_panel.html, 2026-07-13) showed every option renders as
     * "{Branch Name} (BRNxxx)" (e.g. "Test (BRN2)"), and this specific STG dataset has ~150 Branch
     * records, several of which contain "Test" as a substring ("TESTING (BRN111)",
     * "Test NDC MSG (BRN221)", "testtttt (BRN133)", etc.) — any `contains()` match, however scoped,
     * still hits more than one. Fixed by (1) typing into the dropdown's own filter input first
     * (`p-dropdown-filter`, confirmed present in the same DOM dump) to narrow the rendered option
     * list, then (2) matching the option via `starts-with(..., '{branch} (')` — the space+open-paren
     * suffix disambiguates "Test (BRN2)" from "Test NDC MSG (BRN221)", which starts-with("Test ")
     * would not.
     */
    public Agency_Page selectBranch(String branch) throws InterruptedException {
        driver.element().click(Lst_Branch);
        driver.element().type(Txt_BranchFilter, branch);
        By option = By.xpath(String.format(
                "//li[@role='option']//span[starts-with(normalize-space(text()), '%s (')]", branch));
        driver.element().click(option);
        // Country's Branch-triggered auto-fill (and consequently State's option list readiness)
        // needs a brief moment to settle -- confirmed live, 2026-07-13.
        Thread.sleep(600);
        return this;
    }

    /**
     * Confirmed live (2026-07-13): the Agency name field's typed value was found empty at
     * submit-time despite being typed here, immediately after selectBranch() -- an Angular
     * re-render triggered by Branch's Country auto-fill settling appears to reset this field if
     * typing happens too close to that event. Re-verifies and retypes once if the value didn't
     * stick, rather than guessing at a longer fixed wait (Angular's own settling time isn't a
     * constant this platform can reliably predict).
     */
    public Agency_Page fillRequiredCore(String agencyName, String address1, String phone) throws InterruptedException {
        driver.element().type(Txt_Agency, agencyName);
        driver.element().type(Txt_Address1, address1);
        driver.element().type(Txt_PhoneNo, phone);
        Thread.sleep(400);
        String actual = driver.element().getAttribute(Txt_Agency, "value");
        if (actual == null || !actual.equals(agencyName)) {
            driver.element().type(Txt_Agency, agencyName);
        }
        return this;
    }

    public Agency_Page fillOwnerDetails(String contactPerson, String email, String phone) {
        driver.element().type(Txt_ContactPerson, contactPerson);
        driver.element().type(Txt_OwnerEmailID, email);
        driver.element().type(Txt_OwnerPhone, phone);
        return this;
    }

    /** TC-AGENCY-CREATE-007: types directly into Phone No without the rest of the required
     *  fields, to probe non-numeric input handling in isolation. */
    public Agency_Page typePhoneOnly(String value) {
        driver.element().type(Txt_PhoneNo, value);
        return this;
    }

    public String getPhoneNoValue() {
        return driver.element().getAttribute(Txt_PhoneNo, "value");
    }

    /** TC-AGENCY-CREATE-008: Country auto-fills (disabled) once a Branch is selected. */
    public String getCountryValue() {
        return driver.element().getAttribute(Txt_Country, "value");
    }

    public String getCountryDisabledAttribute() {
        return driver.element().getAttribute(Txt_Country, "disabled");
    }

    /**
     * TC-AGENCY-005: types Unicode input into Contact person specifically.
     * Repair (2026-07-12, Automation Repair Loop — EXEC-20260712-002-001): native sendKeys
     * (SHAFT's type()) dropped the Arabic portion of the string entirely while a CJK portion
     * survived — a recognized Selenium/ChromeDriver bidi-input limitation, not an application
     * defect. Sets the value directly via JavaScript instead, dispatching input/change events so
     * any Angular reactive-form binding still registers the change.
     */
    public Agency_Page typeContactPersonOnly(String value) {
        WebElement el = driver.getDriver().findElement(Txt_ContactPerson);
        JavascriptExecutor js = (JavascriptExecutor) driver.getDriver();
        js.executeScript(
                "arguments[0].value = arguments[1];"
                        + "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));"
                        + "arguments[0].dispatchEvent(new Event('change', { bubbles: true }));",
                el, value);
        return this;
    }

    public Agency_Page selectBusinessTypeB2B() {
        driver.element().click(Rbtn_BusinessTypeB2B);
        return this;
    }

    /**
     * State/City are independent cascading PrimeNG dropdowns (Country auto-fills from Branch and
     * needs no interaction). Confirmed live: no filter typing needed, options render directly on
     * open (unlike Branch's ~150-record list) -- exact-match click is sufficient.
     *
     * Explicit waits confirmed necessary live (2026-07-13): City's option list only populates
     * asynchronously once State's selection is registered, and Country's own Branch-triggered
     * auto-fill needs a brief moment to settle before State's dropdown is meaningfully open --
     * mirroring the same Angular-async-render gap already documented for Lst_Branch/REP-005.
     */
    public Agency_Page selectStateAndCity(String state, String city) throws InterruptedException {
        Thread.sleep(600);
        driver.element().click(Lst_State);
        Thread.sleep(500);
        driver.element().click(By.xpath(String.format("//li[@role='option']//span[normalize-space(text())='%s']", state)));
        Thread.sleep(600);
        driver.element().click(Lst_City);
        Thread.sleep(500);
        driver.element().click(By.xpath(String.format("//li[@role='option']//span[normalize-space(text())='%s']", city)));
        return this;
    }

    public Agency_Page fillPostOfficeBox(String value) {
        driver.element().type(Txt_PostOfficeBox, value);
        return this;
    }

    /** TC-AGENCY-UPDATE-004: clears Agency Name (a mandatory field) to probe validation on Update. */
    public Agency_Page clearAgencyName() {
        driver.element().type(Txt_Agency, "");
        return this;
    }

    /** Sends the file path directly to the (visually hidden) native file input -- standard
     *  Selenium/SHAFT technique, bypasses the OS-native file picker dialog entirely. */
    public Agency_Page uploadDocument(String absoluteFilePath) throws InterruptedException {
        driver.getDriver().findElement(File_UploadDocument).sendKeys(absoluteFilePath);
        Thread.sleep(500);
        return this;
    }

    /** TC-AGENCY-CREATE-015: scoped to the form container that wraps the Document file input
     *  (an Angular reactive form, confirmed structurally by File_UploadDocument's own presence),
     *  not a full-page body-text scan — checks whether the uploaded file's name is shown anywhere
     *  within that container. */
    private By documentFormContainer() {
        return By.xpath("//form[.//input[@type=\"file\"]]");
    }

    public boolean isDocumentNameDisplayed(String fileNameFragment) {
        List<WebElement> containers = driver.getDriver().findElements(documentFormContainer());
        return !containers.isEmpty() && containers.get(0).getText().contains(fileNameFragment);
    }

    /** Confirmed live (Add-form screenshot): an "Upload logo Preview" box exists next to the
     *  Upload logo button — scoped by proximity to that same button, mirroring File_UploadLogo's
     *  own following::-based convention, instead of a page-wide //img query. */
    private By Img_LogoPreview = By.xpath("(//button[contains(normalize-space(.),\"Upload logo\")]/following::img)[1]");

    public boolean isLogoPreviewDisplayed() {
        return !driver.getDriver().findElements(Img_LogoPreview).isEmpty();
    }

    /**
     * p-calendar requires real per-character keystroke events to trigger its internal date-mask
     * parsing -- confirmed live that a scripted single-shot value assignment (Playwright's .fill(),
     * the JS-injection equivalent) leaves the field empty despite appearing to "work." SHAFT's
     * type() already sends character-by-character keystrokes (Selenium sendKeys semantics), so no
     * special handling is needed here beyond the normal type() call, unlike the Playwright
     * discovery script which had to switch from .fill() to page.keyboard.type() explicitly.
     *
     * Deliberately does NOT click the Document section's "Add" button afterward -- confirmed live
     * that doing so appends a second, empty, itself-required document row that then blocks
     * submission (Angular validates it as required even though it's meant as an optional "add
     * another attachment" row). The single default row is sufficient on its own.
     */
    public Agency_Page fillContractDates(String startDate, String endDate) throws InterruptedException {
        driver.element().click(Dpick_ContractStartDate);
        driver.element().type(Dpick_ContractStartDate, startDate);
        driver.getDriver().findElement(Dpick_ContractStartDate).sendKeys(org.openqa.selenium.Keys.TAB);
        Thread.sleep(300);
        driver.element().click(Dpick_ContractEndDate);
        driver.element().type(Dpick_ContractEndDate, endDate);
        driver.getDriver().findElement(Dpick_ContractEndDate).sendKeys(org.openqa.selenium.Keys.TAB);
        Thread.sleep(300);
        return this;
    }

    public Agency_Page uploadLogo(String absoluteFilePath) throws InterruptedException {
        driver.getDriver().findElement(File_UploadLogo).sendKeys(absoluteFilePath);
        Thread.sleep(500);
        return this;
    }

    /** Fills the one default Sales Contact row; deliberately does not click its "Add" button, for
     *  the same reason as fillContractDates() -- it appends an extra, empty, required row. */
    public Agency_Page fillSalesContact(String name, String email, String phone) throws InterruptedException {
        driver.element().type(Txt_SalesContactName, name);
        driver.element().type(Txt_SalesContactEmail, email);
        driver.element().type(Txt_SalesContactPhone, phone);
        Thread.sleep(300);
        return this;
    }

    /** TC-AGENCY-CREATE-019: reads the Sales Contact Name field as-is (e.g. to observe whether it
     *  was pre-populated from the Branch Contact, without asserting a specific inherited value). */
    public String getSalesContactNameValue() {
        return driver.element().getAttribute(Txt_SalesContactName, "value");
    }

    /** TC-AGENCY-CREATE-020: the "Add" control for another Sales Contact row, scoped by proximity
     *  to the Sales Contact section's own heading where present, falling back to any "Add" button
     *  on the form — mirrors the same section-relative scoping already used for File_UploadLogo. */
    private By Btn_AddSalesContact = By.xpath(
            "//h5[contains(.,'Sales Contact')]/following::button[normalize-space()='Add'][1] | //button[normalize-space()='Add']");

    public boolean isAddSalesContactButtonPresent() {
        return !driver.getDriver().findElements(Btn_AddSalesContact).isEmpty();
    }

    public Agency_Page selectInvoiceGeneration(String option) throws InterruptedException {
        driver.element().click(Lst_InvoiceGeneration);
        Thread.sleep(500);
        driver.element().click(By.xpath(String.format("//li[@role='option']//span[normalize-space(text())='%s']", option)));
        Thread.sleep(300);
        return this;
    }

    /** Invoice Generation's own option list is data-driven and not stable across environments —
     *  confirmed live (RUN-20260718-001) that clicking whichever option renders first is
     *  sufficient for a successful submission; used where the specific option's label doesn't
     *  matter to the test case. */
    public Agency_Page selectFirstInvoiceGenerationOption() throws InterruptedException {
        driver.element().click(Lst_InvoiceGeneration);
        Thread.sleep(500);
        driver.element().click(By.xpath("//li[@role='option']"));
        Thread.sleep(300);
        return this;
    }

    public Agency_Page selectPaymentOptionCash() {
        driver.element().click(Cbox_PaymentOptionCash);
        return this;
    }

    /**
     * A genuine create triggers a POST + client-side navigation back to /admin/agency (confirmed
     * live via network inspection: POST .../agency/ -> 204). Polls for that navigation instead of a
     * fixed sleep -- confirmed live (2026-07-13) that a fixed 3-5s wait was itself a race: one run's
     * follow-up diagnostic call threw NoSuchElementException on the Add form's own id-Agency input,
     * proving the page HAD already navigated away by the time that diagnostic ran, moments after the
     * fixed-wait assertion had already (incorrectly) read the pre-navigation URL as still blocked.
     * Bounded at 10s; if navigation never happens, returns anyway and lets the caller's own
     * assertion report the real, final state.
     */
    public Agency_Page submit() throws InterruptedException {
        driver.element().click(Btn_SendForApproval);
        long deadline = System.currentTimeMillis() + 10000L;
        while (System.currentTimeMillis() < deadline) {
            if (!driver.getDriver().getCurrentUrl().contains("/add")) return this;
            Thread.sleep(300);
        }
        return this;
    }

    /** TC-AGENCY-002/004/005 (Partially Automatable): captures whatever validation text is present
     *  rather than asserting an invented message. */
    public String getValidationSummaryTextIfPresent() {
        List<WebElement> els = driver.getDriver().findElements(Txt_ValidationSummary);
        return els.isEmpty() ? null : els.get(0).getText();
    }

    /** TC-AGENCY-CREATE-038: scoped to the Add Agency form itself (anchored on the confirmed
     *  id-Agency field), not a full-page body-text scan — a script-tag payload reflected unescaped
     *  would render as literal text within this container. */
    private By addAgencyFormContainer() {
        return By.xpath("//form[.//input[@id=\"id-Agency\"]]");
    }

    public boolean formContentContainsRawScriptTag() {
        List<WebElement> forms = driver.getDriver().findElements(addAgencyFormContainer());
        return !forms.isEmpty() && forms.get(0).getText().contains("<script>");
    }

    public String getContactPersonValue() {
        return driver.element().getAttribute(Txt_ContactPerson, "value");
    }

    /** TC-AGENCY-001's real success oracle (2026-07-13): the app shows a toast reading "Added
     *  Successfully" and navigates from /admin/agency/add back to /admin/agency on a genuine
     *  create -- confirmed live via network inspection (POST .../agency/ -> 204). Returns null if
     *  no toast is present (e.g., validation still blocked submission). */
    public String getSuccessToastTextIfPresent() {
        List<WebElement> els = driver.getDriver().findElements(Txt_SuccessToast);
        return els.isEmpty() ? null : els.get(0).getText();
    }

    public String getCurrentUrl() {
        return driver.getDriver().getCurrentUrl();
    }

    /** Diagnostic only (2026-07-13): lists every currently ng-invalid field's id/tag, so a failed
     *  submission attempt can be root-caused instead of guessed at again. */
    public String getAgencyNameValue() {
        return driver.element().getAttribute(Txt_Agency, "value");
    }

    public String getInvalidFieldsDiagnostic() {
        JavascriptExecutor js = (JavascriptExecutor) driver.getDriver();
        Object result = js.executeScript(
                "return Array.from(document.querySelectorAll('.ng-invalid'))" +
                        ".filter(e => ['INPUT','P-DROPDOWN','P-CALENDAR','P-CHECKBOX','P-RADIOBUTTON','TEXTAREA'].includes(e.tagName))" +
                        ".map(e => e.tagName + (e.id ? ('#' + e.id) : '')).join(', ');");
        return String.valueOf(result);
    }

    // ================================================================================
    // EXTENSIONS — RUN-20260718-001, confirmed live via Agency_Update.md's input-id dump
    // and the Add form's full-page screenshot. Used for both /add and /edit/{id}.
    // ================================================================================

    By Txt_CompanyURL = By.id("id-CompanyURL");
    By Txt_FaxNo = By.id("id-FaxNo");
    By Rbtn_IATAAgencyYes = By.xpath("//p-radiobutton[.//input[@id=\"id-IATAAgency-yes\"]]");
    By Rbtn_IATAAgencyNo = By.xpath("//p-radiobutton[.//input[@id=\"id-IATAAgency-No\"]]");
    By Txt_CreditLimit = By.xpath("//input[@id=\"id-Creditlimit\"]");
    By Txt_TopUpLimit = By.xpath("//input[@id=\"id-Topuplimit\"]");
    By Txt_CreditTermsDays = By.xpath("//input[@id=\"id-CreditTerms(Days)\"]");
    By Txt_ReachingPercentage = By.xpath("//input[@id=\"id-ReachingPercentage\"]");
    By Txt_WarningPromptDays = By.xpath("//input[@id=\"id-WarningPrompt(Days)\"]");
    By Cbox_CreditAgency = By.xpath("//p-checkbox[.//input[@id=\"id--Creditagency\"]]");
    By Cbox_SelectProductFlight = By.xpath("//p-checkbox[.//input[@id=\"id-SelectProduct-Flight\"]]");
    By Cbox_SelectProductOthers = By.xpath("//p-checkbox[.//input[@id=\"id-SelectProduct-Others\"]]");
    By Cbox_ImportPNROption = By.xpath("//p-checkbox[.//input[@id=\"id--ImportPNROption\"]]");
    By Cbox_TransferPNROption = By.xpath("//p-checkbox[.//input[@id=\"id--TransferPnrOption\"]]");
    By Cbox_BlueCommandScreen = By.xpath("//p-checkbox[.//input[@id=\"id--BlueCommandScreen\"]]");
    By Btn_Cancel = By.xpath("//button[normalize-space(.)='Cancel']");

    public Agency_Page fillCompanyURL(String url) {
        driver.element().type(Txt_CompanyURL, url);
        return this;
    }

    public Agency_Page fillFaxNo(String faxNo) {
        driver.element().type(Txt_FaxNo, faxNo);
        return this;
    }

    public Agency_Page selectIATAAgency(boolean yes) {
        driver.element().click(yes ? Rbtn_IATAAgencyYes : Rbtn_IATAAgencyNo);
        return this;
    }

    /** Confirmed live (Agency_Update.md): Credit Limit/Top-Up Limit/Credit Terms (Days) carry real
     *  server-side defaults (50000/500000/1) even when never filled — this method is only needed
     *  for cases that deliberately override or probe those defaults (e.g. non-numeric rejection). */
    public Agency_Page fillPaymentSettingsNumericFields(String creditLimit, String topUpLimit, String creditTermsDays) {
        driver.element().type(Txt_CreditLimit, creditLimit);
        driver.element().type(Txt_TopUpLimit, topUpLimit);
        driver.element().type(Txt_CreditTermsDays, creditTermsDays);
        return this;
    }

    public String getCreditLimitValue() {
        return driver.element().getAttribute(Txt_CreditLimit, "value");
    }

    public Agency_Page fillReachingPercentage(String value) {
        driver.element().type(Txt_ReachingPercentage, value);
        return this;
    }

    public String getReachingPercentageValue() {
        return driver.element().getAttribute(Txt_ReachingPercentage, "value");
    }

    public Agency_Page fillWarningPromptDays(String value) {
        driver.element().type(Txt_WarningPromptDays, value);
        return this;
    }

    public Agency_Page toggleCreditAgency() {
        driver.element().click(Cbox_CreditAgency);
        return this;
    }

    /** Generic payment-option toggle by its confirmed id suffix (e.g. "Wallet", "CreditCard",
     *  "BANQUEMISR") — mirrors selectPaymentOptionCash()'s own convention rather than duplicating a
     *  dedicated method per option, since the option list is long and data-driven (~26 items,
     *  confirmed live via the Update-screen id dump). */
    public Agency_Page togglePaymentOption(String idSuffix) {
        driver.element().click(By.xpath(String.format(
                "//p-checkbox[.//input[@id=\"id-Paymentoption-%s\"]]", idSuffix)));
        return this;
    }

    public Agency_Page selectProductFlight() {
        driver.element().click(Cbox_SelectProductFlight);
        return this;
    }

    public Agency_Page selectProductOthers() {
        driver.element().click(Cbox_SelectProductOthers);
        return this;
    }

    public Agency_Page toggleImportPNROption() {
        driver.element().click(Cbox_ImportPNROption);
        return this;
    }

    public Agency_Page toggleTransferPNROption() {
        driver.element().click(Cbox_TransferPNROption);
        return this;
    }

    public Agency_Page toggleBlueCommandScreen() {
        driver.element().click(Cbox_BlueCommandScreen);
        return this;
    }

    /** TC-AGENCY-CREATE-036: abandons the in-progress form. Confirmed live (Agency_Update.md) that
     *  the equivalent button on the Update screen navigates back to /admin/agency the same way. */
    public Agency_Page clickCancel() {
        driver.element().click(Btn_Cancel);
        return this;
    }

    public String getCompanyURLValue() {
        return driver.element().getAttribute(Txt_CompanyURL, "value");
    }

    public String getPostOfficeBoxValue() {
        return driver.element().getAttribute(Txt_PostOfficeBox, "value");
    }
}
