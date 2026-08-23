package AdminPages.Admin.Agency;

import AdminPages.Admin.Branch.Branch_Common;
import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import utilities.EnvironmentConfig;
import utilities.PrimeNgHelper;

import java.time.Duration;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import static AdminPages.Admin.Agency.SearchAgency_Locators.*;

/**
 * Page Object for the Agency list at {@code /admin/agency} -- the grid, row identity, and the row
 * action icons. <b>This is the only sanctioned way to reach the Update Agency screen</b>
 * ({@link #clickEditPen(String)}); a direct visit to the edit URL renders an empty shell whose locators
 * still resolve (REPAIR-004). Locators live in {@link SearchAgency_Locators}.
 *
 * <p><b>Identity is proven per row, never by position.</b> {@link #agencyCodesOnCurrentPage()} plus
 * {@link #agencyNameOf(String)} let a caller confirm a row is the record this run created before acting
 * on it -- accepting row 1 of a result set is exactly what this run's mutation authorisation forbids.
 */
public class SearchAgency_Page extends Branch_Common {

    /** How many times a status poll may re-issue its lookup. An attempt count, not a pause. */
    private static final int STATUS_POLL_ATTEMPTS = 10;
    private static final Duration TRANSIENT_TIMEOUT = Duration.ofSeconds(8);
    private static final Duration LOAD_TIMEOUT = Duration.ofSeconds(40);
    private static final Duration REMARKS_DIALOG_TIMEOUT = Duration.ofSeconds(10);

    private final PrimeNgHelper prime;

    public SearchAgency_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
        this.prime = new PrimeNgHelper(driver);
    }

    public SearchAgency_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.agencyListUrl());
        waitUntilGridIsReady();
        return this;
    }

    // -- Search filter (REPAIR-AG-012, 2026-08-19, Stage 5H) ------------------------------------

    /**
     * <b>REPAIR-AG-014.</b> Confirmed live: this grid's Status filter defaults to Active, and a freshly
     * submitted Agency is not yet Active, so it is invisible to any search under the default filter.
     * REPAIR-AG-019: waits for the Status panel's presence first -- it is not part of {@link #open()}'s
     * own grid-readiness wait and was observed, live, not yet present the instant this runs.
     */
    private void selectStatusBoth() {
        waitFor(TRANSIENT_TIMEOUT).until(d -> !selenium().findElements(STATUS_BOTH).isEmpty());
        clickVia(STATUS_BOTH);
    }

    public SearchAgency_Page searchByName(String agencyName) {
        selectStatusBoth();
        typeVia(AGENCY_NAME_FILTER, agencyName);
        clickVia(SEARCH_BUTTON);
        waitFor(TRANSIENT_TIMEOUT).until(d -> prime.busyIndicatorCount() == 0);
        return this;
    }

    public SearchAgency_Page searchByCode(String agencyCode) {
        selectStatusBoth();
        typeVia(AGENCY_CODE_FILTER, agencyCode);
        clickVia(SEARCH_BUTTON);
        waitFor(TRANSIENT_TIMEOUT).until(d -> prime.busyIndicatorCount() == 0);
        return this;
    }

    /** The Name filter's current value -- diagnostic only, to confirm typeVia actually registered it. */
    public String agencyNameFilterValue() {
        return valueOfInput(AGENCY_NAME_FILTER);
    }

    /** Raw text of the first {@code limit} rows on whatever view is currently loaded -- diagnostic only. */
    public List<String> topRowsRaw(int limit) {
        return withStaleRetry(() -> {
            List<String> rows = new ArrayList<>();
            int count = Math.min(limit, prime.countOf(GRID_ROWS));
            for (int i = 1; i <= count; i++) {
                List<String> cells = new ArrayList<>();
                for (WebElement cell : selenium().findElements(nthRowCells(i))) {
                    cells.add(cell.getText().trim());
                }
                rows.add(String.join(" | ", cells));
            }
            return rows;
        });
    }

    /**
     * Waits for the grid to render at least one row. Bounded; an empty result set is a legitimate
     * outcome, so the timeout is caught and the caller decides via {@link #rowCount()}.
     */
    public SearchAgency_Page waitUntilGridIsReady() {
        try {
            waitFor(LOAD_TIMEOUT).until(d -> prime.busyIndicatorCount() == 0 && prime.countOf(GRID_ROWS) > 0);
        } catch (TimeoutException noRowsRendered) {
            System.out.println("[DIAG-SYNC] SearchAgency_Page: grid rendered no rows within "
                    + LOAD_TIMEOUT.getSeconds() + "s. Treating as an empty result set.");
        }
        return this;
    }

    // -- Grid reads -----------------------------------------------------------------------------

    public List<String> columnHeaders() {
        List<String> headers = new ArrayList<>();
        for (String header : visibleTextsOf(GRID_HEADERS)) {
            headers.add(header.trim());
        }
        return headers;
    }

    public int rowCount() {
        return prime.countOf(GRID_ROWS);
    }

    /** The Agency Code of every row on the current page, in render order. */
    public List<String> agencyCodesOnCurrentPage() {
        return withStaleRetry(() -> {
            List<String> codes = new ArrayList<>();
            int rows = prime.countOf(GRID_ROWS);
            for (int index = 1; index <= rows; index++) {
                codes.add(textOf(cellIn(index, COLUMN_CODE)));
            }
            return codes;
        });
    }

    public boolean isRowPresent(String agencyCode) {
        return prime.isPresent(rowByCode(agencyCode));
    }

    public String agencyNameOf(String agencyCode) {
        return textOf(cellOf(agencyCode, COLUMN_AGENCY_NAME));
    }

    public String countryNameOf(String agencyCode) {
        return textOf(cellOf(agencyCode, COLUMN_COUNTRY_NAME));
    }

    public String cityOf(String agencyCode) {
        return textOf(cellOf(agencyCode, COLUMN_CITY));
    }

    public String statusOf(String agencyCode) {
        return textOf(cellOf(agencyCode, COLUMN_STATUS));
    }

    public String approvalStatusOf(String agencyCode) {
        return textOf(cellOf(agencyCode, COLUMN_APPROVAL_STATUS));
    }

    public String branchNameOf(String agencyCode) {
        return textOf(cellOf(agencyCode, COLUMN_BRANCH_NAME));
    }

    // -- Row actions ----------------------------------------------------------------------------

    /**
     * Which actions this row actually offers. Reported rather than assumed: the sampled grid showed the
     * set varying with approval status, so a test asserting an action is correctly <em>absent</em> needs
     * this.
     */
    public Set<RowAction> actionsAvailableFor(String agencyCode) {
        Set<RowAction> available = EnumSet.noneOf(RowAction.class);
        for (RowAction action : RowAction.values()) {
            if (prime.isPresent(actionIconOf(agencyCode, action))) {
                available.add(action);
            }
        }
        return available;
    }

    /**
     * Opens the Update Agency screen for this row -- <b>the only supported entry point</b> (REPAIR-004).
     */
    public UpdateAgency_Page clickEditPen(String agencyCode) {
        By pen = actionIconOf(agencyCode, RowAction.EDIT);
        if (!prime.isPresent(pen)) {
            throw new IllegalStateException(
                    "No edit pen found on the row for Agency Code \"" + agencyCode + "\". Either the row is "
                            + "not on the current page or the record does not exist. The Update Agency screen "
                            + "cannot be reached any other way: a direct visit to "
                            + EnvironmentConfig.editAgencyPath() + "/{id} renders an empty shell whose "
                            + "locators still resolve, which produces false results rather than a failure.");
        }
        prime.scrollIntoView(pen);
        clickVia(pen);
        waitFor(LOAD_TIMEOUT).until(
                d -> driver.browser().getCurrentURL().contains(EnvironmentConfig.editAgencyPath()));
        UpdateAgency_Page updateAgencyPage = new UpdateAgency_Page(driver);
        updateAgencyPage.waitUntilLoaded();
        return updateAgencyPage;
    }

    public SearchAgency_Page clickThumbsUp(String agencyCode) {
        By icon = actionIconOf(agencyCode, RowAction.APPROVE);
        requireAction(agencyCode, icon, RowAction.APPROVE);
        prime.scrollIntoView(icon);
        clickVia(icon);
        return this;
    }

    public SearchAgency_Page clickThumbsDown(String agencyCode) {
        By icon = actionIconOf(agencyCode, RowAction.REJECT);
        requireAction(agencyCode, icon, RowAction.REJECT);
        prime.scrollIntoView(icon);
        clickVia(icon);
        return this;
    }

    // -- Remarks confirmation dialog (REPAIR-AG-015, 2026-08-19, Stage 5H) ----------------------

    public boolean remarksPromptShown() {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> !selenium().findElements(REMARKS_TEXTAREA).isEmpty());
            return true;
        } catch (TimeoutException noPrompt) {
            return false;
        }
    }

    /**
     * Fills the mandatory Remarks dialog raised by {@link #clickThumbsUp}/{@link #clickThumbsDown} and
     * submits it.
     */
    public SearchAgency_Page completeRemarksPrompt(String remarks) {
        waitFor(REMARKS_DIALOG_TIMEOUT).until(ExpectedConditions.visibilityOfElementLocated(REMARKS_DIALOG));
        waitFor(REMARKS_DIALOG_TIMEOUT).until(ExpectedConditions.elementToBeClickable(REMARKS_TEXTAREA));

        typeVia(REMARKS_TEXTAREA, remarks);

        String actual = valueOfInput(REMARKS_TEXTAREA);
        if (!remarks.equals(actual)) {
            throw new IllegalStateException(
                    "The Remarks text was not delivered to the dialog, so Submit was not pressed. Expected \""
                            + remarks + "\", the field holds \"" + actual + "\".");
        }

        waitFor(REMARKS_DIALOG_TIMEOUT).until(ExpectedConditions.elementToBeClickable(REMARKS_DIALOG_SUBMIT_BUTTON));
        clickVia(REMARKS_DIALOG_SUBMIT_BUTTON);

        try {
            waitFor(REMARKS_DIALOG_TIMEOUT).until(ExpectedConditions.invisibilityOfElementLocated(REMARKS_DIALOG));
        } catch (TimeoutException stillOpen) {
            throw new IllegalStateException(
                    "Submit was clicked but the Remarks dialog was still open after "
                            + REMARKS_DIALOG_TIMEOUT.getSeconds() + "s, so the approval or rejection cannot be "
                            + "treated as accepted.", stillOpen);
        }
        return this;
    }

    private void requireAction(String agencyCode, By icon, RowAction action) {
        if (!prime.isPresent(icon)) {
            throw new IllegalStateException(
                    "The row for Agency Code \"" + agencyCode + "\" does not offer the " + action
                            + " action. Its approval status is \"" + approvalStatusOf(agencyCode)
                            + "\", and this grid varies the available actions by status.");
        }
    }

    /** Re-reads the row until its Approval Status matches, bounded by attempt count. */
    public boolean waitForApprovalStatus(String agencyCode, String expectedStatus) {
        for (int attempt = 1; attempt <= STATUS_POLL_ATTEMPTS; attempt++) {
            open();
            if (expectedStatus.equalsIgnoreCase(approvalStatusOf(agencyCode))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Re-reads the row until its Approval Status <em>contains</em> {@code fragment}, case-insensitively,
     * bounded by attempt count. Contains, not equals: the grid renders {@code "Pending for approval"},
     * not {@code "Pending"}.
     */
    public boolean waitForApprovalStatusContaining(String agencyCode, String fragment) {
        String observed = "";
        for (int attempt = 1; attempt <= STATUS_POLL_ATTEMPTS; attempt++) {
            open();
            searchByCode(agencyCode); // REPAIR-AG-012: the unfiltered view does not reliably show this row
            observed = approvalStatusOf(agencyCode);
            if (observed.toLowerCase().contains(fragment.toLowerCase())) {
                return true;
            }
        }
        System.out.println("[DIAG-SYNC] Approval Status of " + agencyCode + " never contained \""
                + fragment + "\" across " + STATUS_POLL_ATTEMPTS + " reads; last read \"" + observed + "\"");
        return false;
    }

    /**
     * The Agency Code of the row whose Agency Name is exactly {@code agencyName}, or {@code ""}. Every
     * candidate is checked by name, so a result set containing other records can never yield a code this
     * run does not own.
     */
    public String codeOfExactlyThisAgency(String agencyName) {
        for (String candidateCode : agencyCodesOnCurrentPage()) {
            if (candidateCode.isEmpty()) {
                continue;
            }
            if (agencyName.equals(agencyNameOf(candidateCode))) {
                return candidateCode;
            }
        }
        return "";
    }

    public boolean isAgencyNamePresent(String agencyName) {
        return !codeOfExactlyThisAgency(agencyName).isEmpty();
    }

    /** Raw text of every cell in a row, for failure diagnostics only. */
    public List<String> rowTextOf(String agencyCode) {
        return withStaleRetry(() -> {
            List<String> cells = new ArrayList<>();
            for (WebElement cell : selenium().findElements(rowCellsOf(agencyCode))) {
                cells.add(cell.getText().trim());
            }
            return cells;
        });
    }
}
