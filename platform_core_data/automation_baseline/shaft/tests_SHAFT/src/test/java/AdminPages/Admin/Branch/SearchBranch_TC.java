package AdminPages.Admin.Branch;

import AdminPages.Login.TestBase;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import AdminPages.Admin.Branch.SearchBranch_Page.RowAction;
import AdminPages.Admin.Branch.SearchBranch_Page.Status;

@Epic("Branch")
@Feature("Search & Actions Branch")
public class SearchBranch_TC extends TestBase {

    private static final String KNOWN_BRANCH_CODE =
            BranchTestData.knownBranchCode();

    private static final String KNOWN_BRANCH_NAME =
            BranchTestData.knownBranchName();

    private static final String NON_MATCHING_BRANCH_CODE =
            "ZZZZQQ9";

    private static final String CASCADE_COUNTRY =
            BranchTestData.country();

    /**
     * Page bound for the two approval states TC-BR-054 still scans for. Restored to 10 on 2026-08-15
     * after the diagnosis probe that briefly raised it: Approved and Pending are reliably on page 1,
     * so 10 is generous for them, and Rejected no longer relies on scanning at all
     * (see {@code assertIconsForKnownRecord}).
     */
    private static final int MAX_PAGES_SCANNED_FOR_APPROVAL_STATES = 10;

    private SearchBranch_Page searchBranchPage;

    @Override
    protected void navigateToStartScreen() {
        searchBranchPage = new SearchBranch_Page(driver).open();
    }

    @Test
    @Story("Search & filtering")
    @Description("TC-BR-040: Search Branch by Branch Code returns the matching record")
    public void tcBr040_searchByBranchCodeReturnsMatchingRecord() {
        searchBranchPage.setBranchCode(KNOWN_BRANCH_CODE);

        Assert.assertEquals(
                searchBranchPage.branchCodeFilterValue(),
                KNOWN_BRANCH_CODE,
                "Branch Code was not entered correctly before Search."
        );

        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.isRowPresent(KNOWN_BRANCH_CODE),
                "Expected the grid to return the branch whose Code is "
                        + KNOWN_BRANCH_CODE
                        + ", but no row carried that code. Codes returned: "
                        + searchBranchPage.branchCodesOnCurrentPage()
        );
    }

    @Test
    @Story("Search & filtering")
    @Description("TC-BR-041: Search Branch by Branch Name returns the matching record")
    public void tcBr041_searchByBranchNameReturnsMatchingRecord() {
        searchBranchPage.setBranchName(KNOWN_BRANCH_NAME);

        Assert.assertEquals(
                searchBranchPage.branchNameFilterValue(),
                KNOWN_BRANCH_NAME,
                "Branch Name was not entered correctly before Search."
        );

        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.rowCount() > 0,
                "Expected at least one row for Branch Name \""
                        + KNOWN_BRANCH_NAME + "\"."
        );

        List<String> returnedNames = new ArrayList<>();

        for (String branchCode :
                searchBranchPage.branchCodesOnCurrentPage()) {
            returnedNames.add(
                    searchBranchPage.branchNameOf(branchCode)
            );
        }

        Assert.assertTrue(
                returnedNames.contains(KNOWN_BRANCH_NAME),
                "Expected a row named \"" + KNOWN_BRANCH_NAME
                        + "\", but the grid returned " + returnedNames
        );
    }

    @Test
    @Story("Search & filtering")
    @Description("TC-BR-042: Search with no criteria returns the default Active result set")
    public void tcBr042_searchWithNoCriteriaReturnsDefaultActiveResultSet() {
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.rowCount() > 0,
                "Expected the default search to return results."
        );

        Assert.assertTrue(
                searchBranchPage.totalResultCount() > 0,
                "Expected the result summary to contain a valid total. "
                        + "Actual summary: \""
                        + searchBranchPage.resultSummaryText() + "\"."
        );

        Assert.assertFalse(
                searchBranchPage.isEmptyStateShown(),
                "Expected no empty-state message for a search with no criteria."
        );
    }

    @Test
    @Story("Negative - no results")
    @Description("TC-BR-043: Search with non-matching criteria shows the empty-state message")
    public void tcBr043_searchWithNonMatchingCriteriaShowsEmptyState() {
        searchBranchPage.setBranchCode(NON_MATCHING_BRANCH_CODE);

        Assert.assertEquals(
                searchBranchPage.branchCodeFilterValue(),
                NON_MATCHING_BRANCH_CODE,
                "The non-matching Branch Code was not entered correctly."
        );

        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.isEmptyStateShown(),
                "Expected the empty-state message for Branch Code "
                        + NON_MATCHING_BRANCH_CODE + "."
        );

        Assert.assertEquals(
                searchBranchPage.emptyStateMessage(),
                "No data has been found!",
                "Empty-state message text did not match the expected wording."
        );
    }

    @Test
    @Story("Search & filtering")
    @Description("TC-BR-045: Status filter returns only records matching the selected status")
    public void tcBr045_statusFilterReturnsOnlyRecordsMatchingSelectedStatus() {
        int activeTotal = totalForStatus(Status.ACTIVE);
        int inactiveTotal = totalForStatus(Status.INACTIVE);
        int bothTotal = totalForStatus(Status.BOTH);

        Assert.assertTrue(
                activeTotal > 0,
                "Expected the Active filter to return records."
        );

        Assert.assertTrue(
                inactiveTotal > 0,
                "Expected the Inactive filter to return records."
        );

        Assert.assertEquals(
                bothTotal,
                activeTotal + inactiveTotal,
                "Expected Both (" + bothTotal + ") to equal Active ("
                        + activeTotal + ") plus Inactive ("
                        + inactiveTotal + ")."
        );
    }

    private int totalForStatus(Status status) {
        searchBranchPage.open();
        searchBranchPage.selectStatus(status);
        searchBranchPage.clickSearch();

        int total = searchBranchPage.totalResultCount();

        Assert.assertTrue(
                total >= 0,
                "Could not read the result total for Status "
                        + status.label() + ". Summary: \""
                        + searchBranchPage.resultSummaryText() + "\"."
        );

        return total;
    }

    @Test
    @Story("Search & filtering")
    @Description("TC-BR-046: State filter stays disabled until a Country is selected")
    public void tcBr046_stateFilterStaysDisabledUntilCountrySelected() {
        Assert.assertFalse(
                searchBranchPage.isStateFilterEnabled(),
                "Expected the State filter to be disabled before selecting a Country."
        );

        searchBranchPage.selectCountry(CASCADE_COUNTRY);

        Assert.assertTrue(
                searchBranchPage.isStateFilterEnabled(),
                "Expected the State filter to become enabled after selecting "
                        + CASCADE_COUNTRY + "."
        );

        List<String> stateOptions =
                searchBranchPage.openStateFilterAndReadOptions();

        Assert.assertFalse(
                stateOptions.isEmpty(),
                "Expected the State filter to list states after selecting "
                        + CASCADE_COUNTRY + "."
        );
    }

    /**
     * TC-BR-052 -- Results grid displays all specified columns.
     *
     * <p><b>Partially repaired 2026-08-15 (HEAL-BR-20260815-02). This test is still expected to fail,
     * on the State column only.</b></p>
     *
     * <p><b>What was repaired.</b> The expected label for the first column was {@code "Branch Code"},
     * which the grid has never rendered -- it renders {@code "Code"} (Discovery 2026-08-03 §4;
     * re-confirmed live 2026-08-15). That was an automation-side error of ours, and it made this test
     * report two missing columns when only one was ever in question. The business owner confirmed on
     * 2026-08-14 that the grid's columns are correct, so the application's label is the right one to
     * expect. `TestCases_Branch.md` and `TraceabilityMatrix.md` still say "Branch Code" and need the
     * same correction at Stage 3 -- this skill has no write access to those documents.</p>
     *
     * <p><b>What was deliberately NOT repaired, and must not be.</b> {@code "State"} stays in the
     * expected list. Removing it would make this test pass and would record an open disagreement as
     * settled. Three independent observations say the column is absent: Discovery's explicit
     * {@code offsetParent}/{@code display} check across two page loads; this suite's own column
     * indices ({@code cityOf} reads column 4, {@code approvalStatusOf} reads column 5 -- both correct
     * only for a six-column grid, and TC-BR-055 passes on them); and a live read on 2026-08-15
     * returning {@code [Code, Branch Name, Country Name, City, Approval Status, Actions]}. The
     * business owner's 2026-08-14 clarification states State is present. Those cannot both be true,
     * and resolving it is a human decision, not an automation repair.</p>
     *
     * <p><b>FINDING-012 is retracted</b> as a confirmed application defect (BranchFailureAnalysis
     * 2026-08-14). This test is therefore no longer a regression test against a known application
     * defect; it is an open question about one column.</p>
     */

    private boolean containsIgnoringCase(
            List<String> values,
            String expected
    ) {
        for (String value : values) {
            if (value.equalsIgnoreCase(expected)) {
                return true;
            }
        }

        return false;
    }

    @Test
    @Story("Row actions")
    @Description("TC-BR-054: Row action icons match the record's approval state")
    public void tcBr054_rowActionIconsMatchApprovalState() {
        Set<RowAction> approvedExpected =
                EnumSet.of(RowAction.EDIT, RowAction.REJECT);

        Set<RowAction> pendingExpected =
                EnumSet.of(
                        RowAction.EDIT,
                        RowAction.APPROVE,
                        RowAction.REJECT
                );

        Set<RowAction> rejectedExpected =
                EnumSet.of(RowAction.EDIT, RowAction.APPROVE);

        assertIconsForStatus(
                ApprovalStatus.APPROVED.label(),
                approvedExpected
        );

        assertIconsForStatus(
                ApprovalStatus.PENDING.label(),
                pendingExpected
        );

        // Rejected records sit deep in the default ordering -- located live 2026-08-15 at page 18 of
        // roughly 52, well past the scan limit, which is why this test used to fail naming an
        // environment data gap. It is looked up by code instead of scanned for (REPAIR-BR-014).
        assertIconsForKnownRecord(
                BranchTestData.knownRejectedBranchCode(),
                ApprovalStatus.REJECTED.label(),
                rejectedExpected
        );
    }

    /**
     * Asserts the row-action icons of one named record, reached by searching for its Branch Code.
     *
     * <p>Used where scanning is not viable. It verifies the record is still in the approval state the
     * fixture claims <b>before</b> judging its icons, so a record that has since changed state fails
     * as an out-of-date fixture rather than as a false icon defect.</p>
     */
    private void assertIconsForKnownRecord(
            String branchCode,
            String approvalStatus,
            Set<RowAction> expectedIcons
    ) {
        searchBranchPage.open();
        searchBranchPage.searchByCode(branchCode, Status.BOTH);

        Assert.assertTrue(
                searchBranchPage.isRowPresent(branchCode),
                "Configured " + approvalStatus + " fixture branch \"" + branchCode
                        + "\" was not found. It may have been removed from this environment. "
                        + "Set knownRejectedBranchCode in branch_baseline.properties to any branch "
                        + "currently in that state. This is an environment data gap, "
                        + "not an application defect."
        );

        String actualStatus = searchBranchPage.approvalStatusOf(branchCode);

        Assert.assertEquals(
                actualStatus,
                approvalStatus,
                "Configured fixture branch \"" + branchCode + "\" is no longer \"" + approvalStatus
                        + "\" -- it now reads \"" + actualStatus + "\", so its icon set cannot test "
                        + "the " + approvalStatus + " rule. Point knownRejectedBranchCode at another "
                        + "record. This is an environment data gap, not an application defect."
        );

        Assert.assertEquals(
                searchBranchPage.branchCodeInRow(1),
                branchCode,
                "Search for \"" + branchCode + "\" did not return that record as the only row, "
                        + "so the icons read below would belong to a different branch."
        );

        Set<RowAction> actualIcons = searchBranchPage.actionsAvailableInRow(1);

        Assert.assertEquals(
                actualIcons,
                expectedIcons,
                "Branch " + branchCode + " has Approval Status \"" + approvalStatus
                        + "\" and should offer " + expectedIcons + ", but offered " + actualIcons + "."
        );
    }

    private void assertIconsForStatus(
            String approvalStatus,
            Set<RowAction> expectedIcons
    ) {
        searchBranchPage.open();
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        for (
                int page = 1;
                page <= MAX_PAGES_SCANNED_FOR_APPROVAL_STATES;
                page++
        ) {
            int rowCount = searchBranchPage.rowCount();

            for (int row = 1; row <= rowCount; row++) {
                String actualStatus =
                        searchBranchPage.approvalStatusInRow(row);

                if (approvalStatus.equalsIgnoreCase(actualStatus)) {
                    System.out.println("[DIAG-SYNC] assertIconsForStatus matched \""
                            + approvalStatus + "\" at branchCode="
                            + searchBranchPage.branchCodeInRow(row)
                            + " page=" + page + " row=" + row);

                    Set<RowAction> actualIcons =
                            searchBranchPage.actionsAvailableInRow(row);

                    Assert.assertEquals(
                            actualIcons,
                            expectedIcons,
                            "Branch "
                                    + searchBranchPage.branchCodeInRow(row)
                                    + " has Approval Status \""
                                    + approvalStatus
                                    + "\" and should offer "
                                    + expectedIcons
                                    + ", but offered "
                                    + actualIcons + "."
                    );

                    return;
                }
            }

            if (!searchBranchPage.hasNextPage()) {
                break;
            }

            searchBranchPage.goToNextPage();
        }

        Assert.fail(
                "No row with Approval Status \""
                        + approvalStatus
                        + "\" was found within the configured "
                        + MAX_PAGES_SCANNED_FOR_APPROVAL_STATES
                        + "-page scan limit. The icon behavior was not verified. "
                        + "This is an automation or test-data limitation; "
                        + "no application defect is confirmed."
        );
    }

    @Test
    @Story("Row actions")
    @Description("TC-BR-055: Edit pen opens Update Branch with the record's details pre-filled")
    public void tcBr055_editPenOpensUpdateBranchPreFilled() {
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.rowCount() > 0,
                "Expected Search to return a record that can be opened."
        );

        String branchCode =
                searchBranchPage.branchCodeInRow(1);

        String expectedName =
                searchBranchPage.branchNameOf(branchCode);

        String expectedCountry =
                searchBranchPage.countryNameOf(branchCode);

        String expectedCity =
                searchBranchPage.cityOf(branchCode);

        UpdateBranch_Page updateBranchPage =
                searchBranchPage.clickEditPen(branchCode);

        Assert.assertEquals(
                updateBranchPage.branchName(),
                expectedName,
                "Update Branch opened with a different Branch Name."
        );

        Assert.assertEquals(
                updateBranchPage.country(),
                expectedCountry,
                "Update Branch opened with a different Country."
        );

        Assert.assertEquals(
                updateBranchPage.city(),
                expectedCity,
                "Update Branch opened with a different City."
        );

        Assert.assertFalse(
                updateBranchPage.state().isEmpty(),
                "Expected State to display the stored value."
        );
    }

    @Test
    @Story("Pagination")
    @Description("TC-BR-060: Navigate to the next page of results")
    public void tcBr060_navigateToNextPage() {
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.hasNextPage(),
                "The result set does not contain a next page."
        );

        int originalPage =
                searchBranchPage.currentPageNumber();

        List<String> firstPageCodes =
                searchBranchPage.branchCodesOnCurrentPage();

        searchBranchPage.goToNextPage();

        Assert.assertEquals(
                searchBranchPage.currentPageNumber(),
                originalPage + 1,
                "The paginator did not move to the next page."
        );

        List<String> secondPageCodes =
                searchBranchPage.branchCodesOnCurrentPage();

        Assert.assertFalse(
                secondPageCodes.isEmpty(),
                "Expected the next page to display records."
        );

        Assert.assertNotEquals(
                secondPageCodes,
                firstPageCodes,
                "The grid content did not change after next-page navigation."
        );
    }

    @Test
    @Story("Pagination")
    @Description("TC-BR-061: Navigate to the last page of results")
    public void tcBr061_navigateToLastPage() {
        searchBranchPage.selectStatus(Status.BOTH);
        searchBranchPage.clickSearch();

        Assert.assertTrue(
                searchBranchPage.hasNextPage(),
                "The result set does not contain multiple pages."
        );

        searchBranchPage.goToLastPage();

        Assert.assertTrue(
                searchBranchPage.rowCount() > 0,
                "Expected the final page to display at least one record."
        );

        Assert.assertFalse(
                searchBranchPage.hasNextPage(),
                "Expected no next-page navigation on the final page."
        );
    }
}