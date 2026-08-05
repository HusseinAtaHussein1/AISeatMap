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
}
