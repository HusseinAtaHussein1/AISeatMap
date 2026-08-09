package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

/**
 * Shared plumbing for this run's Page Objects: the driver handle, a bounded-wait factory, and the
 * read helpers every page needs.
 *
 * <p><b>Why reads go through plain Selenium.</b> Actions and assertions use SHAFT's fluent API so
 * they reach the Allure report. Element-<em>information</em> reads do not, because SHAFT moved them
 * from {@code element().getText(by)} to {@code element().get().text(by)} across the 9.x → 10.x
 * boundary. Routing reads through {@link SHAFT.GUI.WebDriver#getDriver()} keeps this suite working
 * on either side of that rename, at the cost of those reads not appearing as Allure steps — a
 * deliberate trade, since a read that silently fails to compile on a version bump is worse than one
 * that is invisible in the report.</p>
 *
 * <p><b>No {@code Thread.sleep} may appear in any subclass.</b> Every wait is a bounded
 * {@link WebDriverWait} obtained from {@link #waitFor(Duration)} (REPAIR-001), and no wait may be
 * nested inside another wait's condition — nesting makes the outer bound non-deterministic.</p>
 *
 * <p>Scope note: {@code AddBranch_Page} and {@code LogIn_Page} predate this class and deliberately do
 * not extend it. Retro-fitting them would mean modifying files the 13 already-passing Create Branch
 * tests depend on, which is outside this run's approved write scope. Recorded as technical debt in
 * the Stage 4A Self-Review Report rather than silently actioned.</p>
 */
public abstract class Branch_Common {

    protected static final Duration POLL_INTERVAL = Duration.ofMillis(250);
    /** REPAIR-BR (2026-08-09): bounded re-fetch attempts when a grid re-render invalidates a WebElement
     * reference between locating it and reading it. */
    protected static final int STALE_RETRY_ATTEMPTS = 3;

    protected final SHAFT.GUI.WebDriver driver;

    protected Branch_Common(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    /** The underlying Selenium driver, used for reads only — never for actions or assertions. */
    protected org.openqa.selenium.WebDriver selenium() {
        return driver.getDriver();
    }

    /**
     * REPAIR-BR-010 (2026-08-09): clicks by dispatching the full mouse event sequence the component
     * listens for, rather than asking the driver to click. Ported from {@code AddBranch_Page.clickVia}
     * (verified live 2026-08-05 for the list screen's {@code routerLink} button and the autocomplete
     * option: a driver-issued click on these controls is reported as delivered and changes nothing).
     * Diagnosed 2026-08-09 (`healing/RepairSummary.md` Pass HEAL-BR-20260809-01) that
     * {@link com.shaft.driver.SHAFT}'s plain {@code driver.element().click()} suffers the identical
     * failure on {@code SearchBranch_Page}'s pagination buttons — confirmed via timestamped
     * instrumentation showing 20+ second no-op clicks repeated across a full run — and applied here to
     * the row-action icons on the same evidence-consistent hypothesis.
     */
    protected void clickVia(By locator) {
        WebElement element = selenium().findElement(locator);
        ((org.openqa.selenium.JavascriptExecutor) selenium()).executeScript(
                "var e = arguments[0];"
                + "var opts = {bubbles: true, cancelable: true, view: window};"
                + "e.dispatchEvent(new MouseEvent('mouseover', opts));"
                + "e.dispatchEvent(new MouseEvent('mousedown', opts));"
                + "e.dispatchEvent(new MouseEvent('mouseup', opts));"
                + "e.dispatchEvent(new MouseEvent('click', opts));",
                element);
    }

    /** Named {@code waitFor}, not {@code wait} — {@code Object.wait} must not be shadowed. */
    protected WebDriverWait waitFor(Duration timeout) {
        WebDriverWait webDriverWait = new WebDriverWait(selenium(), timeout);
        webDriverWait.pollingEvery(POLL_INTERVAL);
        return webDriverWait;
    }

    /** Trimmed {@code value} attribute of the first match, or {@code ""} when absent. */
    protected String valueOfInput(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            if (elements.isEmpty()) {
                return "";
            }
            String value = elements.get(0).getAttribute("value");
            return value == null ? "" : value.trim();
        });
    }

    /** Trimmed visible text of the first match, or {@code ""} when absent. */
    protected String textOf(By locator) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            return elements.isEmpty() ? "" : elements.get(0).getText().trim();
        });
    }

    /**
     * Text of every match that is both displayed and non-empty. Used to detect messages by their
     * rendered content rather than by asserting on raw page source, which matches markup a user never
     * sees and produces assertions that cannot fail.
     */
    protected List<String> visibleTextsOf(By locator) {
        return withStaleRetry(() -> {
            List<String> texts = new ArrayList<>();
            for (WebElement element : selenium().findElements(locator)) {
                if (element.isDisplayed()) {
                    String text = element.getText().trim();
                    if (!text.isEmpty()) {
                        texts.add(text);
                    }
                }
            }
            return texts;
        });
    }

    protected boolean hasClass(By locator, String cssClass) {
        return withStaleRetry(() -> {
            List<WebElement> elements = selenium().findElements(locator);
            if (elements.isEmpty()) {
                return false;
            }
            String classAttribute = elements.get(0).getAttribute("class");
            return classAttribute != null && classAttribute.contains(cssClass);
        });
    }

    /**
     * REPAIR-BR (2026-08-09): re-runs {@code read} up to {@link #STALE_RETRY_ATTEMPTS} times when the
     * grid/panel re-renders between {@code findElements()} locating an element and this same call
     * reading it — the read is re-issued from scratch each attempt, so it never reads a reference that
     * was valid on a prior render but stale on this one.
     */
    protected <T> T withStaleRetry(Supplier<T> read) {
        StaleElementReferenceException lastFailure = null;
        for (int attempt = 1; attempt <= STALE_RETRY_ATTEMPTS; attempt++) {
            try {
                return read.get();
            } catch (StaleElementReferenceException stale) {
                lastFailure = stale;
            }
        }
        throw lastFailure;
    }
}
