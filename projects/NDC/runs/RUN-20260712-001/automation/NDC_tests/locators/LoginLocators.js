// Locators Layer — platform_core_data/automation_framework.md §2.
// One class, one method per locator. No duplicate locators. Never imported by tests directly —
// only LoginPage (Pages Layer) may use this class.
class LoginLocators {
  Txt_Username() {
    return '#id-Username';
  }

  Txt_Password() {
    return '#id-Password';
  }

  Btn_Login() {
    return 'button:has-text("Login")';
  }

  Txt_ErrorMessage() {
    // No dedicated data-testid/role exists on this element (confirmed during Stage 2 Discovery,
    // 2026-07-12) — falls back to Locator Strategy priority level 3 (structural/semantic text
    // match), per automation_agent.md §24.2. Recommend the application add a stable
    // data-testid (e.g. data-testid="login-error") to move this to priority level 2.
    return 'text=Invalid credentials, Please try again.';
  }

  // Success signal — matches platform_core_data/browser/profile.json's login.successSelector exactly,
  // so Discovery and Automation never assert two different definitions of "logged in".
  Txt_DashboardSignal() {
    return 'text=Dashboard';
  }
}

module.exports = { LoginLocators };
