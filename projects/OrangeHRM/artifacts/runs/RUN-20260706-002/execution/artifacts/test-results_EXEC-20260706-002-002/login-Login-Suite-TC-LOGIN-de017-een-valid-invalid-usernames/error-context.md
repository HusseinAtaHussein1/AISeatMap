# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login Suite >> TC-LOGIN-010 [EXPLORATORY, FINDING-006]: forgot password response asymmetry between valid/invalid usernames
- Location: tests\login.spec.js:103:3

# Error details

```
Test timeout of 45000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestPasswordResetCode", waiting until "load"

```

# Test source

```ts
  1  | // Page Object — Forgot Password flow (/web/index.php/auth/requestPasswordResetCode)
  2  | // Confirmed via RUN-20260706-002/discovery/forgot_password_flow.md
  3  | class ForgotPasswordPage {
  4  |   /** @param {import('@playwright/test').Page} page */
  5  |   constructor(page) {
  6  |     this.page = page;
  7  |     this.usernameInput = page.getByRole('textbox', { name: 'Username' });
  8  |     this.resetButton = page.getByRole('button', { name: 'Reset Password' });
  9  |     this.resultHeading = page.locator('h6');
  10 |   }
  11 | 
  12 |   async goto() {
> 13 |     await this.page.goto('/web/index.php/auth/requestPasswordResetCode');
     |                     ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  14 |   }
  15 | 
  16 |   /**
  17 |    * Submits the Forgot Password form. NOTE: for a valid, existing username this is known
  18 |    * (FINDING-005) to hang until an nginx 504 — callers testing that specific case should
  19 |    * pass a generous timeout and expect this call to reject/time out until the bug is fixed.
  20 |    */
  21 |   async requestReset(username, { timeout } = {}) {
  22 |     await this.usernameInput.fill(username);
  23 |     await this.resetButton.click({ timeout });
  24 |   }
  25 | 
  26 |   async getResultHeadingText() {
  27 |     return this.resultHeading.innerText();
  28 |   }
  29 | }
  30 | 
  31 | module.exports = { ForgotPasswordPage };
  32 | 
```