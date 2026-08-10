package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import utilities.EnvironmentConfig;

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
 * <p>Actions and assertions use SHAFT's fluent API; reads use plain Selenium via {@link Branch_Common}.
 * No {@code Thread.sleep} appears here, and no wait is nested inside another wait's condition.</p>
 */
public class SearchBranch_Page extends Branch_Common {

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
    /**
     * Live-verified 2026-08-10 (diagnostic probe against STG): clicking thumbs-up/thumbs-down always
     * raises a PrimeNG {@code p-dialog} titled "Remark *" (mandatory) containing {@link
     * #REMARKS_TEXTAREA} and two buttons, Cancel and Submit. Without submitting it, the record's
     * Approval Status does not change -- confirmed by re-searching after a click with no remarks
     * entered, which still read "Pending for approval". This resolves TC-BR-058's open question
     * (Discovery could not establish whether the grid raises a Remarks prompt): it always does, and
     * it is not optional.
     */
    private static final By REMARKS_DIALOG_SUBMIT_BUTTON =
            By.xpath("//div[contains(@class,'p-dialog')]//button[normalize-space()='Submit']");

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
    /** REPAIR-BR-008 (applied here 2026-08-09): re-drive attempts for an autocomplete/dropdown option
     * click lost to a re-rendering overlay. */
    private static final int SELECT_ATTEMPTS = 3;

    private static final Pattern TOTAL_RESULTS = Pattern.compile("of\\s+([\\d,]+)");

    public SearchBranch_Page(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    public SearchBranch_Page open() {
        driver.browser().navigateToURL(EnvironmentConfig.branchListUrl());
        waitUntilGridIsReady();
        return this;
    }

    /**
     * REPAIR-001: the grid is populated asynchronously after navigation, so wait for it to resolve to
     * either rows or the empty-state message rather than reading whatever is on screen immediately.
     */
    public SearchBranch_Page waitUntilGridIsReady() {
        waitFor(RESULT_TIMEOUT).until(d -> rowCount() > 0 || isEmptyStateShown());
        return this;
    }

    // ── Filters ────────────────────────────────────────────────────────────────────────────────

    /**
     * REPAIR-BR-013 (2026-08-10): routed through {@link Branch_Common#typeVia} because
     * {@code driver.element().type()} is reported as delivered on this screen while leaving the input
     * empty and {@code ng-pristine} — see that method's own note for the probe evidence. Every search
     * this page performs depended on it, so the filter was never applied.
     */
    public SearchBranch_Page setBranchCode(String code) {
        typeVia(BRANCH_CODE_INPUT, code);
        return this;
    }

    /** See {@link #setBranchCode(String)} — same repair, same reason. */
    public SearchBranch_Page setBranchName(String name) {
        typeVia(BRANCH_NAME_INPUT, name);
        return this;
    }

    public SearchBranch_Page selectStatus(Status status) {
        driver.element().click(By.cssSelector("label[for='id-Status-" + status.label() + "']"));
        return this;
    }

    /**
     * Attempted repair, 2026-08-09, targeted rerun did NOT confirm it (TC-BR-046 still fails
     * identically: {@code NoSuchElement option never became clickable}) -- left in place ahead of a
     * real fix because it is strictly more correct than the original (a wait before the click, where
     * there was none), but the underlying cause is NOT confirmed to be REPAIR-BR-008's autocomplete
     * race. This control is verified ({@code COUNTRY_DROPDOWN_ANCESTOR}, above) to be a plain PrimeNG
     * {@code p-dropdown} -- a static option list, not the filtering {@code p-autocomplete} REPAIR-BR-008
     * fixed on the Add Branch screen. Citing that rule here was an unverified assumption of identical
     * mechanism; the actual cause needs live DOM diagnosis (does the ancestor click reliably open the
     * panel? does re-clicking it on retry toggle it closed again?) before another repair attempt.
     */
    public SearchBranch_Page selectCountry(String country) {
        By option = By.xpath("//li[normalize-space(.)='" + country + "']");
        NoSuchElementException lastFailure = null;
        for (int attempt = 1; attempt <= SELECT_ATTEMPTS; attempt++) {
            try {
                driver.element().click(COUNTRY_DROPDOWN_ANCESTOR);
                waitFor(TRANSIENT_TIMEOUT).until(d -> !selenium().findElements(option).isEmpty());
                driver.element().click(option);
                return this;
            } catch (NoSuchElementException | TimeoutException notCommitted) {
                lastFailure = (notCommitted instanceof NoSuchElementException)
                        ? (NoSuchElementException) notCommitted
                        : new NoSuchElementException("option never became clickable", notCommitted);
            }
        }
        throw lastFailure;
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

    /** REPAIR-BR-009: how long {@code isEmptyStateShown()} must hold continuously before it is
     * accepted as the search's real outcome, rather than a transient flash while the grid clears
     * old rows before the new result set streams in (diagnosed 2026-08-09, `healing/RepairSummary.md`
     * Pass HEAL-BR-20260809-01, second round — confirmed via timestamped instrumentation: every
     * false-empty read resolved in ~200-250ms, far faster than a real page-content change elsewhere
     * in the same suite). Two poll cycles at {@link #POLL_INTERVAL} (250ms) is the settle window. */
    private static final Duration EMPTY_STATE_SETTLE = Duration.ofMillis(600);

    /**
     * Clicks Search and waits, bounded, for the result set to actually change (REPAIR-001) rather
     * than reading the previous search's rows. An identical repeat search legitimately produces an
     * identical summary, so a timeout here is a normal outcome, not a failure.
     *
     * <p><b>REPAIR-BR-009:</b> {@code isEmptyStateShown()} is no longer accepted the instant it is
     * observed -- it must hold continuously for {@link #EMPTY_STATE_SETTLE} first. The empty-state
     * placeholder renders both when a search genuinely returns zero rows AND transiently while the
     * grid clears its previous rows before the new set streams in; a bare presence check could not
     * tell the two apart, and every downstream read (row count, pagination controls, which do not
     * exist while the empty state shows) inherited the false-empty race.</p>
     */
    public SearchBranch_Page clickSearch() {
        String summaryBefore = resultSummaryText();
        long t0 = System.currentTimeMillis();
        System.out.println("[DIAG-SYNC] clickSearch start t=0ms summaryBefore=\"" + summaryBefore + "\"");
        clickVia(SEARCH_BUTTON);
        System.out.println("[DIAG-SYNC] clickSearch clicked t=" + (System.currentTimeMillis() - t0) + "ms");
        try {
            long[] emptySince = {-1};
            waitFor(RESULT_TIMEOUT).until(d -> {
                boolean empty = isEmptyStateShown();
                String now = empty ? "" : resultSummaryText();
                boolean summaryChanged = !empty && !now.isEmpty() && !now.equals(summaryBefore);
                boolean settled = false;
                if (empty) {
                    if (emptySince[0] < 0) {
                        emptySince[0] = System.currentTimeMillis();
                    }
                    settled = System.currentTimeMillis() - emptySince[0] >= EMPTY_STATE_SETTLE.toMillis();
                } else {
                    emptySince[0] = -1;
                }
                boolean done = summaryChanged || settled;
                System.out.println("[DIAG-SYNC] clickSearch poll t=" + (System.currentTimeMillis() - t0)
                        + "ms empty=" + empty + " emptySettled=" + settled + " summaryNow=\"" + now
                        + "\" summaryChanged=" + summaryChanged + " done=" + done
                        + " rowCountNow=" + selenium().findElements(GRID_BODY_ROWS).size());
                return done;
            });
            System.out.println("[DIAG-SYNC] clickSearch resolved t=" + (System.currentTimeMillis() - t0) + "ms");
        } catch (TimeoutException expectedWhenResultsAreUnchanged) {
            // Same criteria as the previous search — the grid is already showing the correct rows.
            System.out.println("[DIAG-SYNC] clickSearch timed out t=" + (System.currentTimeMillis() - t0)
                    + "ms summaryNow=\"" + resultSummaryText() + "\" rowCountNow="
                    + selenium().findElements(GRID_BODY_ROWS).size());
        }
        System.out.println("[DIAG-SYNC] clickSearch end t=" + (System.currentTimeMillis() - t0)
                + "ms summaryAfter=\"" + resultSummaryText() + "\" rowCountAfter="
                + selenium().findElements(GRID_BODY_ROWS).size());
        return this;
    }

    public SearchBranch_Page searchByCode(String code, Status status) {
        setBranchCode(code);
        selectStatus(status);
        return clickSearch();
    }

    public SearchBranch_Page searchByName(String name, Status status) {
        setBranchName(name);
        selectStatus(status);
        return clickSearch();
    }

    // ── Reading the grid ───────────────────────────────────────────────────────────────────────

    public List<String> columnHeaders() {
        return withStaleRetry(() -> {
            List<String> headers = new ArrayList<>();
            for (WebElement header : selenium().findElements(GRID_HEADER_CELLS)) {
                headers.add(header.getText().trim());
            }
            return headers;
        });
    }

    public int rowCount() {
        return selenium().findElements(GRID_BODY_ROWS).size();
    }

    /**
     * Branch Codes visible on the page currently displayed, in grid order.
     *
     * <p><b>REPAIR-BR (2026-08-09):</b> retries on {@code StaleElementReferenceException} — the grid
     * can re-render between {@code findElements(GRID_BODY_ROWS)} locating a row and this same read
     * calling {@code row.findElements(...)}/{@code getText()} on it (TC-BR-043/054/055/060/061).
     */
    public List<String> branchCodesOnCurrentPage() {
        return withStaleRetry(() -> {
            List<String> codes = new ArrayList<>();
            for (WebElement row : selenium().findElements(GRID_BODY_ROWS)) {
                List<WebElement> cells = row.findElements(By.tagName("td"));
                if (!cells.isEmpty()) {
                    codes.add(cells.get(0).getText().trim());
                }
            }
            return codes;
        });
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
        return withStaleRetry(() -> {
            Set<RowAction> actions = new LinkedHashSet<>();
            for (RowAction action : RowAction.values()) {
                if (!selenium().findElements(actionIconInRow(branchCode, action)).isEmpty()) {
                    actions.add(action);
                }
            }
            return actions;
        });
    }

    /** The action icons offered by the row at {@code rowIndex} (1-based) on the current page. */
    public Set<RowAction> actionsAvailableInRow(int rowIndex) {
        return withStaleRetry(() -> {
            Set<RowAction> actions = new LinkedHashSet<>();
            for (RowAction action : RowAction.values()) {
                By icon = By.xpath("(//table//tbody//tr)[" + rowIndex
                        + "]//i[contains(@class,'" + action.iconClass() + "')]");
                if (!selenium().findElements(icon).isEmpty()) {
                    actions.add(action);
                }
            }
            return actions;
        });
    }

    public String approvalStatusInRow(int rowIndex) {
        return textOf(By.xpath("(//table//tbody//tr)[" + rowIndex + "]/td[5]"));
    }

    public String branchCodeInRow(int rowIndex) {
        return textOf(By.xpath("(//table//tbody//tr)[" + rowIndex + "]/td[1]"));
    }

    // ── Row actions ────────────────────────────────────────────────────────────────────────────

    /** REPAIR-BR-010 (2026-08-09): raw driver clicks on row-action icons are an evidence-consistent
     * hypothesis for TC-BR-055/065's UpdateBranch_Page load timeout (unconfirmed by direct log
     * evidence, unlike the pagination click failure) -- applied on the strength of the same confirmed
     * pattern (`Branch_Common.clickVia`, ported from `AddBranch_Page`). */
    public UpdateBranch_Page clickEditPen(String branchCode) {
        clickVia(actionIconInRow(branchCode, RowAction.EDIT));
        return new UpdateBranch_Page(driver).waitUntilLoaded();
    }

    public UpdateBranch_Page clickEditPenInRow(int rowIndex) {
        clickVia(By.xpath(
                "(//table//tbody//tr)[" + rowIndex + "]//i[contains(@class,'pi-pencil')]"));
        return new UpdateBranch_Page(driver).waitUntilLoaded();
    }

    public SearchBranch_Page clickThumbsUp(String branchCode) {
        clickVia(actionIconInRow(branchCode, RowAction.APPROVE));
        return this;
    }

    public SearchBranch_Page clickThumbsDown(String branchCode) {
        clickVia(actionIconInRow(branchCode, RowAction.REJECT));
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

    /**
     * Fills the Remarks prompt raised by clickThumbsUp/clickThumbsDown and clicks Submit. Callers
     * must confirm {@link #remarksPromptShown()} first -- this does not itself wait for the prompt to
     * appear, since the two are always used together and a caller that skips the check wants that
     * failure surfaced immediately rather than absorbed here.
     */
    public SearchBranch_Page completeRemarksPrompt(String remarks) {
        driver.element().type(REMARKS_TEXTAREA, remarks);
        clickVia(REMARKS_DIALOG_SUBMIT_BUTTON);
        return this;
    }

    // ── Pagination ─────────────────────────────────────────────────────────────────────────────

    public int currentPageNumber() {
        String raw = textOf(SELECTED_PAGE_BUTTON);
        int parsed = parsePageNumber(raw);
        System.out.println("[DIAG-SYNC] currentPageNumber selectedButtonText=\"" + raw + "\" parsed=" + parsed);
        return parsed;
    }

    /**
     * REPAIR-BR-011 (2026-08-09): {@code button.next} carries no disabled attribute or class on this
     * app even on the genuine last page -- live-verified: {@code <button class="next"><i
     * class="pi pi-angle-right"></i></button>}, identical whether or not a next page exists. The
     * previous {@code hasClass(NEXT_PAGE_BUTTON, "disabled")} check was looking for a signal this
     * paginator never emits. "Is there a next page" is instead answered the same way
     * {@link #goToLastPage()} already answers its own convergence: is the current page already the
     * highest one offered.
     */
    public boolean hasNextPage() {
        List<WebElement> next = selenium().findElements(NEXT_PAGE_BUTTON);
        int current = currentPageNumber();
        int highest = highestOfferedPageNumber();
        boolean result = !next.isEmpty() && (highest < 0 || current < highest);
        System.out.println("[DIAG-SYNC] hasNextPage present=" + !next.isEmpty()
                + " current=" + current + " highestOffered=" + highest + " result=" + result);
        return result;
    }

    /** Advances one page and waits, bounded, for the displayed records to actually change. */
    public SearchBranch_Page goToNextPage() {
        long t0 = System.currentTimeMillis();
        List<String> before = branchCodesOnCurrentPage();
        System.out.println("[DIAG-SYNC] goToNextPage before=" + before + " page=" + currentPageNumber());
        clickVia(NEXT_PAGE_BUTTON);
        System.out.println("[DIAG-SYNC] goToNextPage clicked t=" + (System.currentTimeMillis() - t0) + "ms");
        waitForPageContentToChange(before);
        System.out.println("[DIAG-SYNC] goToNextPage after=" + branchCodesOnCurrentPage()
                + " page=" + currentPageNumber() + " totalMs=" + (System.currentTimeMillis() - t0));
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
    public SearchBranch_Page goToLastPage() {
        for (int hop = 0; hop < MAX_PAGINATION_HOPS; hop++) {
            int highestOffered = highestOfferedPageNumber();
            int current = currentPageNumber();
            System.out.println("[DIAG-SYNC] goToLastPage hop=" + hop + " highestOffered=" + highestOffered
                    + " current=" + current);
            if (highestOffered < 0 || highestOffered == current) {
                System.out.println("[DIAG-SYNC] goToLastPage converged at hop=" + hop);
                return this;
            }
            List<String> before = branchCodesOnCurrentPage();
            clickVia(By.xpath("//button[contains(@class,'page-no')][normalize-space()='"
                    + highestOffered + "']"));
            System.out.println("[DIAG-SYNC] goToLastPage clicked button=\"" + highestOffered + "\" hop=" + hop);
            waitForPageContentToChange(before);
        }
        System.out.println("[DIAG-SYNC] goToLastPage exhausted MAX_PAGINATION_HOPS=" + MAX_PAGINATION_HOPS
                + " final page=" + currentPageNumber());
        return this;
    }

    private int highestOfferedPageNumber() {
        return withStaleRetry(() -> {
            int highest = -1;
            List<String> texts = new ArrayList<>();
            for (WebElement pageButton : selenium().findElements(PAGE_NUMBER_BUTTONS)) {
                String raw = pageButton.getText();
                texts.add(raw);
                highest = Math.max(highest, parsePageNumber(raw));
            }
            System.out.println("[DIAG-SYNC] highestOfferedPageNumber buttonTexts=" + texts + " highest=" + highest);
            return highest;
        });
    }

    private void waitForPageContentToChange(List<String> previousCodes) {
        long t0 = System.currentTimeMillis();
        System.out.println("[DIAG-SYNC] waitForPageContentToChange start previous=" + previousCodes);
        try {
            waitFor(RESULT_TIMEOUT).until(d -> {
                List<String> now = branchCodesOnCurrentPage();
                boolean changed = !now.equals(previousCodes);
                System.out.println("[DIAG-SYNC] waitForPageContentToChange poll t="
                        + (System.currentTimeMillis() - t0) + "ms now=" + now + " changed=" + changed);
                return changed;
            });
            System.out.println("[DIAG-SYNC] waitForPageContentToChange resolved t="
                    + (System.currentTimeMillis() - t0) + "ms");
        } catch (TimeoutException unchanged) {
            // Bounded and non-fatal: the assertion in the test decides whether this matters.
            System.out.println("[DIAG-SYNC] waitForPageContentToChange TIMED OUT t="
                    + (System.currentTimeMillis() - t0) + "ms stillShowing=" + branchCodesOnCurrentPage());
        }
    }

    private int parsePageNumber(String text) {
        String digits = text == null ? "" : text.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? -1 : Integer.parseInt(digits);
    }
}
