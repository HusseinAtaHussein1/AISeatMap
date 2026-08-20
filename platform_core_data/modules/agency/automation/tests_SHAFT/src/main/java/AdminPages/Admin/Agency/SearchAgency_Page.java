package AdminPages.Admin.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import utilities.EnvironmentConfig;

import java.time.Duration;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Page Object for the Agency list at {@code /admin/agency} -- the grid, row identity, and the row
 * action icons. <b>This is the only sanctioned way to reach the Update Agency screen</b>
 * ({@link #clickEditPen(String)}), because a direct visit to the edit URL renders an empty shell whose
 * locators still resolve (REPAIR-004).
 *
 * <h2>Verified live, headless, 2026-08-18</h2>
 *
 * <p>Column order confirmed against the rendered grid, and it is <em>not</em> the same as the Branch
 * list's, so nothing here was carried over by analogy:
 *
 * <pre>
 *   1 Code | 2 Agency Name | 3 Country Name | 4 City | 5 Status | 6 Approval Status | 7 Branch Name | 8 Actions
 * </pre>
 *
 * <p><b>Row actions depend on the row's approval status.</b> On an {@code Approved} row the sampled grid
 * offered the edit pen and thumbs-down but <em>no</em> thumbs-up. {@link #actionsAvailableFor(String)}
 * therefore reports what a row actually offers rather than assuming a fixed set -- which is also what
 * lets a test assert an action is correctly absent.
 *
 * <p><b>Identity is proven per row, never by position.</b> {@link #agencyCodesOnCurrentPage()} plus
 * {@link #agencyNameOf(String)} exist so a caller can confirm a row is the record this run created
 * before acting on it. Accepting row 1 of a result set is precisely what this run's mutation
 * authorisation forbids: acting on a record the run does not own.
 */
public class SearchAgency_Page extends Agency_Common {

    /** Row action icons, identified by their PrimeIcons class. */
    public enum RowAction {
        EDIT("pi-pencil"),
        APPROVE("pi-thumbs-up"),
        REJECT("pi-thumbs-down");

        private final String iconClass;

        RowAction(String iconClass) {
            this.iconClass = iconClass;
        }

        public String iconClass() {
            return iconClass;
        }
    }

    private static final By GRID_ROWS = By.cssSelector("table tbody tr");
    private static final By GRID_HEADERS = By.cssSelector("table thead th");

    private static final int COLUMN_CODE = 1;
    private static final int COLUMN_AGENCY_NAME = 2;
    private static final int COLUMN_COUNTRY_NAME = 3;
    private static final int COLUMN_CITY = 4;
    private static final int COLUMN_STATUS = 5;
    private static final int COLUMN_APPROVAL_STATUS = 6;
    private static final int COLUMN_BRANCH_NAME = 7;

    /**
     * How many times {@link #waitForApprovalStatus(String, String)} may re-issue its lookup. An attempt
     * count, not a pause: a status that genuinely never changes must still fail the calling test rather
     * than loop, and nothing sleeps between attempts.
     */
    private static final int STATUS_POLL_ATTEMPTS = 10;

    public SearchAgency_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    public SearchAgency_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.agencyListUrl());
        waitUntilGridIsReady();
        return this;
    }

    // -- Search filter (REPAIR-AG-012, 2026-08-19, Stage 5H) ------------------------------------

    private static final By AGENCY_NAME_FILTER = By.cssSelector("#id-Agencyname");
    private static final By AGENCY_CODE_FILTER = By.cssSelector("#id-Agencycode");
    private static final By SEARCH_BUTTON = By.xpath("//button[normalize-space(.)='Search in grid']");
    private static final By STATUS_BOTH = radioWrapper("id-Status-Both");

    /**
     * <b>REPAIR-AG-014 (2026-08-19, Stage 5H).</b> Confirmed live: this grid's Status filter
     * (Inactive/Active/Both) defaults to <b>Active</b>, and every search -- by name or by code -- honours
     * it. A freshly submitted-for-approval Agency is not yet {@code Active}, so it is invisible to any
     * search under the default filter <em>even when the create call itself succeeded</em> (a live
     * {@code 204 No Content} creation was confirmed unfindable under Active, then found immediately after
     * switching to Both). This selects Both before every search, exactly mirroring
     * {@code SearchBranch_Page}'s own established Status-radio pattern for Branches -- an omission this
     * class shipped with, distinct from REPAIR-AG-012's unfiltered-view problem, and distinct again from
     * the separate, intermittent, server-side 400 "File not found for UUID" defect this stage also found
     * (Repair Summary §13) -- both were compounding on the same "record not found" symptom.
     */
    private void selectStatusBoth() {
        // REPAIR-AG-019 (2026-08-20, Stage 5H): open() waits for the GRID to be ready, but the Status
        // filter panel is a separate part of the page and was observed, live, not yet present the
        // instant a caller reaches this method -- a NoSuchElementException on this exact radio, not a
        // timeout, meaning clickVia found nothing to click at all. Waiting for its presence first closes
        // that gap without changing what any test asserts.
        waitFor(TRANSIENT_TIMEOUT).until(d -> !selenium().findElements(STATUS_BOTH).isEmpty());
        clickVia(STATUS_BOTH);
    }

    public SearchAgency_Page searchByName(String agencyName) {
        selectStatusBoth();
        typeVia(AGENCY_NAME_FILTER, agencyName);
        clickVia(SEARCH_BUTTON);
        waitFor(TRANSIENT_TIMEOUT).until(d -> busyIndicatorCount() == 0);
        return this;
    }

    public SearchAgency_Page searchByCode(String agencyCode) {
        selectStatusBoth();
        typeVia(AGENCY_CODE_FILTER, agencyCode);
        clickVia(SEARCH_BUTTON);
        waitFor(TRANSIENT_TIMEOUT).until(d -> busyIndicatorCount() == 0);
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
            int count = Math.min(limit, countOf(GRID_ROWS));
            for (int i = 1; i <= count; i++) {
                List<String> cells = new ArrayList<>();
                for (WebElement cell : selenium().findElements(By.xpath("(//table/tbody/tr)[" + i + "]/td"))) {
                    cells.add(cell.getText().trim());
                }
                rows.add(String.join(" | ", cells));
            }
            return rows;
        });
    }

    /**
     * Waits for the grid to render at least one row. Bounded; an empty result set is a legitimate
     * outcome, so the timeout is caught and the caller decides via {@link #rowCount()} rather than
     * having an exception thrown at it.
     */
    public SearchAgency_Page waitUntilGridIsReady() {
        try {
            waitFor(LOAD_TIMEOUT).until(d -> busyIndicatorCount() == 0 && countOf(GRID_ROWS) > 0);
        } catch (TimeoutException noRowsRendered) {
            System.out.println("[DIAG-SYNC] SearchAgency_Page: grid rendered no rows within "
                    + LOAD_TIMEOUT.getSeconds() + "s. Treating as an empty result set; the caller's own "
                    + "assertion decides whether that is correct.");
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
        return countOf(GRID_ROWS);
    }

    /** The Agency Code of every row on the current page, in render order. */
    public List<String> agencyCodesOnCurrentPage() {
        return withStaleRetry(() -> {
            List<String> codes = new ArrayList<>();
            int rows = countOf(GRID_ROWS);
            for (int index = 1; index <= rows; index++) {
                codes.add(textOf(cellIn(index, COLUMN_CODE)));
            }
            return codes;
        });
    }

    private By cellIn(int rowIndex, int columnIndex) {
        return By.xpath("(//table/tbody/tr)[" + rowIndex + "]/td[" + columnIndex + "]");
    }

    /** The row carrying exactly this Agency Code. Matched on cell text, never on position. */
    public By rowByCode(String agencyCode) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + xpathLiteral(agencyCode) + "]]");
    }

    private By cellOf(String agencyCode, int columnIndex) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + xpathLiteral(agencyCode) + "]]/td[" + columnIndex + "]");
    }

    public boolean isRowPresent(String agencyCode) {
        return isPresent(rowByCode(agencyCode));
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

    private By actionIconOf(String agencyCode, RowAction action) {
        return By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                + xpathLiteral(agencyCode) + "]]//i[contains(@class,'" + action.iconClass() + "')]");
    }

    /**
     * Which actions this row actually offers. Reported rather than assumed, because the sampled grid
     * showed the set varying with approval status -- an {@code Approved} row carried the pen and
     * thumbs-down but no thumbs-up. A test asserting an action is correctly <em>absent</em> needs this.
     */
    public Set<RowAction> actionsAvailableFor(String agencyCode) {
        Set<RowAction> available = EnumSet.noneOf(RowAction.class);
        for (RowAction action : RowAction.values()) {
            if (isPresent(actionIconOf(agencyCode, action))) {
                available.add(action);
            }
        }
        return available;
    }

    /**
     * Opens the Update Agency screen for this row -- <b>the only supported entry point</b> (REPAIR-004).
     * Fails with a message naming the record when the row is absent, rather than clicking nothing.
     */
    public UpdateAgency_Page clickEditPen(String agencyCode) {
        By pen = actionIconOf(agencyCode, RowAction.EDIT);
        if (!isPresent(pen)) {
            throw new IllegalStateException(
                    "No edit pen found on the row for Agency Code \"" + agencyCode + "\". Either the row is "
                            + "not on the current page or the record does not exist. The Update Agency screen "
                            + "cannot be reached any other way: a direct visit to "
                            + EnvironmentConfig.editAgencyPath() + "/{id} renders an empty shell whose "
                            + "locators still resolve, which produces false results rather than a failure.");
        }
        scrollIntoView(pen);
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
        scrollIntoView(icon);
        clickVia(icon);
        return this;
    }

    public SearchAgency_Page clickThumbsDown(String agencyCode) {
        By icon = actionIconOf(agencyCode, RowAction.REJECT);
        requireAction(agencyCode, icon, RowAction.REJECT);
        scrollIntoView(icon);
        clickVia(icon);
        return this;
    }

    // -- Remarks confirmation dialog (REPAIR-AG-015, 2026-08-19, Stage 5H) ----------------------
    //
    // clickThumbsUp/clickThumbsDown raise a mandatory Remarks dialog before the approval or
    // rejection actually takes effect -- confirmed live: clicking thumbs-up alone leaves the record
    // Pending, and the dialog only closes once Remarks is filled and its own Submit is pressed. This
    // mirrors SearchBranch_Page's already-proven handling of the identical dialog on the Branch
    // screen, rather than re-deriving it.

    private static final By REMARKS_TEXTAREA = By.cssSelector("textarea[placeholder='remarks...']");
    private static final By REMARKS_DIALOG = By.cssSelector("div.p-dialog");
    private static final By REMARKS_DIALOG_SUBMIT_BUTTON = By.xpath(
            "//div[contains(concat(' ', normalize-space(@class), ' '), ' p-dialog ')]"
                    + "//button[normalize-space()='Submit']");
    private static final Duration REMARKS_DIALOG_TIMEOUT = Duration.ofSeconds(10);

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
     * submits it. Callers should confirm {@link #remarksPromptShown()} first where the prompt's
     * appearance is itself under test; this method's own wait exists so it never types into a dialog
     * that has not finished opening.
     *
     * @throws IllegalStateException if the remark does not arrive, or the dialog does not close
     */
    public SearchAgency_Page completeRemarksPrompt(String remarks) {
        waitFor(REMARKS_DIALOG_TIMEOUT).until(ExpectedConditions.visibilityOfElementLocated(REMARKS_DIALOG));
        waitFor(REMARKS_DIALOG_TIMEOUT).until(ExpectedConditions.elementToBeClickable(REMARKS_TEXTAREA));

        typeVia(REMARKS_TEXTAREA, remarks);

        String actual = valueOfInput(REMARKS_TEXTAREA);
        if (!remarks.equals(actual)) {
            throw new IllegalStateException(
                    "The Remarks text was not delivered to the dialog, so Submit was not pressed -- "
                            + "submitting now would send an empty remark against a mandatory field. Expected \""
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
                            + "treated as accepted. The record's state is unconfirmed.",
                    stillOpen);
        }
        return this;
    }

    private void requireAction(String agencyCode, By icon, RowAction action) {
        if (!isPresent(icon)) {
            throw new IllegalStateException(
                    "The row for Agency Code \"" + agencyCode + "\" does not offer the " + action
                            + " action. Its approval status is \"" + approvalStatusOf(agencyCode)
                            + "\", and this grid varies the available actions by status -- so this is a "
                            + "state precondition, not a locator failure.");
        }
    }

    /**
     * Re-reads the row until its Approval Status matches, bounded by attempt count. Returns whether it
     * matched, so the caller's own assertion carries the failure message.
     */
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
     * bounded by attempt count. Returns whether it matched, so the caller's own assertion carries the
     * failure message.
     *
     * <p><b>Why contains rather than equals.</b> The grid renders the pending state as
     * {@code "Pending for approval"}, not {@code "Pending"}, so an exact-match wait cannot express "has it
     * become pending yet?" without hardcoding a label this stage did not verify character-for-character.
     *
     * <p><b>Why a wait at all (REPAIR-001).</b> An approval or rejection is applied asynchronously: reading
     * the Approval Status immediately after the action returns observes the pre-transition value and reports
     * a false failure. This is the same fault the Branch suite diagnosed and fixed, and the reason
     * {@code waitForApprovalStatus} exists there.
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
     * The Agency Code of the row whose Agency Name is exactly {@code agencyName}, or {@code ""} when the
     * current result set holds no such row.
     *
     * <p>Every candidate is checked by name, so a result set containing other records -- or one no
     * filter narrowed at all -- can never yield a code this run does not own.
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

    /**
     * True when any row on the current page carries this Agency Name. Used by provisioning to confirm a
     * just-created record has become returnable.
     */
    public boolean isAgencyNamePresent(String agencyName) {
        return !codeOfExactlyThisAgency(agencyName).isEmpty();
    }

    /** Raw text of every cell in a row, for failure diagnostics only. */
    public List<String> rowTextOf(String agencyCode) {
        return withStaleRetry(() -> {
            List<String> cells = new ArrayList<>();
            for (WebElement cell : selenium().findElements(
                    By.xpath("//table/tbody/tr[td[" + COLUMN_CODE + "][normalize-space(.)="
                            + xpathLiteral(agencyCode) + "]]/td"))) {
                cells.add(cell.getText().trim());
            }
            return cells;
        });
    }
}
