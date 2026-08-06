package utilities;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Configuration Management (automation-skill §14.1): environment-specific values are read from
 * configuration, never hardcoded into test logic. Both the non-secret values (from
 * environment.properties) and the QA credentials are centralised here, so no test class ever
 * carries an environment-specific literal of its own.
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
     * Super Admin credentials for the QA environment, held here rather than in environment
     * variables so a generated suite runs from any terminal or IDE with no setup step. They live in
     * this one class only -- never inside a test -- so pointing a suite at a different environment
     * stays a single-file change alongside {@code environment.properties}.
     */
    private static final String USERNAME = "odeysysadmin";
    private static final String PASSWORD = "qqE6)Cxp6>B8";

    public static String username() {
        return USERNAME;
    }

    public static String password() {
        return PASSWORD;
    }
}
