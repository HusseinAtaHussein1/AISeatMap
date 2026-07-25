package AdminPages.Admin.Company.Role;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Export package, Target = "compatible with the Reference Project"
 * (E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Admin\Company\Role\Role_Page.java).
 * RUN-20260721-001 (Stage 4). Same package path as the Reference Project's own Role_Page.java, so
 * this can be reconciled with it later rather than living at an unrelated path.
 *
 * The Reference Project already has a working Role_Page.java/SearchRolePage.java pair — inspected
 * per the Automation Knowledge Base rule (agents/automation_agent.md §11) before writing this one.
 * Reused verbatim: txt_RoleName ("//input[@placeholder='Role Name']") and the permission
 * checkboxes' formcontrolname attributes (isView/isEdit/isApprove) — both confirmed live by this
 * platform's own Discovery too (runs/RUN-20260721-001/discovery/), not just carried over blindly.
 *
 * Deliberately NOT reused as-is: the Reference's own module/sub-module tab locators
 * (`p-tabpanel-{N}-label`, e.g. btn_Admin_Tab/btn_Company_Tab/...) are positional — a numeric
 * index tied to render order. FINDING-004 (this run's own Discovery) confirms this project's
 * segment list is Admin-tier-dependent (11 items for Super Admin, AC states 9), so a hardcoded
 * index is exactly the kind of fragility this platform's own precedent already repairs elsewhere
 * (AdminMenu's Btn_Branch/Btn_Staff, RUN-20260712-002). This class instead exposes
 * openModuleSegment(label)/openSubModuleTab(label), parametrized by the tab's own visible text —
 * one flexible method instead of 15 hardcoded ones (Reference's Role_Page has 11 module-tab
 * methods + 4 sub-module-tab methods, all positional). Same reasoning for permission checkboxes:
 * the Reference's own ClickIsViewAtAllFields()/etc. index View/Edit/Approve via mutable instance
 * fields (i/j/k) incremented across a hardcoded 1..61 loop with hardcoded tab-switch breakpoints —
 * this class instead scopes a row's checkboxes by that row's own label text.
 *
 * Known Limitation: the row-scoped checkbox xpath (rowCheckbox()) assumes the row's label and its
 * View/Edit/Approve checkboxes share a common ancestor container — confirmed structurally
 * consistent with this run's own Discovery screenshots (01-AddRole_Admin-Company-tab.png), but not
 * yet independently confirmed live through SHAFT's own Selenium binding (Discovery for this scope
 * used a raw Playwright mouse-event workaround, not this SHAFT package). Flagged for Stage 5's
 * first live run, same disclosure pattern as Branch_Page.java's Btn_Edit/Icn_ThumbDown.
 */
public class Role_Page {
    public Role_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    // ---- Role List/Search screen (Out of Scope per this run's own Project Context — visited only
    //      as the Cancel button's navigation target) ----
    By Btn_AddRole = By.xpath("//button[@routerlink='add']");

    /** Requires AdminMenu.openCompany().openRole() first (lands on /admin/role). */
    public Role_Page openAddRoleForm() {
        driver.element().click(Btn_AddRole);
        return this;
    }

    // ---- Add Role form ----
    // Reused verbatim from the Reference Project's Role_Page.java — confirmed live by this run's
    // own Discovery too (runs/RUN-20260721-001/discovery/00-AddRole_Dashboard-tab.png).
    By Txt_RoleName = By.xpath("//input[@placeholder='Role Name']");
    By Btn_SendForApproval = By.xpath("//button[@type='submit']");
    // Text-based, matching Branch_Page.java's own Btn_CancelApprove convention.
    By Btn_Cancel = By.xpath("//button[normalize-space()='Cancel']");
    // Reused from Branch_Page.java's Txt_ValidationSummary pattern (PrimeNG's standard error-text
    // class) — the exact live message text is asserted in the test class, not invented here.
    By Txt_ValidationMessages = By.xpath("//*[contains(@class,'p-error') or contains(@class,'invalid-feedback')]");

    /** Any module-segment tab (Dashboard/Admin/Master/.../Transfer PNR) or sub-module tab
     *  (Company/Branch/Agency/Staff), matched by its own visible label — both levels use the same
     *  PrimeNG p-tabview markup, confirmed by this run's own Discovery. */
    private By tabByLabel(String label) {
        return By.xpath("//a[contains(@class,'p-tabview-nav-link')][.//*[normalize-space(text())='" + label + "']]");
    }

    public Role_Page openModuleSegment(String label) {
        driver.element().click(tabByLabel(label));
        return this;
    }

    public Role_Page openSubModuleTab(String label) {
        driver.element().click(tabByLabel(label));
        return this;
    }

    public Role_Page enterRoleName(String name) {
        driver.element().type(Txt_RoleName, name);
        return this;
    }

    /** Scopes a permission row's checkbox by that row's own label text (e.g. "Role",
     *  "Operating Country", "Department", "Advance Credit/Top Up", or Dashboard's single
     *  "Display" row) — see class-level Known Limitation. controlName is one of
     *  "isView"/"isEdit"/"isApprove", the real Angular formcontrolname confirmed in the
     *  Reference Project's own Role_Page.java. */
    private By rowCheckbox(String rowLabel, String controlName) {
        return By.xpath("//*[self::div or self::tr][.//*[normalize-space(text())='" + rowLabel
                + "']]//p-checkbox[@formcontrolname='" + controlName + "']");
    }

    public Role_Page clickView(String rowLabel) {
        driver.element().click(rowCheckbox(rowLabel, "isView"));
        return this;
    }

    public Role_Page clickEdit(String rowLabel) {
        driver.element().click(rowCheckbox(rowLabel, "isEdit"));
        return this;
    }

    public Role_Page clickApprove(String rowLabel) {
        driver.element().click(rowCheckbox(rowLabel, "isApprove"));
        return this;
    }

    private boolean isChecked(By checkboxContainer) {
        List<WebElement> els = driver.getDriver().findElements(checkboxContainer);
        if (els.isEmpty()) return false;
        String cls = els.get(0).getAttribute("class");
        return cls != null && cls.contains("p-checkbox-checked");
    }

    public boolean isViewChecked(String rowLabel) {
        return isChecked(rowCheckbox(rowLabel, "isView"));
    }

    public boolean isEditChecked(String rowLabel) {
        return isChecked(rowCheckbox(rowLabel, "isEdit"));
    }

    public boolean isApproveChecked(String rowLabel) {
        return isChecked(rowCheckbox(rowLabel, "isApprove"));
    }

    /** Does NOT wait for navigation away from the form — several of this suite's own tests submit
     *  deliberately-invalid combinations (per Test Design's assumption-based/safe design, see
     *  Role_TC.java) that are expected to stay on /admin/role/add. Callers that expect a real
     *  navigation should assert on currentUrl() themselves. */
    public Role_Page clickSendForApproval() {
        driver.element().click(Btn_SendForApproval);
        return this;
    }

    public Role_Page clickCancel() {
        driver.element().click(Btn_Cancel);
        return this;
    }

    /** Returns every validation message currently rendered on the page — callers assert against
     *  the specific live text they expect (per FINDING-002, never the AC's original quoted
     *  strings), never an invented one. */
    public List<String> getValidationMessages() {
        return driver.getDriver().findElements(Txt_ValidationMessages).stream().map(WebElement::getText).toList();
    }

    public String currentUrl() {
        return driver.getDriver().getCurrentUrl();
    }
}
