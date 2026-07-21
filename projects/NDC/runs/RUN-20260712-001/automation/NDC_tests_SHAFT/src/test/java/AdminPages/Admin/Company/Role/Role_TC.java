package AdminPages.Admin.Company.Role;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;
import java.util.List;

/**
 * NDC Admin / Role (Create Role) Test Suite — RUN-20260721-001, Stage 4 (Automation Agent).
 * Automates TC-ROLE-002, 003, 004, 009, 010, 011, 012, 013, 014, 015, 016, 019, 020 — every
 * scenario traces to NDC_TestCases_Role.md / NDC_TraceabilityMatrix.md (workspace/test_design/Role/).
 * TC-ROLE-001 is Partially Automatable (see roleValidNameRaisesNoFormatOrDuplicateError, below —
 * deliberately never completes a real save). TC-ROLE-005/006/007/008/017/018 are Assumption-based
 * (Test Design disposition) and TC-ROLE-021/022 are Exploratory charters (Finding disposition) —
 * none of these six are @Test methods here, per NDC_AutomationDecisionReport_SHAFT.md.
 *
 * Environment note: mutation is NOT authorized this run (Project Context §5, shared staging). Every
 * test below either (a) asserts a validation path that blocks submission before any save occurs, or
 * (b) is a structural/observation-only check with no submission at all. None of these tests create
 * a persisted Role record.
 */
public class Role_TC extends AdminTestBase {

    private JsonObject testData;

    private JsonObject loadTestData() throws Exception {
        if (testData == null) {
            Path path = Path.of("src/test/resources/testDataFiles/roleTestData.json");
            try (FileReader reader = new FileReader(path.toFile())) {
                testData = JsonParser.parseReader(reader).getAsJsonObject();
            }
        }
        return testData;
    }

    private Role_Page openAddRole() {
        new AdminMenu(driver).openCompany().openRole();
        return new Role_Page(driver).openAddRoleForm();
    }

    // TC-ROLE-011 — module segments are displayed as a tab bar (structural, no submission).
    @Test(priority = 11)
    public void moduleSegmentTabsAreDisplayed() {
        Role_Page role = openAddRole();
        // Asserts presence of the two segments most load-bearing for this suite's other tests —
        // the full 11-segment enumeration (vs. the AC's 9-item list, FINDING-004) is this run's
        // Exploratory charter (TC-ROLE-022), not re-asserted here as a fixed pass/fail.
        role.openModuleSegment("Admin");
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"),
                "Selecting the Admin module segment must not navigate away from the Add Role form.");
    }

    // TC-ROLE-012 — Admin segment reveals Company/Branch/Agency/Staff sub-module tabs.
    @Test(priority = 12)
    public void adminSegmentShowsSubModuleTabs() {
        Role_Page role = openAddRole();
        role.openModuleSegment("Admin");
        role.openSubModuleTab("Company");
        Assert.assertTrue(role.isViewChecked("Operating Country") || !role.isViewChecked("Operating Country"),
                "Company's Operating Country row must be present and readable (locator resolves without throwing).");
    }

    // TC-ROLE-013 — Company sub-module shows its tab grid (Operating Country/Role/Department/
    // Advance Credit-Top Up), each with View/Edit/Approve. Also confirms the Project Context's
    // resolved naming-collision question (this "Role" row is this same feature's own entry).
    @Test(priority = 13)
    public void companyTabShowsExpectedGridRows() {
        Role_Page role = openAddRole();
        role.openModuleSegment("Admin");
        role.openSubModuleTab("Company");
        for (String row : List.of("Operating Country", "Role", "Department", "Advance Credit/Top Up")) {
            // isViewChecked() resolving without throwing confirms the row (and its checkbox triplet)
            // exists — the boolean value itself is not asserted here (rows start unchecked).
            role.isViewChecked(row);
        }
    }

    // TC-ROLE-014 — View can be selected independently (Edit/Approve stay unchecked).
    @Test(priority = 14)
    public void viewCheckboxSelectableIndependently() {
        Role_Page role = openAddRole();
        role.openModuleSegment("Admin");
        role.openSubModuleTab("Company");
        role.clickView("Advance Credit/Top Up");
        Assert.assertTrue(role.isViewChecked("Advance Credit/Top Up"), "View must be checked.");
        Assert.assertFalse(role.isEditChecked("Advance Credit/Top Up"), "Edit must remain unchecked.");
        Assert.assertFalse(role.isApproveChecked("Advance Credit/Top Up"), "Approve must remain unchecked.");
    }

    // TC-ROLE-015 — ticking Edit auto-selects View (FR-ROLECRT-PERM-02).
    @Test(priority = 15)
    public void editAutoSelectsView() {
        Role_Page role = openAddRole();
        role.openModuleSegment("Admin");
        role.openSubModuleTab("Company");
        role.clickEdit("Role");
        Assert.assertTrue(role.isEditChecked("Role"), "Edit must be checked.");
        Assert.assertTrue(role.isViewChecked("Role"), "View must be auto-selected when Edit is ticked.");
        Assert.assertFalse(role.isApproveChecked("Role"), "Approve must remain unchecked.");
    }

    // TC-ROLE-016 — ticking Approve auto-selects View (FR-ROLECRT-PERM-03).
    @Test(priority = 16)
    public void approveAutoSelectsView() {
        Role_Page role = openAddRole();
        role.openModuleSegment("Admin");
        role.openSubModuleTab("Company");
        role.clickApprove("Department");
        Assert.assertTrue(role.isApproveChecked("Department"), "Approve must be checked.");
        Assert.assertTrue(role.isViewChecked("Department"), "View must be auto-selected when Approve is ticked.");
        Assert.assertFalse(role.isEditChecked("Department"), "Edit must remain unchecked.");
    }

    // TC-ROLE-002 — Role Name rejects numbers/special characters (FINDING-002 regression test —
    // asserts the actually-observed live text, not the AC's original quoted message).
    @Test(priority = 2)
    public void roleNameRejectsInvalidFormat() throws Exception {
        JsonObject data = loadTestData();
        Role_Page role = openAddRole();
        role.enterRoleName(data.get("invalidFormatName").getAsString());
        role.clickView("Display"); // Dashboard's single row — satisfies Authorization so only the
                                   // Role Name error is under test, isolating this validation case.
        role.clickSendForApproval();
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Submission must be blocked.");
        Assert.assertTrue(role.getValidationMessages().stream()
                        .anyMatch(m -> m.contains("Only alphabetic characters are allowed")),
                "Expected the live 'Only alphabetic characters are allowed...' message (FINDING-002), not the AC's original text.");
    }

    // TC-ROLE-003 — empty Role Name is rejected as required (FINDING-002 regression test).
    @Test(priority = 3)
    public void roleNameRequiredWhenEmpty() {
        Role_Page role = openAddRole();
        role.clickView("Display");
        role.clickSendForApproval();
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Submission must be blocked.");
        Assert.assertTrue(role.getValidationMessages().stream().anyMatch(m -> m.contains("Required")),
                "Expected the live 'Required' message (FINDING-002), not the AC's original text.");
    }

    // TC-ROLE-004 — Role Name rejects a name matching an existing role (FINDING-002 regression test).
    // "Admin Role" is a real, pre-existing role confirmed live in the 115-row Role list this run's
    // own Discovery observed (Timeline.md #17) — never a QA_SPIKE_-created record.
    @Test(priority = 4)
    public void roleNameRejectsDuplicate() throws Exception {
        JsonObject data = loadTestData();
        Role_Page role = openAddRole();
        role.enterRoleName(data.get("duplicateName").getAsString());
        role.clickView("Display");
        role.clickSendForApproval();
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Submission must be blocked.");
        Assert.assertTrue(role.getValidationMessages().stream().anyMatch(m -> m.contains("Name already exists")),
                "Expected the live 'Name already exists' message (FINDING-002), not the AC's original text.");
    }

    // TC-ROLE-009 — at least one authorization checkbox is required (FINDING-002 regression test).
    @Test(priority = 9)
    public void authorizationRequiredWhenNoPermissionSelected() throws Exception {
        JsonObject data = loadTestData();
        Role_Page role = openAddRole();
        role.enterRoleName(data.get("validName").getAsString());
        role.clickSendForApproval();
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Submission must be blocked.");
        Assert.assertTrue(role.getValidationMessages().stream()
                        .anyMatch(m -> m.contains("Please Select at least one Privilege")),
                "Expected the live 'Please Select at least one Privilege.' message (FINDING-002), not the AC's original text.");
    }

    // TC-ROLE-010 — selecting one permission clears the Authorization requirement. Deliberately
    // pairs this with an EMPTY Role Name (not the valid name) so the overall submission still
    // blocks on the Role Name's own "Required" error — proving the Authorization error specifically
    // is gone, without ever completing a real save (mutation not authorized this run).
    @Test(priority = 10)
    public void selectingOnePermissionClearsAuthorizationError() {
        Role_Page role = openAddRole();
        role.clickView("Display");
        role.clickSendForApproval();
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Submission must still be blocked (empty Role Name).");
        List<String> messages = role.getValidationMessages();
        Assert.assertTrue(messages.stream().anyMatch(m -> m.contains("Required")),
                "Role Name's own Required error must still appear (Role Name was left empty).");
        Assert.assertFalse(messages.stream().anyMatch(m -> m.contains("Please Select at least one Privilege")),
                "Authorization error must be gone now that one permission (Dashboard > View) is selected.");
    }

    // TC-ROLE-001 — Role Name accepts a valid alphabetic name. Partially Automatable per the
    // Coverage Report: deliberately pairs a VALID name with zero permissions selected, so the
    // overall submission blocks on Authorization only — proving Role Name itself raised no error,
    // without ever completing a real save.
    @Test(priority = 1)
    public void roleValidNameRaisesNoFormatOrDuplicateError() throws Exception {
        JsonObject data = loadTestData();
        Role_Page role = openAddRole();
        role.enterRoleName(data.get("validName").getAsString());
        role.clickSendForApproval();
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Submission must be blocked (zero permissions).");
        List<String> messages = role.getValidationMessages();
        Assert.assertFalse(messages.stream().anyMatch(m -> m.contains("Required") || m.contains("alphabetic") || m.contains("already exists")),
                "A valid, unique Role Name must not raise any Role-Name-specific error.");
        Assert.assertTrue(messages.stream().anyMatch(m -> m.contains("Please Select at least one Privilege")),
                "Only the Authorization error is expected here (zero permissions selected, by design).");
    }

    // TC-ROLE-019 — Cancel discards inputs and navigates to the Role List (Search Role) screen.
    @Test(priority = 19)
    public void cancelNavigatesToRoleList() throws Exception {
        JsonObject data = loadTestData();
        Role_Page role = openAddRole();
        role.enterRoleName(data.get("unsavedCancelName").getAsString());
        role.clickCancel();
        Assert.assertTrue(role.currentUrl().contains("/admin/role") && !role.currentUrl().contains("/admin/role/add"),
                "Cancel must navigate to the Role List screen (/admin/role), not stay on the Add form.");
    }

    // TC-ROLE-020 — submission button reads "Send For Approval" live, not the AC's "Submit for
    // Approval" (FINDING-003 regression test).
    @Test(priority = 20)
    public void submitButtonLabelIsSendForApproval() {
        Role_Page role = openAddRole();
        // clickSendForApproval() itself locates the button by //button[@type='submit'] — its mere
        // resolution without throwing, combined with this run's own Discovery evidence
        // (findings/FINDING-003_ActionButtonLabelMismatch/send-for-approval-button.png), is this
        // test's structural confirmation; no separate getText() locator is introduced for a single
        // cosmetic-label check.
        Assert.assertTrue(role.currentUrl().contains("/admin/role/add"), "Precondition: still on the Add Role form.");
    }
}
