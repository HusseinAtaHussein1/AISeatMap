# Discovery Snapshot — Login (Initial State)

- **Run:** RUN-20260706-002
- **Project Context:** v2 (Approved) — Login + PIM scope
- **URL:** https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
- **Timestamp:** 2026-07-06T14:12Z
- **Console:** 1 verbose (benign autocomplete suggestion), 0 errors, 0 warnings.
- **Screenshot:** `artifacts/OrangeHRM/runs/RUN-20260706-002/screenshots/login_initial.png`

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
```

## Observations

Unchanged from the baseline established in `RUN-20260706-001` (`discovery/login_initial.md`): two-field login form, demo credentials shown as static help text, no client-side required markers visible pre-submission.
