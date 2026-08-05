package utilities;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Configuration Management (automation-skill §14.1): environment-specific values are read from
 * configuration, never hardcoded into test logic. Credentials are read from environment variables
 * only -- never from a checked-in file -- mirroring the platform's own credentials.json contract
 * (platform_core/tools/browser_driver/README.md §4), restated in this project's own terms since a
 * standalone Java project cannot read that Node-side file directly.
 */
public class EnvironmentConfig {
    private static final Properties PROPS = new Properties();

    static {
        try (InputStream in = EnvironmentConfig.class.getClassLoader()
                .getResourceAsStream("environment.properties")) {
            if (in != null) {
                PROPS.load(in);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load environment.properties", e);
        }
    }

    public static String baseUrl() {
        return PROPS.getProperty("baseUrl");
    }

    public static String addBranchUrl() {
        return baseUrl() + PROPS.getProperty("addBranchPath");
    }

    public static String branchListUrl() {
        return baseUrl() + PROPS.getProperty("branchListPath");
    }

    /**
     * Path fragment identifying the Update Branch screen. Used only to recognise whether the browser
     * is still on that screen after a submit -- the screen itself is always reached by clicking a
     * row's edit pen, never by direct navigation, because it needs a record id this suite does not
     * synthesise.
     */
    public static String editBranchPath() {
        return PROPS.getProperty("editBranchPath");
    }

    /**
     * Never hardcode a credential value (platform-wide rule, restated here). Set
     * BRANCH_QA_USERNAME / BRANCH_QA_PASSWORD as environment variables before running this suite --
     * never inside this file, never inside a test.
     */
    public static String username() {
        String value = System.getenv("BRANCH_QA_USERNAME");
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "BRANCH_QA_USERNAME environment variable is not set. Set it before running this suite; " +
                "never hardcode a credential value in source (see README.md \"Credentials\").");
        }
        return value;
    }

    public static String password() {
        String value = System.getenv("BRANCH_QA_PASSWORD");
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                "BRANCH_QA_PASSWORD environment variable is not set. Set it before running this suite; " +
                "never hardcode a credential value in source (see README.md \"Credentials\").");
        }
        return value;
    }
}
