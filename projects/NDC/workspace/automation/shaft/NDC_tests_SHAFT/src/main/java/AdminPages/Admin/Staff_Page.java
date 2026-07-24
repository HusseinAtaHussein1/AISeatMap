package AdminPages.Admin;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Export package, Target = "compatible with the Reference Project"
 * (E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Admin\Staff_Page.java).
 * RUN-20260712-002 (Stage 4). Trimmed to the methods TC-STAFF-001/002/003/005 need — the Reference
 * Project's own Staff_Page also covers Search/Edit/Approve/Reject flows not automated this run
 * (TC-STAFF-004, the List record-count question, is an Exploratory/manual charter, not automated).
 * Locators reused verbatim — its ids (id-Usertype, id-Employeename, id-Optiontoundercut-Yes/No,
 * etc.) matched exactly what this run's own Discovery observed live (Staff_Add.md).
 */
public class Staff_Page {

    public Staff_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    By Btn_AddStaff = By.xpath("//span[@style=\"margin-inline-end: 10px;\"]");
    By Lst_Usertype = By.xpath("//p-dropdown[.//input[@id=\"id-Usertype\"]]");
    By Lst_OperatingCountry = By.xpath("//p-multiselect[.//input[@name='Operating country']]");
    By Lst_Branch = By.xpath("//p-multiselect[.//input[@id=\"id-Branch\"]]");
    By Lst_Department = By.xpath("//p-multiselect[.//input[@id=\"id-Department\"]]");
    By Lst_Role = By.xpath("(//p-dropdown)[2]");
    By Txt_EmployeeName = By.xpath("//input[@id=\"id-Employeename\"]");
    By Txt_EmployeeEmail = By.xpath("//input[@id=\"id-Employeeemail\"]");
    By Txt_EmployeePhoneNo = By.xpath("//input[@id=\"Employee phone number\"]");
    By Txt_EmployeeSecondaryNo = By.xpath("//input[@id=\"Secondary phone number\"]");
    By Txt_Username = By.xpath("//input[@id=\"id-Username\"]");
    By Lst_ApproverList = By.xpath("//p-dropdown[.//input[@id=\"id-ApproverList\"]]");
    By Rbtn_YesUndercut = By.xpath("//p-radiobutton[.//input[@id=\"id-Optiontoundercut-Yes\"]]");
    By Rbtn_NoUndercut = By.xpath("//p-radiobutton[.//input[@id=\"id-Optiontoundercut-No\"]]");
    By Rbtn_NoUndercutInput = By.xpath("//input[@id=\"id-Optiontoundercut-No\"]");
    By Btn_SendForApproval = By.xpath("//button[@type=\"submit\"]");
    By Txt_ValidationSummary = By.xpath("//*[contains(@class,'p-error') or contains(@class,'invalid-feedback')]");

    public void addStaff() {
        driver.element().click(Btn_AddStaff);
    }

    /**
     * Repair (2026-07-12, Automation Repair Loop — EXEC-20260712-002-001): the original
     * page-wide //span[contains(text(),'X')] search for the "Usertype" option matched the top
     * nav's own "Admin" tab text too (MultipleElementsFoundException). Scoped now to the open
     * PrimeNG dropdown/multiselect overlay panel only, so it can never match chrome elsewhere on
     * the page.
     */
    private void clickDropdownOption(String optionText) {
        By scopedOption = By.xpath(String.format(
                "//div[contains(@class,'p-dropdown-panel') or contains(@class,'p-multiselect-panel')]//span[contains(text(), '%s')]",
                optionText));
        driver.element().click(scopedOption);
    }

    public void fillCore(String usertype, String operatingCountry, String branch, String department,
                          String role, String employeeName, String employeeEmail, String employeePhoneNo,
                          String employeeSecNo, String username, String approverList) {
        driver.element().click(Lst_Usertype);
        clickDropdownOption(usertype);
        driver.element().click(Lst_OperatingCountry);
        clickDropdownOption(operatingCountry);
        driver.element().click(Lst_Branch);
        clickDropdownOption(branch);
        driver.element().click(Lst_Department);
        clickDropdownOption(department);
        driver.element().click(Lst_Role);
        clickDropdownOption(role);
        driver.element().type(Txt_EmployeeName, employeeName);
        driver.element().type(Txt_EmployeeEmail, employeeEmail);
        driver.element().type(Txt_EmployeePhoneNo, employeePhoneNo);
        driver.element().type(Txt_EmployeeSecondaryNo, employeeSecNo);
        driver.element().type(Txt_Username, username);
        driver.element().click(Lst_ApproverList);
        clickDropdownOption(approverList);
    }

    /** TC-STAFF-002/003 field-only entry point, without the full fillCore flow, for validation/uniqueness probes. */
    public void typeUsernameOnly(String username) {
        driver.element().type(Txt_Username, username);
    }

    /** TC-STAFF-005: observes the default radio state without clicking either option. */
    public boolean isNoUndercutSelectedByDefault() {
        return "true".equals(driver.element().getAttribute(Rbtn_NoUndercutInput, "checked"))
                || driver.getDriver().findElement(Rbtn_NoUndercutInput).isSelected();
    }

    public void submit() {
        driver.element().click(Btn_SendForApproval);
    }

    public String getValidationSummaryTextIfPresent() {
        List<WebElement> els = driver.getDriver().findElements(Txt_ValidationSummary);
        return els.isEmpty() ? null : els.get(0).getText();
    }

    public String getSuccessMessage() {
        return driver.element().getText(By.xpath("//div[@aria-label=\"Added Successfully\"]"));
    }
}
