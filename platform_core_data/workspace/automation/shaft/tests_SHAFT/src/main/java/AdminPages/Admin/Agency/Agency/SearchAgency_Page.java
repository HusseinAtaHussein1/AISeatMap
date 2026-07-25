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
        return typeAgencyName(agencyName).selectStatusBoth().submitSearch();
    }

    /** Centralized 2026-07-25 to remove the raw-locator search/filter sequences that had
     *  accumulated directly in Agency_Search_TC — every field below already had a confirmed
     *  locator on this class (searchFixtures_dot70 extensions, RUN-20260718-001), they were just
     *  never given their own public method. */
    public SearchAgency_Page typeAgencyName(String agencyName) {
        driver.element().type(Txt_AgencyName, agencyName);
        return this;
    }

    public SearchAgency_Page typeAgencyCode(String agencyCode) {
        driver.element().type(Txt_AgencyCode, agencyCode);
        return this;
    }

    public SearchAgency_Page selectStatusBoth() {
        driver.element().click(Rbtn_Both);
        return this;
    }

    public SearchAgency_Page selectStatusActive() {
        driver.element().click(Rbtn_Active);
        return this;
    }

    public SearchAgency_Page selectStatusInactive() {
        driver.element().click(Rbtn_Inactive);
        return this;
    }

    /** Opens the City multiselect, picks the option whose text contains the given value, then
     *  dismisses the overlay by clicking outside it — same panel-open/option-match/close sequence
     *  Agency_Search_TC's own search003 test drove inline before this method existed. */
    public SearchAgency_Page filterByCity(String city) throws InterruptedException {
        driver.element().click(Lst_City);
        Thread.sleep(800);
        driver.element().click(By.xpath(String.format(
                "//li[contains(@class,'p-multiselect-item')]//*[contains(normalize-space(text()),'%s')]", city)));
        closeOpenOverlay();
        return this;
    }

    private void closeOpenOverlay() {
        driver.getDriver().findElement(By.tagName("body")).click();
    }

    public SearchAgency_Page submitSearch() throws InterruptedException {
        driver.element().click(Btn_SearchGrid);
        waitForResultsToRender();
        return this;
    }

    public SearchAgency_Page searchByCode(String agencyCode) throws InterruptedException {
        return typeAgencyCode(agencyCode).selectStatusBoth().submitSearch();
    }

    /** Both-status, no filters — the default "load everything" list view used by tests that just
     *  need the grid populated (e.g. to resolve a freshly-created record's Agency Code). */
    public SearchAgency_Page showAll() throws InterruptedException {
        return selectStatusBoth().submitSearch();
    }

    /** Navigates to the Add Agency form. */
    public Agency_Page clickAddAgency() {
        driver.element().click(Btn_AddAgency);
        return new Agency_Page(driver);
    }

    /** Resolves the Agency Code (e.g. "AGN10200") for a given Agency Name by reading the currently
     *  rendered grid rows — confirmed live that a freshly-created record sorts to the top, so
     *  callers typically call showAll() first. Centralized 2026-07-25 (was duplicated identically
     *  in Agency_Actions_TC and Agency_Update_TC). */
    public String resolveCodeForName(String agencyName) {
        List<WebElement> rows = driver.getDriver().findElements(Tbl_Rows);
        for (WebElement row : rows) {
            List<WebElement> cells = row.findElements(By.tagName("td"));
            if (!cells.isEmpty() && cells.get(1).getText().equals(agencyName)) {
                return cells.get(0).getText();
            }
        }
        throw new IllegalStateException("Could not find a freshly-created Agency named " + agencyName + " in the first page of results.");
    }

    /** TC-AGENCY-SEARCH-006: scoped to the search form itself (the field under test and its
     *  immediate container), not the full page body — a script-tag payload reflected unescaped
     *  would render as literal text within this container. */
    private By searchFormContainer() {
        return By.xpath("//form[.//input[@id=\"id-Agencyname\"]]");
    }

    public boolean searchAreaContainsRawScriptTag() {
        List<WebElement> forms = driver.getDriver().findElements(searchFormContainer());
        return !forms.isEmpty() && forms.get(0).getText().contains("<script>");
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
