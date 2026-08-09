package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import utilities.EnvironmentConfig;

import java.time.Duration;
import java.util.List;

/**
 * Page Object for Admin → Branch → Update Branch (US 8606), reached by clicking a row's edit pen.
 *
 * <p>Every locator below was verified live against the STG build this suite targets
 * (automation-skill §11A), <b>except</b> {@link #VALIDATION_MESSAGES} and {@link #TOAST_MESSAGES},
 * which are disclosed as unverified in the Selector Verification Report — see their own note. Three
 * verified facts drive the design of this class:</p>
 *
 * <ol>
 *   <li><b>The form pre-fills asynchronously, and reading it on a fixed delay produces a false
 *       "the form is empty" result.</b> Discovery hit exactly that twice, and it would have been
 *       published as a high-severity defect had the first symptom been trusted. Polling across fresh
 *       navigations showed 10/10 fields populated within ~500&nbsp;ms. Every entry point therefore
 *       goes through {@link #waitUntilLoaded()}, which polls the Branch Name field until it holds a
 *       value (REPAIR-001). <b>Never add a fixed delay to this class.</b></li>
 *   <li><b>{@code #id-Name} and {@code #id-EmailID} are not unique on this screen</b> — each appears
 *       twice, once for the branch and once for the contact person. The branch field is index
 *       {@code [1]}; the contact field is {@code [2]}. Both are addressed positionally below.</li>
 *   <li><b>Remarks arrives pre-filled</b> with the record's previous remark (an observed record
 *       carried "Approved"). {@link #clearRemarks()} therefore exists and is used by TC-BR-067 —
 *       without it, the "Remarks is mandatory" test would submit an already-populated field and pass
 *       for the wrong reason.</li>
 * </ol>
 */
public class UpdateBranch_Page extends Branch_Common {

    /** Branch Name — the readiness signal. Index [1]; [2] is the contact person's name. */
    private static final By BRANCH_NAME = By.xpath("(//input[@id='id-Name'])[1]");
    private static final By BRANCH_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[1]");
    private static final By OPERATING_COUNTRY = By.cssSelector("#id-Operatingcountry");
    private static final By COUNTRY = By.cssSelector("#id-Country");
    private static final By POST_OFFICE_BOX = By.cssSelector("#id-PostOfficeBox");
    private static final By CREDIT_LIMIT = By.cssSelector("#id-CreditLimit");
    private static final By TOP_UP_LIMIT = By.cssSelector("#id-TopUpLimit");
    private static final By OUTSTANDING_THRESHOLD = By.cssSelector("#id-OutstandingThreshold");

    /** Address 1 is the first textarea; Remarks is identified by its placeholder, not by index. */
    private static final By ADDRESS_1 = By.xpath("(//textarea)[1]");
    private static final By REMARKS = By.cssSelector("textarea[placeholder='remarks...']");

    /** State/City render a PrimeNG dropdown; the selected value shows in the widget's label span. */
    private static final By STATE_DROPDOWN_LABEL = By.xpath(
            "//*[@id='id-State']/ancestor::div[contains(@class,'p-dropdown')][1]"
                    + "//span[contains(@class,'p-dropdown-label')]");
    private static final By CITY_DROPDOWN_LABEL = By.xpath(
            "//*[@id='id-City']/ancestor::div[contains(@class,'p-dropdown')][1]"
                    + "//span[contains(@class,'p-dropdown-label')]");

    // ── Action buttons — each verified n=1, visible ────────────────────────────────────────────
    private static final By SEND_FOR_APPROVAL_BUTTON =
            By.xpath("//button[normalize-space(.)='Send For Approval']");
    private static final By APPROVE_BUTTON = By.xpath("//button[normalize-space(.)='Approve']");
    private static final By CANCEL_BUTTON = By.xpath("//button[normalize-space(.)='Cancel']");

    /**
     * <b>Disclosed as UNVERIFIED.</b> No validation message and no toast was triggered during live
     * verification — doing so would have required submitting a form, which the verification pass was
     * explicitly read-only. These two locators cover the container classes this Angular/PrimeNG stack
     * conventionally uses.
     *
     * <p>They are matched as <em>visible elements carrying text</em>, never against raw page source.
     * That distinction is the point: an earlier draft of this class asserted
     * {@code getPageSource().contains("required")}, which is true of almost any Angular form because
     * of the {@code required} attribute — an assertion that could never fail. Anchoring on a rendered
     * message means that if these classes are wrong the test fails honestly and Stage 5H repairs it
     * against real evidence, rather than passing for the wrong reason forever.</p>
     */
    private static final By VALIDATION_MESSAGES = By.cssSelector(
            ".p-error, .invalid-feedback, .error-message, small.error, .field-error");
    private static final By TOAST_MESSAGES = By.cssSelector(
            ".p-toast-message, .p-message, .toast, .alert-success, .snackbar");

    private static final Duration LOAD_TIMEOUT = Duration.ofSeconds(30);
    private static final Duration TRANSIENT_TIMEOUT = Duration.ofSeconds(8);

    public UpdateBranch_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    /**
     * REPAIR-001 — the one gate every entry point passes through. Polls the Branch Name field until
     * it actually holds a value, which is the only reliable signal that the record's stored values
     * have landed in the form. A fixed delay here produced a false "form is empty" reading twice
     * during Discovery; this method exists specifically so that cannot recur.
     */
    /** Diagnosis-only (2026-08-09): timestamp anchor for [DIAG-SYNC] reads below, reset each load. */
    private long diagLoadedAt = -1;

    /**
     * REPAIR-BR-012 (2026-08-09): the Branch Name field populating is not proof the City dropdown has
     * -- confirmed via timestamped instrumentation: Name held a value at t=623ms while City still read
     * literally {@code "loading..."} (placeholder=true), and remained {@code "loading..."} 213ms later
     * with no further wait in between. City (and State, the same PrimeNG-dependent-dropdown pattern)
     * populate on their own, independent async timeline. Now waited for explicitly, not inferred from
     * Name.
     */
    public UpdateBranch_Page waitUntilLoaded() {
        long t0 = System.currentTimeMillis();
        waitFor(LOAD_TIMEOUT).until(d -> !valueOfInput(BRANCH_NAME).isEmpty());
        waitFor(LOAD_TIMEOUT).until(d -> !"loading...".equalsIgnoreCase(textOf(CITY_DROPDOWN_LABEL).trim()));
        waitFor(LOAD_TIMEOUT).until(d -> !"loading...".equalsIgnoreCase(textOf(STATE_DROPDOWN_LABEL).trim()));
        diagLoadedAt = System.currentTimeMillis();
        System.out.println("[DIAG-SYNC] UpdateBranch_Page.waitUntilLoaded resolved t="
                + (diagLoadedAt - t0) + "ms cityLabel=\"" + textOf(CITY_DROPDOWN_LABEL)
                + "\" cityPlaceholder=" + hasClass(CITY_DROPDOWN_LABEL, "p-placeholder")
                + " stateLabel=\"" + textOf(STATE_DROPDOWN_LABEL) + "\"");
        return this;
    }

    // ── Reads ──────────────────────────────────────────────────────────────────────────────────

    public String branchName() {
        return valueOfInput(BRANCH_NAME);
    }

    public String branchEmailId() {
        return valueOfInput(BRANCH_EMAIL_ID);
    }

    public String operatingCountry() {
        return valueOfInput(OPERATING_COUNTRY);
    }

    public String country() {
        return valueOfInput(COUNTRY);
    }

    public String state() {
        return textOf(STATE_DROPDOWN_LABEL);
    }

    public String city() {
        String raw = textOf(CITY_DROPDOWN_LABEL);
        System.out.println("[DIAG-SYNC] UpdateBranch_Page.city() t="
                + (diagLoadedAt < 0 ? -1 : System.currentTimeMillis() - diagLoadedAt)
                + "ms sinceLoaded value=\"" + raw + "\" placeholder="
                + hasClass(CITY_DROPDOWN_LABEL, "p-placeholder"));
        return raw;
    }

    public String postOfficeBox() {
        return valueOfInput(POST_OFFICE_BOX);
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

    public String address1() {
        return valueOfInput(ADDRESS_1);
    }

    public String remarks() {
        return valueOfInput(REMARKS);
    }

    /**
     * A PrimeNG dropdown showing nothing selected renders its placeholder with a
     * {@code p-placeholder} class — distinct from showing a real, stored value.
     */
    public boolean isStateShowingPlaceholder() {
        return hasClass(STATE_DROPDOWN_LABEL, "p-placeholder");
    }

    public boolean isCityShowingPlaceholder() {
        return hasClass(CITY_DROPDOWN_LABEL, "p-placeholder");
    }

    // ── Edits ──────────────────────────────────────────────────────────────────────────────────

    public UpdateBranch_Page setAddress1(String value) {
        driver.element().type(ADDRESS_1, value);
        return this;
    }

    public UpdateBranch_Page setRemarks(String value) {
        driver.element().type(REMARKS, value);
        return this;
    }

    /**
     * Empties Remarks. Required by TC-BR-067: the field arrives pre-filled with the record's previous
     * remark, so a "Remarks is mandatory" test that does not clear it first submits a populated field
     * and passes without ever exercising the rule. Uses Selenium's {@code clear()} because typing an
     * empty string is not a reliable way to empty a field.
     */
    public UpdateBranch_Page clearRemarks() {
        List<WebElement> remarks = selenium().findElements(REMARKS);
        if (!remarks.isEmpty()) {
            remarks.get(0).clear();
        }
        return this;
    }

    // ── Actions ────────────────────────────────────────────────────────────────────────────────

    public UpdateBranch_Page clickSendForApproval() {
        driver.element().click(SEND_FOR_APPROVAL_BUTTON);
        return this;
    }

    public UpdateBranch_Page clickApprove() {
        driver.element().click(APPROVE_BUTTON);
        return this;
    }

    public UpdateBranch_Page clickCancel() {
        driver.element().click(CANCEL_BUTTON);
        return this;
    }

    // ── Post-action state ──────────────────────────────────────────────────────────────────────

    /** True while the browser is still on the Update screen — i.e. submission was blocked. */
    public boolean isStillOnUpdateScreen() {
        return driver.browser().getCurrentURL().contains(EnvironmentConfig.editBranchPath());
    }

    /**
     * REPAIR-002: a required-field message is rendered transiently, so this is a bounded,
     * non-throwing poll for a <em>visible</em> validation element carrying text.
     */
    public boolean validationErrorShown() {
        return anyVisibleTextAppears(VALIDATION_MESSAGES);
    }

    public List<String> validationErrorMessages() {
        return visibleTextsOf(VALIDATION_MESSAGES);
    }

    /** REPAIR-002: transient success toast, detected the same way and equally non-throwing. */
    public boolean confirmationShown() {
        return anyVisibleTextAppears(TOAST_MESSAGES);
    }

    public List<String> confirmationMessages() {
        return visibleTextsOf(TOAST_MESSAGES);
    }

    private boolean anyVisibleTextAppears(By locator) {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> !visibleTextsOf(locator).isEmpty());
            return true;
        } catch (TimeoutException neverAppeared) {
            return false;
        }
    }
}
