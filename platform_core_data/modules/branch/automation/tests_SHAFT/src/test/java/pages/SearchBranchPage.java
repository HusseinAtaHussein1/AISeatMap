package pages;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import utils.EnvironmentConfig;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Page Object for Admin → Branch — the Search &amp; Actions screen (US 8599).
 *
 * <p>Every locator below was verified live, headless, against the STG build this suite targets
 * (automation-skill §11A) and is recorded in {@code SelectorVerificationReport_SHAFT.md}. Four
 * verified, non-obvious facts recur throughout this class and are stated once here rather than
 * re-derived per method:</p>
 *
 * <ol>
 *   <li><b>The Country and State filters are PrimeNG {@code p-dropdown} widgets</b> whose underlying
 *       {@code <input>} is a visually-hidden accessibility node; the clickable target is the nearest
 *       {@code div.p-dropdown} ancestor.</li>
 *   <li><b>The Status radios are hidden inputs.</b> The clickable target is
 *       {@code label[for="id-Status-{Option}"]}.</li>
 *   <li><b>Pagination is a custom {@code <tilde-paginator>}, not PrimeNG.</b> There is no
 *       {@code .p-paginator} anywhere on this screen. The controls are {@code button.next} and
 *       {@code button.page-no} (the current page carries {@code .selected}). Critically, <b>"First"
 *       and "Last" render as {@code <span>}, not {@code <button>}</b> — their clickability was never
 *       confirmed, so {@link #goToLastPage()} walks the numbered buttons instead.</li>
 *   <li><b>A row is addressed by its Branch Code, never by index.</b>
 *       {@code //table//tbody//tr[td[1][normalize-space()='CODE']]} was verified to resolve uniquely.
 *       Every mutating action in this suite is scoped through that locator, so it can only ever
 *       touch a record this run created (ProjectContext §5, mutation authorisation).</li>
 * </ol>
 *
 * <p>Actions and assertions use SHAFT's fluent API; reads use plain Selenium via {@link BasePage}.
 * No {@code Thread.sleep} appears here, and no wait is nested inside another wait's condition.</p>
 */
public class SearchBranchPage extends BasePage {

    /** The three Status filter options, as the screen renders them. */
    public enum Status {
        ACTIVE("Active"),
        INACTIVE("Inactive"),
        BOTH("Both");

        private final String label;

        Status(String label) {
            this.label = label;
        }

        public String label() {
            return label;
        }
    }

    /** The three row action icons, keyed by the PrimeIcons class that identifies each. */
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

    // ── Filter form ────────────────────────────────────────────────────────────────────────────
    private static final By BRANCH_CODE_INPUT = By.cssSelector("#id-Branchcode");
    private static final By BRANCH_NAME_INPUT = By.cssSelector("#id-Branchname");
    private static final By COUNTRY_DROPDOWN_ANCESTOR =
            By.xpath("//*[@id='id-Country']/ancestor::div[contains(@class,'p-dropdown')][1]");
    private static final By STATE_DROPDOWN_ANCESTOR =
            By.xpath("//*[@id='id-State']/ancestor::div[contains(@class,'p-dropdown')][1]");
    private static final By DROPDOWN_OPTION_ITEMS = By.cssSelector(".p-dropdown-panel li");
    private static final By SEARCH_BUTTON =
            By.xpath("//button[@type='submit'][contains(., 'Search')]");

    // ── Results grid ───────────────────────────────────────────────────────────────────────────
    private static final By GRID_HEADER_CELLS = By.cssSelector("table thead th");
    private static final By GRID_BODY_ROWS = By.cssSelector("table tbody tr");
    private static final By EMPTY_STATE_MESSAGE = By.cssSelector("td.message");
    /** Leaf element carrying e.g. "Showing 10 results of 493 results". */
    private static final By RESULT_SUMMARY_TEXT = By.xpath(
            "//*[contains(normalize-space(.), 'results of')]"
                    + "[not(.//*[contains(normalize-space(.), 'results of')])]");
    /** The Remarks control a grid-level approve/reject may raise. Verified on the Update screen. */
    private static final By REMARKS_TEXTAREA = By.cssSelector("textarea[placeholder='remarks...']");

    // ── Pagination (custom <tilde-paginator>) ──────────────────────────────────────────────────
    private static final By NEXT_PAGE_BUTTON = By.cssSelector("button.next");
    private static final By PAGE_NUMBER_BUTTONS = By.cssSelector("button.page-no");
    private static final By SELECTED_PAGE_BUTTON = By.cssSelector("button.page-no.selected");

    private static final Duration RESULT_TIMEOUT = Duration.ofSeconds(20);
    private static final Duration TRANSIENT_TIMEOUT = Duration.ofSeconds(6);
    /** Upper bound on paging hops, so a mis-read paginator can never loop indefinitely. */
    private static final int MAX_PAGINATION_HOPS = 80;
    /** Bounded re-search attempts when waiting for a persisted approval-status change. */
    private static final int MAX_STATUS_REFRESH_ATTEMPTS = 3;

    private static final Pattern TOTAL_RESULTS = Pattern.compile("of\\s+([\\d,]+)");

    public SearchBranchPage(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    public SearchBranchPage open() {
        driver.browser().navigateToURL(EnvironmentConfig.branchListUrl());
        waitUntilGridIsReady();
        return this;
    }

    /**
     * REPAIR-001: the grid is populated asynchronously after navigation, so wait for it to resolve to
     * either rows or the empty-state message rather than reading whatever is on screen immediately.
     */
    public SearchBranchPage waitUntilGridIsReady() {
        waitFor(RESULT_TIMEOUT).until(d -> rowCount() > 0 || isEmptyStateShown());
        return this;
    }

    // ── Filters ────────────────────────────────────────────────────────────────────────────────

    public SearchBranchPage setBranchCode(String code) {
        driver.element().type(BRANCH_CODE_INPUT, code);
        return this;
    }

    public SearchBranchPage setBranchName(String name) {
        driver.element().type(BRANCH_NAME_INPUT, name);
        return this;
    }

    public SearchBranchPage selectStatus(Status status) {
        driver.element().click(By.cssSelector("label[for='id-Status-" + status.label() + "']"));
        return this;
    }

    public SearchBranchPage selectCountry(String country) {
        driver.element().click(COUNTRY_DROPDOWN_ANCESTOR);
        driver.element().click(By.xpath("//li[normalize-space(text())='" + country + "']"));
        return this;
    }

    /** A PrimeNG widget signals "unusable" with a {@code p-disabled} class on its container. */
    public boolean isStateFilterEnabled() {
        return !hasClass(STATE_DROPDOWN_ANCESTOR, "p-disabled");
    }

    /** Opens the State dropdown and returns the option labels it offers. */
    public List<String> openStateFilterAndReadOptions() {
        driver.element().click(STATE_DROPDOWN_ANCESTOR);
        waitFor(RESULT_TIMEOUT).until(d -> !selenium().findElements(DROPDOWN_OPTION_ITEMS).isEmpty());
        List<String> options = new ArrayList<>();
        for (WebElement option : selenium().findElements(DROPDOWN_OPTION_ITEMS)) {
            options.add(option.getText().trim());
        }
        return options;
    }

    // ── Searching ──────────────────────────────────────────────────────────────────────────────

    /**
     * Clicks Search and waits, bounded, for the result set to actually change (REPAIR-001) rather
     * than reading the previous search's rows. An identical repeat search legitimately produces an
     * identical summary, so a timeout here is a normal outcome, not a failure.
     */
    public SearchBranchPage clickSearch() {
        String summaryBefore = resultSummaryText();
        driver.element().click(SEARCH_BUTTON);
        try {
            waitFor(RESULT_TIMEOUT).until(d -> {
                if (isEmptyStateShown()) {
                    return true;
                }
                String now = resultSummaryText();
                return !now.isEmpty() && !now.equals(summaryBefore);
            });
        } catch (TimeoutException expectedWhenResultsAreUnchanged) {
            // Same criteria as the previous search — the grid is already showing the correct rows.
        }
        return this;
    }

    public SearchBranchPage searchByCode(String code, Status status) {
        setBranchCode(code);
        selectStatus(status);
        return clickSearch();
    }

    public SearchBranchPage searchByName(String name, Status status) {
        setBranchName(name);
        selectStatus(status);
        return clickSearch();
    }

    // ── Reading the grid ───────────────────────────────────────────────────────────────────────

    public List<String> columnHeaders() {
        List<String> headers = new ArrayList<>();
        for (WebElement header : selenium().findElements(GRID_HEADER_CELLS)) {
            headers.add(header.getText().trim());
        }
        return headers;
    }

    public int rowCount() {
        return selenium().findElements(GRID_BODY_ROWS).size();
    }

    /** Branch Codes visible on the page currently displayed, in grid order. */
    public List<String> branchCodesOnCurrentPage() {
        List<String> codes = new ArrayList<>();
        for (WebElement row : selenium().findElements(GRID_BODY_ROWS)) {
            List<WebElement> cells = row.findElements(By.tagName("td"));
            if (!cells.isEmpty()) {
                codes.add(cells.get(0).getText().trim());
            }
        }
        return codes;
    }

    public boolean isEmptyStateShown() {
        return !selenium().findElements(EMPTY_STATE_MESSAGE).isEmpty();
    }

    public String emptyStateMessage() {
        return textOf(EMPTY_STATE_MESSAGE);
    }

    public String resultSummaryText() {
        return textOf(RESULT_SUMMARY_TEXT);
    }

    /**
     * Total record count parsed from the result summary ("… of 493 results"), or {@code -1} when the
     * summary is absent — a search returning nothing has no total to report.
     */
    public int totalResultCount() {
        Matcher matcher = TOTAL_RESULTS.matcher(resultSummaryText());
        if (!matcher.find()) {
            return -1;
        }
        return Integer.parseInt(matcher.group(1).replace(",", ""));
    }

    // ── Addressing one row by its Branch Code ──────────────────────────────────────────────────

    /**
     * The single locator every row-scoped operation is built on. Verified to resolve uniquely — this
     * is what makes "act only on a record this run created" enforceable rather than aspirational.
     */
    public By rowByCode(String branchCode) {
        return By.xpath("//table//tbody//tr[td[1][normalize-space()='" + branchCode + "']]");
    }

    private By cellInRow(String branchCode, int columnIndex) {
        return By.xpath("//table//tbody//tr[td[1][normalize-space()='"
                + branchCode + "']]/td[" + columnIndex + "]");
    }

    private By actionIconInRow(String branchCode, RowAction action) {
        return By.xpath("//table//tbody//tr[td[1][normalize-space()='" + branchCode
                + "']]//i[contains(@class,'" + action.iconClass() + "')]");
    }

    public boolean isRowPresent(String branchCode) {
        return !selenium().findElements(rowByCode(branchCode)).isEmpty();
    }

    /** Approval Status is column 5 of the six the grid currently renders (see FINDING-012). */
    public String approvalStatusOf(String branchCode) {
        return textOf(cellInRow(branchCode, 5));
    }

    public String branchNameOf(String branchCode) {
        return textOf(cellInRow(branchCode, 2));
    }

    public String countryNameOf(String branchCode) {
        return textOf(cellInRow(branchCode, 3));
    }

    public String cityOf(String branchCode) {
        return textOf(cellInRow(branchCode, 4));
    }

    /** The action icons actually offered by one row, as a set of {@link RowAction}. */
    public Set<RowAction> actionsAvailableFor(String branchCode) {
        Set<RowAction> actions = new LinkedHashSet<>();
        for (RowAction action : RowAction.values()) {
            if (!selenium().findElements(actionIconInRow(branchCode, action)).isEmpty()) {
                actions.add(action);
            }
        }
        return actions;
    }

    /** The action icons offered by the row at {@code rowIndex} (1-based) on the current page. */
    public Set<RowAction> actionsAvailableInRow(int rowIndex) {
        Set<RowAction> actions = new LinkedHashSet<>();
        for (RowAction action : RowAction.values()) {
            By icon = By.xpath("(//table//tbody//tr)[" + rowIndex
                    + "]//i[contains(@class,'" + action.iconClass() + "')]");
            if (!selenium().findElements(icon).isEmpty()) {
                actions.add(action);
            }
        }
        return actions;
    }

    public String approvalStatusInRow(int rowIndex) {
        return textOf(By.xpath("(//table//tbody//tr)[" + rowIndex + "]/td[5]"));
    }

    public String branchCodeInRow(int rowIndex) {
        return textOf(By.xpath("(//table//tbody//tr)[" + rowIndex + "]/td[1]"));
    }

    // ── Row actions ────────────────────────────────────────────────────────────────────────────

    public UpdateBranchPage clickEditPen(String branchCode) {
        driver.element().click(actionIconInRow(branchCode, RowAction.EDIT));
        return new UpdateBranchPage(driver).waitUntilLoaded();
    }

    public UpdateBranchPage clickEditPenInRow(int rowIndex) {
        driver.element().click(By.xpath(
                "(//table//tbody//tr)[" + rowIndex + "]//i[contains(@class,'pi-pencil')]"));
        return new UpdateBranchPage(driver).waitUntilLoaded();
    }

    public SearchBranchPage clickThumbsUp(String branchCode) {
        driver.element().click(actionIconInRow(branchCode, RowAction.APPROVE));
        return this;
    }

    public SearchBranchPage clickThumbsDown(String branchCode) {
        driver.element().click(actionIconInRow(branchCode, RowAction.REJECT));
        return this;
    }

    /**
     * REPAIR-001: an approve/reject is asynchronous, so poll for the row to actually reach the
     * expected Approval Status instead of asserting immediately after the click. Each attempt
     * re-navigates and re-searches, so what is asserted is <em>persisted</em> state, not an
     * optimistic UI update.
     *
     * <p>Deliberately a plain bounded attempt loop rather than a {@code WebDriverWait} condition:
     * each attempt internally performs its own bounded waits, and nesting those inside another
     * wait's condition would make the outer bound non-deterministic.</p>
     *
     * @return {@code true} if the status was reached within the attempt bound.
     */
    public boolean waitForApprovalStatus(String branchCode, String expectedStatus) {
        for (int attempt = 0; attempt < MAX_STATUS_REFRESH_ATTEMPTS; attempt++) {
            open();
            searchByCode(branchCode, Status.BOTH);
            if (expectedStatus.equalsIgnoreCase(approvalStatusOf(branchCode))) {
                return true;
            }
        }
        return false;
    }

    // ── Transient prompts (REPAIR-002) ─────────────────────────────────────────────────────────

    /**
     * REPAIR-002: whether a Remarks entry is being requested before the action completes. Anchored on
     * the verified Remarks control rather than on page text, and non-throwing — TC-BR-058 explicitly
     * needs "no prompt appeared" recorded as an observation rather than failed on.
     */
    public boolean remarksPromptShown() {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> !selenium().findElements(REMARKS_TEXTAREA).isEmpty());
            return true;
        } catch (TimeoutException noPrompt) {
            return false;
        }
    }

    // ── Pagination ─────────────────────────────────────────────────────────────────────────────

    public int currentPageNumber() {
        return parsePageNumber(textOf(SELECTED_PAGE_BUTTON));
    }

    public boolean hasNextPage() {
        List<WebElement> next = selenium().findElements(NEXT_PAGE_BUTTON);
        return !next.isEmpty() && next.get(0).isEnabled() && !hasClass(NEXT_PAGE_BUTTON, "disabled");
    }

    /** Advances one page and waits, bounded, for the displayed records to actually change. */
    public SearchBranchPage goToNextPage() {
        List<String> before = branchCodesOnCurrentPage();
        driver.element().click(NEXT_PAGE_BUTTON);
        waitForPageContentToChange(before);
        return this;
    }

    /**
     * Walks to the final page by repeatedly clicking the highest-numbered page button offered.
     *
     * <p><b>Why not click "Last".</b> The paginator's First/Last controls render as
     * {@code <span class="first">} / {@code <span class="last">}, not buttons, and live verification
     * never confirmed they respond to a click. Rather than encode an unverified interaction, this
     * walks the numbered buttons — which <em>were</em> verified — until the highest offered page is
     * the one already selected. Bounded by {@link #MAX_PAGINATION_HOPS}.</p>
     */
    public SearchBranchPage goToLastPage() {
        for (int hop = 0; hop < MAX_PAGINATION_HOPS; hop++) {
            int highestOffered = highestOfferedPageNumber();
            if (highestOffered < 0 || highestOffered == currentPageNumber()) {
                return this;
            }
            List<String> before = branchCodesOnCurrentPage();
            driver.element().click(By.xpath("//button[contains(@class,'page-no')][normalize-space()='"
                    + highestOffered + "']"));
            waitForPageContentToChange(before);
        }
        return this;
    }

    private int highestOfferedPageNumber() {
        int highest = -1;
        for (WebElement pageButton : selenium().findElements(PAGE_NUMBER_BUTTONS)) {
            highest = Math.max(highest, parsePageNumber(pageButton.getText()));
        }
        return highest;
    }

    private void waitForPageContentToChange(List<String> previousCodes) {
        try {
            waitFor(RESULT_TIMEOUT).until(d -> !branchCodesOnCurrentPage().equals(previousCodes));
        } catch (TimeoutException unchanged) {
            // Bounded and non-fatal: the assertion in the test decides whether this matters.
        }
    }

    private int parsePageNumber(String text) {
        String digits = text == null ? "" : text.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? -1 : Integer.parseInt(digits);
    }
}
