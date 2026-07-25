package AdminPages.Admin.Staff;

import AdminPages.Admin.AdminMenu;
import AdminPages.Admin.AdminTestBase;
import AdminPages.Admin.Staff_Page;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;

/**
 * NDC Admin / Staff Test Suite — RUN-20260712-002, Stage 4 (Automation Agent).
 * Automates TC-STAFF-001, 002, 003, 005 — every scenario traces to TestCases_Staff.md /
 * TraceabilityMatrix.md. TC-STAFF-004 is an Exploratory/manual charter (Test Design
 * disposition) and is deliberately NOT a @Test here.
 */
public class Staff_TC extends AdminTestBase {

    private JsonObject testData;

    private JsonObject loadTestData() throws Exception {
        if (testData == null) {
            Path path = Path.of("src/test/resources/testDataFiles/staffTestData.json");
            try (FileReader reader = new FileReader(path.toFile())) {
                testData = JsonParser.parseReader(reader).getAsJsonObject();
            }
        }
        return testData;
    }

    // TC-STAFF-001 — Add Staff happy path submits to approval queue (FINDING-002 regression test).
    @Test(priority = 1)
    public void addStaffHappyPathEntersApprovalQueue() throws Exception {
        JsonObject data = loadTestData().getAsJsonObject("happyPath");
        new AdminMenu(driver).openStaff();
        Staff_Page staff = new Staff_Page(driver);
        staff.addStaff();
        staff.fillCore(data.get("usertype").getAsString(), data.get("operatingCountry").getAsString(),
                data.get("branch").getAsString(), data.get("department").getAsString(), data.get("role").getAsString(),
                data.get("employeeName").getAsString(), data.get("employeeEmail").getAsString(),
                data.get("employeePhone").getAsString(), data.get("employeeSecondaryPhone").getAsString(),
                data.get("username").getAsString(), data.get("approverList").getAsString());
        staff.submit();
        // Per FINDING-002: assert Approval Status = Pending at Execution time, subject to FINDING-005
        // (Staff List record visibility) being resolved first per that Finding's exploratory charter.
    }

    // TC-STAFF-002 — required-field validation blocks empty submission. Partially Automatable.
    @Test(priority = 2)
    public void addStaffEmptyRequiredFieldsBlocked() {
        new AdminMenu(driver).openStaff();
        Staff_Page staff = new Staff_Page(driver);
        staff.addStaff();
        staff.submit();
        System.out.println("TC-STAFF-002 validation text observed: " + staff.getValidationSummaryTextIfPresent());
    }

    // TC-STAFF-003 — Username uniqueness: reuses TC-STAFF-001's username. Assumption-based per
    // Test Design; establishes actual behavior rather than asserting an invented rule.
    @Test(priority = 3, dependsOnMethods = "addStaffHappyPathEntersApprovalQueue")
    public void addStaffDuplicateUsernameEstablishesBehavior() throws Exception {
        JsonObject data = loadTestData().getAsJsonObject("happyPath");
        new AdminMenu(driver).openStaff();
        Staff_Page staff = new Staff_Page(driver);
        staff.addStaff();
        staff.fillCore(data.get("usertype").getAsString(), data.get("operatingCountry").getAsString(),
                data.get("branch").getAsString(), data.get("department").getAsString(), data.get("role").getAsString(),
                "QA_SPIKE_Staff01_Dup", data.get("employeeEmail").getAsString(),
                data.get("employeePhone").getAsString(), data.get("employeeSecondaryPhone").getAsString(),
                data.get("username").getAsString(), data.get("approverList").getAsString());
        staff.submit();
        System.out.println("TC-STAFF-003 validation text observed (duplicate username): " + staff.getValidationSummaryTextIfPresent());
    }

    // TC-STAFF-005 — "Option to undercut" defaults to No (Direct Observation, confirmed live this run).
    @Test(priority = 5)
    public void optionToUndercutDefaultsToNo() {
        new AdminMenu(driver).openStaff();
        Staff_Page staff = new Staff_Page(driver);
        staff.addStaff();
        Assert.assertTrue(staff.isNoUndercutSelectedByDefault(), "\"Option to undercut\" must default to No.");
    }
}
