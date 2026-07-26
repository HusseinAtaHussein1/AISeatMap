#!/usr/bin/env bash
# Builds three realistic target-project fixtures for end-to-end verification.
set -euo pipefail

BASE="${1:?usage: make-fixtures.sh <base-dir>}"
rm -rf "$BASE"
mkdir -p "$BASE"

# ---------------------------------------------------------------------------------------------
# 1. Brownfield Node + Playwright, with an existing suite and its own conventions
# ---------------------------------------------------------------------------------------------
APP="$BASE/brownfield-playwright"
mkdir -p "$APP/src/components" "$APP/tests/e2e/pages" "$APP/tests/e2e/fixtures" "$APP/.github/workflows"

cat > "$APP/package.json" <<'JSON'
{
  "name": "shop-web",
  "version": "2.3.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test:e2e": "playwright test"
  },
  "dependencies": { "react": "18.3.1", "react-dom": "18.3.1" },
  "devDependencies": { "@playwright/test": "1.61.1", "typescript": "5.4.5", "vite": "5.2.0" }
}
JSON

cat > "$APP/package-lock.json" <<'JSON'
{
  "name": "shop-web",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/@playwright/test": { "version": "1.61.1" },
    "node_modules/react": { "version": "18.3.1" },
    "node_modules/typescript": { "version": "5.4.5" }
  }
}
JSON

cat > "$APP/playwright.config.ts" <<'TS'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://staging.shop.example',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
TS

cat > "$APP/tests/e2e/user-login.spec.ts" <<'TS'
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('authentication', () => {
  test('a registered user can sign in', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signIn('demo@example.com', 'correct-horse');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
TS

cat > "$APP/tests/e2e/guest-checkout.spec.ts" <<'TS'
import { test, expect } from '@playwright/test';

test('a guest can complete checkout', async ({ page }) => {
  await page.goto('/cart');
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page).toHaveURL(/\/checkout/);
});
TS

cat > "$APP/tests/e2e/pages/LoginPage.ts" <<'TS'
import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
TS

cat > "$APP/tests/e2e/fixtures/users.ts" <<'TS'
export const users = { demo: { email: 'demo@example.com' } };
TS

cat > "$APP/src/components/Cart.tsx" <<'TSX'
export const Cart = () => null;
TSX

cat > "$APP/.github/workflows/ci.yml" <<'YML'
name: ci
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
YML

cat > "$APP/.env" <<'ENV'
API_SECRET=super-secret-value
ENV

cat > "$APP/.gitignore" <<'GI'
node_modules/
dist/
.env
GI

# ---------------------------------------------------------------------------------------------
# 2. Brownfield Maven + SHAFT, tests at depth 6
# ---------------------------------------------------------------------------------------------
JAPP="$BASE/brownfield-shaft"
mkdir -p "$JAPP/src/main/java/com/company/app" \
         "$JAPP/src/main/resources/properties" \
         "$JAPP/src/test/java/com/company/tests" \
         "$JAPP/src/test/java/com/company/pages"

cat > "$JAPP/pom.xml" <<'XML'
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.company</groupId>
  <artifactId>portal-automation</artifactId>
  <version>1.0.0</version>
  <dependencies>
    <dependency>
      <groupId>io.github.shafthq</groupId>
      <artifactId>SHAFT_ENGINE</artifactId>
      <version>9.1.20240310</version>
    </dependency>
    <dependency>
      <groupId>org.testng</groupId>
      <artifactId>testng</artifactId>
      <version>7.10.1</version>
    </dependency>
  </dependencies>
</project>
XML

cat > "$JAPP/testng.xml" <<'XML'
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="Regression">
  <test name="Login">
    <classes><class name="com.company.tests.LoginTest"/></classes>
  </test>
</suite>
XML

cat > "$JAPP/src/main/resources/properties/path.properties" <<'PROPS'
executionAddress=local
PROPS

cat > "$JAPP/src/test/java/com/company/tests/LoginTest.java" <<'JAVA'
package com.company.tests;

import com.company.pages.LoginPage;
import org.testng.annotations.Test;

public class LoginTest {
    @Test
    public void registeredUserCanSignIn() {
        LoginPage login = new LoginPage();
        login.open();
    }
}
JAVA

cat > "$JAPP/src/test/java/com/company/pages/LoginPage.java" <<'JAVA'
package com.company.pages;

public class LoginPage {
    public void open() {
    }
}
JAVA

cat > "$JAPP/src/main/java/com/company/app/App.java" <<'JAVA'
package com.company.app;

public class App {
}
JAVA

# ---------------------------------------------------------------------------------------------
# 3. Greenfield — a real app with no tests at all
# ---------------------------------------------------------------------------------------------
GAPP="$BASE/greenfield-node"
mkdir -p "$GAPP/src"

cat > "$GAPP/package.json" <<'JSON'
{
  "name": "brand-new-api",
  "version": "0.1.0",
  "scripts": { "start": "node src/index.js" },
  "dependencies": { "express": "4.19.2" }
}
JSON

cat > "$GAPP/src/index.js" <<'JS'
const express = require('express');
const app = express();
app.get('/health', (_req, res) => res.json({ ok: true }));
module.exports = app;
JS

# git-init each so the lifecycle phases have real repositories to work against
for d in "$APP" "$JAPP" "$GAPP"; do
  git -C "$d" init -q
  git -C "$d" config user.email "dev@example.com"
  git -C "$d" config user.name "Dev"
  git -C "$d" config commit.gpgsign false
  git -C "$d" add -A
  git -C "$d" commit -q -m "initial commit"
done

echo "fixtures ready in $BASE"
ls -1 "$BASE"
