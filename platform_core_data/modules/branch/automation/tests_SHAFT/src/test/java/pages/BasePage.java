package pages;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

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
 * <p>Scope note: {@code AddBranchPage} and {@code LoginPage} predate this class and deliberately do
 * not extend it. Retro-fitting them would mean modifying files the 13 already-passing Create Branch
 * tests depend on, which is outside this run's approved write scope. Recorded as technical debt in
 * the Stage 4A Self-Review Report rather than silently actioned.</p>
 */
public abstract class BasePage {

    protected static final Duration POLL_INTERVAL = Duration.ofMillis(250);

    protected final SHAFT.GUI.WebDriver driver;

    protected BasePage(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    /** The underlying Selenium driver, used for reads only — never for actions or assertions. */
    protected org.openqa.selenium.WebDriver selenium() {
        return driver.getDriver();
    }

    /** Named {@code waitFor}, not {@code wait} — {@code Object.wait} must not be shadowed. */
    protected WebDriverWait waitFor(Duration timeout) {
        WebDriverWait webDriverWait = new WebDriverWait(selenium(), timeout);
        webDriverWait.pollingEvery(POLL_INTERVAL);
        return webDriverWait;
    }

    /** Trimmed {@code value} attribute of the first match, or {@code ""} when absent. */
    protected String valueOfInput(By locator) {
        List<WebElement> elements = selenium().findElements(locator);
        if (elements.isEmpty()) {
            return "";
        }
        String value = elements.get(0).getAttribute("value");
        return value == null ? "" : value.trim();
    }

    /** Trimmed visible text of the first match, or {@code ""} when absent. */
    protected String textOf(By locator) {
        List<WebElement> elements = selenium().findElements(locator);
        return elements.isEmpty() ? "" : elements.get(0).getText().trim();
    }

    /**
     * Text of every match that is both displayed and non-empty. Used to detect messages by their
     * rendered content rather than by asserting on raw page source, which matches markup a user never
     * sees and produces assertions that cannot fail.
     */
    protected List<String> visibleTextsOf(By locator) {
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
    }

    protected boolean hasClass(By locator, String cssClass) {
        List<WebElement> elements = selenium().findElements(locator);
        if (elements.isEmpty()) {
            return false;
        }
        String classAttribute = elements.get(0).getAttribute("class");
        return classAttribute != null && classAttribute.contains(cssClass);
    }
}
