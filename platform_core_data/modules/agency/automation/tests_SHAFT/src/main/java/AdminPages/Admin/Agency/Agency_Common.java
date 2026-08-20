package AdminPages.Admin.Agency;

import AdminPages.Admin.Branch.Branch_Common;
import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;

import java.time.Duration;
import java.util.List;

/**
 * Shared plumbing for the Agency Page Objects.
 *
 * <p><b>This class extends {@link Branch_Common} instead of copying it.</b> That base already carries
 * the driver handle, the bounded-wait factory, the stale-retry read helpers, and the two hard-won
 * interaction repairs this application requires -- {@code clickVia} (REPAIR-BR-010: a driver-issued
 * click on these PrimeNG controls is reported as delivered and changes nothing) and {@code typeVia}
 * (REPAIR-BR-013: SHAFT reported text as typed while the input's {@code value} stayed empty and the
 * control stayed {@code ng-pristine}). Re-deriving either of those for Agency would mean
 * rediscovering, by failing, what the Branch suite already paid for.
 *
 * <p><b>A recorded imperfection, not an oversight.</b> Inheriting cross-module means Agency now
 * depends on a type in the {@code Branch} package. The correct home for that base is
 * {@code utilities}, but moving it would modify files the Branch suite's passing tests depend on --
 * outside this run's approved write scope, and exactly the kind of change automation-skill §11D.2 says
 * to <em>propose</em> rather than perform. The relocation to {@code utilities.Page_Common} is proposed
 * in this stage's Automation Decision Report; until it is approved the dependency stays visible here
 * rather than hidden behind a duplicate.
 *
 * <h2>Two mechanics every Agency page must obey</h2>
 *
 * <ol>
 *   <li><b>The Update form is reached by clicking a row's edit pen, never by URL</b> (REPAIR-004).
 *       Verified live 2026-08-18: {@code /admin/agency/edit/{id}} renders an empty shell -- body text
 *       246 characters, every field blank, no product-access table -- while every locator still
 *       resolves. A test built on a deep link therefore reads empty values successfully and reports a
 *       false defect.
 *   <li><b>Readiness is "spinners gone AND fields visible", never "fields hold values"</b>
 *       (REPAIR-014). See {@link #waitUntilFormSettled()} -- this is where Agency deliberately
 *       diverges from {@code UpdateBranch_Page}, and the reason is measured, not stylistic.
 * </ol>
 *
 * <p><b>No {@code Thread.sleep} may appear in any subclass.</b> Every wait is a bounded
 * {@code waitFor(...)} inherited from {@link Branch_Common} (REPAIR-001).
 */
public abstract class Agency_Common extends Branch_Common {

    protected static final Duration LOAD_TIMEOUT = Duration.ofSeconds(40);
    protected static final Duration TRANSIENT_TIMEOUT = Duration.ofSeconds(8);

    /**
     * Any element this stack uses to say "still loading". Verified live 2026-08-18: two such elements
     * were present on the Update Agency form at t=1500ms and zero at t=3000ms.
     */
    protected static final By BUSY_INDICATORS = By.cssSelector(
            "[class*='spinner'], [class*='loading'], [class*='p-progress']");

    /**
     * Minimum count of <em>visible</em> inputs meaning the Update Agency form has actually rendered.
     *
     * <p><b>REPAIR-AG-016 (2026-08-19, Stage 5H): recalibrated.</b> The original 50 was measured
     * against one manually-populated Agency (69 of 72 inputs visible) and never checked against a
     * <em>minimally</em>-populated one. Live evidence: this suite's own fixture Agency -- one bank
     * account row, one sales contact, as few product-access rows as its fixture Branch's suppliers --
     * settles, genuinely (zero spinners, a stable count across repeated reads), at only <b>25</b>
     * visible inputs. 50 is unreachable for exactly the kind of record an automation fixture builds, so
     * every {@code waitUntilFormSettled()} call spent its full 40s timeout and failed regardless of
     * approval status -- a miscalibrated threshold, not a broken condition. The threshold must fit the
     * <em>least</em>-populated record a shared fixture can produce, not the richest one ever observed:
     * <table><tr><td>un-rendered shell</td><td>0</td></tr>
     * <tr><td>fixture Agency (minimal), 2026-08-19</td><td>25</td></tr>
     * <tr><td>manually-populated Agency, 2026-08-18</td><td>69</td></tr></table>
     * 20 sits safely below the lowest real-render figure measured and far above the empty-shell
     * figure -- the same margin logic as the original 50, recalibrated against both data points instead
     * of one.
     */
    protected static final int MIN_VISIBLE_INPUTS = 20;

    protected Agency_Common(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    /**
     * <b>REPAIR-AG-011 (2026-08-19, Stage 5H).</b> Types via real, per-character keystrokes
     * ({@link WebElement#sendKeys}), for the one class of control where {@code typeVia}
     * (REPAIR-BR-013) is the wrong tool: PrimeNG's Calendar component.
     *
     * <p>Confirmed live on {@code #id-ContractStartDate}/{@code #id-ContractEndDate}: {@code typeVia}'s
     * synthetic {@code element.value = "..."} plus a single dispatched {@code input}/{@code change}
     * event left the field's DOM value <b>empty</b> after blur, even though no error was ever raised and
     * no exception was ever thrown. Real, per-character keystrokes on the identical field produced
     * {@code value="01/01/2026"}. The Calendar component evidently keeps its own internal date model
     * and only updates it in response to genuine key events; a value assigned by script bypasses that
     * model, and the component clears the input rather than accepting an externally-set value it never
     * parsed.
     *
     * <p><b>Why this is not a second, competing fix for {@code typeVia}'s underlying application
     * quirk.</b> {@code typeVia} exists because a plain input's Angular {@code formControl} did not
     * register a script-set value; this fields' problem is the opposite shape -- PrimeNG's own
     * JavaScript state machine, not Angular's, is what does not see a script-set value. Two different
     * controls, two different reasons, two different corrections. Using this method on a plain input
     * would work but is unnecessary; using {@code typeVia} on a {@code p-calendar} silently fails.
     */
    protected void typeRealKeystrokes(By locator, String value) {
        List<WebElement> elements = selenium().findElements(locator);
        if (elements.isEmpty()) {
            throw new IllegalStateException("No element found for locator " + locator);
        }
        WebElement element = elements.get(0);
        scrollIntoView(locator);
        element.click();
        // REPAIR-AG-018 (2026-08-20, Stage 5H): WebElement.clear() is not a real keystroke -- on some
        // driver/browser combinations it resets the value by script rather than dispatching real key
        // events, which is exactly the mechanism REPAIR-AG-011 already found this Calendar component
        // ignores. Live evidence: clearing this same field via genuine Ctrl+A / Delete key presses made
        // the "Required" validation message appear; clearing it via clear() + sendKeys(value) (this
        // method's own prior form) did not, for the identical field and identical empty value. Selecting
        // and deleting via real key events, exactly as a person would, is used instead.
        element.sendKeys(org.openqa.selenium.Keys.chord(org.openqa.selenium.Keys.CONTROL, "a"));
        element.sendKeys(org.openqa.selenium.Keys.DELETE);
        element.sendKeys(value);
        // Tab away so the component's own blur-time commit/validation runs, mirroring how a real user
        // leaves the field.
        element.sendKeys(org.openqa.selenium.Keys.TAB);
    }

    /**
     * The single readiness gate for every Agency screen that renders a populated form.
     *
     * <p><b>Why this does not poll on "the fields hold values", the way {@code UpdateBranch_Page}
     * legitimately does.</b> On the Agency Update form that signal is <em>false readiness</em>, and it
     * was measured rather than reasoned about. A timestamped probe on 2026-08-18 read:
     *
     * <pre>
     *   t = 1500 ms   inputs bound to values, 0 of 72 visible, 2 spinners present
     *   t = 3000 ms   69 of 72 visible, 0 spinners
     * </pre>
     *
     * <p>The record's values land roughly 1.5 seconds <em>before</em> the form becomes visible. A wait
     * satisfied by "values are present" resolves while the whole form is still invisible, and every
     * subsequent interaction then targets an element that cannot be clicked or typed into. An earlier
     * verification pass in this very stage was invalidated by exactly that mistake and discarded.
     *
     * <p>The condition is therefore the conjunction of both signals. Neither alone is sufficient:
     * spinners are absent before the fetch starts, and visibility alone would admit a
     * rendered-but-empty form.
     *
     * <p>This changes <em>when</em> a test reads, never <em>what</em> it asserts. If a form genuinely
     * never renders, the bounded wait expires and the caller's own assertion fails with its own
     * message -- no assertion is weakened and nothing passes that should not.
     */
    public void waitUntilFormSettled() {
        long t0 = System.currentTimeMillis();
        waitFor(LOAD_TIMEOUT).until(
                d -> busyIndicatorCount() == 0 && visibleInputCount() >= MIN_VISIBLE_INPUTS);
        System.out.println("[DIAG-SYNC] Agency form settled t=" + (System.currentTimeMillis() - t0)
                + "ms visibleInputs=" + visibleInputCount() + " spinners=" + busyIndicatorCount());
    }

    protected int busyIndicatorCount() {
        return withStaleRetry(() -> selenium().findElements(BUSY_INDICATORS).size());
    }

    /** Count of inputs actually laid out and visible -- the half of readiness that values cannot prove. */
    protected int visibleInputCount() {
        return withStaleRetry(() -> {
            int visible = 0;
            for (WebElement input : selenium().findElements(By.tagName("input"))) {
                if (input.isDisplayed()) {
                    visible++;
                }
            }
            return visible;
        });
    }

    // -- PrimeNG component addressing ----------------------------------------------------------

    /**
     * <b>The single most important locator rule on this screen.</b> PrimeNG renders a hidden
     * accessibility {@code input} carrying the {@code id-*} id, and the element a user actually
     * interacts with is an ancestor {@code div}. Clicking the id directly targets a hidden node: the
     * click is accepted and nothing happens. Every dropdown, checkbox, radio button and multi-select
     * below is therefore addressed through its ancestor wrapper (knowledge item APP-002).
     */
    protected static By primeAncestorOf(String elementId, String wrapperClass) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'"
                + wrapperClass + "')][1]");
    }

    protected static By dropdownWrapper(String elementId) {
        return primeAncestorOf(elementId, "p-dropdown");
    }

    /** The span showing a PrimeNG dropdown's currently selected value. */
    protected static By dropdownLabel(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'p-dropdown')][1]"
                + "//span[contains(@class,'p-dropdown-label')]");
    }

    /**
     * <b>REPAIR-AG-001 (2026-08-19, Stage 5H).</b> The click target for a PrimeNG checkbox is the inner
     * {@code div.p-checkbox-box}, <em>not</em> the outer {@code div.p-checkbox} wrapper.
     *
     * <p>This method originally returned the wrapper, and that is what broke the whole suite: the fixture
     * build failed at {@code BranchSupplierGrid.selectRow(2)} with "the click was accepted and had no
     * effect", which cascaded into 18 skipped tests.
     *
     * <p><b>The correction was already documented in this project and I generated past it.</b>
     * {@code AddBranch_Page}'s class Javadoc records, verified live on 2026-08-05 by dispatching the same
     * click at both levels: <i>"the wrapper leaves {@code checked} false, the box toggles it true &mdash;
     * one level too high and does not toggle the checkbox."</i> Its own
     * {@code FIRST_ROW_STATUS_CHECKBOX_ANCESTOR} ends in {@code //div[contains(@class,'p-checkbox-box')]}
     * for exactly this reason. Reading REPAIR-BR-010's "dispatch the full mouse event sequence" without
     * also taking its "at which element" correction is what produced this defect.
     */
    protected static By checkboxWrapper(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'p-checkbox')][1]"
                + "//div[contains(@class,'p-checkbox-box')]");
    }

    /**
     * The same correction applied to radio buttons, <b>by symmetry rather than by live proof</b>. No
     * proven radio locator exists anywhere in this project, so {@code p-radiobutton-box} is inferred from
     * PrimeNG's consistent {@code {component}-box} structure and is verified by the Stage 5H re-run rather
     * than asserted here. If a radio toggle fails with the no-op message, this is the first locator to
     * check.
     */
    protected static By radioWrapper(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'p-radiobutton')][1]"
                + "//div[contains(@class,'p-radiobutton-box')]");
    }

    /** The hidden accessibility input itself -- the authoritative source of checked state. */
    protected static By primeInput(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']");
    }

    protected static By multiSelectWrapper(String elementId) {
        return primeAncestorOf(elementId, "p-multiselect");
    }

    /**
     * Validation message belonging to <em>one specific field</em>.
     *
     * <p><b>Reused from the Branch suite's live-verified finding, not guessed.</b> This application's
     * required-field markup is
     * {@code ndc-fg-input > span.fg-error.has-error > ul.error-list > li}, holding text such as
     * {@code Required}. The Branch suite originally guessed at {@code .p-error},
     * {@code .invalid-feedback}, {@code .error-message}, {@code small.error} and {@code .field-error}
     * -- <em>none of which exists anywhere in this application</em> -- and found the real markup only
     * by failing in Stage 5H. The Agency suite starts from that answer, which is the entire purpose of
     * the Repair KB being a mandatory read before generation (automation-skill §11B).
     *
     * <p>{@code fg-error} alone is insufficient: it is a generic wrapper present, usually empty, on
     * every field. Only {@code fg-error} <em>combined with</em> {@code has-error} signals an active
     * message. Anchoring on the field's own nearest {@code ndc-fg-input} ancestor means this can never
     * match a different field's message -- which matters on a form carrying 81 controls.
     */
    protected static By validationMessageFor(String fieldXpath) {
        return By.xpath(fieldXpath + "/ancestor::ndc-fg-input[1]"
                + "//span[contains(concat(' ',normalize-space(@class),' '),' fg-error ')"
                + " and contains(concat(' ',normalize-space(@class),' '),' has-error ')]"
                + "//ul[contains(concat(' ',normalize-space(@class),' '),' error-list ')]//li");
    }

    /** Every currently rendered validation message on the form, whichever field it belongs to. */
    protected static final By ANY_VALIDATION_MESSAGE = By.xpath(
            "//span[contains(concat(' ',normalize-space(@class),' '),' fg-error ')"
                    + " and contains(concat(' ',normalize-space(@class),' '),' has-error ')]"
                    + "//ul[contains(concat(' ',normalize-space(@class),' '),' error-list ')]//li");

    protected static final By TOAST_MESSAGES = By.cssSelector(
            ".p-toast-message, .p-message, .toast, .alert-success, .snackbar");

    // -- Element state reads -------------------------------------------------------------------

    protected boolean isPresent(By locator) {
        return withStaleRetry(() -> !selenium().findElements(locator).isEmpty());
    }

    protected boolean isVisible(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return !elements.isEmpty() && elements.get(0).isDisplayed();
        });
    }

    /**
     * True when the element carries a {@code readonly} attribute -- a distinct condition from
     * {@code disabled}, and the two must not be conflated. FINDING-009 records a field that is
     * mandatory <em>and</em> read-only at the same time, so a test asserting "the user cannot edit
     * this" has to name which mechanism it is asserting.
     */
    protected boolean isReadOnly(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return !elements.isEmpty() && elements.get(0).getAttribute("readonly") != null;
        });
    }

    protected boolean isDisabledAttribute(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return !elements.isEmpty() && elements.get(0).getAttribute("disabled") != null;
        });
    }

    /**
     * <b>REPAIR-AG-002 (2026-08-19, Stage 5H).</b> Reads checked state from the underlying input's
     * {@code checked} <em>DOM property</em>, not from a CSS class.
     *
     * <p>The original implementation checked for {@code p-highlight} on {@code div.p-checkbox} -- wrong on
     * two counts. PrimeNG puts {@code p-highlight} on the inner {@code div.p-checkbox-box}, so the outer
     * wrapper never carries it; and a class name is a styling detail that can change without the control's
     * behaviour changing. So this returned {@code false} even for a control that really was ticked, which
     * meant {@link #togglePrimeControl} could not observe a state change and threw <em>even when the click
     * had worked</em>.
     *
     * <p>The {@code checked} property is what the Branch suite asserts on
     * ({@code readBooleanProperty(PAYMENT_OPTION_CASH, "checked")}) and it cannot drift with a stylesheet.
     * Note it must be read as a <b>property</b>, not an attribute: the {@code checked} attribute reflects
     * the initial markup, while the property reflects current state.
     */
    protected boolean isPrimeControlChecked(String elementId) {
        return readBooleanProperty(primeInput(elementId), "checked");
    }

    /** Class-based fallback for a control with no addressable id -- see {@link #isPrimeControlChecked}. */
    protected boolean isPrimeControlHighlighted(By boxLocator) {
        return hasClass(boxLocator, "p-highlight");
    }

    /** Reads a live DOM <em>property</em> (not attribute) from the first match; {@code false} when absent. */
    protected boolean readBooleanProperty(By locator, String property) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            if (elements.isEmpty()) {
                return false;
            }
            Object value = ((JavascriptExecutor) selenium())
                    .executeScript("return arguments[0][arguments[1]] === true;", elements.get(0), property);
            return Boolean.TRUE.equals(value);
        });
    }

    protected int countOf(By locator) {
        return withStaleRetry(() -> selenium().findElements(locator).size());
    }

    // -- Interactions --------------------------------------------------------------------------

    /**
     * Clicks a PrimeNG checkbox or radio by element id, then confirms the state actually changed.
     *
     * <p><b>REPAIR-AG-001/002 (2026-08-19).</b> Both halves of this method were wrong before Stage 5H: it
     * clicked the outer {@code div.p-checkbox} (which does not toggle anything) and verified via
     * {@code p-highlight} on that same outer element (which never carries it). The two faults masked each
     * other -- a correct click would still have been reported as a no-op.
     *
     * <p>The verification is kept, and deliberately so: a silent no-op click is this application's
     * documented failure mode (REPAIR-BR-010), so a toggle that reports success without changing state must
     * never be trusted. It is the verification that turned this defect into a clear, located failure
     * instead of a Branch submitted with an invalid Product Access grid.
     */
    protected void togglePrimeControl(String elementId, By clickTarget) {
        boolean before = isPrimeControlChecked(elementId);
        scrollIntoView(clickTarget);
        clickVia(clickTarget);
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> isPrimeControlChecked(elementId) != before);
        } catch (TimeoutException stateNeverChanged) {
            throw new IllegalStateException(
                    "Clicked a PrimeNG control but its underlying input's checked property stayed " + before
                            + " -- the click was accepted and had no effect (REPAIR-BR-010 no-op-click). "
                            + "Check the click target is the inner box (p-checkbox-box / p-radiobutton-box) "
                            + "and not the outer wrapper, which does not toggle. Element id: " + elementId
                            + ", click target: " + clickTarget);
        }
    }

    /**
     * Toggle for a control with <b>no addressable id</b> -- a grid row's checkbox, where the id is
     * regenerated per row. Falls back to the {@code p-highlight} class on the box, which is the only
     * signal available without an id to read a property from.
     */
    protected void togglePrimeControlByBox(By boxLocator) {
        boolean before = isPrimeControlHighlighted(boxLocator);
        scrollIntoView(boxLocator);
        clickVia(boxLocator);
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> isPrimeControlHighlighted(boxLocator) != before);
        } catch (TimeoutException stateNeverChanged) {
            throw new IllegalStateException(
                    "Clicked a PrimeNG control but its p-highlight state stayed " + before
                            + " -- the click was accepted and had no effect (REPAIR-BR-010 no-op-click). "
                            + "The target must be the inner box (p-checkbox-box), not the outer p-checkbox "
                            + "wrapper, which is one level too high and does not toggle. Locator: "
                            + boxLocator);
        }
    }

    /**
     * Selects a value in a PrimeNG dropdown by its visible text: open the wrapper, then click the
     * matching item in the overlay panel. The panel renders at the document root rather than inside
     * the dropdown, so the option is located globally, not as a descendant.
     */
    protected void selectFromDropdown(String elementId, String visibleText) {
        By wrapper = dropdownWrapper(elementId);
        scrollIntoView(wrapper);
        clickVia(wrapper);
        By option = By.xpath("//div[contains(@class,'p-dropdown-panel')]"
                + "//li[normalize-space(.)=" + xpathLiteral(visibleText) + "]");
        waitFor(TRANSIENT_TIMEOUT).until(d -> isVisible(option));
        clickVia(option);
        waitFor(TRANSIENT_TIMEOUT).until(
                d -> visibleText.equals(textOf(dropdownLabel(elementId)).trim()));
    }

    protected void scrollIntoView(By locator) {
        List<WebElement> elements = selenium().findElements(locator);
        if (!elements.isEmpty()) {
            ((JavascriptExecutor) selenium()).executeScript(
                    "arguments[0].scrollIntoView({block:'center'});", elements.get(0));
        }
    }

    /**
     * Bounded, non-throwing poll for a visible element carrying text (REPAIR-002). Messages on this
     * stack are transient, so absence has to be a returnable answer rather than an exception.
     */
    protected boolean anyVisibleTextAppears(By locator) {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> !visibleTextsOf(locator).isEmpty());
            return true;
        } catch (TimeoutException neverAppeared) {
            return false;
        }
    }

    /**
     * Quotes a value safely for XPath, including one containing an apostrophe. Agency names this suite
     * generates contain none, but expected message text is not generated here, and a naive
     * {@code "'" + text + "'"} would produce an invalid expression rather than a failed match.
     */
    protected static String xpathLiteral(String value) {
        if (!value.contains("'")) {
            return "'" + value + "'";
        }
        StringBuilder concat = new StringBuilder("concat(");
        String[] parts = value.split("'", -1);
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                concat.append(", \"'\", ");
            }
            concat.append("'").append(parts[i]).append("'");
        }
        return concat.append(")").toString();
    }
}
