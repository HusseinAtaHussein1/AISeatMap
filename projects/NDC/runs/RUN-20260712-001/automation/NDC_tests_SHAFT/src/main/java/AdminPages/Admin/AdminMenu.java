package AdminPages.Admin;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;

/**
 * Export package, Target = "compatible with the Reference Project"
 * (E:\Automation2\NDC-Uplift-Automation\src\main\java\AdminPages\Admin\AdminMenu.java).
 * Reused verbatim (RUN-20260712-002) — this is the Reference Project's own existing nav helper for
 * the Admin tab, unrelated to Login/Branch/Agency/Staff scope-specific pages.
 *
 * Repaired 2026-07-18: Btn_Branch/Btn_Staff were positional ("(//a[@class=\"ng-star-inserted\"])[2]"/
 * "[4]") — flagged as a Known Limitation since RUN-20260712-002, and confirmed live this run to
 * cause an intermittent nav failure (TC-BRANCH-007 landed somewhere without the List's "id-Name"
 * field, twice, in an otherwise identical fresh-session-per-test flow). Live DOM inspection
 * (diagBranchNavStructure diagnostic) showed both links carry their own stable, unique `href`
 * (`/admin/branch`, `/admin/staff`) — switched to those instead of position-counting, which was
 * always liable to break the moment any sibling nav item's visibility changed.
 */
public class AdminMenu {
    public AdminMenu(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;
    By Btn_Admin = By.xpath("//a[@id=\"p-tabpanel-1-label\"]");
    By Btn_Branch = By.xpath("//a[@href=\"/admin/branch\"]");
    By Btn_Agency = By.xpath("//li[3]//tilde-theme-accordion[1]//header[1]//a[1]");
    By Btn_Staff = By.xpath("//a[@href=\"/admin/staff\"]");

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
