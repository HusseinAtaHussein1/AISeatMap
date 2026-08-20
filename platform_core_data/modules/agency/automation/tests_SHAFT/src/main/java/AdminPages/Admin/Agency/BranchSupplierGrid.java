package AdminPages.Admin.Agency;

import com.shaft.driver.SHAFT;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;

import java.time.Duration;

/**
 * Row-indexed access to the Add Branch form's Product Access grid, for the one thing the Agency fixture
 * needs and the Branch suite never did: selecting <b>two or more</b> supplier rows.
 *
 * <h2>Why this class exists rather than a change to {@code AddBranch_Page}</h2>
 *
 * <p>{@code AddBranch_Page} models the <em>first</em> supplier row only -- {@code checkFirstSupplierRow},
 * {@code selectFirstSupplierCredential}, {@code setFirstSupplierDescription} -- because one row is all
 * any Branch test case ever needed. {@code PO-14} needs at least two, because {@code BR-006} makes
 * "a Branch carrying two or more suppliers with credentials" the precondition for the Agency form's PCC
 * section existing at all.
 *
 * <p>Adding row-indexed methods to {@code AddBranch_Page} would mean editing a 1,359-line file that 31
 * passing Branch tests depend on. automation-skill §11D.2 says a module needing a change to a shared
 * asset <em>proposes</em> it rather than making it. So the capability is added <b>alongside</b>, in the
 * Agency module's own package, and {@code AddBranch_Page} is not touched at all.
 *
 * <p><b>This is narrower than the approved Automation Plan.</b> The plan said {@code BranchProvisioner}
 * would be "extended"; composing beside it instead means <em>no</em> Branch file changes, which honours
 * the plan's stated intent -- "additive, so branch's 31 tests are unaffected" -- more strictly than its
 * letter. Recorded in the Automation Decision Report.
 *
 * <h2>The locators are generalised from a live-verified structure, not invented</h2>
 *
 * <p>{@code AddBranch_Page.FIRST_ROW_CREDENTIAL_DROPDOWN} was verified live on 2026-08-06 as
 * {@code (//table//tbody//tr)[1]/td[3]//div[' p-dropdown ']}, with the grid's columns confirmed as
 * {@code Status | Supplier Name | Credential Name | Product Name | Description}. The dropdown locators here
 * are that same expression with the row index parameterised, so they inherit two corrections the Branch
 * suite already paid for. The Status checkbox locator is <b>not</b> column-positional -- see
 * {@link #statusCheckboxBoxInRow(int)} and REPAIR-AG-003:
 *
 * <ul>
 *   <li><b>Token-exact class matching.</b> {@code contains(@class,'p-dropdown')} is a substring match
 *       that also matches {@code p-dropdown-trigger}, {@code p-dropdown-label} and
 *       {@code p-dropdown-clearable}. The space-padded {@code concat} form cannot.
 *   <li><b>Row-scoped Description.</b> {@code AddBranch_Page} locates Description by
 *       {@code input[id^='id-supplier-'][placeholder='Description']}, which is not row-scoped and
 *       resolves to the first such input anywhere in the grid. Harmless while only row 1 is ever used;
 *       wrong the moment a second row is involved. Every locator here is anchored inside its own row.
 * </ul>
 */
public class BranchSupplierGrid extends Agency_Common {

    private static final int COLUMN_SUPPLIER_NAME = 2;
    private static final int COLUMN_CREDENTIAL_NAME = 3;

    /** Token-exact {@code p-dropdown} match -- see the class note on why substring matching is wrong. */
    private static final String EXACT_P_DROPDOWN =
            "div[contains(concat(' ', normalize-space(@class), ' '), ' p-dropdown ')]";

    public BranchSupplierGrid(SHAFT.GUI.WebDriver driver) {
        super(driver);
    }

    private static String row(int rowIndex) {
        return "(//table//tbody//tr)[" + rowIndex + "]";
    }

    public int rowCount() {
        return countOf(By.xpath("//table//tbody//tr"));
    }

    public String supplierNameInRow(int rowIndex) {
        return textOf(By.xpath(row(rowIndex) + "/td[" + COLUMN_SUPPLIER_NAME + "]"));
    }

    /**
     * The row's Status checkbox <b>box</b> -- the element that actually toggles.
     *
     * <p><b>REPAIR-AG-001 / REPAIR-AG-003 (2026-08-19, Stage 5H).</b> This locator caused the whole suite
     * to fail. Two things were wrong:
     *
     * <ol>
     *   <li>It ended at {@code div.p-checkbox}, the outer wrapper. {@code AddBranch_Page} records, verified
     *       live 2026-08-05, that clicking the wrapper leaves {@code checked} false and only the inner
     *       {@code div.p-checkbox-box} toggles it -- "one level too high".
     *   <li>It located the cell as {@code td[1]}, assuming the Status column's position. The proven Branch
     *       locator instead finds {@code input[@type='checkbox']} <em>within the row</em> and walks up to
     *       its box, which holds regardless of column order. That is now what this does: structure, not
     *       position.
     * </ol>
     */
    private By statusCheckboxBoxInRow(int rowIndex) {
        return By.xpath(row(rowIndex) + "//input[@type='checkbox']"
                + "/ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' p-checkbox ')][1]"
                + "//div[contains(@class,'p-checkbox-box')]");
    }

    /**
     * Whether the row is ticked. Read from the {@code p-highlight} class on the box, not from the input's
     * {@code checked} property: a grid row's checkbox id is regenerated per row
     * ({@code id-supplier-*}), so there is no stable id to address the input by.
     */
    public boolean isRowSelected(int rowIndex) {
        return isPrimeControlHighlighted(statusCheckboxBoxInRow(rowIndex));
    }

    /** Ticks the row's Status checkbox and confirms the state actually changed (REPAIR-BR-010). */
    public BranchSupplierGrid selectRow(int rowIndex) {
        if (isRowSelected(rowIndex)) {
            return this;
        }
        togglePrimeControlByBox(statusCheckboxBoxInRow(rowIndex));
        return this;
    }

    private By credentialDropdownInRow(int rowIndex) {
        return By.xpath(row(rowIndex) + "/td[" + COLUMN_CREDENTIAL_NAME + "]//" + EXACT_P_DROPDOWN + "[1]");
    }

    private By credentialLabelInRow(int rowIndex) {
        return By.xpath(row(rowIndex) + "/td[" + COLUMN_CREDENTIAL_NAME + "]//" + EXACT_P_DROPDOWN
                + "[1]//span[contains(@class,'p-dropdown-label')]");
    }

    /** Bounded interaction-attempt count, mirroring {@code AddBranch_Page}'s proven precedent (3). */
    private static final int CREDENTIAL_OPEN_MAX_ATTEMPTS = 3;

    /** The visible text of every option currently rendered in an open PrimeNG dropdown overlay panel. */
    private java.util.List<String> openPanelOptionTexts() {
        return visibleTextsOf(By.xpath("//div[contains(@class,'p-dropdown-panel')]"
                + "[not(contains(@style,'display: none'))]//li[contains(@class,'p-dropdown-item')]"));
    }

    /**
     * Selects a Credential Name in this row. Mandatory once the row's Status checkbox is ticked --
     * REPAIR-BR-002 recorded that a ticked row without a credential leaves the grid invalid and blocks
     * every submission, which is precisely the failure that made the Branch happy path unreachable
     * before that repair.
     *
     * <p>The overlay panel is matched on {@code li.p-dropdown-item} rather than a bare {@code //li},
     * because this application's navigation menus contribute a dozen unrelated {@code li} elements to
     * every page (verified live 2026-08-06).
     *
     * <p><b>REPAIR-AG-004 (2026-08-19, Stage 5H).</b> A single unconditional click on the dropdown was
     * not enough for row 2 -- confirmed live: the earlier readiness wait passed, the click was dispatched,
     * and the option overlay never became visible. {@code AddBranch_Page} diagnosed the identical failure
     * mode on row 1 of this same grid on 2026-08-14 (TC-BR-069): a click can be dispatched without the
     * PrimeNG overlay committing, with {@code aria-expanded} staying false. Its fix was a bounded,
     * re-locating retry rather than a single click, and this method now applies the same shape: check
     * whether the panel is already open before clicking (so an open panel is never toggled closed), give
     * each attempt its own short commit window, and re-locate the dropdown fresh on every attempt rather
     * than reusing one captured reference that a re-render could make stale.
     */
    public BranchSupplierGrid selectCredentialInRow(int rowIndex, String preferredCredentialName) {
        By dropdown = credentialDropdownInRow(rowIndex);
        waitFor(TRANSIENT_TIMEOUT).until(d -> isVisible(dropdown) && !hasClass(dropdown, "p-disabled"));

        // Open the panel, verifying it actually committed (REPAIR-AG-004) -- confirmed live 2026-08-19
        // that the click itself is reliable and the panel renders its options within tens of
        // milliseconds, so this loop exists for robustness against a rare no-commit click, not because
        // rendering is slow.
        java.util.List<String> availableOptions = java.util.Collections.emptyList();
        for (int attempt = 1; attempt <= CREDENTIAL_OPEN_MAX_ATTEMPTS && availableOptions.isEmpty(); attempt++) {
            scrollIntoView(dropdown);
            clickVia(dropdown);
            try {
                waitFor(Duration.ofSeconds(2)).until(d -> !openPanelOptionTexts().isEmpty());
                availableOptions = openPanelOptionTexts();
            } catch (TimeoutException notYetCommitted) {
                System.out.println("[REPAIR-AG-004] row " + rowIndex + " credential dropdown: click "
                        + "dispatched, no options rendered within 2s (attempt " + attempt + "/"
                        + CREDENTIAL_OPEN_MAX_ATTEMPTS + ")");
            }
        }
        if (availableOptions.isEmpty()) {
            throw new IllegalStateException(
                    "Row " + rowIndex + "'s Credential dropdown rendered no options after "
                            + CREDENTIAL_OPEN_MAX_ATTEMPTS + " click attempts. Supplier: \""
                            + supplierNameInRow(rowIndex) + "\".");
        }

        // REPAIR-AG-005 (2026-08-19, Stage 5H). Each row's Credential Name dropdown is scoped to that
        // row's OWN supplier and offers only ITS configured credential(s) -- confirmed live: row 1 offers
        // exactly "Live", row 2 offers exactly "Aegean staging", row 3 "AegeanUAE", row 4
        // "AirArabiaEgypt", row 5 three of its own. No credential name is shared across suppliers.
        //
        // The original code passed BranchTestData.credentialName() ("Live") to every row, which only
        // ever matches row 1 by coincidence. Every other row's dropdown legitimately never contains
        // "Live" -- the option this code waited for could not exist, no matter how long or how many
        // times the wait retried. That is why REPAIR-AG-004's retry alone did not close this defect:
        // the earlier symptom (no-commit click) and this one (wrong requested text) look identical from
        // the caller's side -- "the option never became visible" -- but have different causes, and only
        // live inspection of the panel's actual contents distinguished them.
        //
        // Fixed by selecting from what the row actually offers: the preferred name if present, otherwise
        // the first available option. No in-scope Agency test case inspects which credential a supplier
        // carries -- only that the Branch has two or more suppliers WITH a credential set at all
        // (BR-006) -- so accepting the row's own first option is correct, not a workaround.
        String toSelect = availableOptions.contains(preferredCredentialName)
                ? preferredCredentialName : availableOptions.get(0);
        if (!toSelect.equals(preferredCredentialName)) {
            System.out.println("[REPAIR-AG-005] row " + rowIndex + " (" + supplierNameInRow(rowIndex)
                    + ") has no credential named \"" + preferredCredentialName + "\"; available: "
                    + availableOptions + ". Selecting \"" + toSelect + "\" instead.");
        }

        By option = By.xpath("//div[contains(@class,'p-dropdown-panel')]"
                + "//li[contains(@class,'p-dropdown-item') and normalize-space(.)="
                + xpathLiteral(toSelect) + "]");
        clickVia(option);
        waitFor(TRANSIENT_TIMEOUT).until(
                d -> toSelect.equals(textOf(credentialLabelInRow(rowIndex)).trim()));
        return this;
    }

    private By descriptionInRow(int rowIndex) {
        return By.xpath(row(rowIndex) + "//input[@placeholder='Description']");
    }

    public BranchSupplierGrid setDescriptionInRow(int rowIndex, String description) {
        By field = descriptionInRow(rowIndex);
        waitFor(TRANSIENT_TIMEOUT).until(d -> isPresent(field) && !isDisabledAttribute(field));
        typeVia(field, description);
        return this;
    }

    /**
     * Fully populates one supplier row: tick it, choose its credential, describe it. Returns the
     * supplier's name so the caller can record which suppliers the fixture actually carries -- the PCC
     * section's presence depends on them, so a later failure needs to be able to name them.
     */
    public String populateRow(int rowIndex, String credentialName, String description) {
        String supplierName = supplierNameInRow(rowIndex);
        selectRow(rowIndex);
        selectCredentialInRow(rowIndex, credentialName);
        setDescriptionInRow(rowIndex, description);
        return supplierName;
    }
}
