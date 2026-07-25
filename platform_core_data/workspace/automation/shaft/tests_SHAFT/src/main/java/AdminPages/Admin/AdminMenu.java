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
 *
 * Extended 2026-07-21 (RUN-20260721-001, Stage 4 — Role scope): added openCompany()/openRole().
 * The Reference Project's own AdminMenu.java (E:\Automation2\NDC-Uplift-Automation) has an
 * equivalent Company()/Role() pair, but Btn_Role there is positional
 * ("(//li[@class=\"child ng-star-inserted\"])[2]") — the same class of fragility already repaired
 * above for Btn_Branch/Btn_Staff, and directly relevant here since FINDING-004
 * (runs/RUN-20260721-001/discovery/findings/FINDING-004_ModuleSegmentListDiscrepancy/metadata.md)
 * shows this project's own menu/segment lists can vary by Admin tier. Deliberately NOT reused
 * verbatim — Btn_Role below uses the same text-based pattern as the Reference's own Btn_Company
 * (`//span[normalize-space()='...']`) instead, so it does not depend on Role's position among
 * Company's sub-items. Not yet independently confirmed live by this platform's own browser
 * automation (Discovery for this scope used a raw Playwright mouse-event workaround, not SHAFT) —
 * flagged as a Known Limitation for Stage 5, same disclosure pattern as Branch_Page's Btn_Edit.
 */
public class AdminMenu {
    public AdminMenu(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;
    By Btn_Admin = By.xpath("//a[@id=\"p-tabpanel-1-label\"]");
    By Btn_Branch = By.xpath("//a[@href=\"/admin/branch\"]");
    By Btn_Agency = By.xpath("//li[3]//tilde-theme-accordion[1]//header[1]//a[1]");
    By Btn_AgencyList = By.xpath("//a[@href=\"/admin/agency\"]");
    By Btn_Staff = By.xpath("//a[@href=\"/admin/staff\"]");
    By Btn_Company = By.xpath("//span[normalize-space()='Company']");
    By Btn_Role = By.xpath("//span[normalize-space()='Role']");

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

    /** Requires openAgency() first (expands the Agency accordion). Navigates to /admin/agency
     *  (the Agency List/Search screen) — same two-hop convention as openCompany()/openRole().
     *  Centralized here 2026-07-25 to remove the duplicated raw-locator navigation helpers that
     *  had accumulated across Agency_Actions_TC/Agency_Create_TC/Agency_Update_TC. */
    public AdminMenu openAgencyList() {
        driver.element().click(Btn_AgencyList);
        return this;
    }

    /** Expands the "Company" sub-item in the Admin sidebar, revealing Operating Country/Role/
     *  Department/Advance Credit-Top Up (runs/RUN-20260721-001/discovery/Timeline.md #5). */
    public AdminMenu openCompany() {
        driver.element().click(Btn_Company);
        return this;
    }

    /** Requires openCompany() first. Navigates to /admin/role (the Role List/Search screen). */
    public AdminMenu openRole() {
        driver.element().click(Btn_Role);
        return this;
    }
}
