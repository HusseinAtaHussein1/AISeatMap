package AdminPages.Admin.Branch;

/**
 * The three approval states a Branch record can be in, as the application renders them.
 *
 * <p><b>Why this type exists (added 2026-08-15).</b> The literal {@code "Pending for approval"} was
 * written out in three separate files -- {@code UpdateBranch_TC}, {@code SearchBranch_TC} and
 * {@code AddBranch_Page} -- and {@code "Approved"} in two. Every copy is the same expected business
 * value, so a rename in the application would have had to be found and corrected in each place
 * independently, with nothing to signal that a missed copy existed.</p>
 *
 * <p>This mirrors the shape {@link SearchBranch_Page.Status} already uses for the Status filter's
 * three options, so it follows an established convention in this suite rather than introducing a new
 * one. It deliberately does <b>not</b> grow into a general constants holder: it carries these three
 * labels and nothing else.</p>
 *
 * <p>No label text changed when this type was introduced -- each constant carries the exact string
 * its previous literal held.</p>
 */
public enum ApprovalStatus {
    PENDING("Pending for approval"),
    APPROVED("Approved"),
    REJECTED("Rejected");

    private final String label;

    ApprovalStatus(String label) {
        this.label = label;
    }

    /** The state exactly as the application renders it in the grid and on the record. */
    public String label() {
        return label;
    }
}
