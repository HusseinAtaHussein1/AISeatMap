package utilities;

/**
 * Generates unique, synthetic Agency field values so repeated executions never collide with a prior
 * run's records. Mirrors {@link BranchDataFactory}'s role and shape deliberately rather than inventing
 * a second convention.
 *
 * <p><b>Why uniqueness matters more here than convenience.</b> STG has no DELETE (ProjectContext
 * PO-3): every execution's records are permanent. A fixed literal such as {@code "QA_AGENCY_001"}
 * would collide on the second run and the failure would look like a validation defect rather than a
 * data-reuse problem.</p>
 *
 * <p><b>Nothing here is real.</b> PO-4 requires synthetic, non-sensitive test data. The email domain
 * is {@code example.com} (RFC 2606, reserved and unroutable), phone numbers are in a reserved range,
 * and the URL uses {@code example.com} for the same reason -- no value generated here can reach a real
 * mailbox, phone, or host.</p>
 */
public final class AgencyDataFactory {

    private AgencyDataFactory() {
    }

    /** Provenance-tagged agency name. Digits and underscores only -- the shape this suite has proven acceptable. */
    public static String uniqueAgencyName() {
        return "QA_AGENCY_" + System.nanoTime();
    }

    /**
     * <b>REPAIR-AG-009 (2026-08-19, Stage 5H).</b> Letters and a space only -- no digits, no underscore.
     * Confirmed live: {@code "QA_Contact_" + nanoTime()} was rejected with
     * {@code "Please enter a valid contact Person"}. Uniqueness is not needed here -- this field is
     * never looked up by value the way Agency Name is -- so a fixed, letter-only name is used instead of
     * inventing a synthetic naming scheme this field's own validation does not accept.
     */
    public static String uniqueContactPerson() {
        return "QA Contact Person";
    }

    /** Same correction as {@link #uniqueContactPerson()}, for the same reason (REPAIR-AG-009). */
    public static String uniqueSalesContactName() {
        return "QA Sales Contact";
    }

    /** RFC 2606 reserved domain -- deliverable to nobody, by design. */
    public static String uniqueEmail(String prefix) {
        return prefix + "_" + System.nanoTime() + "@example.com";
    }

    /**
     * A phone number in a reserved, non-dialable range. Length is fixed at a plausible 10 digits
     * because the form's own format rules are only partially documented (FINDING-010 recorded that
     * input-format guidance is absent from the UI), so this factory does not attempt to satisfy a rule
     * nobody has stated -- it supplies a conventional value and lets the assertion do the judging.
     */
    /**
     * <b>REPAIR-AG-010 (2026-08-19, Stage 5H).</b> Confirmed live: a {@code 555}-prefixed number was
     * rejected with {@code "Please enter valid phone number"} on every phone field on the Agency form --
     * {@code 555} is the conventional reserved-for-fiction prefix and this validator evidently blocks
     * it specifically, not just malformed shapes. {@code branch_baseline.properties}' own accepted
     * {@code phoneNumber=1001234567} does not use that prefix, which is the clue this correction follows:
     * the leading digits are changed to {@code 10}, matching the Branch fixture's own proven-accepted
     * shape, while the trailing digits stay derived from {@link System#nanoTime()} for uniqueness.
     */
    public static String uniquePhoneNumber() {
        String tail = String.valueOf(System.nanoTime());
        return "10" + tail.substring(tail.length() - 8);
    }

    public static String uniqueRemarks(String purpose) {
        return "QA automated check: " + purpose + " [" + System.nanoTime() + "]";
    }
}
