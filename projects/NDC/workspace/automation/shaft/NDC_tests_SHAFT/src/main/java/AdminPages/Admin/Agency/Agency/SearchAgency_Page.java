package AdminPages.Admin.Agency.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Export package, Target = "compatible with the Reference Project" — RUN-20260713-001 (Stage 4).
 *
 * Reused from the Reference Project's own SearchAgency_Page.java (E:\Automation2\NDC-Uplift-
 * Automation), per agents/automation_agent.md §9/§11 (reuse before generating new) — its locators
 * (#id-Agencyname, p-radiobutton-wrapped Status radios, submit button) matched this run's own live
 * Discovery exactly (Agency_Search.md). Not a verbatim copy: the Reference version's navigation
 * click and its commented-out Country/State/City multiselect logic and Thread.sleep(1000) hard wait
 * were dropped — navigation to the Agency List already happens the same way TC-AGENCY-001/etc. do it
 * (this run's own AdminMenu.openAgency() + the "/admin/agency" link click), so this page object's
 * responsibility starts once already on the List screen, matching this package's existing Page
 * Object convention (Agency_Page, Branch_Page do the same — navigation is the test's job, not the
 * page object's).
 */
public class SearchAgency_Page {
    public SearchAgency_Page(SHAFT.GUI.WebDriver driver) {
        this.driver = driver;
    }

    SHAFT.GUI.WebDriver driver;

    By Txt_AgencyName = By.xpath("//input[@id=\"id-Agencyname\"]");
    By Rbtn_Both = By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]");
    By Btn_SearchGrid = By.xpath("//button[@type=\"submit\"]");
    By Tbl_Rows = By.xpath("//table/tbody/tr");
    By Txt_NoDataFound = By.xpath("//*[contains(text(),'No data has been found')]");

    // EXTENSIONS — RUN-20260718-001, confirmed live (input-id DOM query on the List/Search filter
    // area, this run): id-Agencycode, id-SelectCountry/id-State/id-City (p-multiselect wrappers,
    // same wrapping convention as the Add form's single-select p-dropdowns), id-Status-Inactive/
    // -Active (Both was already present above).
    By Txt_AgencyCode = By.xpath("//input[@id=\"id-Agencycode\"]");
    By Rbtn_Active = By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Active\"]]");
    By Rbtn_Inactive = By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Inactive\"]]");
    By Lst_Country = By.xpath("//p-multiselect[.//input[@id=\"id-SelectCountry\"]]");
    By Lst_State = By.xpath("//p-multiselect[.//input[@id=\"id-State\"]]");
    By Lst_City = By.xpath("//p-multiselect[.//input[@id=\"id-City\"]]");
    By Btn_AddAgency = By.xpath("//button[contains(normalize-space(.), 'Add agency')]");

    public SearchAgency_Page searchByName(String agencyName) throws InterruptedException {
        driver.element().type(Txt_AgencyName, agencyName);
        driver.element().click(Rbtn_Both);
        driver.element().click(Btn_SearchGrid);
        waitForResultsToRender();
        return this;
    }

    /**
     * Polls for either a populated results table OR the "No data has been found!" message, up to
     * 8s -- confirmed live (2026-07-13) that the initial SHAFT port ran the whole search-and-check
     * sequence in 1.6s and observed neither state yet, mirroring the exact same Angular-async-
     * render-timing gap Branch's own getVisibleRowCountWithoutSearch() had to poll for (REP-001).
     */
    private void waitForResultsToRender() throws InterruptedException {
        long deadline = System.currentTimeMillis() + 8000L;
        while (System.currentTimeMillis() < deadline) {
            boolean hasRows = !driver.getDriver().findElements(Tbl_Rows).isEmpty();
            boolean hasNoDataMessage = !driver.getDriver().findElements(Txt_NoDataFound).isEmpty();
            if (hasRows || hasNoDataMessage) return;
            Thread.sleep(250);
        }
    }

    /** Returns the visible grid rows' full text content, one String per row — empty list if
     *  "No data has been found!" is showing instead of a table. */
    public List<String> getResultRowsText() {
        List<WebElement> rows = driver.getDriver().findElements(Tbl_Rows);
        return rows.stream().map(WebElement::getText).toList();
    }

    public boolean isNoDataFoundShown() {
        return !driver.getDriver().findElements(Txt_NoDataFound).isEmpty();
    }
}
