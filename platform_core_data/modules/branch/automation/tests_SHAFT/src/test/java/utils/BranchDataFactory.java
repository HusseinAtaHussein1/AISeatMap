package utils;

/**
 * Generates unique values per test run so repeated executions never collide on a prior run's data
 * (Automation Plan §7 -- "why nothing existing covers it": no such utility existed before this run).
 * Mirrors the uniqueness the Test Design suite's own Test Data implies for TC-BR-001
 * (e.g. "QA_BRANCH_001") without hardcoding one fixed, collidable value.
 */
public class BranchDataFactory {
    private BranchDataFactory() {
    }

    public static String uniqueBranchName() {
        return "QA_BRANCH_" + System.nanoTime();
    }

    public static String uniqueEmail(String prefix) {
        return prefix + "_" + System.nanoTime() + "@example.com";
    }
}
