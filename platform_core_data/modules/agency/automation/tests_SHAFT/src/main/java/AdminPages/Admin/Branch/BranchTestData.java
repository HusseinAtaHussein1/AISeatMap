package AdminPages.Admin.Branch;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Shared Test Data fixture (Automation Plan §5 "Shared Test Data" / §14.1 "Test Data Separation") --
 * the one baseline dataset every "fill every other mandatory field with valid data" test case reuses,
 * read from branch_baseline.properties rather than hardcoded per test.
 */
public class BranchTestData {
    private static final Properties PROPS = new Properties();

    static {
        try (InputStream in = BranchTestData.class.getClassLoader()
                .getResourceAsStream("branch_baseline.properties")) {
            if (in != null) {
                PROPS.load(in);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load branch_baseline.properties", e);
        }
    }

    public static String operatingCountry() {
        return PROPS.getProperty("operatingCountry");
    }

    /**
     * The Country the application auto-fills from {@link #operatingCountry()}. Kept in the same file
     * as its Operating Country because the two are one mapping, not two independent values --
     * TC-BR-004 asserts that mapping directly, and TC-BR-046 drives the Search screen's Country
     * filter with it.
     */
    public static String country() {
        return PROPS.getProperty("country");
    }

    public static String state() {
        return PROPS.getProperty("state");
    }

    public static String city() {
        return PROPS.getProperty("city");
    }

    public static String address1() {
        return PROPS.getProperty("address1");
    }

    public static String postOfficeBox() {
        return PROPS.getProperty("postOfficeBox");
    }

    public static String phoneNumber() {
        return PROPS.getProperty("phoneNumber");
    }

    public static String emailPassword() {
        return PROPS.getProperty("emailPassword");
    }

    public static String contactName() {
        return PROPS.getProperty("contactName");
    }

    public static String contactPhoneNumber() {
        return PROPS.getProperty("contactPhoneNumber");
    }

    public static String creditLimit() {
        return PROPS.getProperty("creditLimit");
    }

    public static String topUpLimit() {
        return PROPS.getProperty("topUpLimit");
    }

    public static String creditTermsDays() {
        return PROPS.getProperty("creditTermsDays");
    }

    public static String outstandingThreshold() {
        return PROPS.getProperty("outstandingThreshold");
    }

    /**
     * Credential Name for the Product Access grid's selected supplier row -- mandatory once a row is
     * checked. Added by the 2026-08-06 healing pass (REPAIR-BR-002): the grid's Credential Name
     * dropdown had no fixture value and no page-object method, so the checked row was always
     * incomplete and no submission could ever succeed.
     */
    public static String credentialName() {
        return PROPS.getProperty("credentialName");
    }

    /** Sales Configuration target-amount fields, added by the same pass (REPAIR-BR-003). */
    public static String targetAmount() {
        return PROPS.getProperty("targetAmount");
    }

    public static String targetMonth() {
        return PROPS.getProperty("targetMonth");
    }

    public static String targetYear() {
        return PROPS.getProperty("targetYear");
    }

    public static String reachingPercentage() {
        return PROPS.getProperty("reachingPercentage");
    }

    public static String warningPromptDays() {
        return PROPS.getProperty("warningPromptDays");
    }

    /**
     * Free-text Description for the selected Product Access row. Moved here 2026-08-15 from a literal
     * inside {@code AddBranch_Page.fillMandatoryBaseline} -- a Page Object holds locators, actions,
     * synchronisation and page state, never the data typed into the form.
     */
    public static String productAccessDescription() {
        return PROPS.getProperty("productAccessDescription");
    }

    /**
     * Branch Code of a pre-existing STG record, for TC-BR-040's read-only search.
     *
     * <p><b>Independent of {@link #knownBranchName()} -- these are not a code/name pair.</b> They name
     * two different branches and serve two different test cases. See the header comment in
     * {@code branch_baseline.properties} for the live evidence behind that statement.</p>
     */
    public static String knownBranchCode() {
        return PROPS.getProperty("knownBranchCode");
    }

    /** Branch Name of a pre-existing STG record, for TC-BR-041's read-only search. See
     * {@link #knownBranchCode()} -- the two are independent fixtures, not a pair. */
    public static String knownBranchName() {
        return PROPS.getProperty("knownBranchName");
    }

    /**
     * Branch Code of a pre-existing STG record whose Approval Status is {@code Rejected}, for
     * TC-BR-054. Configured rather than scanned for because rejected records sit deep in the grid's
     * default ordering -- located live 2026-08-15 at page 18 of roughly 52, well past the test's
     * 10-page scan limit.
     */
    public static String knownRejectedBranchCode() {
        return PROPS.getProperty("knownRejectedBranchCode");
    }
}
