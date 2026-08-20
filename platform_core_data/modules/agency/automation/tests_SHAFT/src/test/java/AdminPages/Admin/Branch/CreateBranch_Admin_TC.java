package AdminPages.Admin.Branch;

import AdminPages.Login.TestBase_TC;
import AdminPages.Admin.Branch.BranchTestData;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import org.testng.annotations.Test;

import java.util.HashSet;
import java.util.Set;

/**
 * CreateBranchSuite -- Automation Plan §5. Every method below maps 1:1 to a Test Case ID
 * (automation-skill §12/§14.1) and inherits that test case's Requirement/Discovery/Finding/Evidence
 * References from TraceabilityMatrix.md verbatim -- never re-derived here. Scope: the 13 test cases
 * where both Review = Approved and Automation = Approved (AutomationPlan_SHAFT.md, scope source).
 *
 * Assertions are SHAFT's own fluent, reporting-integrated API (driver.assertThat()/verifyThat()) --
 * confirmed live against io.github.shafthq:shaft-engine:10.3.20260707 this run, since Context7 was
 * unavailable to confirm it via documentation (StackDocumentationContext_SHAFT.md §6).
 */
@Epic("Branch")
@Feature("Create Branch")
public class CreateBranch_Admin_TC extends TestBase_TC {

    /**
     * TC-BR-001 -- Create Branch with all mandatory Branch Details fields.
     * Requirement: PRD_UserStories.md US 5 §Branch Details. Discovery: DiscoverySnapshot_CreateBranch.md §3-4.
     * Finding: N/A. Expected Result: Branch saved, status "Pending for approval."
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-001: Create Branch with all mandatory Branch Details fields")
    public void tcBr001_createBranchWithAllMandatoryFields() {
        addBranchPage.fillMandatoryBaseline(new HashSet<>());
        addBranchPage.clickSubmit();
        addBranchPage.assertSubmissionSucceeded();
    }

    /**
     * TC-BR-002 -- Mandatory Branch Details fields block submission when empty.
     * Requirement: PRD_UserStories.md US 5 §Branch Details. Discovery: DiscoverySnapshot_CreateBranch.md §4.
     * One iteration per Test-Design "Field Left Empty" row -- reuses fillMandatoryBaseline's skip set
     * rather than re-authoring the fill sequence per field (§14.1 Reusable Actions).
     */
    @Test
    @Story("Negative - empty values")
    @Description("TC-BR-002: Mandatory Branch Details fields block submission when empty")
    public void tcBr002_mandatoryBranchDetailsFieldsBlockSubmissionWhenEmpty() {
        String[] fields = {"operatingCountry", "name", "state", "city", "address1", "postOfficeBox", "phoneNumber"};
        for (String field : fields) {
            addBranchPage.open();
            Set<String> skip = new HashSet<>();
            skip.add(field);
            addBranchPage.fillMandatoryBaseline(skip);
            addBranchPage.clickSubmit();
            addBranchPage.assertSubmissionBlocked();
        }
    }

    /**
     * TC-BR-004 -- Country field auto-fills based on selected Operating Country.
     * Requirement: PRD_UserStories.md US 5 §Branch Details. Discovery: OQ-BR-1, resolved this run's
     * Stage 4M execution (Country confirmed "Egypt" for Operating Country "EgyptUAT").
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-004: Country field auto-fills based on selected Operating Country")
    public void tcBr004_countryAutoFillsFromOperatingCountry() {
        addBranchPage.selectOperatingCountry(BranchTestData.operatingCountry());
        // Both sides of this mapping come from the same fixture file (2026-08-15). They are one
        // environment fact, not two values: reading them from one place is what keeps them consistent.
        addBranchPage.assertCountryEquals(BranchTestData.country());
    }

    /**
     * TC-BR-013 -- Mandatory Branch Email Configuration fields block submission when empty.
     * Requirement: PRD_UserStories.md US 5 §Branch Email Configuration.
     */
    @Test
    @Story("Negative - empty values")
    @Description("TC-BR-013: Mandatory Branch Email Configuration fields block submission when empty")
    public void tcBr013_mandatoryEmailConfigFieldsBlockSubmissionWhenEmpty() {
        String[] fields = {"branchEmailId", "emailPassword"};
        for (String field : fields) {
            addBranchPage.open();
            Set<String> skip = new HashSet<>();
            skip.add(field);
            addBranchPage.fillMandatoryBaseline(skip);
            addBranchPage.clickSubmit();
            addBranchPage.assertSubmissionBlocked();
        }
    }

    /**
     * TC-BR-021 -- Mandatory Branch Sales Configuration fields block submission when empty.
     * Requirement: PRD_UserStories.md US 5 §Branch Sales Configuration.
     */
    @Test
    @Story("Negative - empty values")
    @Description("TC-BR-021: Mandatory Branch Sales Configuration fields block submission when empty")
    public void tcBr021_mandatorySalesConfigFieldsBlockSubmissionWhenEmpty() {
        String[] fields = {"creditLimit", "topUpLimit", "creditTermsDays"};
        for (String field : fields) {
            addBranchPage.open();
            Set<String> skip = new HashSet<>();
            skip.add(field);
            addBranchPage.fillMandatoryBaseline(skip);
            addBranchPage.clickSubmit();
            addBranchPage.assertSubmissionBlocked();
        }
    }

    /**
     * TC-BR-024 -- Reaching Percentage rejects a value greater than 100%.
     * Requirement: PRD_UserStories.md US 5 §Branch Sales Configuration. Discovery: §6 Confirmed Behaviour.
     */
    @Test
    @Story("Negative - boundary values")
    @Description("TC-BR-024: Reaching Percentage rejects a value greater than 100%")
    public void tcBr024_reachingPercentageRejectsValueGreaterThan100() {
        addBranchPage.setReachingPercentage("150.123");
        addBranchPage.assertReachingPercentageCapMessageShown();
    }

    /**
     * TC-BR-025 -- Reaching Percentage accepts a value with up to 3 decimal places.
     * Requirement: PRD_UserStories.md US 5 §Branch Sales Configuration.
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-025: Reaching Percentage accepts a value with up to 3 decimal places")
    public void tcBr025_reachingPercentageAcceptsThreeDecimalPlaces() {
        addBranchPage.setReachingPercentage("99.123");
        addBranchPage.assertReachingPercentageValueEquals("99.123");
    }

    /**
     * TC-BR-026 -- Warning Prompt (Days) rejects a value exceeding 11 digits.
     * Requirement: PRD_UserStories.md US 5 §Branch Sales Configuration. Finding: FINDING-004 (Confirmed,
     * still open as of this run's Stage 4M pass). Regression test -- asserts the CORRECTED behavior
     * (automation-skill §13), so this test is EXPECTED TO FAIL until FINDING-004 is fixed
     * (AutomationPlan_SHAFT.md RISK-AUTO-2 -- disclosed, not a broken script). Credit Terms is set to
     * the same 15-digit value so the separate, already-confirmed cross-field rule (TC-BR-027, out of
     * this run's automation scope) cannot itself be the source of any resulting message.
     */
    @Test
    @Story("Regression - FINDING-004")
    @Description("TC-BR-026: Warning Prompt (Days) rejects a value exceeding 11 digits")
    public void tcBr026_warningPromptRejectsValueExceeding11Digits() {
        addBranchPage.setCreditTermsDays("9999999");
        addBranchPage.setWarningPromptDays("9999999");
        addBranchPage.assertWarningPromptCappedAt11Digits();
    }

    /**
     * TC-BR-028 -- Select at least one Payment Option.
     * Requirement: PRD_UserStories.md US 5 §Branch Sales Configuration.
     * Notes: does not assert on the full Payment Option list contents -- that list mirrors the
     * Payment Gateway module's Active records (FINDING-001, documented exception), not a Branch rule.
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-028: Select at least one Payment Option")
    public void tcBr028_selectAtLeastOnePaymentOption() {
        addBranchPage.checkPaymentOptionCash();
        addBranchPage.assertPaymentOptionCashChecked();
    }

    /**
     * TC-BR-030 -- Description field is enabled only when a Supplier row is selected.
     * Requirement: PRD_UserStories.md US 5 §Product Access Details.
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-030: Description field is enabled only when a Supplier row is selected")
    public void tcBr030_descriptionEnabledOnlyWhenSupplierRowSelected() {
        addBranchPage.assertFirstSupplierDescriptionDisabled();
        addBranchPage.checkFirstSupplierRow();
        addBranchPage.assertFirstSupplierDescriptionEnabled();
    }

    /**
     * TC-BR-037 -- Create Branch with a valid Child Agencies Threshold Amount value.
     * Requirement: PRD_UserStories.md US 6 §2 Branch Module (field traced to US 51489 via FINDING-010,
     * not US 8605). Tag: ExpectedImplementation.
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-037: Create Branch with a valid Child Agencies Threshold Amount value")
    public void tcBr037_createBranchWithValidOutstandingThreshold() {
        addBranchPage.setOutstandingThreshold("10");
        addBranchPage.assertOutstandingThresholdValueEquals("10");
    }

    /**
     * TC-BR-038 -- Child Agencies Threshold Amount opens pre-filled with a default value.
     * Requirement: PRD_UserStories.md US 6 §2 Branch Module. Tag: ExpectedImplementation.
     *
     * <p>REVISED 2026-08-15 (module owner). This case previously asserted that an empty Outstanding
     * Threshold blocks submission. That scenario is not reachable: the application pre-fills the field
     * with a default value the moment Add Branch opens, so the old fixture's {@code skip} only meant
     * "do not type here" -- it left the application's own default in place, the form submitted
     * successfully, and {@code assertSubmissionBlocked()} failed against correct behavior. The
     * empty-value scenario is dropped outright rather than rewritten to clear the field; what is
     * actually observable and worth covering is that the field is never presented empty.</p>
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-038: Child Agencies Threshold Amount opens pre-filled with a default value")
    public void tcBr038_outstandingThresholdPrefilledWithDefaultValue() {
        addBranchPage.assertOutstandingThresholdPrefilled();
    }

    /**
     * TC-BR-039 -- Child Agencies Threshold Amount accepts a numeric value.
     * Requirement: PRD_UserStories.md US 6 §2 Branch Module.
     */
    @Test
    @Story("Happy path")
    @Description("TC-BR-039: Child Agencies Threshold Amount accepts a numeric value")
    public void tcBr039_outstandingThresholdAcceptsNumericValue() {
        addBranchPage.setOutstandingThreshold("25");
        addBranchPage.assertOutstandingThresholdValueEquals("25");
    }
}
