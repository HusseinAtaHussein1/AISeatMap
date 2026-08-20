package AdminPages.Admin.Agency;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Shared Test Data fixture for the Agency suite (automation-skill §14.1, Test Data Separation) -- the
 * one baseline dataset every "fill every other mandatory field with valid data" case reuses, read from
 * {@code agency_baseline.properties} rather than hardcoded per test.
 *
 * <p>Mirrors {@link AdminPages.Admin.Branch.BranchTestData} deliberately: same loading mechanism, same
 * accessor shape, same rule that test data never lives inside a Page Object.
 *
 * <p><b>Unset keys fail loudly.</b> {@link #required(String)} throws naming the missing key, because a
 * silent {@code null} would be typed into a field as the literal text "null" and the resulting failure
 * would look like an application defect rather than a missing fixture value.
 */
public final class AgencyTestData {

    private static final Properties PROPS = new Properties();

    static {
        try (InputStream in = AgencyTestData.class.getClassLoader()
                .getResourceAsStream("agency_baseline.properties")) {
            if (in == null) {
                throw new IllegalStateException(
                        "agency_baseline.properties was not found on the classpath. The Agency suite cannot "
                                + "run without its baseline fixture data.");
            }
            PROPS.load(in);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load agency_baseline.properties", e);
        }
    }

    private AgencyTestData() {
    }

    private static String required(String key) {
        String value = PROPS.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("agency_baseline.properties is missing a value for \"" + key
                    + "\". Set it rather than letting the suite type an empty or null value into the form.");
        }
        return value.trim();
    }

    /**
     * The Country the application auto-fills from the selected Branch. <b>Asserted, never entered</b> --
     * the field is verified {@code readonly} on both the Add and Update forms.
     */
    public static String country() {
        return required("country");
    }

    public static String state() {
        return required("state");
    }

    public static String city() {
        return required("city");
    }

    public static String address1() {
        return required("address1");
    }

    public static String postOfficeBox() {
        return required("postOfficeBox");
    }

    public static String invoiceGeneration() {
        return required("invoiceGeneration");
    }

    public static String creditLimit() {
        return required("creditLimit");
    }

    public static String topUpLimit() {
        return required("topUpLimit");
    }

    public static String creditTermsDays() {
        return required("creditTermsDays");
    }

    /** One of the three Payment options that names a real payment method -- see FINDING-011. */
    public static String paymentOption() {
        return required("paymentOption");
    }

    public static String contractStartDate() {
        return required("contractStartDate");
    }

    public static String contractEndDate() {
        return required("contractEndDate");
    }

    /**
     * The known, reusable Branch fixture (operator instruction, 2026-08-20): {@code ""} when unset, so
     * the caller falls back to building a fresh Branch rather than throwing. Unlike every other value in
     * this class, this one is legitimately optional -- removing it is exactly how the suite is meant to
     * revert to {@code SupplierBranchProvisioner.createApprovedBranchWithSuppliers}.
     */
    public static String knownApprovedBranchCode() {
        return PROPS.getProperty("knownApprovedBranchCode", "").trim();
    }

    public static String knownApprovedBranchName() {
        return PROPS.getProperty("knownApprovedBranchName", "").trim();
    }

    /** Comma-separated in the properties file; returned as configured. */
    public static java.util.List<String> knownApprovedBranchSuppliers() {
        String raw = PROPS.getProperty("knownApprovedBranchSuppliers", "").trim();
        if (raw.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        java.util.List<String> suppliers = new java.util.ArrayList<>();
        for (String supplier : raw.split(",")) {
            suppliers.add(supplier.trim());
        }
        return suppliers;
    }
}
