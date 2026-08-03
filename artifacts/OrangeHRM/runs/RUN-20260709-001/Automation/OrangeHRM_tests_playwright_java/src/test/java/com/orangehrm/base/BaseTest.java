package com.orangehrm.base;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Shared browser lifecycle for every test class in the Login & Access Suite.
 * One Playwright/Browser instance for the whole run; a fresh BrowserContext + Page
 * per test method, so every test is independent and idempotent without manual cleanup.
 */
public abstract class BaseTest {

    private static Playwright playwright;
    private static Browser browser;
    private static Properties config;

    protected BrowserContext context;
    protected Page page;

    @BeforeAll
    static void launchBrowser() {
        config = loadConfig();
        playwright = Playwright.create();
        boolean headless = Boolean.parseBoolean(config.getProperty("headless", "true"));
        browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setHeadless(headless));
    }

    @BeforeEach
    void createContext() {
        context = browser.newContext();
        context.setDefaultTimeout(Double.parseDouble(config.getProperty("default.timeout.ms", "30000")));
        page = context.newPage();
    }

    @AfterEach
    void closeContext() {
        if (context != null) {
            context.close();
        }
    }

    @AfterAll
    static void closeBrowser() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    protected static String baseUrl() {
        return config.getProperty("base.url");
    }

    protected static String loginPath() {
        return config.getProperty("login.path");
    }

    protected static double extendedTimeoutMs() {
        return Double.parseDouble(config.getProperty("extended.timeout.ms", "90000"));
    }

    private static Properties loadConfig() {
        Properties props = new Properties();
        try (InputStream in = BaseTest.class.getClassLoader().getResourceAsStream("config.properties")) {
            props.load(in);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config.properties", e);
        }
        return props;
    }
}
