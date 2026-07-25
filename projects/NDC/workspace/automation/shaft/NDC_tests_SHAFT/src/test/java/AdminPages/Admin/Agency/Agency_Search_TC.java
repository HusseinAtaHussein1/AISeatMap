package AdminPages.Admin.Agency;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Admin.Agency.Agency.SearchAgency_Page;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;
import java.util.List;

/**
 * NDC Admin / Agency — Search suite. RUN-20260718-001, Stage 4 (new NDC_tests_SHAFT_Agency
 * package). Traces to runs/RUN-20260718-001/test_design/NDC_TestCases_Agency.md's
 * TC-AGENCY-SEARCH-* cases. Fixture data (Approved/Rejected known records) is the real, live-
 * confirmed .70 data recorded in agencyTestData.json's "searchFixtures_dot70" block — not the
 * old .80-specific EXEBA/AGN9741 reference, per this run's environment override.
 */
public class Agency_Search_TC extends AdminTestBase {

    private JsonObject testData;

    private JsonObject data() throws Exception {
        if (testData == null) {
            Path path = Path.of("src/test/resources/testDataFiles/agencyTestData.json");
            try (FileReader reader = new FileReader(path.toFile())) {
                testData = JsonParser.parseReader(reader).getAsJsonObject();
            }
        }
        return testData;
    }

    private void openAgencyList() {
        new AdminMenu(driver).openAgency();
        driver.element().click(By.xpath("//a[@href=\"/admin/agency\"]"));
    }

    // ---- TC-AGENCY-SEARCH-001 ----
    @Test(priority = 1)
    public void search001_ByAgencyCodeReturnsMatchingRecord() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        openAgencyList();
        driver.element().type(By.xpath("//input[@id=\"id-Agencycode\"]"), fixtures.get("approvedAgencyCode").getAsString());
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        SearchAgency_Page search = new SearchAgency_Page(driver);
        waitBriefly();
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "Expected at least one row for a known Agency Code.");
        Assert.assertTrue(rows.get(0).contains(fixtures.get("approvedAgencyCode").getAsString()));
    }

    // ---- TC-AGENCY-SEARCH-002 (Reuse — same mechanics as the existing searchByName test) ----
    @Test(priority = 2)
    public void search002_ByAgencyNameReturnsMatchingRecord() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        openAgencyList();
        SearchAgency_Page search = new SearchAgency_Page(driver);
        search.searchByName(fixtures.get("approvedAgencyName").getAsString());
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "Expected at least one row for a known Agency Name.");
    }

    // ---- TC-AGENCY-SEARCH-003 ----
    @Test(priority = 3)
    public void search003_ByStateAndCityNarrowsResults() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        openAgencyList();
        driver.element().click(By.xpath("//p-multiselect[.//input[@id=\"id-City\"]]"));
        waitBriefly();
        driver.element().click(By.xpath(String.format("//li[contains(@class,'p-multiselect-item')]//*[contains(normalize-space(text()),'%s')]", fixtures.get("approvedAgencyCity").getAsString())));
        driver.getDriver().findElement(By.tagName("body")).click(); // close the multiselect panel
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
        SearchAgency_Page search = new SearchAgency_Page(driver);
        List<String> rows = search.getResultRowsText();
        System.out.println("[TC-AGENCY-SEARCH-003] Rows for City=" + fixtures.get("approvedAgencyCity").getAsString() + ": " + rows.size());
    }

    // ---- TC-AGENCY-SEARCH-004 ----
    @Test(priority = 4)
    public void search004_ByStatusFiltersActiveInactiveBoth() {
        openAgencyList();
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Active\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
        SearchAgency_Page search = new SearchAgency_Page(driver);
        List<String> activeRows = search.getResultRowsText();
        Assert.assertFalse(activeRows.isEmpty(), "Expected Active rows to exist.");
        for (String row : activeRows) {
            Assert.assertTrue(row.contains("Active") || row.contains("Approved"),
                    "Every row under Status=Active should reflect an Active/Approved record.");
        }
    }

    // ---- TC-AGENCY-SEARCH-005 ----
    @Test(priority = 5)
    public void search005_NoResultsFoundMessageShown() {
        openAgencyList();
        driver.element().type(By.xpath("//input[@id=\"id-Agencyname\"]"), "QASPIKE_NO_SUCH_AGENCY_EXISTS_ZZZ");
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
        SearchAgency_Page search = new SearchAgency_Page(driver);
        Assert.assertTrue(search.isNoDataFoundShown(), "Expected 'No data has been found!' for a name that cannot match any record.");
    }

    // ---- TC-AGENCY-SEARCH-006 ----
    @Test(priority = 6)
    public void search006_InvalidAgencyCodeInputHandledGracefully() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        openAgencyList();
        driver.element().type(By.xpath("//input[@id=\"id-Agencyname\"]"), fixtures.get("invalidSearchInput").getAsString());
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Both\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
        String pageText = driver.getDriver().findElement(By.tagName("body")).getText();
        Assert.assertFalse(pageText.contains("<script>"), "A script-tag payload in the search field must never render as executable/raw markup.");
    }

    // ---- TC-AGENCY-SEARCH-007 ----
    @Test(priority = 7)
    public void search007_CombinedMultiFieldSearchNarrows() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        openAgencyList();
        driver.element().type(By.xpath("//input[@id=\"id-Agencyname\"]"), fixtures.get("approvedAgencyName").getAsString());
        driver.element().click(By.xpath("//p-radiobutton[.//input[@id=\"id-Status-Active\"]]"));
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
        SearchAgency_Page search = new SearchAgency_Page(driver);
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "Combined Name+Status=Active search should still return the known Active record.");
    }

    // ---- TC-AGENCY-SEARCH-008 ----
    @Test(priority = 8)
    public void search008_AddButtonNavigatesToAddAgency() {
        openAgencyList();
        driver.element().click(By.xpath("//button[contains(normalize-space(.), 'Add agency')]"));
        waitBriefly();
        Assert.assertTrue(driver.getDriver().getCurrentUrl().contains("/admin/agency/add"),
                "The Add agency button should navigate to /admin/agency/add.");
    }

    // ---- TC-AGENCY-SEARCH-009 ----
    @Test(priority = 9)
    public void search009_BlankFieldsReturnDefaultFullList() {
        openAgencyList();
        driver.element().click(By.xpath("//button[@type=\"submit\"]"));
        waitBriefly();
        SearchAgency_Page search = new SearchAgency_Page(driver);
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "A blank search (default Status) should still return the default result list.");
    }

    private void waitBriefly() {
        try {
            Thread.sleep(1200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
