# NDC — Timeline (RUN-20260712-001)

| Time (session-relative) | Action | Discovery Mode | Result |
|---|---|---|---|
| T+0 | Navigate to `http://192.168.1.70` (login screen) | Browser Automation | Login screen rendered, title "NDC" |
| T+1 | Capture screenshot + DOM structure (inputs/buttons/links) | Browser Automation | 2 inputs, 1 submit button, 1 "Forgot Password?" link identified |
| T+2 | Submit login with fabricated non-existent username/password | Browser Automation | Remained on `/auth/login`; message "Invalid credentials, Please try again." |
| T+3 | Capture screenshot of invalid-attempt state | Browser Automation | `login_screen_invalid_attempt.png` |
| T+4 | Authenticate via `BrowserDriver` with the existing valid project credential | Browser Automation | Redirected to `http://192.168.1.80/dashboard`, title "NDC - Dashboard" — see FINDING-NDC-LOGIN-001 |
| T+5 | Capture screenshot of post-login state; check for unexpected dialogs | Browser Automation | No dialog captured |

No Skipped/Blocked/Unreachable events this run — the single in-scope screen (Login) was fully reachable and observed.
