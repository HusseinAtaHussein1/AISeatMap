package AdminPages.Admin.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import utilities.AgencyDataFactory;
import utilities.EnvironmentConfig;

import java.io.File;
import java.time.Duration;
import java.util.List;
import java.util.Set;

/**
 * Page Object for Admin &rarr; Agency &rarr; Add Agency.
 *
 * <p><b>Create Agency is in scope as a means only</b> (ProjectContext §2). Nothing about it is
 * asserted by any in-scope test case; this class exists so the suite can provision the one Agency
 * record it is authorised to act on. That framing matters: a failure here is a <em>provisioning</em>
 * failure, and its message says so rather than implying a defect in Create Agency.
 *
 * <h2>Verified live and headless, read-only, 2026-08-18</h2>
 *
 * <p>The full 74-control inventory of this form was enumerated with zero non-GET requests issued --
 * nothing was typed, no control was clicked, and Send For Approval was never pressed, so no record
 * could be created (evidence {@code addform_locator_verification_run004.json}). Six facts from that
 * pass shape this class, and none of them was inferred from the Update form:
 *
 * <ol>
 *   <li><b>Country is {@code readonly} and derived from Branch.</b> It carries no {@code p-dropdown}
 *       wrapper, so it is neither typed nor selected -- it is waited for, then asserted. Discovery
 *       nonetheless recorded {@code Country *} rendering {@code Required} on the empty form, so the
 *       field is mandatory <em>and</em> not user-editable: it becomes satisfied only by choosing a
 *       Branch.
 *   <li><b>Branch, State, City, Invoice generation, Account Type, Month and Year are all
 *       {@code readonly} inputs inside {@code p-dropdown} wrappers.</b> Typing into any of them is
 *       impossible; each is driven through its wrapper's overlay panel (knowledge item APP-002).
 *   <li><b>The three phone fields have ids containing spaces</b> -- {@code "Phone No"} and
 *       {@code "Phone Number"}, the latter appearing twice. {@code #Phone No} is not a valid CSS id
 *       selector, so all three are addressed positionally among {@code input[type=tel]}.
 *   <li><b>{@code id-EmailID} appears twice</b> -- [1] Agency Owner, [2] Sales Contact.
 *   <li><b>{@code #id-AccountNumber} and {@code #id-Bankname} exist here but not on the Update
 *       form.</b> They are optional, so the fixture leaves them alone; they are modelled only so the
 *       asymmetry is recorded in code rather than rediscovered.
 *   <li><b>The Product Access grid is empty until a Branch is selected</b> ({@code productAccessRows:
 *       0} on first load). The supplier rows are the selected Branch's own suppliers, which is exactly
 *       why the fixture Branch must be created carrying suppliers (PO-14 / BR-006) -- without them,
 *       {@code "Please select at least one supplier."} can never be satisfied and no Agency can be
 *       created at all.
 * </ol>
 */
public class AddAgency_Page extends Agency_Common {

    private static final String BRANCH_ID = "id-Branch";
    private static final String STATE_ID = "id-State";
    private static final String CITY_ID = "id-City";
    private static final String INVOICE_GENERATION_ID = "id-Invoicegeneration";

    private static final By AGENCY_NAME = By.cssSelector("#id-Agency");
    /** Readonly, auto-filled from Branch. Asserted, never entered. */
    private static final By COUNTRY = By.cssSelector("#id-Country");
    private static final By POST_OFFICE_BOX = By.cssSelector("#id-Postofficebox");
    private static final By COMPANY_URL = By.cssSelector("#id-CompanyURL");
    private static final By FAX_NO = By.cssSelector("#id-FaxNo");

    private static final By ADDRESS_1 = By.xpath("(//textarea)[1]");
    private static final By ADDRESS_2 = By.xpath("(//textarea)[2]");

    /** Three tel inputs in DOM order: agency master, owner, sales contact. Ids contain spaces. */
    private static final By PHONE_NO_MASTER = By.xpath("(//input[@type='tel'])[1]");
    private static final By OWNER_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[2]");
    private static final By SALES_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[3]");

    private static final By CONTACT_PERSON = By.cssSelector("#id-Contactperson");
    private static final By OWNER_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[1]");
    private static final By SALES_CONTACT_NAME = By.cssSelector("#id-Name");
    private static final By SALES_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[2]");

    private static final By DOCUMENT_FILE_INPUT = By.xpath("(//input[@type='file'])[1]");
    private static final By LOGO_FILE_INPUT = By.xpath("(//input[@type='file'])[2]");
    private static final By CONTRACT_START_DATE = By.cssSelector("#id-ContractStartDate");
    private static final By CONTRACT_END_DATE = By.cssSelector("#id-ContractEndDate");

    private static final By CREDIT_LIMIT = By.cssSelector("#id-Creditlimit");
    private static final By TOP_UP_LIMIT = By.cssSelector("#id-Topuplimit");
    private static final By OUTSTANDING_THRESHOLD = By.cssSelector("#id-OutstandingThreshold");
    private static final By CREDIT_TERMS_DAYS = By.cssSelector("[id='id-CreditTerms(Days)']");
    private static final By REACHING_PERCENTAGE = By.cssSelector("#id-ReachingPercentage");
    private static final By WARNING_PROMPT_DAYS = By.cssSelector("[id='id-WarningPrompt(Days)']");

    /** Present on Add but absent from Update. Optional; the fixture does not fill them. */
    private static final By ACCOUNT_NUMBER = By.cssSelector("#id-AccountNumber");
    private static final By BANK_NAME = By.cssSelector("#id-Bankname");

    private static final By PRODUCT_ACCESS_ROWS = By.cssSelector("table tbody tr");

    /**
     * <b>REPAIR-AG-007 (2026-08-19, Stage 5H).</b> Confirmed live: the Agency form's Product Access grid
     * uses a <em>plain native</em> {@code input[type=checkbox]} with no PrimeNG wrapper at all --
     * structurally different from the Branch form's Product Access grid, which wraps its Status
     * checkbox in {@code div.p-checkbox > div.p-checkbox-box} (REPAIR-AG-001). The original locator here
     * assumed the Branch grid's PrimeNG structure transferred; it does not, and matched zero elements on
     * every row. A native checkbox needs no wrapper indirection: it is clicked and read directly.
     */
    private static final By PRODUCT_ACCESS_ROW_CHECKBOXES =
            By.xpath("//table/tbody/tr//input[@type='checkbox']");

    private static final By CANCEL_BUTTON = By.xpath("//button[normalize-space(.)='Cancel']");
    private static final By SEND_FOR_APPROVAL_BUTTON =
            By.xpath("//button[normalize-space(.)='Send For Approval']");

    private static final Duration SUBMIT_OUTCOME_TIMEOUT = Duration.ofSeconds(15);

    public AddAgency_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    /**
     * Opens the blank Add Agency form. Unlike the Update screen this <em>is</em> reachable by URL: it
     * needs no record id, and the verification pass confirmed it renders fully (70 of 72 inputs visible,
     * no spinners, ~500&nbsp;ms).
     */
    public AddAgency_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.addAgencyUrl());
        waitFor(LOAD_TIMEOUT).until(d -> busyIndicatorCount() == 0 && isVisible(AGENCY_NAME));
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

    /**
     * <b>REPAIR-AG-011 (2026-08-19, Stage 5H).</b> Types via real keystrokes, not {@code typeVia}. See
     * {@link Agency_Common#typeRealKeystrokes} for why: confirmed live, {@code typeVia}'s synthetic
     * value assignment left this PrimeNG Calendar field empty after blur, with no error raised.
     */
    public AddAgency_Page setContractStartDate(String value) {
        typeRealKeystrokes(CONTRACT_START_DATE, value);
        return this;
    }

    /** Same correction as {@link #setContractStartDate}, for the same reason (REPAIR-AG-011). */
    public AddAgency_Page setContractEndDate(String value) {
        typeRealKeystrokes(CONTRACT_END_DATE, value);
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
        return isReadOnly(COUNTRY);
    }

    public boolean isAccountNumberPresent() {
        return isPresent(ACCOUNT_NUMBER);
    }

    public boolean isBankNamePresent() {
        return isPresent(BANK_NAME);
    }

    // -- Dropdowns and cascade ------------------------------------------------------------------

    /**
     * <b>REPAIR-AG-006 (2026-08-19, Stage 5H).</b> The Branch dropdown does not use this class's generic
     * {@link #selectFromDropdown}, because its option text is not the bare Branch Name.
     *
     * <p>Confirmed live: the Branch list -- 553 entries on this environment -- renders each option as
     * {@code "{Branch Name} ({Branch Code})"}, e.g. {@code "AAAAA (BRN384)"}. State, City and Invoice
     * generation, by contrast, render plain option text with no such suffix, which is why
     * {@link #selectFromDropdown} is still correct for those and was not changed. An exact match on the
     * bare name -- what the generic helper does -- can never match a Branch option, no matter how long or
     * how many times it retries: the option being waited for does not exist in that form. This is the
     * second time in this class a "the option never appeared" symptom turned out to be a wrong assumption
     * about rendered text rather than a timing or click defect (see {@code BranchSupplierGrid}'s
     * REPAIR-AG-005 for the first).
     *
     * <p>Matched by <b>prefix</b> ({@code starts-with(name, "{branchName} (")}), not by an exact string
     * built from a guessed code, because this method does not know the Branch Code the application will
     * render -- only the name it was given.
     */
    public AddAgency_Page selectBranch(String branchName) {
        By wrapper = dropdownWrapper(BRANCH_ID);
        scrollIntoView(wrapper);
        clickVia(wrapper);
        By option = By.xpath("//div[contains(@class,'p-dropdown-panel')]"
                + "//li[contains(@class,'p-dropdown-item') and starts-with(normalize-space(.),"
                + xpathLiteral(branchName + " (") + ")]");
        waitFor(TRANSIENT_TIMEOUT).until(d -> isVisible(option));
        clickVia(option);
        waitFor(TRANSIENT_TIMEOUT).until(
                d -> textOf(dropdownLabel(BRANCH_ID)).trim().startsWith(branchName + " ("));
        waitFor(LOAD_TIMEOUT).until(d -> !valueOfInput(COUNTRY).isEmpty());
        return this;
    }

    public AddAgency_Page selectState(String visibleText) {
        selectFromDropdown(STATE_ID, visibleText);
        return this;
    }

    public AddAgency_Page selectCity(String visibleText) {
        selectFromDropdown(CITY_ID, visibleText);
        return this;
    }

    public AddAgency_Page selectInvoiceGeneration(String visibleText) {
        selectFromDropdown(INVOICE_GENERATION_ID, visibleText);
        return this;
    }

    // -- Payment option -------------------------------------------------------------------------

    /**
     * Ticks one Payment option checkbox by its option name, e.g. {@code "Cash"}.
     *
     * <p>The form offers 29 of these, of which 26 are personal first names or single letters
     * ({@code -Edgardo}, {@code -Filomena}, {@code -m}, {@code -f} ...). That is FINDING-011, confirmed
     * live on this build. Only {@code Cash}, {@code Wallet} and {@code CreditCard} name real payment
     * methods, and the fixture uses one of those.
     */
    public AddAgency_Page tickPaymentOption(String optionName) {
        String optionId = "id-Paymentoption-" + optionName;
        togglePrimeControl(optionId, checkboxWrapper(optionId));
        return this;
    }

    /** How many Payment option checkboxes the form renders -- the measurement behind FINDING-011. */
    public int paymentOptionCount() {
        return countOf(By.xpath("//input[starts-with(@id,'id-Paymentoption-')]"));
    }

    // -- Product Access -------------------------------------------------------------------------

    public int productAccessRowCount() {
        return countOf(PRODUCT_ACCESS_ROWS);
    }

    /**
     * Ticks the first supplier row in the Product Access grid, satisfying
     * {@code "Please select at least one supplier."}
     *
     * <p>Fails with an explicit provisioning message when the grid is empty, because an empty grid is
     * not a defect in this form -- it means the selected Branch carries no suppliers, and that is a
     * fixture precondition (PO-14 / BR-006). Distinguishing the two is the whole point of the message.
     */
    public AddAgency_Page tickFirstSupplierRow() {
        waitFor(LOAD_TIMEOUT).until(d -> countOf(PRODUCT_ACCESS_ROWS) > 0);
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
        By firstRowCheckbox = By.xpath("(//table/tbody/tr//input[@type='checkbox'])[1]");
        boolean before = readBooleanProperty(firstRowCheckbox, "checked");
        clickVia(firstRowCheckbox);
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> readBooleanProperty(firstRowCheckbox, "checked") != before);
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
            throw new IllegalArgumentException(
                    "Upload fixture not found: " + absolutePath + ". Both the document and the logo are "
                            + "mandatory on this form, so provisioning cannot proceed without them.");
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

    // -- Baseline fill --------------------------------------------------------------------------

    /**
     * Fills every mandatory field with valid baseline data, skipping any key named in {@code skip}.
     * Same contract as {@code AddBranch_Page.fillMandatoryBaseline(Set)} so the provisioning pattern
     * transfers unchanged.
     *
     * <p><b>The Branch &rarr; Country &rarr; State/City cascade is honoured explicitly.</b> Skipping
     * {@code "branch"} makes Country, State and City unreachable: Country never fills and the
     * State/City option lists never load, so attempting them would fail on a missing option rather
     * than on the emptiness a test is actually asserting. Skipping {@code "branch"} also leaves the
     * Product Access grid empty, so the supplier row is skipped too -- for the same reason.
     *
     * <p>Recognised skip keys: {@code branch}, {@code name}, {@code state}, {@code city},
     * {@code address1}, {@code postOfficeBox}, {@code phoneNoMaster}, {@code contactPerson},
     * {@code ownerEmailId}, {@code ownerPhoneNumber}, {@code document}, {@code contractStartDate},
     * {@code contractEndDate}, {@code logo}, {@code salesContactName}, {@code salesEmailId},
     * {@code salesPhoneNumber}, {@code invoiceGeneration}, {@code creditLimit}, {@code topUpLimit},
     * {@code creditTermsDays}, {@code paymentOption}, {@code supplierRow}.
     */
    public AddAgency_Page fillMandatoryBaseline(Set<String> skip, String documentPath, String logoPath) {
        boolean branchSelected = !skip.contains("branch");
        if (branchSelected) {
            selectBranch(branchNameToSelect);
        }
        if (!skip.contains("name")) {
            setAgencyName(AgencyDataFactory.uniqueAgencyName());
        }
        if (branchSelected && !skip.contains("state")) {
            selectState(AgencyTestData.state());
        }
        if (branchSelected && !skip.contains("city")) {
            selectCity(AgencyTestData.city());
        }
        if (!skip.contains("address1")) {
            setAddress1(AgencyTestData.address1());
        }
        if (!skip.contains("postOfficeBox")) {
            setPostOfficeBox(AgencyTestData.postOfficeBox());
        }
        if (!skip.contains("phoneNoMaster")) {
            setPhoneNoMaster(AgencyDataFactory.uniquePhoneNumber());
        }
        if (!skip.contains("contactPerson")) {
            setContactPerson(AgencyDataFactory.uniqueContactPerson());
        }
        if (!skip.contains("ownerEmailId")) {
            setOwnerEmailId(AgencyDataFactory.uniqueEmail("owner"));
        }
        if (!skip.contains("ownerPhoneNumber")) {
            setOwnerPhoneNumber(AgencyDataFactory.uniquePhoneNumber());
        }
        if (!skip.contains("document")) {
            attachDocument(documentPath);
        }
        if (!skip.contains("contractStartDate")) {
            setContractStartDate(AgencyTestData.contractStartDate());
        }
        if (!skip.contains("contractEndDate")) {
            setContractEndDate(AgencyTestData.contractEndDate());
        }
        if (!skip.contains("logo")) {
            attachLogo(logoPath);
        }
        if (!skip.contains("salesContactName")) {
            setSalesContactName(AgencyDataFactory.uniqueSalesContactName());
        }
        if (!skip.contains("salesEmailId")) {
            setSalesEmailId(AgencyDataFactory.uniqueEmail("sales"));
        }
        if (!skip.contains("salesPhoneNumber")) {
            setSalesPhoneNumber(AgencyDataFactory.uniquePhoneNumber());
        }
        if (!skip.contains("invoiceGeneration")) {
            selectInvoiceGeneration(AgencyTestData.invoiceGeneration());
        }
        if (!skip.contains("creditLimit")) {
            setCreditLimit(AgencyTestData.creditLimit());
        }
        if (!skip.contains("topUpLimit")) {
            setTopUpLimit(AgencyTestData.topUpLimit());
        }
        if (!skip.contains("creditTermsDays")) {
            setCreditTermsDays(AgencyTestData.creditTermsDays());
        }
        if (!skip.contains("paymentOption")) {
            tickPaymentOption(AgencyTestData.paymentOption());
        }
        if (branchSelected && !skip.contains("supplierRow")) {
            tickFirstSupplierRow();
        }
        return this;
    }

    /**
     * The Branch the next {@link #fillMandatoryBaseline} call selects. Set by the provisioner to the
     * run-created fixture Branch, so the created Agency is unambiguously this run's own.
     */
    private String branchNameToSelect = "";

    public AddAgency_Page usingBranch(String branchName) {
        this.branchNameToSelect = branchName;
        return this;
    }

    // -- Submit ---------------------------------------------------------------------------------

    public AddAgency_Page clickSendForApproval() {
        scrollIntoView(SEND_FOR_APPROVAL_BUTTON);
        clickVia(SEND_FOR_APPROVAL_BUTTON);
        return this;
    }

    public AddAgency_Page clickCancel() {
        scrollIntoView(CANCEL_BUTTON);
        clickVia(CANCEL_BUTTON);
        return this;
    }

    /**
     * Asserts the Agency was submitted: either the browser navigated away from the Add Agency URL, or
     * a rendered validation message set is absent and a toast appeared. Polled, bounded (REPAIR-001) --
     * reading either signal immediately after the click returns observes the pre-navigation state and
     * reports a false failure, which is exactly the fault the Branch suite diagnosed and fixed.
     *
     * <p>On failure it prints the rendered validation messages and the still-empty visible fields,
     * because "provisioning failed" without naming which mandatory field was rejected costs a whole
     * diagnostic cycle.
     */
    /**
     * @param agencyName the exact name just submitted, so a navigated-but-not-saved outcome (below) can
     *                    be caught here instead of surfacing four lookups and ~60s later (REPAIR-AG-013).
     */
    public void assertSubmissionSucceeded(String agencyName) {
        boolean navigatedAway;
        try {
            navigatedAway = new WebDriverWait(driver.getDriver(), SUBMIT_OUTCOME_TIMEOUT)
                    .until(d -> !driver.browser().getCurrentURL().contains(EnvironmentConfig.addAgencyPath()));
        } catch (TimeoutException notObserved) {
            navigatedAway = false;
        }

        boolean succeeded = navigatedAway;
        boolean navigatedButNotFound = false;
        if (!navigatedAway) {
            System.out.println("[PROVISION] still on " + driver.browser().getCurrentURL());
            System.out.println("[PROVISION] validation messages = " + visibleTextsOf(ANY_VALIDATION_MESSAGE));
            System.out.println("[PROVISION] empty visible fields = " + emptyVisibleFieldLabels());
            System.out.println("[PROVISION] productAccessRows = " + productAccessRowCount());
        } else {
            // REPAIR-AG-013 (2026-08-19, Stage 5H): navigation away is not proof of a successful save.
            // Live network capture confirmed the creation call can return 400 ("File not found for UUID")
            // for a file the upload endpoint had just accepted moments earlier in the same session --
            // with zero client-side error shown -- while the app still navigates to the list regardless.
            // One immediate name search here catches that outcome at the submission step itself, instead
            // of the caller's post-create lookup discovering it four attempts and ~60s later with a
            // message that names the record but never the real cause. This is Application Failure §11A:
            // the server bug itself is reported, not healed; only detection is repaired here.
            SearchAgency_Page searchAgencyPage = new SearchAgency_Page(driver);
            searchAgencyPage.open().searchByName(agencyName);
            succeeded = searchAgencyPage.isAgencyNamePresent(agencyName);
            navigatedButNotFound = !succeeded;
            if (succeeded) {
                System.out.println("[PROVISION] submission navigated to " + driver.browser().getCurrentURL()
                        + " and an immediate name search confirmed the record exists.");
            } else {
                System.out.println("[PROVISION] navigated to " + driver.browser().getCurrentURL()
                        + " but an immediate name search found no record for \"" + agencyName + "\" -- "
                        + "treating as a failed submission the app did not report client-side. See "
                        + "REPAIR-AG-013: known failure mode is a 400 on the file-attachment lookup with "
                        + "no visible error.");
            }
        }

        Assert.assertTrue(succeeded,
                navigatedButNotFound
                        ? "Provisioning failed: the Add Agency form navigated to the list, but no record "
                                + "named \"" + agencyName + "\" exists immediately afterward. This is the known "
                                + "REPAIR-AG-013 failure mode -- the app can navigate away on a submission the "
                                + "server itself rejected (observed live: 400 \"File not found for UUID\" on a "
                                + "just-uploaded file), with no client-side error shown. This is an application "
                                + "defect, not an automation defect; see the Repair Summary §13."
                        : "Provisioning failed: the Add Agency form did not submit. The suite cannot proceed, "
                                + "because every mutating test may act only on an Agency this run created -- "
                                + "acting on any other record is outside this run's mutation authorisation. See "
                                + "the [PROVISION] diagnostics above for the fields the form rejected.");
    }

    public void assertSubmissionBlocked() {
        driver.assertThat().browser().url().contains(EnvironmentConfig.addAgencyPath()).perform();
    }

    /** Labels of visible, still-empty text fields -- failure diagnostics only. */
    @SuppressWarnings("unchecked")
    private List<String> emptyVisibleFieldLabels() {
        return (List<String>) ((org.openqa.selenium.JavascriptExecutor) selenium()).executeScript(
                "return Array.from(document.querySelectorAll('input,textarea')).filter(function(e){"
                        + "  var r=e.getBoundingClientRect();"
                        + "  return r.width>0 && e.type!=='checkbox' && e.type!=='radio'"
                        + "         && e.type!=='file' && !e.value;"
                        + "}).map(function(e){"
                        + "  var lbl='';var p=e.parentElement;"
                        + "  for(var i=0;i<6&&p;i++){var l=p.querySelector('label');"
                        + "    if(l){lbl=l.textContent.trim();break;}p=p.parentElement;}"
                        + "  return (lbl||e.id||e.placeholder||e.tagName);"
                        + "}).slice(0,30);");
    }
}
