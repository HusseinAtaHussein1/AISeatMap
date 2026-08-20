package AdminPages.Admin.Branch;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
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
     * The PrimeNG dialog that carries the Remarks prompt. Live-verified 2026-08-10: clicking
     * thumbs-up or thumbs-down always raises a mandatory {@code p-dialog} titled "Remark *" holding
     * {@link #REMARKS_TEXTAREA} plus Cancel and Submit. Clicking the icon without submitting the
     * dialog leaves the record unchanged — re-searching afterwards still read "Pending for approval".
     *
     * <p>Matched on an exact {@code p-dialog} class token rather than a substring, because
     * {@code contains(@class,'p-dialog')} would also match {@code p-dialog-content},
     * {@code p-dialog-header} and {@code p-dialog-mask}. That exact mistake, with
     * {@code p-dropdown}/{@code p-dropdown-trigger}, is already recorded against this suite
     * (Quarantine Register, TC-BR-001 attempt 5), so it is not repeated here.</p>
     */
    private static final By REMARKS_DIALOG = By.cssSelector("div.p-dialog");
    /** Submit inside {@link #REMARKS_DIALOG}. Scoped to that dialog so it can never match a Submit
     * button belonging to the page underneath. */
    private static final By REMARKS_DIALOG_SUBMIT_BUTTON = By.xpath(
            "//div[contains(concat(' ', normalize-space(@class), ' '), ' p-dialog ')]"
                    + "//button[normalize-space()='Submit']");

    // ── Pagination (custom <tilde-paginator>) ──────────────────────────────────────────────────
    private static final By NEXT_PAGE_BUTTON = By.cssSelector("button.next");
    private static final By PAGE_NUMBER_BUTTONS = By.cssSelector("button.page-no");
    private static final By SELECTED_PAGE_BUTTON = By.cssSelector("button.page-no.selected");

    private static final Duration RESULT_TIMEOUT = Duration.ofSeconds(20);
    private static final Duration TRANSIENT_TIMEOUT = Duration.ofSeconds(6);
    /** Maximum time allowed for a Search filter value to commit before Search is permitted. */
    private static final Duration FILTER_COMMIT_TIMEOUT = Duration.ofSeconds(3);
    /** Upper bound on paging hops, so a mis-read paginator can never loop indefinitely. */
    private static final int MAX_PAGINATION_HOPS = 80;
    /** Bounded re-search attempts when waiting for a persisted approval-status change. */
    private static final int MAX_STATUS_REFRESH_ATTEMPTS = 3;
    /** REPAIR-BR-008 (applied here 2026-08-09): re-drive attempts for an autocomplete/dropdown option
     * click lost to a re-rendering overlay. */
    private static final int SELECT_ATTEMPTS = 3;
    /** REPAIR-BR-012: bounded re-drive attempts for a Status label click that did not select its radio. */
    private static final int STATUS_SELECT_ATTEMPTS = 3;
    /** REPAIR-BR-012: how long a Status radio has to report selected before the click is re-driven. */
    private static final Duration STATUS_COMMIT_TIMEOUT = Duration.ofSeconds(3);
    /** How long the Remarks dialog has to open, and afterwards to close, before the action is treated
     * as not delivered. Longer than {@link #TRANSIENT_TIMEOUT} because closing follows a server round
     * trip that changes the record's approval state. */
    private static final Duration REMARKS_DIALOG_TIMEOUT = Duration.ofSeconds(10);

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
     *
     * <p><b>REPAIR-BR-012 (2026-08-15):</b> "rows exist" is no longer accepted as "the grid finished
     * loading". The result summary ("Showing 10 results of 509 results") renders <em>after</em> the
     * rows do, so this wait used to return during a window in which {@link #resultSummaryText()} was
     * still {@code ""}. {@link #clickSearch()} then captured an empty baseline, and any summary that
     * subsequently appeared — including the <em>previous</em> search's — looked like a change. That is
     * the direct cause of TC-BR-045 reading Active's total for Inactive (`EXEC-BR-20260814-15`:
     * {@code clickSearch start summaryBefore=""} → {@code resolved t=542ms} → {@code 509}). The grid
     * is now only "ready" once it is in a state that can actually be read.</p>
     */
    public SearchBranch_Page waitUntilGridIsReady() {
        awaitGridSettled("waitUntilGridIsReady");
        return this;
    }

    /**
     * The single definition of "the grid has finished loading and may be read": either rows are
     * present <em>and</em> the result summary has rendered, or the empty state has held continuously
     * for {@link #EMPTY_STATE_SETTLE} (REPAIR-BR-009's contract, reused rather than reimplemented).
     *
     * <p>Bounded and non-throwing: it exists to stop callers <em>misreading</em> a half-rendered grid,
     * not to assert anything itself. Callers that need proof of a fresh result cycle use
     * {@link #clickSearch()}'s own grid-replacement guard.</p>
     */
    private void awaitGridSettled(String caller) {
        long[] emptySince = {-1};
        try {
            waitFor(RESULT_TIMEOUT).until(d -> {
                if (isEmptyStateShown()) {
                    if (emptySince[0] < 0) {
                        emptySince[0] = System.currentTimeMillis();
                    }
                    return System.currentTimeMillis() - emptySince[0] >= EMPTY_STATE_SETTLE.toMillis();
                }
                emptySince[0] = -1;
                return rowCount() > 0 && !resultSummaryText().isEmpty();
            });
        } catch (TimeoutException neverSettled) {
            System.out.println("[DIAG-SYNC] awaitGridSettled(" + caller + ") did not settle within "
                    + RESULT_TIMEOUT.getSeconds() + "s; rowCount=" + rowCount()
                    + " summary=\"" + resultSummaryText() + "\" emptyStateShown=" + isEmptyStateShown());
        }
    }

    // ── Filters ────────────────────────────────────────────────────────────────────────────────

    public SearchBranch_Page setBranchCode(String code) {
        typeWithDeliveryFallback(BRANCH_CODE_INPUT, code, "Branch Code");
        awaitFilterValueCommitted(BRANCH_CODE_INPUT, code, "Branch Code");
        return this;
    }

    public SearchBranch_Page setBranchName(String name) {
        typeWithDeliveryFallback(BRANCH_NAME_INPUT, name, "Branch Name");
        awaitFilterValueCommitted(BRANCH_NAME_INPUT, name, "Branch Name");
        return this;
    }

    /** How long a filter input has to show the typed value before the delivery fallback is used.
     * Short on purpose: this is not a wait for the application to do work, only for a keystroke that
     * either arrived or did not. The real bound stays {@link #FILTER_COMMIT_TIMEOUT}. */
    private static final Duration TYPE_DELIVERY_PROBE = Duration.ofMillis(750);

    /**
     * REPAIR-BR-013 (2026-08-15) — types into a filter input and, if the keystrokes did not arrive,
     * sets the value through the DOM and raises the events Angular listens for.
     *
     * <p><b>Why this is needed.</b> On this screen only, {@code driver.element().type()} reports
     * success and leaves the input empty. Diagnosed live 2026-08-15 (`TC-BR-040/041/043`, all three:
     * {@code Actual value: ""}) and previously on 2026-08-14 (`DIAG-BR-20260814-02`, which also
     * recorded the field staying {@code ng-pristine ng-untouched} with zero events fired). Native
     * Selenium {@code clear()+sendKeys()} was tried on 2026-08-14 (`rerun-21`) and left the field
     * empty too, so the fallback is not another variation of sending keystrokes.</p>
     *
     * <p><b>Why this exact fallback.</b> It is the pattern {@code AddBranch_Page.setValueAndNotify}
     * already uses for every field on the Add Branch form — set the value, then dispatch
     * {@code input}, {@code change} and {@code blur} so Angular's form control registers it. That
     * page fills 20+ controls this way across 13 passing tests, so this reuses a mechanism already
     * proven against this application rather than introducing a new one.</p>
     *
     * <p><b>The normal path is always tried first</b> and is used whenever it works, so this never
     * silently replaces real typing. It is also not a way past a control the application is
     * deliberately blocking: a disabled or read-only input rejects a DOM write the same way, and the
     * caller's {@link #awaitFilterValueCommitted} check still has to pass afterwards.</p>
     */
    private void typeWithDeliveryFallback(By locator, String value, String fieldLabel) {
        driver.element().type(locator, value);
        if (valueArrived(locator, value)) {
            return;
        }
        System.out.println("[DIAG-SYNC] " + fieldLabel + " keystrokes did not arrive (value=\""
                + valueOfInput(locator) + "\"); applying the DOM set + event dispatch fallback");
        WebElement element = selenium().findElement(locator);
        ((org.openqa.selenium.JavascriptExecutor) selenium()).executeScript(
                "var e = arguments[0];"
                        + "e.focus();"
                        + "e.value = arguments[1];"
                        + "e.dispatchEvent(new Event('input', {bubbles: true}));"
                        + "e.dispatchEvent(new Event('change', {bubbles: true}));"
                        + "e.dispatchEvent(new Event('blur', {bubbles: true}));"
                        + "e.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));",
                element, value);
    }

    /** Bounded, non-throwing check that an input now holds {@code expected}. */
    private boolean valueArrived(By locator, String expected) {
        try {
            waitFor(TYPE_DELIVERY_PROBE).until(d -> expected.equals(valueOfInput(locator)));
            return true;
        } catch (TimeoutException notArrived) {
            return false;
        }
    }

    /** Current Branch Code filter value, used as an explicit pre-search assertion in TC-BR-040/043. */
    public String branchCodeFilterValue() {
        return valueOfInput(BRANCH_CODE_INPUT);
    }

    /** Current Branch Name filter value, used as an explicit pre-search assertion in TC-BR-041. */
    public String branchNameFilterValue() {
        return valueOfInput(BRANCH_NAME_INPUT);
    }

    /**
     * Prevents a false-pass search with empty criteria when SHAFT reports typing as complete but the
     * Angular input has not retained the requested value.
     */
    private void awaitFilterValueCommitted(By locator, String expected, String fieldLabel) {
        try {
            waitFor(FILTER_COMMIT_TIMEOUT)
                    .until(d -> expected.equals(valueOfInput(locator)));
        } catch (TimeoutException notCommitted) {
            throw new IllegalStateException(
                    fieldLabel + " input did not retain \"" + expected + "\" within "
                            + FILTER_COMMIT_TIMEOUT.getSeconds() + "s. Actual value: \""
                            + valueOfInput(locator) + "\". Search was not executed.",
                    notCommitted);
        }
    }

    /**
     * REPAIR-BR-012 (2026-08-15): the click is no longer assumed to have taken effect. The Status
     * radios are hidden inputs driven by their labels, so "the label was clicked" and "the requested
     * filter is now selected" are different facts; the second is what Search depends on. This clicks,
     * then waits for the requested radio to actually report {@code isSelected()}, re-driving the click
     * a bounded number of times before failing with the observed state of all three radios.
     */
    public SearchBranch_Page selectStatus(Status status) {
        By label = By.cssSelector("label[for='id-Status-" + status.label() + "']");
        TimeoutException lastFailure = null;
        for (int attempt = 1; attempt <= STATUS_SELECT_ATTEMPTS; attempt++) {
            // REPAIR-BR-013: a normal click first, every attempt. The JS-dispatched click is only
            // reached once this one is observed not to have selected the radio (REPAIR-008's guard
            // rail: never the default strategy).
            driver.element().click(label);
            try {
                waitFor(STATUS_COMMIT_TIMEOUT)
                        .until(d -> d.findElement(radioOf(status)).isSelected());
                System.out.println("[DIAG-SYNC] selectStatus " + status.label()
                        + " selected on attempt " + attempt + " of " + STATUS_SELECT_ATTEMPTS
                        + " (normal click)");
                return this;
            } catch (TimeoutException notSelected) {
                lastFailure = notSelected;
                System.out.println("[DIAG-SYNC] selectStatus " + status.label()
                        + " NOT selected by the normal click on attempt " + attempt
                        + "; " + statusDiagnostics());
            }

            clickVia(label);
            try {
                waitFor(STATUS_COMMIT_TIMEOUT)
                        .until(d -> d.findElement(radioOf(status)).isSelected());
                System.out.println("[DIAG-SYNC] selectStatus " + status.label()
                        + " selected on attempt " + attempt + " of " + STATUS_SELECT_ATTEMPTS
                        + " (dispatched click fallback)");
                return this;
            } catch (TimeoutException stillNotSelected) {
                lastFailure = stillNotSelected;
                System.out.println("[DIAG-SYNC] selectStatus " + status.label()
                        + " NOT selected by the dispatched click either on attempt " + attempt
                        + "; " + statusDiagnostics());
            }
        }
        throw new IllegalStateException("Status filter \"" + status.label() + "\" was not selected after "
                + STATUS_SELECT_ATTEMPTS + " normal and " + STATUS_SELECT_ATTEMPTS + " dispatched click "
                + "attempt(s), so Search would have run against the wrong filter. " + statusDiagnostics(),
                lastFailure);
    }

    private By radioOf(Status status) {
        return By.cssSelector("#id-Status-" + status.label());
    }

    /** Observed selected-state of all three Status radios, for failure diagnostics. */
    private String statusDiagnostics() {
        StringBuilder observed = new StringBuilder("radios: ");
        for (Status option : Status.values()) {
            List<WebElement> found = selenium().findElements(radioOf(option));
            observed.append(option.label()).append('{');
            observed.append(found.isEmpty()
                    ? "absent"
                    : "selected=" + found.get(0).isSelected() + " value=" + found.get(0).getAttribute("value"));
            observed.append("} ");
        }
        return observed.toString().trim();
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
    /** The dropdown overlay itself, used to tell "the panel is open" from "the panel is closed". */
    private static final By DROPDOWN_PANEL = By.cssSelector(".p-dropdown-panel");

    /**
     * REPAIR-BR-013 (2026-08-15) — replaces the unconfirmed repair described above. Two defects in
     * the previous version are addressed, both named in its own note:
     *
     * <ol>
     *   <li><b>The click never arrived.</b> Diagnosed live 2026-08-15: the panel never opened, so the
     *       option never existed to be clicked ({@code option never became clickable}). This is the
     *       same delivery failure confirmed on this screen's text inputs, Status labels and Search
     *       button in the same run, so the same fallback applies — normal click first, dispatched
     *       click only once the panel is observed still closed.</li>
     *   <li><b>The retry defeated itself.</b> The old loop re-clicked the ancestor on every attempt
     *       without checking whether the panel was already open, so a successful first click could be
     *       toggled shut by the second. The panel state is now checked before any reopen.</li>
     * </ol>
     *
     * <p>Commit is proven by the panel closing after the option is clicked, not by the State filter
     * becoming enabled — that is what TC-BR-046 asserts, and a page object must not prove the very
     * thing the test is there to check.</p>
     */
    public SearchBranch_Page selectCountry(String country) {
        By option = By.xpath("//li[normalize-space(.)='" + country + "']");
        RuntimeException lastFailure = null;

        for (int attempt = 1; attempt <= SELECT_ATTEMPTS; attempt++) {
            if (!isDropdownPanelOpen()) {
                driver.element().click(COUNTRY_DROPDOWN_ANCESTOR);
                if (!awaitPanelOpen()) {
                    System.out.println("[DIAG-SYNC] selectCountry panel did not open on the normal click "
                            + "(attempt " + attempt + "); applying the dispatched click fallback");
                    clickVia(COUNTRY_DROPDOWN_ANCESTOR);
                    awaitPanelOpen();
                }
            } else {
                System.out.println("[DIAG-SYNC] selectCountry panel already open on attempt " + attempt
                        + "; not re-clicking the control, which would close it");
            }

            try {
                waitFor(TRANSIENT_TIMEOUT).until(d -> !selenium().findElements(option).isEmpty());
            } catch (TimeoutException optionNeverListed) {
                lastFailure = new NoSuchElementException("option never became clickable", optionNeverListed);
                continue;
            }

            driver.element().click(option);
            if (awaitPanelClosed()) {
                System.out.println("[DIAG-SYNC] selectCountry \"" + country
                        + "\" committed on attempt " + attempt + " (normal click)");
                return this;
            }
            clickVia(option);
            if (awaitPanelClosed()) {
                System.out.println("[DIAG-SYNC] selectCountry \"" + country
                        + "\" committed on attempt " + attempt + " (dispatched click fallback)");
                return this;
            }
            lastFailure = new IllegalStateException("Country option \"" + country
                    + "\" was clicked but the dropdown never closed, so the selection did not commit.");
        }

        throw lastFailure;
    }

    private boolean isDropdownPanelOpen() {
        return !selenium().findElements(DROPDOWN_PANEL).isEmpty();
    }

    private boolean awaitPanelOpen() {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> isDropdownPanelOpen());
            return true;
        } catch (TimeoutException stayedClosed) {
            return false;
        }
    }

    private boolean awaitPanelClosed() {
        try {
            waitFor(TRANSIENT_TIMEOUT).until(d -> !isDropdownPanelOpen());
            return true;
        } catch (TimeoutException stayedOpen) {
            return false;
        }
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
        long t0 = System.currentTimeMillis();

        // Never measure from a half-rendered grid: awaitGridSettled guarantees the summary has
        // rendered, so the captured baseline is the *previous result set*, not an empty placeholder.
        awaitGridSettled("clickSearch/before");
        String summaryBefore = resultSummaryText();
        List<WebElement> rowsBefore = selenium().findElements(GRID_BODY_ROWS);
        WebElement rowRef = rowsBefore.isEmpty() ? null : rowsBefore.get(0);
        System.out.println("[DIAG-SYNC] clickSearch start t=0ms summaryBefore=\"" + summaryBefore
                + "\" rowsBefore=" + rowsBefore.size());

        // REPAIR-BR-013: normal click first; the dispatched click is used only if the grid gives no
        // sign of a new result cycle, and the same staleness proof still has to hold afterwards.
        driver.element().click(SEARCH_BUTTON);
        System.out.println("[DIAG-SYNC] clickSearch clicked t=" + (System.currentTimeMillis() - t0) + "ms");
        if (rowRef != null && !cycleStarted(rowRef)) {
            System.out.println("[DIAG-SYNC] clickSearch normal click produced no result cycle t="
                    + (System.currentTimeMillis() - t0) + "ms; applying the dispatched click fallback");
            clickVia(SEARCH_BUTTON);
        }

        awaitFreshResultCycle(rowRef, t0);
        awaitGridSettled("clickSearch/after");

        System.out.println("[DIAG-SYNC] clickSearch end t=" + (System.currentTimeMillis() - t0)
                + "ms summaryAfter=\"" + resultSummaryText() + "\" rowCountAfter="
                + selenium().findElements(GRID_BODY_ROWS).size());
        return this;
    }

    /**
     * REPAIR-BR-012: proves a <em>new</em> result cycle completed before any total is read.
     *
     * <p><b>Signal: grid DOM replacement.</b> The application re-creates every {@code <tr>} on each
     * search — measured 2026-08-14 (`DIAG-BR-20260814-03`/`04`): 10 rows removed and 10 added even
     * when the result set was byte-identical (509 → 509), and the empty-state row detached when a
     * search went from empty to rows. There is no {@code trackBy} reuse. So the previously-captured
     * first row going stale is a deterministic, application-driven "the grid re-rendered" signal that
     * works whether or not the total changed — which matters, because two valid filters can
     * legitimately return the same count and a total-inequality check would deadlock on that.</p>
     *
     * <p>It is also terminal: once stale, always stale, so no polling interval can miss it. The
     * previous implementation instead waited for the summary <em>text</em> to differ from a baseline
     * that was frequently {@code ""}, which any summary at all satisfied — including the previous
     * search's. That is the TC-BR-045 defect.</p>
     *
     * <p>When the grid was already empty before the click there is no row to observe; that case falls
     * back to REPAIR-BR-009's settle contract via {@link #awaitGridSettled(String)}.</p>
     */
    /**
     * REPAIR-BR-013: bounded, non-throwing probe for "the grid has begun a new cycle", used only to
     * decide whether the Search click landed. It never replaces {@link #awaitFreshResultCycle}, which
     * still has to prove the cycle completed before any total is read.
     */
    private boolean cycleStarted(WebElement rowRef) {
        try {
            waitFor(SEARCH_DELIVERY_PROBE).until(ExpectedConditions.stalenessOf(rowRef));
            return true;
        } catch (TimeoutException noCycleYet) {
            return false;
        }
    }

    /** How long the Search click is given to start a new result cycle before the dispatched click is
     * tried. Deliberately short: this measures whether the click arrived, not how long the search takes. */
    private static final Duration SEARCH_DELIVERY_PROBE = Duration.ofSeconds(3);

    private void awaitFreshResultCycle(WebElement rowRef, long t0) {
        if (rowRef == null) {
            System.out.println("[DIAG-SYNC] clickSearch pre-click grid was empty; "
                    + "falling back to the empty-state settle contract");
            return;
        }
        try {
            waitFor(RESULT_TIMEOUT).until(ExpectedConditions.stalenessOf(rowRef));
            System.out.println("[DIAG-SYNC] clickSearch fresh result cycle confirmed (grid re-rendered) t="
                    + (System.currentTimeMillis() - t0) + "ms");
        } catch (TimeoutException notRefreshed) {
            throw new IllegalStateException("Search did not produce a fresh result cycle within "
                    + RESULT_TIMEOUT.getSeconds() + "s: the results grid never re-rendered, so any total "
                    + "read now would be the previous search's. summaryBefore/after=\""
                    + resultSummaryText() + "\" rowCount=" + selenium().findElements(GRID_BODY_ROWS).size()
                    + " emptyStateShown=" + isEmptyStateShown() + " " + statusDiagnostics(), notRefreshed);
        }
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
     * Fills the mandatory Remarks dialog raised by {@link #clickThumbsUp}/{@link #clickThumbsDown}
     * and submits it. Added 2026-08-15 alongside the recovery of {@code BranchActions_TC}, which
     * cannot approve or reject without it.
     *
     * <p><b>Not a plain {@code type()} + {@code click()}.</b> Writing it that way would repeat the
     * failure REPAIR-BR-013 exists to prevent: on this screen {@code driver.element().type()} is
     * reported as delivered while leaving the input empty and {@code ng-pristine}, and a
     * driver-issued click on these controls is reported as delivered while changing nothing. Both
     * are silent, so the caller would see a green step and an unchanged record. This method
     * therefore reuses the two mechanisms already proven on this page —
     * {@link #typeWithDeliveryFallback} and {@link Branch_Common#clickVia} — and then <em>checks</em>
     * each step rather than assuming it landed:</p>
     *
     * <ol>
     *   <li>the dialog and its textarea are visible and interactable before anything is typed;</li>
     *   <li>the textarea actually holds the requested text before Submit is pressed — a remark that
     *       never arrived would otherwise be submitted as empty against a mandatory field;</li>
     *   <li>the dialog is gone afterwards, which is the observable proof the submission was accepted
     *       rather than silently rejected.</li>
     * </ol>
     *
     * <p>Every wait is bounded and none is nested inside another wait's condition
     * ({@link Branch_Common}). There is no fixed sleep. This method changes no other Search action
     * and no existing synchronisation.</p>
     *
     * <p>Callers should confirm {@link #remarksPromptShown()} first where the appearance of the
     * prompt is itself the thing under test (TC-BR-058); this method's own wait exists so it is
     * never typing into a dialog that has not finished opening, not to substitute for that check.</p>
     *
     * @throws IllegalStateException if the remark does not arrive, or the dialog does not close
     */
    public SearchBranch_Page completeRemarksPrompt(String remarks) {
        waitFor(REMARKS_DIALOG_TIMEOUT)
                .until(ExpectedConditions.visibilityOfElementLocated(REMARKS_DIALOG));
        waitFor(REMARKS_DIALOG_TIMEOUT)
                .until(ExpectedConditions.elementToBeClickable(REMARKS_TEXTAREA));

        typeWithDeliveryFallback(REMARKS_TEXTAREA, remarks, "Remarks");

        String actual = valueOfInput(REMARKS_TEXTAREA);
        if (!remarks.equals(actual)) {
            throw new IllegalStateException(
                    "The Remarks text was not delivered to the dialog, so Submit was not pressed — "
                            + "submitting now would send an empty remark against a mandatory field. "
                            + "Expected \"" + remarks + "\", the field holds \"" + actual + "\".");
        }

        waitFor(REMARKS_DIALOG_TIMEOUT)
                .until(ExpectedConditions.elementToBeClickable(REMARKS_DIALOG_SUBMIT_BUTTON));
        clickVia(REMARKS_DIALOG_SUBMIT_BUTTON);

        try {
            waitFor(REMARKS_DIALOG_TIMEOUT)
                    .until(ExpectedConditions.invisibilityOfElementLocated(REMARKS_DIALOG));
        } catch (TimeoutException stillOpen) {
            throw new IllegalStateException(
                    "Submit was clicked but the Remarks dialog was still open after "
                            + REMARKS_DIALOG_TIMEOUT.getSeconds() + "s, so the approval or rejection "
                            + "cannot be treated as accepted. The record's state is unconfirmed.",
                    stillOpen);
        }
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