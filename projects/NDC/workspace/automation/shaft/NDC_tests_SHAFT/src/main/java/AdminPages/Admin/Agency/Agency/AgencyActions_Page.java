package AdminPages.Admin.Agency.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * New page object — RUN-20260718-001 (Stage 4, new tests_SHAFT_Agency package).
 *
 * Backed entirely by runs/RUN-20260718-001/discovery/Agency_Actions.md (live browser session,
 * .70, 2026-07-18) — every locator/behavior here was individually confirmed against real
 * QASPIKE_ACT* fixtures before being ported here, never invented. This closes the gap
 * runs/RUN-20260713-001/discovery/Agency_Activate.md (FINDING-007) left "Blocked — needs human
 * input" on where Agency Approve/Reject actually happens.
 *
 * Scope: the Agency List screen's Actions column only (pencil / thumbs-up / thumbs-down and the
 * shared remark popup they open) — operates on the same screen SearchAgency_Page already
 * represents, but is kept as its own class since it is a distinct workflow (Actions), not
 * Search, per the Suite Planning Engine's business-workflow grouping (agents/automation_agent.md
 * §10).
 */
public class AgencyActions_Page {
    public AgencyActions_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    // Confirmed live: label's `for="id-Remarks"` exists, but the textarea itself does not
    // reliably carry that id in the rendered DOM (the reusable ndc-fg-form-generator component
    // does not guarantee it) — placeholder is the stable, confirmed selector.
    By Txt_Remarks = By.xpath("//textarea[@placeholder=\"remarks...\"]");
    By Btn_DialogSubmit = By.xpath("//button[normalize-space(.)=\"Submit\"]");
    By Btn_DialogCancel = By.xpath("//button[normalize-space(.)=\"Cancel\"]");
    By Txt_DialogTitle = By.xpath("//span[contains(@class,\"p-dialog-title\")]");
    By Txt_ToastOrMessage = By.xpath("//*[contains(@class,'p-toast') or @role='alert' or contains(@class,'p-message')]");

    private By rowByCode(String agencyCode) {
        return By.xpath(String.format("//table/tbody/tr[td[1][normalize-space(text())=\"%s\"]]", agencyCode));
    }

    private By pencilForCode(String agencyCode) {
        return By.xpath(String.format(
                "//table/tbody/tr[td[1][normalize-space(text())=\"%s\"]]//i[contains(@class,'pi-pencil')]", agencyCode));
    }

    private By thumbsUpForCode(String agencyCode) {
        return By.xpath(String.format(
                "//table/tbody/tr[td[1][normalize-space(text())=\"%s\"]]//i[contains(@class,'pi-thumbs-up')]", agencyCode));
    }

    private By thumbsDownForCode(String agencyCode) {
        return By.xpath(String.format(
                "//table/tbody/tr[td[1][normalize-space(text())=\"%s\"]]//i[contains(@class,'pi-thumbs-down')]", agencyCode));
    }

    /** TC-AGENCY-ACTIONS-001: opens Update Agency for the exact row clicked. Caller asserts the
     *  resulting URL and/or the Update screen's own pre-populated Agency Name field. */
    public void clickPencilForCode(String agencyCode) {
        driver.element().click(pencilForCode(agencyCode));
    }

    /** TC-AGENCY-ACTIONS-003/004: opens the Approve remark popup for the given row. */
    public AgencyActions_Page clickApproveForCode(String agencyCode) {
        driver.element().click(thumbsUpForCode(agencyCode));
        return this;
    }

    /** TC-AGENCY-ACTIONS-005/006: opens the Reject remark popup for the given row. */
    public AgencyActions_Page clickRejectForCode(String agencyCode) {
        driver.element().click(thumbsDownForCode(agencyCode));
        return this;
    }

    /** Confirmed live: submitting with an empty Remarks value does not approve/reject the record
     *  (the row's Approval Status is unchanged afterward) — this is the real, observed block
     *  mechanism, not an inline validation-message read (none was captured live). Callers should
     *  assert the row's Approval Status is unchanged after calling this, not an error message. */
    public AgencyActions_Page attemptSubmitWithEmptyRemark() {
        driver.element().click(Btn_DialogSubmit);
        return this;
    }

    public AgencyActions_Page fillRemarkAndSubmit(String remark) {
        driver.element().type(Txt_Remarks, remark);
        driver.element().click(Btn_DialogSubmit);
        return this;
    }

    public AgencyActions_Page cancelDialog() {
        driver.element().click(Btn_DialogCancel);
        return this;
    }

    /** TC-AGENCY-ACTIONS-003/005: the popup's title is the Agency's own name — confirmed live. */
    public String getDialogTitle() {
        return driver.element().getText(Txt_DialogTitle);
    }

    public boolean isRemarkFieldPresent() {
        return !driver.getDriver().findElements(Txt_Remarks).isEmpty();
    }

    /** TC-AGENCY-ACTIONS-004/006/007/009: real column values, confirmed live
     *  ("Active"/"Approved", "Inactive"/"Rejected", "Inactive"/"Pending for approval"). */
    public String getStatusForCode(String agencyCode) {
        List<WebElement> cells = driver.getDriver().findElement(rowByCode(agencyCode)).findElements(By.tagName("td"));
        return cells.get(4).getText();
    }

    public String getApprovalStatusForCode(String agencyCode) {
        List<WebElement> cells = driver.getDriver().findElement(rowByCode(agencyCode)).findElements(By.tagName("td"));
        return cells.get(5).getText();
    }

    /** TC-AGENCY-ACTIONS-002/008: real icon set present on this row's Actions cell — confirmed
     *  live to vary by Approval Status (Pending: pencil+up+down; Approved: pencil+down only;
     *  Rejected: pencil+up only) — see Agency_Actions.md / FINDING-008 point 6. Returns the
     *  "pi-xxx" suffixes present, e.g. ["pencil", "thumbs-up", "thumbs-down"]. */
    public List<String> getActionIconsForCode(String agencyCode) {
        WebElement row = driver.getDriver().findElement(rowByCode(agencyCode));
        String html = (String) ((org.openqa.selenium.JavascriptExecutor) driver.getDriver())
                .executeScript("return arguments[0].outerHTML;", row.findElements(By.tagName("td")).get(7));
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("pi-([a-z-]+)").matcher(html);
        java.util.List<String> icons = new java.util.ArrayList<>();
        while (m.find()) icons.add(m.group(1));
        return icons;
    }

    public String getToastOrMessageTextIfPresent() {
        List<WebElement> els = driver.getDriver().findElements(Txt_ToastOrMessage);
        return els.isEmpty() ? null : els.get(0).getText();
    }

    public String getCurrentUrl() {
        return driver.getDriver().getCurrentUrl();
    }
}
