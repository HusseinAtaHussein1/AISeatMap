package AdminPages.Admin;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;

/**
 * Export package, Target = "compatible with the Reference Project"
 * (E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Admin\AdminMenu.java).
 * Reused verbatim (RUN-20260712-002) — this is the Reference Project's own existing nav helper for
 * the Admin tab, unrelated to Login/Branch/Agency/Staff scope-specific pages. Its Btn_Branch/Btn_Staff
 * locators are positional ("(//a[@class=\"ng-star-inserted\"])[2]") — a known brittleness inherited
 * from the Reference Project, not introduced here; see NDC_AutomationPlan_SHAFT.md "Known Limitations."
 */
public class AdminMenu {
    public AdminMenu(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;
    By Btn_Admin = By.xpath("//a[@id=\"p-tabpanel-1-label\"]");
    By Btn_Branch = By.xpath("(//a[@class=\"ng-star-inserted\"])[2]");
    By Btn_Agency = By.xpath("//li[3]//tilde-theme-accordion[1]//header[1]//a[1]");
    By Btn_Staff = By.xpath("(//a[@class=\"ng-star-inserted\"])[4]");

    public AdminMenu openSubAdmin() {
        driver.element().click(Btn_Admin);
        return this;
    }

    public AdminMenu openBranch() {
        driver.element().click(Btn_Branch);
        return this;
    }

    public AdminMenu openStaff() {
        driver.element().click(Btn_Staff);
        return this;
    }

    public AdminMenu openAgency() {
        driver.element().click(Btn_Agency);
        return this;
    }
}
