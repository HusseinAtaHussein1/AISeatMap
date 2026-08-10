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
     * Finding: N/A. Expected Result: Branch saved, success message "Added Successfully" (corrected
     * 2026-08-10 by user instruction; was "Pending for approval", which is the record's later Approval
     * Status value, not the submit-time success message).
     *
     * <p><b>Known coverage gap (2026-08-10).</b> The test case's Expected Result also requires the new
     * Branch to be retrievable under the {@code Inactive} status filter and absent from {@code Active}.
     * That assertion was added, then <b>reverted on instruction</b> after its first run: the submit
     * itself was blocked under headless with mandatory Product Access Description fields left empty,
     * while {@code BranchProvisioner}'s identical fill sequence succeeded in the same run -- so the cause
     * sits in the fill/headless interaction, not in the placement assertion. <b>This method therefore
     * verifies submit-time success only, not persistence</b>, which is the same gap that let an
     * unretrievable-record condition report green. Re-add the placement check once the create flow is
     * reliable; do not treat a pass here as proof a Branch was created.</p>
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
        addBranchPage.assertCountryEquals("Egypt");
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

    /*
     * TC-BR-026 (Warning Prompt (Days) rejects a value exceeding 11 digits) was REMOVED from this
     * suite on 2026-08-10 by module-owner instruction -- "leave this one alone and take it out of the
     * automation test cases" (FINDING-004, now Rejected/Dropped). The Stage 3 test case itself is
     * retained, unchanged, in the manual suite with Automation = Rejected; only its automation is gone.
     *
     * Not left disabled-in-place, because the instruction was to remove it from automation scope, and a
     * dormant @Test still reads as "in scope, temporarily off". Two independent reasons it should not be
     * resurrected as it stood: FINDING-016 (Credit Terms' 7-digit cap makes the 11-digit boundary
     * unreachable with legal data) is still open, and the assertion it used could never have been valid
     * anyway -- see the note on assertWarningPromptCappedAt11DigitsOrMessageShown in AddBranch_Page,
     * which reads back a value this suite sets via JS, bypassing the very maxlength it aims to test.
     */

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
     * TC-BR-038 -- Child Agencies Threshold Amount blocks submission when empty.
     * Requirement: PRD_UserStories.md US 6 §2 Branch Module. Tags: AssumptionBased, ExpectedImplementation
     * (Mandatory/Optional not explicitly stated by US 51489; assumed Mandatory per the live UI's asterisk).
     */
    @Test
    @Story("Negative - empty values")
    @Description("TC-BR-038: Child Agencies Threshold Amount blocks submission when empty")
    public void tcBr038_outstandingThresholdBlocksSubmissionWhenEmpty() {
        Set<String> skip = new HashSet<>();
        skip.add("outstandingThreshold");
        addBranchPage.fillMandatoryBaseline(skip);
        addBranchPage.clickSubmit();
        addBranchPage.assertSubmissionBlocked();
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
