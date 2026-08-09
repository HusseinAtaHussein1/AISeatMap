package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import utilities.EnvironmentConfig;

import java.time.Duration;
import java.util.Set;

/**
 * Page Object for Admin -> Branch -> Add branch.
 *
 * Every locator below is cited in SelectorVerificationReport_SHAFT.md, verified live against the
 * same STG build this run's Stage 4M execution ran against (2026-08-03). Two verified, non-obvious
 * patterns recur throughout this class and are documented once here rather than re-derived per
 * method:
 *
 * 1. The State/City dropdowns' underlying &lt;input&gt; is a visually-hidden, 0x0 accessibility node.
 *    The real, clickable target is the nearest ancestor {@code div.p-dropdown}.
 * 2. Every checkbox on this form (Payment Option, Product Access "Status" column) has the same
 *    hidden-input-behind-a-styled-box structure. The real, clickable target is the inner
 *    {@code div.p-checkbox-box} -- corrected 2026-08-05 from the {@code div.p-checkbox} wrapper this
 *    note used to name, which is one level too high and does not toggle the checkbox.
 *
 * API confirmed live this run against io.github.shafthq:shaft-engine:10.3.20260707 via javap
 * (Context7 was unavailable -- see AutomationPlan_SHAFT.md §12/§14). This version's assertion
 * surface is fluent (driver.assertThat().element(locator)...perform()) rather than plain
 * getAttribute()/getText() -- this class exposes small, named assertion helpers built on that
 * fluent API so test methods stay one line each, per §14.1 "Reusable Assertions".
 */
public class AddBranch_Page {
    private static final By OPERATING_COUNTRY = By.cssSelector("#id-Operatingcountry");
    private static final By COUNTRY_READONLY = By.cssSelector("#id-Country");
    private static final By STATE_DROPDOWN_ANCESTOR =
            By.xpath("//*[@id='id-State']/ancestor::div[contains(@class,'p-dropdown')][1]");
    private static final By CITY_DROPDOWN_ANCESTOR =
            By.xpath("//*[@id='id-City']/ancestor::div[contains(@class,'p-dropdown')][1]");
    /*
     * The application renders DUPLICATE ids on this form -- verified live 2026-08-05: there are two
     * elements with id {@code id-Name} (Branch Details' "Name" and Contact Person's "Name"), two with
     * id {@code id-EmailID}, and two phone inputs both carrying id "Phone Number". A duplicate id is
     * invalid HTML and is worth raising as an application finding in its own right, but it also means
     * a plain {@code #id-Name} selector is ambiguous: it always resolves to the Branch Details one.
     * Before this was found, the Branch and Contact locators below were identical, so filling the
     * contact person silently overwrote the branch name and left every contact field empty -- which is
     * what "Required" on submit was really reporting. Each pair is therefore positional now: index 1 is
     * the Branch Details section, index 2 is Contact Person.
     */
    private static final By BRANCH_NAME_FIRST = By.xpath("(//input[@id='id-Name'])[1]");
    private static final By ADDRESS1 = By.xpath("(//textarea)[1]");
    private static final By POST_OFFICE_BOX = By.cssSelector("#id-PostOfficeBox");
    private static final By PHONE_NUMBER_FIRST = By.xpath("(//input[@type='tel'])[1]");
    private static final By BRANCH_EMAIL_ID_FIRST = By.xpath("(//input[@id='id-EmailID'])[1]");
    private static final By EMAIL_PASSWORD = By.cssSelector("#id-EmailPassword");
    private static final By CONTACT_NAME = By.xpath("(//input[@id='id-Name'])[2]");
    private static final By CONTACT_EMAIL_ID = By.xpath("(//input[@id='id-EmailID'])[2]");
    private static final By CONTACT_PHONE_NUMBER = By.xpath("(//input[@type='tel'])[2]");
    /** <b>2026-08-06 (REPAIR-BR-004):</b> retained for documentation, and deliberately no longer clicked.
     * This XPath matches at least three buttons on the Add Branch form -- one per repeatable section
     * (Branch Email Config, Branch Contact Info, and the Sales Config target-amount row) -- so
     * "the first match" was never a stable way to name one of them. More importantly, clicking it does
     * not commit the contact: it <i>appends an additional empty row</i>, which the application then
     * reports as {@code Required}. Verified live 2026-08-06 (healing/evidence_0806/diagnosis3.log §C):
     * the {@code id-Name} input count went 2 -> 3 with values {@code ["", "Ahmed Ayman", ""]}, and with
     * no Add click at all the form reports no contact error whatsoever. The inline row is the contact. */
    private static final By ADD_CONTACT_BUTTON = By.xpath("//button[contains(., 'Add')]");
    private static final By TARGET_AMOUNT = By.cssSelector("#id-EnterTargetAmount");
    /** Target Amount is not a bare number: the application answers an amount alone with "Please select
     * month and year, and enter a numeric amount." Both companions are readonly PrimeNG dropdowns
     * (verified live 2026-08-06 -- months January..December, years 2026 | 2027). */
    private static final By TARGET_MONTH_DROPDOWN = By.xpath(
            "//*[@id='id-SetMonth']/ancestor::p-dropdown[1]//div[contains(@class,'p-dropdown')][1]");
    private static final By TARGET_YEAR_DROPDOWN = By.xpath(
            "//*[@id='id-SetYear']/ancestor::p-dropdown[1]//div[contains(@class,'p-dropdown')][1]");
    private static final By CREDIT_LIMIT = By.cssSelector("#id-CreditLimit");
    private static final By TOP_UP_LIMIT = By.cssSelector("#id-TopUpLimit");
    private static final By CREDIT_TERMS_DAYS = By.cssSelector("[id='id-CreditTerms(Days)']");
    private static final By REACHING_PERCENTAGE = By.cssSelector("#id-ReachingPercentage");
    private static final By WARNING_PROMPT_DAYS = By.cssSelector("[id='id-WarningPrompt(Days)']");
    private static final By PAYMENT_OPTION_CASH = By.cssSelector("#id-PaymentOption-Cash");
    /** The click target for a PrimeNG checkbox is the inner {@code div.p-checkbox-box}, not the outer
     * {@code div.p-checkbox} wrapper -- verified live 2026-08-05 by dispatching the same click at both:
     * the wrapper leaves {@code checked} false, the box toggles it true. The wrapper is where the
     * class-level note above said to click; that was the level too high. */
    private static final By PAYMENT_OPTION_CASH_ANCESTOR = By.xpath(
            "//*[@id='id-PaymentOption-Cash']/ancestor::div[contains(@class,'p-checkbox')][1]"
                    + "//div[contains(@class,'p-checkbox-box')]");
    private static final By OUTSTANDING_THRESHOLD = By.cssSelector("#id-OutstandingThreshold");
    private static final By FIRST_ROW_STATUS_CHECKBOX_ANCESTOR = By.xpath(
            "(//table//tbody//tr)[1]//input[@type='checkbox']/ancestor::div[contains(@class,'p-checkbox')][1]"
                    + "//div[contains(@class,'p-checkbox-box')]");
    private static final By FIRST_ROW_DESCRIPTION = By.cssSelector("input[id^='id-supplier-'][placeholder='Description']");
    /** The Product Access grid's Credential Name control for the first row -- mandatory once that row's
     * Status checkbox is ticked, and previously absent from this Page Object entirely, which is why no
     * happy-path submission could ever succeed (REPAIR-BR-002).
     *
     * <p>Verified live 2026-08-06 (healing/evidence_0806/D5-credential-cell.html): the grid's columns
     * are Status | Supplier Name | Credential Name | Product Name | Description, so Credential Name is
     * {@code td[3]}, and the control is a PrimeNG {@code p-dropdown} whose clickable trigger is the
     * inner {@code div.p-dropdown} -- not a {@code <select>}, and not the row's hidden
     * {@code input[id^='id-supplier-']} combobox, whose id is regenerated per row and therefore cannot
     * be hardcoded. */
    private static final By FIRST_ROW_CREDENTIAL_DROPDOWN = By.xpath(
            "(//table//tbody//tr)[1]/td[3]//div[contains(@class,'p-dropdown')][1]");
    private static final By SUBMIT_BUTTON = By.xpath(
            "//button[contains(., 'Send For Approval') or contains(., 'Submit for Approval')]");
    private static final By CANCEL_BUTTON = By.xpath("//button[contains(., 'Cancel')]");
    /** The list screen's "Add branch" action -- an Angular {@code routerLink="add"} button, confirmed
     * live against the DOM (2026-08-05). Retained because it is the real control a user clicks, but
     * {@link #open()} deliberately does not use it: see that method's note on why clicking it proved
     * less reliable than navigating to the route directly. */
    private static final By ADD_BRANCH_BUTTON = By.cssSelector("button[routerlink='add']");

    private final SHAFT.GUI.WebDriver driver;

    public AddBranch_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    /**
     * Types into a PrimeNG-backed input, verified live 2026-08-05.
     *
     * <p>Neither {@code driver.element().type(...)} nor raw Selenium {@code sendKeys} lands any text
     * in this form's PrimeNG controls ({@code p-autocomplete}, {@code p-inputnumber}). SHAFT reports
     * the type as successful and the element probes clean -- unique match, visible at 467x45, enabled,
     * not readonly, and actually focused -- yet the input's value stays empty. The same
     * {@code sendKeys} path works on the plain login inputs, so this is specific to these components,
     * which intercept key events and manage their own value. Setting the value and dispatching the
     * {@code input} event Angular's ControlValueAccessor listens for is what these components
     * actually respond to: with it, the autocomplete panel opens and filters correctly (confirmed by
     * the filtered option list appearing). This is the same mechanism Playwright's own
     * {@code fill()} uses, not a way of bypassing the application's behaviour.
     */
    private void typeInto(By locator, String value) {
        setValueAndNotify(locator, value, true);
    }

    /**
     * Types a filter string without blurring, for the autocomplete: blurring closes the suggestion
     * panel, so the option this is about to select would be gone before it could be clicked.
     */
    private void typeFilter(By locator, String value) {
        setValueAndNotify(locator, value, false);
    }

    /**
     * Blur matters for more than tidiness: this form's field-level validation only renders once the
     * control is touched. Verified live 2026-08-05 -- entering 150 in Reaching Percentage shows
     * "Reaching Percentage should not be greater than 100%" only after a blur, so without it a test
     * asserting that message fails against an application that is in fact behaving correctly.
     */
    private void setValueAndNotify(By locator, String value, boolean blurAfter) {
        WebElement element = driver.getDriver().findElement(locator);
        ((org.openqa.selenium.JavascriptExecutor) driver.getDriver()).executeScript(
                "var e = arguments[0];"
                + "e.focus();"
                + "e.value = arguments[1];"
                + "e.dispatchEvent(new Event('input', {bubbles: true}));"
                + "e.dispatchEvent(new Event('change', {bubbles: true}));"
                + "if (arguments[2]) {"
                + "  e.dispatchEvent(new Event('blur', {bubbles: true}));"
                + "  e.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));"
                + "}",
                element, value, blurAfter);
    }

    /**
     * Reads an input's current value as the DOM property rather than the literal HTML attribute.
     * PrimeNG never writes a {@code value=} attribute onto these inputs -- verified live: after
     * typing, the DOM property reads {@code "10"} while {@code getAttribute("value")} is {@code null}
     * -- so an attribute-based assertion can never pass regardless of whether the application is
     * behaving correctly.
     */
    private String readValue(By locator) {
        WebElement element = driver.getDriver().findElement(locator);
        Object value = ((org.openqa.selenium.JavascriptExecutor) driver.getDriver())
                .executeScript("return arguments[0].value;", element);
        return value == null ? "" : value.toString();
    }

    /**
     * Reads a boolean DOM property ({@code checked}, {@code disabled}) off the first element matching
     * the locator.
     *
     * <p>SHAFT 7.4's own {@code isSelected()} / {@code isDisabled()} assertions resolve against HTML
     * *attributes*, which is why they failed here with "Expected 'true' for the 'selected' attribute
     * ... Actual null": a checkbox's state lives in the {@code checked} property, and {@code selected}
     * is an {@code <option>} attribute that never appears on a checkbox at all. Reading the property
     * asks the question the test actually means to ask.
     */
    private boolean readBooleanProperty(By locator, String property) {
        WebElement element = driver.getDriver().findElements(locator).get(0);
        Object value = ((org.openqa.selenium.JavascriptExecutor) driver.getDriver())
                .executeScript("return !!arguments[0][arguments[1]];", element, property);
        return Boolean.TRUE.equals(value);
    }

    /**
     * Waits for an overlay option (autocomplete or dropdown panel) carrying exactly this label, then
     * clicks it. The option's text sits in a nested {@code <span>} rather than as a direct text node
     * of the {@code <li>}, so the predicate must be {@code normalize-space(.)} -- a
     * {@code normalize-space(text())} form matches nothing and was silently failing every selection
     * on this form before 2026-08-05.
     */
    private void selectAutocompleteOption(String label) {
        selectAutocompleteOption(label, null, null, null);
    }

    /**
     * Selects an autocomplete option and <b>confirms the selection actually committed</b>
     * (REPAIR-BR-008).
     *
     * <p>Waiting for the option to merely exist is not enough, and this was measured rather than
     * assumed. PrimeNG re-renders the suggestion panel as it filters, so an option clicked the instant
     * it appears is frequently an {@code <li>} Angular then replaces -- the click is delivered to a
     * detached element and the selection silently never commits. Verified live 2026-08-06
     * (healing/evidence_0806/diagnosis8.log vs diagnosis7.log): clicking immediately failed **2 of 4**
     * attempts, while the identical sequence with a settle wait succeeded **3 of 3**. That race is why
     * the same step could pass in one test and time out in another on identical code, and why
     * TC-BR-038 passed in a 5-test run and failed in a 13-test one.
     *
     * <p>The fix is not a longer timeout (§14.1 -- that would only make the race lose less often). It
     * re-drives the interaction until an observable <i>commit signal</i> appears: the control's own
     * value, plus any dependent field the selection is supposed to populate. If no signal appears within
     * the budget it throws, so the step can never again silently do nothing.
     *
     * @param commitProbe   locator whose value proves the commit, or {@code null} to skip the check
     * @param expectedValue value {@code commitProbe} must hold, or {@code null} to accept any non-empty
     * @param reopenPanel   re-drives whatever opens/filters the panel before each attempt -- required,
     *                      because a lost click leaves the panel closed and the filter cleared, so
     *                      re-clicking the same locator alone would find nothing
     */
    private void selectAutocompleteOption(String label, By commitProbe, String expectedValue, Runnable reopenPanel) {
        By option = By.xpath("//li[normalize-space(.)='" + label + "']");
        RuntimeException lastFailure = null;
        for (int attempt = 1; attempt <= SELECT_COMMIT_ATTEMPTS; attempt++) {
            try {
                if (attempt > 1 && reopenPanel != null) {
                    reopenPanel.run();
                }
                new WebDriverWait(driver.getDriver(), FIRST_LOAD_TIMEOUT)
                        .until(d -> !d.findElements(option).isEmpty());
                clickVia(option);
                if (commitProbe == null) {
                    return;
                }
                new WebDriverWait(driver.getDriver(), COMMIT_TIMEOUT)
                        .until(d -> {
                            String actual = readValue(commitProbe);
                            return expectedValue == null ? !actual.isEmpty() : expectedValue.equals(actual);
                        });
                return;
            } catch (RuntimeException notCommitted) {
                lastFailure = notCommitted;
            }
        }
        throw new IllegalStateException("Selecting \"" + label + "\" never committed after "
                + SELECT_COMMIT_ATTEMPTS + " attempts (commit probe: " + commitProbe + ")", lastFailure);
    }

    /**
     * Clicks by dispatching the full mouse event sequence the component listens for, rather than by
     * asking the driver to click.
     *
     * <p>Verified live 2026-08-05: a driver-issued click on these controls is reported as delivered
     * and changes nothing. It was reproduced twice, on two unrelated controls -- the list screen's
     * {@code routerLink} button (URL never changed, across three consecutive re-clicks) and this
     * form's autocomplete option (the option was found and clicked, yet the selection never committed
     * and Country never auto-filled). The same two interactions commit correctly when driven by
     * dispatched events, confirmed against this application in a separate browser. Together with the
     * identical finding for typing (see {@link #typeInto}), the pattern is that this
     * Selenium/Chrome combination does not reliably deliver synthetic input to these components;
     * dispatching the events the component actually binds to is what works.
     */
    private void clickVia(By locator) {
        WebElement element = driver.getDriver().findElement(locator);
        ((org.openqa.selenium.JavascriptExecutor) driver.getDriver()).executeScript(
                "var e = arguments[0];"
                + "var opts = {bubbles: true, cancelable: true, view: window};"
                + "e.dispatchEvent(new MouseEvent('mouseover', opts));"
                + "e.dispatchEvent(new MouseEvent('mousedown', opts));"
                + "e.dispatchEvent(new MouseEvent('mouseup', opts));"
                + "e.dispatchEvent(new MouseEvent('click', opts));",
                element);
    }

    /** Bounded presence wait for the list screen's "Add branch" button before clicking it.
     *
     * <p><b>2026-08-05 correction:</b> the earlier "whichever test runs first in a fresh JVM fork
     * never finds this button" investigation was conducted under two compounding, unrelated bugs:
     * {@code EnvironmentConfig.username()}/{@code password()} read the wrong environment variable
     * names (fixed there), and {@link AdminPages.Login.LogIn_Page#loginAsSuperAdmin()} did not wait
     * for the post-login redirect before returning, so the very first (slowest, coldest) login in a
     * run could lose the race and this navigation would land back on {@code /auth/login} -- never on
     * the branch list at all, which is why no timeout here could have fixed it (see the fix in
     * {@code LogIn_Page}). A conservative 20s remains a legitimate allowance for real network
     * variance on top of that fix, not a mask for it. */
    private static final Duration FIRST_LOAD_TIMEOUT = Duration.ofSeconds(20);
    /** Per-attempt allowance for a dependent dropdown's panel to render its options, and how many
     * open attempts {@link #openDependentDropdown} makes before failing loudly. */
    private static final Duration DEPENDENT_PANEL_TIMEOUT = Duration.ofSeconds(6);
    private static final int OPEN_DROPDOWN_ATTEMPTS = 3;
    /** How long to wait for an autocomplete selection's commit signal, and how many times to re-drive
     * the interaction when it does not appear (REPAIR-BR-008). */
    private static final Duration COMMIT_TIMEOUT = Duration.ofSeconds(6);
    private static final int SELECT_COMMIT_ATTEMPTS = 3;

    /**
     * <b>2026-08-05, superseding the run-003 "REPAIR-004" note that used to sit here.</b> That repair
     * concluded direct navigation to this route could not work and the screen had to be reached by
     * clicking the list screen's {@code routerLink="add"} button. That conclusion was drawn while
     * {@link AdminPages.Login.LogIn_Page#loginAsSuperAdmin()} still returned without waiting for the
     * post-login redirect, so the "direct navigation" being judged was really an unauthenticated
     * navigation that the route guard bounced to {@code /auth/login} -- which is why every field
     * lookup after it failed. With that race fixed, direct navigation to this route works and was
     * re-verified live (form renders, inputs accept text, autocomplete opens). The click-through
     * approach was additionally the *less* reliable of the two in practice: the button would pass
     * {@code elementToBeClickable} and report a delivered click while Angular's router never acted on
     * it, repeatably, across three consecutive re-clicks.
     */
    public AddBranch_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.addBranchUrl());
        new WebDriverWait(driver.getDriver(), FIRST_LOAD_TIMEOUT)
                .until(d -> !d.findElements(OPERATING_COUNTRY).isEmpty());
        driver.assertThat().element(OPERATING_COUNTRY).exists().perform();
        return this;
    }

    /**
     * Operating Country is an autocomplete: click, type a filter, select the exact match -- then confirm
     * the selection committed by waiting for the read-only Country field it is supposed to populate
     * (REPAIR-BR-008). Country auto-filling is the application's own signal that the selection landed,
     * and it is what the State/City cascade depends on.
     */
    public AddBranch_Page selectOperatingCountry(String name) {
        Runnable openAndFilter = () -> {
            clickVia(OPERATING_COUNTRY);
            typeFilter(OPERATING_COUNTRY, name);
        };
        openAndFilter.run();
        selectAutocompleteOption(name, COUNTRY_READONLY, null, openAndFilter);
        return this;
    }

    /**
     * Opens a dependent (cascading) dropdown only once the application has actually populated it
     * (REPAIR-BR-005).
     *
     * <p>State and City are loaded from the server in response to their parent's selection, and
     * {@link #selectOperatingCountry} returns the instant it clicks the country option -- so the
     * previous code clicked State while the control was still unpopulated. PrimeNG then opened
     * nothing, and the option wait polled a panel that never appeared until it timed out, 20s later,
     * on every loop iteration that reached this point. Verified live 2026-08-06
     * (healing/evidence_0806/diagnosis5.log): with a settle wait, {@code Cairo} is present in
     * {@code li.p-dropdown-item} on both a first and a re-opened form; without one, no panel opens.
     *
     * <p>This waits for the correct <i>state</i> (the panel actually rendering options) rather than
     * simply allowing more time for a broken interaction, and it fails loudly when the option never
     * arrives rather than leaving the field silently unselected.
     */
    private void openDependentDropdown(By trigger, String expectedOption) {
        By option = By.xpath("//li[contains(@class,'p-dropdown-item')][normalize-space(.)='" + expectedOption + "']");
        // The parent selection's server round-trip is what populates this control, and Country
        // auto-filling is the observable signal that it completed.
        new WebDriverWait(driver.getDriver(), FIRST_LOAD_TIMEOUT)
                .until(d -> !readValue(COUNTRY_READONLY).isEmpty());
        // A p-dropdown click TOGGLES, so the trigger is clicked exactly once per attempt and never on
        // every poll -- clicking per poll opens and immediately re-closes the panel, which is a real
        // mistake this repair made on its first attempt (2026-08-06, rerun-4).
        RuntimeException lastFailure = null;
        for (int attempt = 1; attempt <= OPEN_DROPDOWN_ATTEMPTS; attempt++) {
            clickVia(trigger);
            try {
                new WebDriverWait(driver.getDriver(), DEPENDENT_PANEL_TIMEOUT)
                        .until(d -> !d.findElements(option).isEmpty());
                return;
            } catch (RuntimeException notYet) {
                lastFailure = notYet;
                clickVia(trigger); // close the empty panel so the next attempt's click re-opens it
            }
        }
        throw new IllegalStateException("Dependent dropdown never offered the option \"" + expectedOption
                + "\" after " + OPEN_DROPDOWN_ATTEMPTS + " attempts (trigger: " + trigger + ")", lastFailure);
    }

    public AddBranch_Page selectState(String name) {
        openDependentDropdown(STATE_DROPDOWN_ANCESTOR, name);
        selectDropdownItem(name);
        return this;
    }

    public AddBranch_Page selectCity(String name) {
        openDependentDropdown(CITY_DROPDOWN_ANCESTOR, name);
        selectDropdownItem(name);
        return this;
    }

    /** TC-BR-004: asserts the Country field auto-populated to the given expected value. */
    public void assertCountryEquals(String expected) {
        Assert.assertEquals(readValue(COUNTRY_READONLY), expected, "Country should auto-fill from Operating Country");
    }

    public AddBranch_Page setBranchName(String name) {
        typeInto(BRANCH_NAME_FIRST, name);
        return this;
    }

    public AddBranch_Page setAddress1(String value) {
        typeInto(ADDRESS1, value);
        return this;
    }

    public AddBranch_Page setPostOfficeBox(String value) {
        typeInto(POST_OFFICE_BOX, value);
        return this;
    }

    public AddBranch_Page setPhoneNumber(String value) {
        typeInto(PHONE_NUMBER_FIRST, value);
        return this;
    }

    public AddBranch_Page setBranchEmailId(String value) {
        typeInto(BRANCH_EMAIL_ID_FIRST, value);
        return this;
    }

    /**
     * <b>2026-08-06 (REPAIR-BR-007):</b> was {@code driver.element().typeSecure(...)} -- the one field
     * on this form still typed through SHAFT rather than through {@link #typeInto}. Per this class's own
     * note on {@code typeInto}, SHAFT/Selenium typing does not land in these PrimeNG controls: the type
     * is reported as successful and the value stays empty, which is exactly what the execution evidence
     * showed ({@code Email Password *} listed as an empty required field on submit, EXEC-BR-20260806-01
     * and its healing rerun). Secrecy is not lost by the change -- the value is still never asserted on,
     * logged, or attached; it simply reaches the control by the mechanism the control responds to.
     */
    public AddBranch_Page setEmailPassword(String value) {
        typeInto(EMAIL_PASSWORD, value);
        return this;
    }

    /**
     * Fills the inline Branch Contact Info row. It deliberately does <b>not</b> click "Add" -- see
     * {@link #ADD_CONTACT_BUTTON} for the live evidence that doing so appends an empty row the
     * application then requires (REPAIR-BR-004).
     */
    public AddBranch_Page addContactPerson(String name, String email, String phone) {
        typeInto(CONTACT_NAME, name);
        typeInto(CONTACT_EMAIL_ID, email);
        typeInto(CONTACT_PHONE_NUMBER, phone);
        return this;
    }

    /**
     * Fills the Sales Configuration target amount and its mandatory month/year companions
     * (REPAIR-BR-003). Like the contact row, the target row's own "Add" button is not clicked: it
     * appends another empty row rather than committing this one.
     */
    public AddBranch_Page setTargetAmount(String amount, String month, String year) {
        typeInto(TARGET_AMOUNT, amount);
        clickVia(TARGET_MONTH_DROPDOWN);
        selectDropdownItem(month);
        clickVia(TARGET_YEAR_DROPDOWN);
        selectDropdownItem(year);
        return this;
    }

    public AddBranch_Page setCreditLimit(String value) {
        typeInto(CREDIT_LIMIT, value);
        return this;
    }

    public AddBranch_Page setTopUpLimit(String value) {
        typeInto(TOP_UP_LIMIT, value);
        return this;
    }

    public AddBranch_Page setCreditTermsDays(String value) {
        typeInto(CREDIT_TERMS_DAYS, value);
        return this;
    }

    public AddBranch_Page setReachingPercentage(String value) {
        typeInto(REACHING_PERCENTAGE, value);
        return this;
    }

    /** TC-BR-024/025: asserts the Reaching Percentage field's current retained value. */
    public void assertReachingPercentageValueEquals(String expected) {
        Assert.assertEquals(readValue(REACHING_PERCENTAGE), expected, "Reaching Percentage should retain the entered value");
    }

    /**
     * TC-BR-024: asserts the ">100%" validation message is present on the page.
     * SHAFT_ENGINE 9.4's WebDriverBrowserValidationsBuilder has no text()/pageSource() fluent
     * validation (that is a later-version addition confirmed unavailable via javap this run) -- read
     * the page source directly and assert on it with TestNG's own Assert instead.
     */
    public void assertReachingPercentageCapMessageShown() {
        Assert.assertTrue(driver.browser().getPageSource().contains("should not be greater than 100"),
                "Expected the page to contain the Reaching Percentage 100% validation message.");
    }

    public AddBranch_Page setWarningPromptDays(String value) {
        typeInto(WARNING_PROMPT_DAYS, value);
        return this;
    }

    /**
     * TC-BR-026: asserts Warning Prompt (Days) was capped at 11 digits, OR that a length-related
     * validation message is shown. This is a regression assertion for FINDING-004, which is still an
     * open defect as of this run's own Stage 4M pass (RISK-AUTO-2) -- expected to fail honestly until
     * that defect is fixed, not a sign of a broken test.
     */
    public void assertWarningPromptCappedAt11DigitsOrMessageShown() {
        String actual = readValue(WARNING_PROMPT_DAYS);
        Assert.assertTrue(actual.length() <= 11,
                "Warning Prompt (Days) should be capped at 11 digits, but retained " + actual.length()
                        + " characters: \"" + actual + "\" (FINDING-004, still open)");
    }

    public AddBranch_Page checkPaymentOptionCash() {
        clickVia(PAYMENT_OPTION_CASH_ANCESTOR);
        return this;
    }

    /** TC-BR-028: asserts the Cash Payment Option checkbox is checked and retained. */
    public void assertPaymentOptionCashChecked() {
        Assert.assertTrue(readBooleanProperty(PAYMENT_OPTION_CASH, "checked"),
                "Cash Payment Option should be checked and retained");
    }

    public AddBranch_Page setOutstandingThreshold(String value) {
        typeInto(OUTSTANDING_THRESHOLD, value);
        return this;
    }

    /** TC-BR-037/039: asserts the Outstanding Threshold field's current retained value. */
    public void assertOutstandingThresholdValueEquals(String expected) {
        Assert.assertEquals(readValue(OUTSTANDING_THRESHOLD), expected, "Outstanding Threshold should retain the entered value");
    }

    public AddBranch_Page checkFirstSupplierRow() {
        clickVia(FIRST_ROW_STATUS_CHECKBOX_ANCESTOR);
        return this;
    }

    /** TC-BR-030: asserts the first Supplier row's Description field is currently disabled. */
    public void assertFirstSupplierDescriptionDisabled() {
        Assert.assertTrue(readBooleanProperty(FIRST_ROW_DESCRIPTION, "disabled"),
                "First Supplier row's Description should be disabled while no row is selected");
    }

    /** TC-BR-030: asserts the first Supplier row's Description field is currently enabled. */
    public void assertFirstSupplierDescriptionEnabled() {
        Assert.assertFalse(readBooleanProperty(FIRST_ROW_DESCRIPTION, "disabled"),
                "First Supplier row's Description should be enabled once its row is selected");
    }

    public AddBranch_Page setFirstSupplierDescription(String value) {
        typeInto(FIRST_ROW_DESCRIPTION, value);
        return this;
    }

    /**
     * Selects a Credential Name for the first Supplier row (REPAIR-BR-002). Mandatory once that row's
     * Status checkbox is ticked -- ticking the row without choosing a credential leaves the grid
     * invalid, which is what blocked every happy-path submission before this method existed.
     *
     * <p>A PrimeNG {@code p-dropdown} renders its options into an overlay panel appended to the
     * document, as {@code li.p-dropdown-item} -- deliberately matched on that class rather than on a
     * bare {@code //li}, because this application's own navigation menus contribute a dozen unrelated
     * {@code <li>} elements to the page at all times (verified live 2026-08-06, diagnosis.log D1).
     */
    public AddBranch_Page selectFirstSupplierCredential(String name) {
        clickVia(FIRST_ROW_CREDENTIAL_DROPDOWN);
        selectDropdownItem(name);
        return this;
    }

    /**
     * Waits for an already-opened PrimeNG dropdown panel to render an option with exactly this label,
     * then clicks it. Matched on {@code li.p-dropdown-item} rather than a bare {@code //li} because
     * this application's navigation menus contribute a dozen unrelated {@code <li>} elements to every
     * page (verified live 2026-08-06, diagnosis.log §D1).
     */
    private void selectDropdownItem(String label) {
        By option = By.xpath("//li[contains(@class,'p-dropdown-item')][normalize-space(.)='" + label + "']");
        new WebDriverWait(driver.getDriver(), FIRST_LOAD_TIMEOUT)
                .until(d -> !d.findElements(option).isEmpty());
        clickVia(option);
    }

    /**
     * Fills every mandatory field except the ones named in {@code skip} with the shared baseline
     * fixture (AdminPages.Admin.Branch.BranchTestData) -- the composed action every "leave one field empty" test case
     * (TC-BR-002/013/021/038) reuses instead of re-authoring the fill sequence per test
     * (automation-skill §14.1 "Reusable Actions").
     */
    public AddBranch_Page fillMandatoryBaseline(Set<String> skip) {
        // Operating Country -> State -> City is a cascade: each list is only populated once its parent
        // is chosen. So a test that deliberately leaves Operating Country empty cannot then fill State
        // or City -- their option lists never load, and attempting it fails on a missing option rather
        // than on the emptiness the test is actually asserting. Honour that dependency explicitly
        // instead of trying to fill an unreachable field.
        boolean operatingCountryFilled = !skip.contains("operatingCountry");
        if (operatingCountryFilled) {
            selectOperatingCountry(AdminPages.Admin.Branch.BranchTestData.operatingCountry());
        }
        boolean stateFilled = operatingCountryFilled && !skip.contains("state");
        if (stateFilled) {
            selectState(AdminPages.Admin.Branch.BranchTestData.state());
        }
        if (stateFilled && !skip.contains("city")) {
            selectCity(AdminPages.Admin.Branch.BranchTestData.city());
        }
        if (!skip.contains("name")) {
            setBranchName(utilities.BranchDataFactory.uniqueBranchName());
        }
        if (!skip.contains("address1")) {
            setAddress1(AdminPages.Admin.Branch.BranchTestData.address1());
        }
        if (!skip.contains("postOfficeBox")) {
            setPostOfficeBox(AdminPages.Admin.Branch.BranchTestData.postOfficeBox());
        }
        if (!skip.contains("phoneNumber")) {
            setPhoneNumber(AdminPages.Admin.Branch.BranchTestData.phoneNumber());
        }
        if (!skip.contains("branchEmailId")) {
            setBranchEmailId(utilities.BranchDataFactory.uniqueEmail("qa"));
        }
        if (!skip.contains("emailPassword")) {
            setEmailPassword(AdminPages.Admin.Branch.BranchTestData.emailPassword());
        }
        if (!skip.contains("contactName") && !skip.contains("contactEmailId") && !skip.contains("contactPhoneNumber")) {
            addContactPerson(AdminPages.Admin.Branch.BranchTestData.contactName(),
                    utilities.BranchDataFactory.uniqueEmail("contact"),
                    AdminPages.Admin.Branch.BranchTestData.contactPhoneNumber());
        }
        if (!skip.contains("creditLimit")) {
            setCreditLimit(AdminPages.Admin.Branch.BranchTestData.creditLimit());
        }
        if (!skip.contains("topUpLimit")) {
            setTopUpLimit(AdminPages.Admin.Branch.BranchTestData.topUpLimit());
        }
        if (!skip.contains("creditTermsDays")) {
            setCreditTermsDays(AdminPages.Admin.Branch.BranchTestData.creditTermsDays());
        }
        // REPAIR-BR-003 (2026-08-06): Reaching Percentage and Warning Prompt (Days) are mandatory --
        // the application reports both as "Required" on submit -- and this fixture never filled them,
        // so the form it produced could not be submitted regardless of the field under test. Verified
        // live: healing/evidence_0806/diagnosis.log §D3.
        if (!skip.contains("targetAmount")) {
            setTargetAmount(AdminPages.Admin.Branch.BranchTestData.targetAmount(),
                    AdminPages.Admin.Branch.BranchTestData.targetMonth(),
                    AdminPages.Admin.Branch.BranchTestData.targetYear());
        }
        if (!skip.contains("reachingPercentage")) {
            setReachingPercentage(AdminPages.Admin.Branch.BranchTestData.reachingPercentage());
        }
        if (!skip.contains("warningPromptDays")) {
            setWarningPromptDays(AdminPages.Admin.Branch.BranchTestData.warningPromptDays());
        }
        if (!skip.contains("paymentOption")) {
            checkPaymentOptionCash();
        }
        if (!skip.contains("outstandingThreshold")) {
            setOutstandingThreshold(AdminPages.Admin.Branch.BranchTestData.outstandingThreshold());
        }
        // REPAIR-BR-002 (2026-08-06): ticking the row's Status checkbox without choosing a Credential
        // Name leaves the Product Access grid invalid. Order matters -- the Credential Name dropdown and
        // the Description field are both only enabled once the row is selected.
        if (!skip.contains("supplierRow")) {
            checkFirstSupplierRow();
            if (!skip.contains("supplierCredential")) {
                selectFirstSupplierCredential(AdminPages.Admin.Branch.BranchTestData.credentialName());
            }
            setFirstSupplierDescription("QA product access description");
        }
        return this;
    }

    public AddBranch_Page clickSubmit() {
        clickVia(SUBMIT_BUTTON);
        return this;
    }

    public AddBranch_Page clickCancel() {
        clickVia(CANCEL_BUTTON);
        return this;
    }

    /** Asserts the submit button's label reads exactly the given expected text (TC-BR-035, out of this run's scope but kept as a documented capability). */
    public void assertSubmitButtonLabelEquals(String expected) {
        driver.assertThat().element(SUBMIT_BUTTON).text().isEqualTo(expected).perform();
    }

    /** Asserts submission was blocked -- the browser is still on the Add Branch URL. */
    public void assertSubmissionBlocked() {
        driver.assertThat().browser().url().contains("/admin/branch/add").perform();
    }

    /** Bounded wait for the post-submit outcome signal, per REPAIR-001 (see {@link #assertSubmissionSucceeded}). */
    private static final Duration SUBMIT_OUTCOME_TIMEOUT = Duration.ofSeconds(10);

    /**
     * Asserts submission succeeded: either the browser navigated away from the Add Branch URL, or
     * the page source contains "Pending for approval". Reads the page source directly (see
     * assertReachingPercentageCapMessageShown's note on this SHAFT_ENGINE version's validation
     * builder not exposing a text()/pageSource() fluent check).
     *
     * <p><b>REPAIR-001 (applied here 2026-08-09):</b> both signals used to be read once, immediately
     * after {@code clickSubmit()} returns. Diagnosis (healing/evidence_0806/diagnosis6.log) established
     * the submission does succeed and does navigate away, but asynchronously -- the earlier immediate
     * read observed the pre-navigation state and reported a false failure. This now polls, bounded, for
     * either signal to become true rather than asserting on whatever is on screen the instant the click
     * returns. No expected value changed: {@code navigatedAway || pendingApprovalShown} is the same
     * condition as before, only no longer read too early.</p>
     */
    public void assertSubmissionSucceeded() {
        boolean succeeded;
        try {
            succeeded = new WebDriverWait(driver.getDriver(), SUBMIT_OUTCOME_TIMEOUT)
                    .until(d -> !driver.browser().getCurrentURL().contains("/admin/branch/add")
                            || driver.browser().getPageSource().contains("Pending for approval"));
        } catch (TimeoutException notObserved) {
            succeeded = false;
        }
        System.out.println("[DIAG8] url=" + driver.browser().getCurrentURL());
        System.out.println("[DIAG8] errors=" + ((org.openqa.selenium.JavascriptExecutor) driver.getDriver())
                .executeScript("return Array.from(document.querySelectorAll('.p-error,.invalid-feedback,[class*=error]'))"
                        + ".map(function(e){return e.textContent.trim();})"
                        + ".filter(function(t){return t.length>0 && t.length<160;}).slice(0,20).join(' ~ ');"));
        System.out.println("[DIAG8] emptyFields=" + ((org.openqa.selenium.JavascriptExecutor) driver.getDriver())
                .executeScript(
                        "return Array.from(document.querySelectorAll('input,textarea')).filter(function(e){"
                        + "  var r=e.getBoundingClientRect();"
                        + "  return r.width>0 && e.type!=='checkbox' && e.type!=='radio' && !e.value;"
                        + "}).map(function(e){"
                        + "  var lbl='';var p=e.parentElement;"
                        + "  for(var i=0;i<5&&p;i++){var l=p.querySelector('label');if(l){lbl=l.textContent.trim();break;}p=p.parentElement;}"
                        + "  return (lbl||e.id||e.placeholder||e.tagName);"
                        + "}).slice(0,25).join(' | ');"));
        Assert.assertTrue(succeeded,
                "Expected the Branch to be saved with status \"Pending for approval.\"");
    }
}
