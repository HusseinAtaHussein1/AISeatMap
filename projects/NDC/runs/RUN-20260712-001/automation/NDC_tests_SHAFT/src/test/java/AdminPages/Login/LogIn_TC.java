package AdminPages.Login;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileReader;
import java.nio.file.Path;

/**
 * NDC Login Test Suite — RUN-20260712-001, Stage 4 (Automation Agent).
 * Automates exactly TC-LOGIN-001 through TC-LOGIN-008, no more — every scenario traces to
 * NDC_TestCases_Login.md / NDC_TraceabilityMatrix.md. Target = "export a package compatible with
 * the Reference Project" (E:\Automation2\NDC-Uplift-Automation) — same package/class-name
 * conventions, reused locators, but this repository itself is untouched.
 */
public class LogIn_TC extends TestBase {

    private JsonObject testData;

    private JsonObject loadTestData() throws Exception {
        if (testData == null) {
            Path path = Path.of("src/test/resources/testDataFiles/loginTestData.json");
            try (FileReader reader = new FileReader(path.toFile())) {
                testData = JsonParser.parseReader(reader).getAsJsonObject();
            }
        }
        return testData;
    }

    // TC-LOGIN-001 — Valid login redirects to the Dashboard. Asserts on the documented success
    // signal (page title contains "Dashboard", matching browser/profile.json's successSelector
    // text=Dashboard), not a specific host — see FINDING-NDC-LOGIN-001.
    // Repaired 2026-07-12 (Automation Repair Loop, EXEC-20260712-001-001): original assertion
    // fired ~314ms after the click, before the redirect completed. Now polls the real end-state.
    @Test(priority = 1)
    public void validLoginRedirectsToDashboard() throws Exception {
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.loginWithValidCredential();
        Assert.assertTrue(login.waitForDashboardTitle(15));
    }

    // TC-LOGIN-002 — Invalid credentials (non-existent username) rejected with a generic message.
    // Repaired 2026-07-12 (Automation Repair Loop, EXEC-20260712-001-001): original attempt timed
    // out after ~60s with a blank-form screenshot (classified Inconclusive, not Automation Failure,
    // at execution time) — included in this repair pass per explicit instruction. Now polls at a
    // tighter interval immediately after the click instead of relying on SHAFT's default retry.
    @Test(priority = 2)
    public void invalidCredentialsShowGenericMessage() throws Exception {
        JsonObject invalid = loadTestData().getAsJsonObject("invalidLogin");
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.enterUsername(invalid.get("username").getAsString())
                .enterPassword(invalid.get("password").getAsString())
                .clickLogin();
        String message = login.waitForInvalidCredentialsMessage(10);
        Assert.assertEquals(message, invalid.get("expectedMessage").getAsString());
        Assert.assertTrue(login.currentUrl().contains("/auth/login"));
    }

    // TC-LOGIN-003 — Empty Username/Password (combined) blocked.
    // Repaired 2026-07-12 (Automation Repair Loop, EXEC-20260712-001-001): original assertion
    // expected "Username/Password is required" (copied from the Reference Project's own, stale
    // tests). Live app directly observed (this execution, 3x independently) to show plain
    // "Required" for both fields — corrected here in the automation only, per repair scope rules;
    // NDC_TestCases_Login.md is intentionally not touched by this repair (see NDC_ExecutionResults.md).
    @Test(priority = 3)
    public void emptyUsernameAndPasswordBlocked() {
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.enterUsername("").enterPassword("").clickLogin();
        Assert.assertEquals(login.getUsernameRequiredMessage(), "Required");
        Assert.assertEquals(login.getPasswordRequiredMessage(), "Required");
    }

    // TC-LOGIN-004 — Password field masks input. Structural check, no submission.
    @Test(priority = 4)
    public void passwordFieldIsMasked() {
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        Assert.assertEquals(login.getPasswordFieldType(), "password");
    }

    // TC-LOGIN-005 — Empty Username only (Password filled) blocked. Assumption-based.
    @Test(priority = 5)
    public void emptyUsernameOnlyBlocked() throws Exception {
        JsonObject invalid = loadTestData().getAsJsonObject("invalidLogin");
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.enterUsername("").enterPassword(invalid.get("password").getAsString()).clickLogin();
        // Repaired 2026-07-12 — see TC-LOGIN-003's comment for root cause/scope.
        Assert.assertEquals(login.getUsernameRequiredMessage(), "Required");
    }

    // TC-LOGIN-006 — Empty Password only (Username filled) blocked. Assumption-based.
    @Test(priority = 6)
    public void emptyPasswordOnlyBlocked() throws Exception {
        JsonObject invalid = loadTestData().getAsJsonObject("invalidLogin");
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.enterUsername(invalid.get("username").getAsString()).enterPassword("").clickLogin();
        // Repaired 2026-07-12 — see TC-LOGIN-003's comment for root cause/scope.
        Assert.assertEquals(login.getPasswordRequiredMessage(), "Required");
    }

    // TC-LOGIN-007 — Login button exposes a loading-indicator attribute. Structural check, no submission.
    @Test(priority = 7)
    public void loginButtonHasLoadingIndicatorAttribute() {
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        Assert.assertEquals(login.getLoginButtonLoadingIconAttribute(), "pi pi-spin pi-spinner");
    }

    // TC-LOGIN-008 — Anti-enumeration: wrong password against a real, valid username yields the
    // same generic message as TC-LOGIN-002. Exactly one attempt, per the shared-env negative-testing default.
    @Test(priority = 8)
    public void wrongPasswordForRealUsernameShowsSameGenericMessage() throws Exception {
        String wrongPassword = loadTestData().get("wrongPasswordForRealUsername").getAsString();
        LogIn_Page login = new LogIn_Page(driver).navigateToLogin();
        login.loginWithValidUsernameWrongPassword(wrongPassword);
        Assert.assertEquals(login.getInvalidCredentialsMessage(), "Invalid credentials, Please try again.");
        Assert.assertTrue(login.currentUrl().contains("/auth/login"));
    }
}
