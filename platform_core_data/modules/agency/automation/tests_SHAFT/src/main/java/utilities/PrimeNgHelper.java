package utilities;

import AdminPages.Admin.Branch.Branch_Common;
import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;

import java.time.Duration;
import java.util.List;

/**
 * Small technical helper for the PrimeNG behaviour every Agency Page Object needs: dropdown/checkbox/
 * radio addressing, toggling with no-op-click verification, and the two Agency-wide synchronization
 * repairs (loading-indicator wait, mandatory-field diagnostics).
 *
 * <p><b>Relocated from {@code Agency_Common} (2026-08-23 refactor).</b> Nothing here is Agency business
 * logic, an Agency locator, an assertion, fixture setup, test data, or page navigation -- it is the
 * PrimeNG/technical subset of what {@code Agency_Common} used to mix together with those. Each Agency
 * Page Object now composes an instance of this class instead of inheriting a shared base for it.
 *
 * <p><b>Still extends {@link Branch_Common}, and that is the same recorded imperfection as before, not a
 * new one.</b> That base carries the driver handle, the bounded-wait factory, the stale-retry read
 * helpers, and the two hard-won interaction repairs this application requires -- {@code clickVia}
 * (REPAIR-BR-010: a driver-issued click on these PrimeNG controls is reported as delivered and changes
 * nothing) and {@code typeVia} (REPAIR-BR-013: SHAFT reported text as typed while the input's
 * {@code value} stayed empty). The correct home for that base is {@code utilities}, but moving or copying
 * it would touch a file the Branch suite's passing tests depend on -- outside this refactor's approved
 * write scope. The dependency stays visible here, exactly as it was in the class this one replaces.
 */
public class PrimeNgHelper extends Branch_Common {

    protected static final Duration TRANSIENT_TIMEOUT = Duration.ofSeconds(8);

    /** Any element this stack uses to say "still loading". Verified live 2026-08-18. */
    public static final By BUSY_INDICATORS = By.cssSelector(
            "[class*='spinner'], [class*='loading'], [class*='p-progress']");

    public PrimeNgHelper(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    // -- PrimeNG component addressing ----------------------------------------------------------

    /**
     * <b>The single most important locator rule on this screen.</b> PrimeNG renders a hidden
     * accessibility {@code input} carrying the {@code id-*} id, and the element a user actually
     * interacts with is an ancestor {@code div}. Clicking the id directly targets a hidden node: the
     * click is accepted and nothing happens (knowledge item APP-002).
     */
    public static By primeAncestorOf(String elementId, String wrapperClass) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'"
                + wrapperClass + "')][1]");
    }

    public static By dropdownWrapper(String elementId) {
        return primeAncestorOf(elementId, "p-dropdown");
    }

    /** The span showing a PrimeNG dropdown's currently selected value. */
    public static By dropdownLabel(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'p-dropdown')][1]"
                + "//span[contains(@class,'p-dropdown-label')]");
    }

    /**
     * <b>REPAIR-AG-001 (2026-08-19, Stage 5H).</b> The click target for a PrimeNG checkbox is the inner
     * {@code div.p-checkbox-box}, <em>not</em> the outer {@code div.p-checkbox} wrapper -- confirmed live:
     * the wrapper leaves {@code checked} false, the box toggles it true.
     */
    public static By checkboxWrapper(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'p-checkbox')][1]"
                + "//div[contains(@class,'p-checkbox-box')]");
    }

    /** The same correction applied to radio buttons, by symmetry with {@link #checkboxWrapper}. */
    public static By radioWrapper(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']/ancestor::div[contains(@class,'p-radiobutton')][1]"
                + "//div[contains(@class,'p-radiobutton-box')]");
    }

    /** The hidden accessibility input itself -- the authoritative source of checked state. */
    public static By primeInput(String elementId) {
        return By.xpath("//*[@id='" + elementId + "']");
    }

    public static By multiSelectWrapper(String elementId) {
        return primeAncestorOf(elementId, "p-multiselect");
    }

    // -- Element state reads -------------------------------------------------------------------

    public boolean isPresent(By locator) {
        return withStaleRetry(() -> !selenium().findElements(locator).isEmpty());
    }

    public boolean isVisible(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return !elements.isEmpty() && elements.get(0).isDisplayed();
        });
    }

    /**
     * True when the element carries a {@code readonly} attribute -- distinct from {@code disabled}. A
     * field can be mandatory and read-only at the same time (FINDING-009), so a caller asserting "the
     * user cannot edit this" has to name which mechanism it means.
     */
    public boolean isReadOnly(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return !elements.isEmpty() && elements.get(0).getAttribute("readonly") != null;
        });
    }

    public boolean isDisabledAttribute(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return !elements.isEmpty() && elements.get(0).getAttribute("disabled") != null;
        });
    }

    /**
     * <b>REPAIR-AG-002 (2026-08-19, Stage 5H).</b> Reads checked state from the underlying input's
     * {@code checked} DOM <em>property</em>, not from a CSS class -- a class name is a styling detail
     * that can change without the control's behaviour changing.
     */
    public boolean isPrimeControlChecked(String elementId) {
        return readBooleanProperty(primeInput(elementId), "checked");
    }

    /** Class-based fallback for a control with no addressable id -- see {@link #isPrimeControlChecked}. */
    public boolean isPrimeControlHighlighted(By boxLocator) {
        return hasClass(boxLocator, "p-highlight");
    }

    /** Reads a live DOM <em>property</em> (not attribute) from the first match; {@code false} when absent. */
    public boolean readBooleanProperty(By locator, String property) {
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

    public int countOf(By locator) {
        return withStaleRetry(() -> selenium().findElements(locator).size());
    }

    // -- Interactions --------------------------------------------------------------------------

    /**
     * Clicks a PrimeNG checkbox or radio by element id, then confirms the state actually changed
     * (REPAIR-AG-001/002) -- a silent no-op click is this application's documented failure mode
     * (REPAIR-BR-010), so a toggle that reports success without changing state must never be trusted.
     */
    public void togglePrimeControl(String elementId, By clickTarget) {
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

    /** Toggle for a control with <b>no addressable id</b> -- a grid row's checkbox with a regenerated id. */
    public void togglePrimeControlByBox(By boxLocator) {
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
     * matching item in the overlay panel, which renders at the document root rather than as a descendant.
     */
    public void selectFromDropdown(String elementId, String visibleText) {
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

    public void scrollIntoView(By locator) {
        List<WebElement> elements = selenium().findElements(locator);
        if (!elements.isEmpty()) {
            ((JavascriptExecutor) selenium()).executeScript(
                    "arguments[0].scrollIntoView({block:'center'});", elements.get(0));
        }
    }

    /** Bounded, non-throwing poll for a visible element carrying text (REPAIR-002). */
    public boolean anyVisibleTextAppears(By locator) {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> !visibleTextsOf(locator).isEmpty());
            return true;
        } catch (TimeoutException neverAppeared) {
            return false;
        }
    }

    /** Quotes a value safely for XPath, including one containing an apostrophe. */
    public static String xpathLiteral(String value) {
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

    // -- Cross-page synchronization (formerly Agency_Common.waitUntilFormSettled) ---------------

    /**
     * The single readiness gate for an Agency screen that renders a populated form: spinner-clear AND
     * field-visible, never field-populated (REPAIR-AG-016). Values bind roughly 1.5s before the form
     * becomes visible, so a wait satisfied by "values are present" resolves while the form is still
     * invisible and every subsequent interaction then targets an element that cannot be clicked or typed
     * into -- see the Automation Plan for the timestamped probe this was measured from.
     *
     * @param minVisibleInputs the least-populated record a shared fixture can produce must still clear
     *                         this threshold; see REPAIR-AG-016 for how 20 was calibrated
     */
    public void waitUntilFormSettled(Duration timeout, int minVisibleInputs) {
        long t0 = System.currentTimeMillis();
        waitFor(timeout).until(
                d -> busyIndicatorCount() == 0 && visibleInputCount() >= minVisibleInputs);
        System.out.println("[DIAG-SYNC] Agency form settled t=" + (System.currentTimeMillis() - t0)
                + "ms visibleInputs=" + visibleInputCount() + " spinners=" + busyIndicatorCount());
    }

    public int busyIndicatorCount() {
        return withStaleRetry(() -> selenium().findElements(BUSY_INDICATORS).size());
    }

    /** Count of inputs actually laid out and visible -- the half of readiness that values cannot prove. */
    public int visibleInputCount() {
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

    // -- Two confirmed interaction repairs, kept exactly, relocated ------------------------------

    /**
     * <b>2026-08-23 regeneration finding.</b> A plain, driver-issued click -- deliberately <b>not</b>
     * {@code clickVia}. Live inspection found "Send For Approval" is a genuine native
     * {@code <button type="submit">}, structurally nothing like the fake-div PrimeNG controls
     * {@code clickVia} exists for.
     */
    public void clickNative(By locator) {
        List<WebElement> elements = selenium().findElements(locator);
        if (elements.isEmpty()) {
            throw new IllegalStateException("No element found for locator " + locator);
        }
        scrollIntoView(locator);
        elements.get(0).click();
    }

    /**
     * <b>REPAIR-AG-011 (2026-08-19, Stage 5H).</b> Types via real, per-character keystrokes for the one
     * class of control where {@code typeVia} (REPAIR-BR-013) is the wrong tool: PrimeNG's Calendar
     * component, which keeps its own internal date model and ignores a script-assigned value.
     *
     * <p>{@code element.clear()} is not a real keystroke either (REPAIR-AG-018) -- some driver/browser
     * combinations reset the value by script rather than dispatching real key events, which is exactly
     * the mechanism this component ignores. Selecting and deleting via real key events, exactly as a
     * person would, is used instead.
     */
    public void typeRealKeystrokes(By locator, String value) {
        List<WebElement> elements = selenium().findElements(locator);
        if (elements.isEmpty()) {
            throw new IllegalStateException("No element found for locator " + locator);
        }
        WebElement element = elements.get(0);
        scrollIntoView(locator);
        element.click();
        element.sendKeys(Keys.chord(Keys.CONTROL, "a"));
        element.sendKeys(Keys.DELETE);
        element.sendKeys(value);
        element.sendKeys(Keys.TAB);
    }

    /**
     * <b>2026-08-23 regeneration finding.</b> Names, by their own visible label, every mandatory control
     * Angular currently marks {@code ng-invalid}, reading the DOM directly rather than trusting any one
     * field's earlier fill call -- correct regardless of <em>why</em> a field ended up unfilled.
     */
    @SuppressWarnings("unchecked")
    public List<String> stillInvalidMandatoryFields() {
        return (List<String>) ((JavascriptExecutor) selenium()).executeScript(
                "function nearbyLabel(el) {"
                        + "  var node = el;"
                        + "  for (var hops = 0; hops < 6 && node; hops++) {"
                        + "    var container = node.parentElement;"
                        + "    if (!container) break;"
                        + "    var labels = container.querySelectorAll('label');"
                        + "    for (var i = 0; i < labels.length; i++) {"
                        + "      var t = (labels[i].textContent || '').trim();"
                        + "      if (t && t.length < 60) return t;"
                        + "    }"
                        + "    node = container;"
                        + "  }"
                        + "  return el.id ? ('#' + el.id) : el.tagName.toLowerCase();"
                        + "}"
                        + "var leafTags = ['input', 'select', 'textarea', 'p-dropdown', 'p-calendar', 'p-multiselect'];"
                        + "var invalid = Array.from(document.querySelectorAll('.ng-invalid')).filter("
                        + "  function(e) { return leafTags.indexOf(e.tagName.toLowerCase()) !== -1; });"
                        + "var seen = {};"
                        + "var out = [];"
                        + "invalid.forEach(function(e) {"
                        + "  var label = nearbyLabel(e);"
                        + "  if (!seen[label]) { seen[label] = true; out.push(label); }"
                        + "});"
                        + "return out;");
    }
}
