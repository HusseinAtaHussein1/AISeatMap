# Discovery Snapshot — Login (Initial State)

- **Run:** RUN-20260706-001
- **Project Context:** `artifacts/OrangeHRM/context/OrangeHRM_ProjectContext.md` (v1, Approved)
- **Module (In Scope):** Login / Authentication & Access
- **URL:** https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
- **Timestamp:** 2026-07-06T10:24Z
- **Browser:** Chromium (Playwright MCP)
- **Logged-in user:** none (unauthenticated)
- **Screenshot:** `artifacts/OrangeHRM/runs/RUN-20260706-001/screenshots/login_initial.png`
- **Console:** 1 verbose message (DOM autocomplete-attribute suggestion on the password field) — 0 errors, 0 warnings.

## Accessibility Snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - img "company-branding" [ref=e8]
    - generic [ref=e9]:
      - heading "Login" [level=5] [ref=e10]
      - generic [ref=e11]:
        - generic [ref=e13]:
          - paragraph [ref=e14]: "Username : Admin"
          - paragraph [ref=e15]: "Password : admin123"
        - generic [ref=e16]:
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]: 
              - generic [ref=e21]: Username
            - textbox "Username" [active] [ref=e23]
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]: 
              - generic [ref=e28]: Password
            - textbox "Password" [ref=e30]
          - button "Login" [ref=e32] [cursor=pointer]
          - paragraph [ref=e34] [cursor=pointer]: Forgot your password?
      - generic [ref=e35]:
        - generic [ref=e36]:
          - link [ref=e37] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/orangehrm/mycompany/
          - link [ref=e40] [cursor=pointer]:
            - /url: https://www.facebook.com/OrangeHRM/
          - link [ref=e43] [cursor=pointer]:
            - /url: https://twitter.com/orangehrm?lang=en
          - link [ref=e46] [cursor=pointer]:
            - /url: https://www.youtube.com/c/OrangeHRMInc
        - generic [ref=e49]:
          - paragraph [ref=e50]: OrangeHRM OS 5.8
          - paragraph [ref=e51]:
            - text: © 2005 - 2026
            - link "OrangeHRM, Inc" [ref=e52] [cursor=pointer]:
              - /url: http://www.orangehrm.com
            - text: . All rights reserved.
  - img "orangehrm-logo" [ref=e54]
```

## Observations

- The login form exposes exactly two fields (Username, Password) plus a "Login" button and a "Forgot your password?" link — matches PRD FR-1.
- The page **itself displays the valid demo credentials** ("Username : Admin", "Password : admin123") as static help text — this is a demo-instance convenience, not a documented PRD requirement (PRD is silent on this). Logged as an Observation candidate (see QA Assessment Report).
- No client-side required-field markers (`*`) visible on Username/Password, unlike other in-app forms (e.g., PIM's "Employee Full Name*"). Consistent with a simple login form; to be tested via empty-submission next.
