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
     * Path fragment identifying the Add Branch screen, for recognising whether the browser is still
     * on that screen after a submit. Added 2026-08-15: {@code AddBranch_Page} carried this path as a
     * literal in two places, a third copy of a value {@code environment.properties} already held, so
     * repointing the suite at an environment with a different route would have left those two checks
     * silently testing the old path.
     */
    public static String addBranchPath() {
        return PROPS.getProperty("addBranchPath");
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
     * variables so the suite runs from any terminal or IDE with no setup step. They live in this
     * one class only -- never inside a test -- so pointing the suite at a different environment
     * stays a single-file change alongside {@code environment.properties}.
     */
    // ── Agency routes (added by run-004, Stage 4A) ────────────────────────────────────────────

    public static String agencyListUrl() {
        return baseUrl() + agencyListPath();
    }

    public static String addAgencyUrl() {
        return baseUrl() + addAgencyPath();
    }

    public static String agencyListPath() {
        return PROPS.getProperty("agencyListPath", "/admin/agency");
    }

    public static String addAgencyPath() {
        return PROPS.getProperty("addAgencyPath", "/admin/agency/add");
    }

    /**
     * Recognition only -- never a navigation target. The Update Agency screen is reached by clicking a
     * row's edit pen; a direct visit to this path renders an empty shell whose locators still resolve
     * (verified live 2026-08-18). See {@code editBranchPath()} above, which carries the same warning
     * for the same reason on the Branch screen.
     */
    public static String editAgencyPath() {
        return PROPS.getProperty("editAgencyPath", "/admin/agency/edit");
    }

    private static final String USERNAME = "odeysysadmin";
    private static final String PASSWORD = "qqE6)Cxp6>B8";

    public static String username() {
        return USERNAME;
    }

    public static String password() {
        return PASSWORD;
    }
}
