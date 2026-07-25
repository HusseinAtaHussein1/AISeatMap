package AdminPages.Master.PaymentGateway;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * New this run (2026-07-18, TC-BRANCH-008). Master → Payment Gateway → Payment Method
 * (`/master/gateway/gateway-method`) — no Reference Project equivalent existed for this screen, so
 * locators are authored fresh from this run's own live inspection (`knowledge_base/application/APP-002.md`).
 * Row-scoped by Payment Method name throughout, mirroring Branch_Page's own row-scoping pattern
 * (FINDING-004 lesson) — never a positional guess into the paginated 34-entry list.
 */
public class PaymentMethod_Page {
    public PaymentMethod_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    // 2026-07-18: pointed at .70 per explicit user instruction, matching this run's own Discovery
    // screenshots (Branch Edit BRN2, Payment Method list) which were all taken against .70.
    private static final String PAYMENT_METHOD_URL = "http://192.168.1.70/master/gateway/gateway-method";

    public PaymentMethod_Page open() {
        driver.browser().navigateToURL(PAYMENT_METHOD_URL);
        waitForTableToRender();
        return this;
    }

    /** Mirrors Branch_Page.getVisibleRowCountWithoutSearch()'s poll-not-fixed-delay pattern — the
     *  page load strategy is "none", so navigateToURL() returns before Angular's async grid render
     *  completes; querying the DOM immediately after would see zero rows. */
    private void waitForTableToRender() {
        long deadline = System.currentTimeMillis() + 8000L;
        while (System.currentTimeMillis() < deadline) {
            if (!driver.getDriver().findElements(By.xpath("//tr/td")).isEmpty()) return;
            try {
                Thread.sleep(250);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }

    private By rowFor(String paymentMethodName) {
        return By.xpath("//tr[td[normalize-space()=\"" + paymentMethodName + "\"]]");
    }

    private By statusCellFor(String paymentMethodName) {
        return By.xpath("//tr[td[normalize-space()=\"" + paymentMethodName + "\"]]/td[2]");
    }

    /** The row's toggle icon — filled circle (pi-circle-fill) when Online, outline (pi-circle) when Offline. */
    private By toggleIconFor(String paymentMethodName) {
        return By.xpath("//tr[td[normalize-space()=\"" + paymentMethodName
                + "\"]]//div[contains(@class,\"action\") and not(contains(@class,\"exception-buttons\"))]//i[contains(@class,\"pi-circle\")]");
    }

    public String getStatus(String paymentMethodName) {
        List<WebElement> cells = driver.getDriver().findElements(statusCellFor(paymentMethodName));
        return cells.isEmpty() ? null : cells.get(0).getText().trim();
    }

    /** Flips Online<->Offline for the named row; no confirmation modal has been observed for this action. */
    public PaymentMethod_Page toggleStatus(String paymentMethodName) {
        driver.element().click(toggleIconFor(paymentMethodName));
        return this;
    }

    public boolean isRowPresent(String paymentMethodName) {
        return !driver.getDriver().findElements(rowFor(paymentMethodName)).isEmpty();
    }
}
