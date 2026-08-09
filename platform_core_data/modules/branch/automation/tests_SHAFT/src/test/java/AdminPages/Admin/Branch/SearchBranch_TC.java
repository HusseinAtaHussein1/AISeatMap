package AdminPages.Admin.Branch;

import AdminPages.Login.TestBase;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.Test;
import AdminPages.Admin.Branch.SearchBranch_Page;
import AdminPages.Admin.Branch.SearchBranch_Page.RowAction;
import AdminPages.Admin.Branch.SearchBranch_Page.Status;
import AdminPages.Admin.Branch.UpdateBranch_Page;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * SearchBranchSuite -- the read-only half of US 8599. Every method maps 1:1 to a Test Case ID and
 * inherits that case's Requirement/Discovery/Finding/Evidence References from TraceabilityMatrix.md
 * verbatim (automation-skill §12).
 *
 * <p><b>Nothing in this class mutates a record.</b> Approve/reject and update live in
 * {@link BranchActions_TC} and {@link UpdateBranch_TC}, where each test provisions its own
 * Branch first. That split is what keeps this suite runnable against a shared environment without
 * relying on the mutation authorisation at all.</p>
 */
@Epic("Branch")
@Feature("Search & Actions Branch")
public class SearchBranch_TC extends TestBase {

    /**
     * Search fixtures quoted from the test cases' own Test Data tables (TC-BR-040, TC-BR-041). They
     * are read-only references to pre-existing records -- never mutated -- so they are declared here
     * beside the cases that cite them rather than in the creation-baseline fixture file.
     */
    private static final String KNOWN_BRANCH_CODE = "BRN2";
    private static final String KNOWN_BRANCH_NAME = "Emirates NDC";
    private static final String NON_MATCHING_BRANCH_CODE = "ZZZZQQ9";
    private static final String CASCADE_COUNTRY = "Egypt";

    /** Bound on how far TC-BR-054 will page looking for a row in each approval state. */
    private static final int MAX_PAGES_SCANNED_FOR_APPROVAL_STATES = 10;

    private SearchBranch_Page searchBranchPage;

    @Override
    protected void navigateToStartScreen() {
        searchBranchPage = new SearchBranch_Page(driver).open();
    }

    /**
     * TC-BR-040 -- Search Branch by Branch Code returns the matching record.
     * Requirement: PRD_UserStories.md US 7 §Search &amp; Filtering. Priority P1.
     */
    @Test
    @Story("Search & filtering")
    @Description("TC-BR-040: Search Branch by Branch Code returns the matching record")
    public void tcBr040_searchByBranchCodeReturnsMatchingRecord() {
        searchBranchPage.searchByCode(KNOWN_BRANCH_CODE, Status.BOTH);

        Assert.assertTrue(searchBranchPage.isRowPresent(KNOWN_BRANCH_CODE),
                "Expected the grid to return the branch whose Code is " + KNOWN_BRANCH_CODE
                        + ", but no row carried that code. Codes returned: "
                        + searchBranchPage.branchCodesOnCurrentPage());
    }

    /**
     * TC-BR-041 -- Search Branch by Branch Name returns the matching record.
     * Requirement: PRD_UserStories.md US 7 §Search &amp; Filtering. Priority P1.
     */
    @Test
    @Story("Search & filtering")
    @Description("TC-BR-041: Search Branch by Branch Name returns the matching record")
    public void tcBr041_searchByBranchNameReturnsMatchingRecord() {
        searchBranchPage.searchByName(KNOWN_BRANCH_NAME, Status.BOTH);

        Assert.assertTrue(searchBranchPage.rowCount() > 0,
                "Expected at least one row for Branch Name \"" + KNOWN_BRANCH_NAME + "\".");

        List<String> names = new ArrayList<>();
        for (String code : searchBranchPage.branchCodesOnCurrentPage()) {
            names.add(searchBranchPage.branchNameOf(code));
        }
        Assert.assertTrue(names.contains(KNOWN_BRANCH_NAME),
                "Expected a row named \"" + KNOWN_BRANCH_NAME + "\"; the grid returned " + names);
    }

    /**
     * TC-BR-042 -- Search with no criteria returns the default Active result set.
     * Requirement: PRD_UserStories.md US 7 §Business Rules ("default search status is Active").
     */
    @Test
    @Story("Search & filtering")
    @Description("TC-BR-042: Search with no criteria returns the default Active result set")
    public void tcBr042_searchWithNoCriteriaReturnsDefaultActiveResultSet() {
        searchBranchPage.clickSearch();

        Assert.assertTrue(searchBranchPage.rowCount() > 0,
                "Expected the default search to return results.");
        Assert.assertTrue(searchBranchPage.totalResultCount() > 0,
                "Expected the result count text to state a total; it read \""
                        + searchBranchPage.resultSummaryText() + "\".");
        Assert.assertFalse(searchBranchPage.isEmptyStateShown(),
                "Expected no empty-state message for a search with no criteria.");
    }

    /**
     * TC-BR-043 -- Search with non-matching criteria shows the empty-state message.
     * Requirement: PRD_UserStories.md US 7 §Search Result Grid. Tags: Negative-InvalidInputs, Regression.
     */
    @Test
    @Story("Negative - no results")
    @Description("TC-BR-043: Search with non-matching criteria shows the empty-state message")
    public void tcBr043_searchWithNonMatchingCriteriaShowsEmptyState() {
        searchBranchPage.searchByCode(NON_MATCHING_BRANCH_CODE, Status.BOTH);

        Assert.assertTrue(searchBranchPage.isEmptyStateShown(),
                "Expected the empty-state message for Branch Code " + NON_MATCHING_BRANCH_CODE + ".");
        Assert.assertEquals(searchBranchPage.emptyStateMessage(), "No data has been found!",
                "Empty-state message text did not match the expected wording.");
    }

    /**
     * TC-BR-045 -- Status filter returns only records matching the selected status.
     * Requirement: PRD_UserStories.md US 7 §Business Rules.
     * Compares the three totals to each other rather than to Discovery's fixed 491/125/616, because
     * the environment is shared and those counts move.
     */
    @Test
    @Story("Search & filtering")
    @Description("TC-BR-045: Status filter returns only records matching the selected status")
    public void tcBr045_statusFilterReturnsOnlyRecordsMatchingSelectedStatus() {
        int activeTotal = totalForStatus(Status.ACTIVE);
        int inactiveTotal = totalForStatus(Status.INACTIVE);
        int bothTotal = totalForStatus(Status.BOTH);

        Assert.assertTrue(activeTotal > 0, "Expected the Active filter to return a result set.");
        Assert.assertTrue(inactiveTotal > 0, "Expected the Inactive filter to return a result set.");
        Assert.assertEquals(bothTotal, activeTotal + inactiveTotal,
                "Expected Both (" + bothTotal + ") to equal Active (" + activeTotal
                        + ") plus Inactive (" + inactiveTotal + ").");
    }

    private int totalForStatus(Status status) {
        searchBranchPage.open();
        searchBranchPage.selectStatus(status);
        searchBranchPage.clickSearch();
        return searchBranchPage.totalResultCount();
    }

    /**
     * TC-BR-046 -- State filter stays disabled until a Country is selected.
     * Requirement: PRD_UserStories.md US 7 §Business Rules (cascade dependency).
     */
    @Test
    @Story("Search & filtering")
    @Description("TC-BR-046: State filter stays disabled until a Country is selected")
    public void tcBr046_stateFilterStaysDisabledUntilCountrySelected() {
        Assert.assertFalse(searchBranchPage.isStateFilterEnabled(),
                "Expected the State filter to be disabled before a Country is selected.");

        searchBranchPage.selectCountry(CASCADE_COUNTRY);

        Assert.assertTrue(searchBranchPage.isStateFilterEnabled(),
                "Expected the State filter to become enabled after selecting " + CASCADE_COUNTRY + ".");
        Assert.assertFalse(searchBranchPage.openStateFilterAndReadOptions().isEmpty(),
                "Expected the State filter to list states belonging to " + CASCADE_COUNTRY + ".");
    }

    /**
     * TC-BR-052 -- Results grid displays all specified columns.
     * Requirement: PRD_UserStories.md US 7 §Search Result Grid. Finding: FINDING-012 (Confirmed, open).
     *
     * <p><b>This test is expected to fail, and the assertion must not be softened.</b> US 8599
     * enumerates seven grid columns; Discovery confirmed only six render -- <b>State is absent</b>,
     * and confirmed absent rather than responsive-hidden. Per automation-skill §13 a regression test
     * asserts the corrected behaviour, so this asserts all seven and will stay red until FINDING-012
     * is fixed or the requirement is formally changed. A red result here is the test working.</p>
     */
    @Test
    @Story("Regression - FINDING-012")
    @Description("TC-BR-052: Results grid displays all specified columns")
    public void tcBr052_resultsGridDisplaysAllSpecifiedColumns() {
        searchBranchPage.clickSearch();
        List<String> headers = searchBranchPage.columnHeaders();

        List<String> required = Arrays.asList(
                "Branch Code", "Branch Name", "Country Name", "State", "City", "Approval Status", "Actions");
        List<String> missing = new ArrayList<>();
        for (String column : required) {
            if (!containsIgnoringCase(headers, column)) {
                missing.add(column);
            }
        }

        Assert.assertTrue(missing.isEmpty(),
                "Grid is missing required column(s) " + missing + ". Headers rendered: " + headers
                        + ". FINDING-012 confirms the State column is absent -- this assertion asserts "
                        + "the corrected behaviour and must not be weakened to match the defect.");
    }

    private boolean containsIgnoringCase(List<String> headers, String expected) {
        for (String header : headers) {
            if (header.equalsIgnoreCase(expected)) {
                return true;
            }
        }
        return false;
    }

    /**
     * TC-BR-054 -- Row action icons match the record's approval state.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities.
     *
     * <p>A record never offers a transition to the state it is already in: Approved omits thumbs-up,
     * Rejected omits thumbs-down, Pending offers both. Read-only -- it locates existing rows in each
     * state by paging, bounded, rather than creating records to guarantee them.</p>
     */
    @Test
    @Story("Row actions")
    @Description("TC-BR-054: Row action icons match the record's approval state")
    public void tcBr054_rowActionIconsMatchApprovalState() {
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        Set<RowAction> approvedExpected = EnumSet.of(RowAction.EDIT, RowAction.REJECT);
        Set<RowAction> pendingExpected = EnumSet.of(RowAction.EDIT, RowAction.APPROVE, RowAction.REJECT);
        Set<RowAction> rejectedExpected = EnumSet.of(RowAction.EDIT, RowAction.APPROVE);

        assertIconsForStatus("Approved", approvedExpected);
        assertIconsForStatus("Pending for approval", pendingExpected);
        assertIconsForStatus("Rejected", rejectedExpected);
    }

    /**
     * Finds the first row in the given approval state, paging up to a bound, and asserts its icon set.
     * If no such row is reachable the test fails naming that explicitly as an unmet precondition --
     * an environment gap, not an application defect, and not something to quietly skip.
     */
    private void assertIconsForStatus(String approvalStatus, Set<RowAction> expectedIcons) {
        searchBranchPage.open();
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        for (int page = 0; page < MAX_PAGES_SCANNED_FOR_APPROVAL_STATES; page++) {
            int rows = searchBranchPage.rowCount();
            List<String> statusesOnPage = new ArrayList<>();
            for (int row = 1; row <= rows; row++) {
                statusesOnPage.add(searchBranchPage.approvalStatusInRow(row));
            }
            System.out.println("[DIAG-SYNC] assertIconsForStatus(\"" + approvalStatus + "\") page=" + page
                    + " rowCount=" + rows + " statusesSeen=" + statusesOnPage);
            for (int row = 1; row <= rows; row++) {
                if (approvalStatus.equalsIgnoreCase(searchBranchPage.approvalStatusInRow(row))) {
                    Set<RowAction> actual = searchBranchPage.actionsAvailableInRow(row);
                    Assert.assertEquals(actual, expectedIcons,
                            "Row " + searchBranchPage.branchCodeInRow(row) + " is \"" + approvalStatus
                                    + "\" and should offer exactly " + expectedIcons + " but offered " + actual);
                    return;
                }
            }
            if (!searchBranchPage.hasNextPage()) {
                break;
            }
            searchBranchPage.goToNextPage();
        }

        Assert.fail("Unmet precondition: no row with Approval Status \"" + approvalStatus
                + "\" was found within " + MAX_PAGES_SCANNED_FOR_APPROVAL_STATES
                + " pages, so its icon set could not be verified. This is an environment data gap, "
                + "not an application defect.");
    }

    /**
     * TC-BR-055 -- Edit pen opens Update Branch with the record's details pre-filled.
     * Requirement: PRD_UserStories.md US 7 §Actions &amp; Functionalities (Edit Branch).
     *
     * <p>Step 3 of the test case matters: wait for a field to actually populate before comparing.
     * Reading the form on a fixed delay produced a false "form is empty" result twice during
     * Discovery -- {@code clickEditPen} routes through {@code UpdateBranch_Page.waitUntilLoaded()},
     * which polls instead.</p>
     */
    @Test
    @Story("Row actions")
    @Description("TC-BR-055: Edit pen opens Update Branch with the record's details pre-filled")
    public void tcBr055_editPenOpensUpdateBranchPreFilled() {
        System.out.println("[DIAG-SYNC] tcBr055 before clickSearch rowCount=" + searchBranchPage.rowCount());
        searchBranchPage.clickSearch();
        System.out.println("[DIAG-SYNC] tcBr055 after clickSearch rowCount=" + searchBranchPage.rowCount());
        Assert.assertTrue(searchBranchPage.rowCount() > 0, "Expected results to open a record from.");

        String code = searchBranchPage.branchCodeInRow(1);
        String expectedName = searchBranchPage.branchNameOf(code);
        String expectedCountry = searchBranchPage.countryNameOf(code);
        String expectedCity = searchBranchPage.cityOf(code);

        UpdateBranch_Page updateBranchPage = searchBranchPage.clickEditPen(code);

        Assert.assertEquals(updateBranchPage.branchName(), expectedName,
                "Update Branch opened with a different Branch Name than the grid row showed.");
        Assert.assertEquals(updateBranchPage.country(), expectedCountry,
                "Update Branch opened with a different Country than the grid row showed.");
        Assert.assertEquals(updateBranchPage.city(), expectedCity,
                "Update Branch opened with a different City than the grid row showed.");
        Assert.assertFalse(updateBranchPage.state().isEmpty(),
                "Expected the State field to show the record's stored value.");
    }

    /**
     * TC-BR-060 -- Navigate to the next page of results.
     * Requirement: PRD_UserStories.md US 7 §Pagination.
     */
    @Test
    @Story("Pagination")
    @Description("TC-BR-060: Navigate to the next page of results")
    public void tcBr060_navigateToNextPage() {
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();
        Assert.assertTrue(searchBranchPage.hasNextPage(),
                "Unmet precondition: the search returned only one page, so next-page cannot be exercised.");

        List<String> firstPageCodes = searchBranchPage.branchCodesOnCurrentPage();
        searchBranchPage.goToNextPage();
        List<String> secondPageCodes = searchBranchPage.branchCodesOnCurrentPage();

        Assert.assertFalse(secondPageCodes.isEmpty(), "Expected page 2 to display records.");
        for (String code : secondPageCodes) {
            Assert.assertFalse(firstPageCodes.contains(code),
                    "Branch Code " + code + " appeared on both page 1 and page 2.");
        }
    }

    /**
     * TC-BR-061 -- Navigate to the last page of results.
     * Requirement: PRD_UserStories.md US 7 §Pagination.
     *
     * <p>Uses the numbered page buttons rather than the "Last" control: that control renders as
     * {@code <span class="last">}, not a button, and its clickability was never confirmed during
     * live verification. See {@code SearchBranch_Page.goToLastPage()}.</p>
     */
    @Test
    @Story("Pagination")
    @Description("TC-BR-061: Navigate to the last page of results")
    public void tcBr061_navigateToLastPage() {
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();
        Assert.assertTrue(searchBranchPage.hasNextPage(),
                "Unmet precondition: the search returned only one page, so last-page cannot be exercised.");

        searchBranchPage.goToLastPage();

        Assert.assertTrue(searchBranchPage.rowCount() > 0,
                "Expected the final page to display at least one row.");
        Assert.assertFalse(searchBranchPage.hasNextPage(),
                "Expected no further next-page navigation to be offered on the final page.");
    }
}
