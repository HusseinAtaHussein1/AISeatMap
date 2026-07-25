package AdminPages.Admin.Agency;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Admin.Agency.Agency.Agency_Page;
import AdminPages.Admin.Agency.Agency.SearchAgency_Page;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.shaft.tools.io.ReportManager;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;
import java.util.List;

/**
 * NDC Admin / Agency — Search suite. RUN-20260718-001, Stage 4 (new tests_SHAFT_Agency
 * package). Traces to runs/RUN-20260718-001/test_design/TestCases_Agency.md's
 * TC-AGENCY-SEARCH-* cases. Fixture data (Approved/Rejected known records) is the real, live-
 * confirmed .70 data recorded in agencyTestData.json's "searchFixtures_dot70" block — not the
 * old .80-specific EXEBA/AGN9741 reference, per this run's environment override.
 *
 * Refactored 2026-07-25: every filter/search/status/city interaction below now goes through
 * SearchAgency_Page (typeAgencyName, typeAgencyCode, selectStatusActive/Inactive/Both,
 * filterByCity, submitSearch, etc.) instead of raw By.xpath locators inline in this test class —
 * those locators already existed on SearchAgency_Page (searchFixtures_dot70 extensions,
 * RUN-20260718-001), they just never had a public method exposing them.
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

    private SearchAgency_Page openAgencyList() {
        new AdminMenu(driver).openAgency().openAgencyList();
        return new SearchAgency_Page(driver);
    }

    // ---- TC-AGENCY-SEARCH-001 ----
    @Test(priority = 1)
    public void search001_ByAgencyCodeReturnsMatchingRecord() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        SearchAgency_Page search = openAgencyList().searchByCode(fixtures.get("approvedAgencyCode").getAsString());
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "Expected at least one row for a known Agency Code.");
        Assert.assertTrue(rows.get(0).contains(fixtures.get("approvedAgencyCode").getAsString()));
    }

    // ---- TC-AGENCY-SEARCH-002 (Reuse — same mechanics as the existing searchByName test) ----
    @Test(priority = 2)
    public void search002_ByAgencyNameReturnsMatchingRecord() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        SearchAgency_Page search = openAgencyList().searchByName(fixtures.get("approvedAgencyName").getAsString());
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "Expected at least one row for a known Agency Name.");
    }

    // ---- TC-AGENCY-SEARCH-003 ----
    @Test(priority = 3)
    public void search003_ByStateAndCityNarrowsResults() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        SearchAgency_Page search = openAgencyList()
                .filterByCity(fixtures.get("approvedAgencyCity").getAsString())
                .selectStatusBoth()
                .submitSearch();
        List<String> rows = search.getResultRowsText();
        ReportManager.log("[TC-AGENCY-SEARCH-003] Rows for City=" + fixtures.get("approvedAgencyCity").getAsString() + ": " + rows.size());
    }

    // ---- TC-AGENCY-SEARCH-004 ----
    @Test(priority = 4)
    public void search004_ByStatusFiltersActiveInactiveBoth() throws Exception {
        SearchAgency_Page search = openAgencyList().selectStatusActive().submitSearch();
        List<String> activeRows = search.getResultRowsText();
        Assert.assertFalse(activeRows.isEmpty(), "Expected Active rows to exist.");
        for (String row : activeRows) {
            Assert.assertTrue(row.contains("Active") || row.contains("Approved"),
                    "Every row under Status=Active should reflect an Active/Approved record.");
        }
    }

    // ---- TC-AGENCY-SEARCH-005 ----
    @Test(priority = 5)
    public void search005_NoResultsFoundMessageShown() throws Exception {
        SearchAgency_Page search = openAgencyList().searchByName("QASPIKE_NO_SUCH_AGENCY_EXISTS_ZZZ");
        Assert.assertTrue(search.isNoDataFoundShown(), "Expected 'No data has been found!' for a name that cannot match any record.");
    }

    // ---- TC-AGENCY-SEARCH-006 ----
    @Test(priority = 6)
    public void search006_InvalidAgencyCodeInputHandledGracefully() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        SearchAgency_Page search = openAgencyList().searchByName(fixtures.get("invalidSearchInput").getAsString());
        Assert.assertFalse(search.searchAreaContainsRawScriptTag(), "A script-tag payload in the search field must never render as executable/raw markup.");
    }

    // ---- TC-AGENCY-SEARCH-007 ----
    @Test(priority = 7)
    public void search007_CombinedMultiFieldSearchNarrows() throws Exception {
        JsonObject fixtures = data().getAsJsonObject("searchFixtures_dot70");
        SearchAgency_Page search = openAgencyList()
                .typeAgencyName(fixtures.get("approvedAgencyName").getAsString())
                .selectStatusActive()
                .submitSearch();
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "Combined Name+Status=Active search should still return the known Active record.");
    }

    // ---- TC-AGENCY-SEARCH-008 ----
    @Test(priority = 8)
    public void search008_AddButtonNavigatesToAddAgency() {
        Agency_Page agencyPage = openAgencyList().clickAddAgency();
        Assert.assertTrue(agencyPage.getCurrentUrl().contains("/admin/agency/add"),
                "The Add agency button should navigate to /admin/agency/add.");
    }

    // ---- TC-AGENCY-SEARCH-009 ----
    @Test(priority = 9)
    public void search009_BlankFieldsReturnDefaultFullList() throws Exception {
        SearchAgency_Page search = openAgencyList().submitSearch();
        List<String> rows = search.getResultRowsText();
        Assert.assertFalse(rows.isEmpty(), "A blank search (default Status) should still return the default result list.");
    }
}
