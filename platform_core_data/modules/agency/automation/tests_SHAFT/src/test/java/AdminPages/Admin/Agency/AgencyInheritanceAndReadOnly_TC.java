package AdminPages.Admin.Agency;

import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.Test;

/**
 * Agency Update &mdash; Inheritance &amp; Read-only. Covers TC-AGENCY-055 and 059.
 *
 * <p>Neither case saves anything, so both are safe on any agency. They run early, before any case has
 * changed the shared fixture's state.
 */
public class AgencyInheritanceAndReadOnly_TC extends AgencyTestBase {

    /**
     * TC-AGENCY-055 &mdash; Manager Name shows the supplier's value and cannot be edited.
     *
     * <p><b>Why this case exists at all.</b> AC-9 lists {@code Manager Name} as mandatory and specifies
     * <i>"Please enter a valid Manager Name."</i>. run-004 established the field is <b>read-only</b> and
     * <b>inherited</b> -- authored under Master &rarr; Supplier &rarr; Supplier and merely displayed here
     * (FINDING-009). AC-9's validation is therefore not an Agency test case at all; this is an
     * inheritance-and-read-only assertion instead.
     *
     * <p><b>The PCC section is conditional</b> (FINDING-008): it renders only while the agency's Branch
     * carries suppliers with credentials. The fixture Branch is created with two, precisely so this case
     * is exercisable. If the section is nonetheless absent, this test <b>skips with a named
     * precondition</b> rather than failing -- an absent section is not evidence about Manager Name's
     * read-only behaviour, and reporting it as a failure would attribute a fixture gap to the application.
     *
     * <p><b>One thing is deliberately not asserted:</b> the field carries a mandatory asterisk although
     * nobody can fill it. The suite records that as a low-priority cosmetic observation, explicitly not a
     * failure condition, so this test prints it and moves on.
     */
    @Test(priority = 5, description = "TC-AGENCY-055 Manager Name shows the supplier's value and is read-only")
    public void tc055_managerNameIsInheritedAndReadOnly() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        if (!form.isPccSectionPresent()) {
            throw new SkipException(
                    "BLOCKED PRECONDITION, not a failure: the Airline Supplier credentials (PCC) section is "
                            + "not rendered on agency " + agencyCode + ". FINDING-008 establishes the section "
                            + "appears only while the parent Branch carries suppliers with credentials. This "
                            + "run's fixture Branch was created with "
                            + branch().supplierNames().size() + " supplier(s): "
                            + branch().supplierNames() + ". If the section is still absent, the "
                            + "supplier rows did not carry credentials -- an environment/fixture gap. Manager "
                            + "Name's read-only behaviour is not evidenced either way by this outcome.");
        }

        String displayedManagerName = form.managerName();
        System.out.println("[TC-055] Manager Name displayed = \"" + displayedManagerName + "\" readOnly="
                + form.isManagerNameReadOnly() + " visible=" + form.isManagerNameVisible());
        System.out.println("[TC-055] Supplier credentials description = \""
                + form.supplierCredentialsDescription() + "\"");
        System.out.println("[TC-055] Not asserted, by design: the field carries a mandatory asterisk although "
                + "it cannot be filled. The Stage 3 suite records that as a cosmetic observation, not a "
                + "failure condition.");

        Assert.assertTrue(form.isManagerNameVisible(),
                "Manager Name should be visible within the PCC section once that section renders.");
        Assert.assertFalse(displayedManagerName.trim().isEmpty(),
                "Manager Name should display the value inherited from the supplier master, but it was empty. "
                        + "An empty inherited field means either the supplier record carries no Manager Name "
                        + "or the inheritance did not happen -- both are findings, and which one it is must be "
                        + "checked against Master > Supplier > Supplier for this run's suppliers: "
                        + branch().supplierNames());
        Assert.assertTrue(form.isManagerNameReadOnly(),
                "Manager Name must not be editable on the Agency form -- its value is authored on the supplier "
                        + "master and only displayed here (FINDING-009). If it has become editable, the "
                        + "inheritance model has changed and AC-9's validation message would become an Agency "
                        + "concern after all.");
    }

    /**
     * TC-AGENCY-059 &mdash; Branch is read-only on the Update form.
     *
     * <p><b>This is the assertion the whole retired Branch-change area now rests on.</b> {@code PO-10}
     * excluded that area on the grounds that Branch cannot be changed here; if Branch ever becomes
     * editable, TC-AGENCY-052's questions return and the exclusion needs revisiting. run-004 verified the
     * control is {@code disabled} <em>and</em> {@code readonly} and did <b>not</b> attempt to change it --
     * the observation was of the control's state, not of a change being refused. This test makes that a
     * standing assertion, and likewise does not attempt a change.
     *
     * <p><b>Partially automated, and the gap is stated rather than hidden.</b> The suite's step 2 is
     * "click the control and attempt to open its list". Asserting that a click produces no dropdown panel
     * cannot distinguish "the control is inert" from "the panel rendered somewhere this locator does not
     * look", so the automated assertion covers the three DOM-level properties that <em>are</em>
     * unambiguous -- not visible as an editable control, {@code readonly}, {@code disabled}. The
     * click-and-observe half remains manual and is recorded as partial coverage in the Automation Coverage
     * Report.
     */
    @Test(priority = 6, description = "TC-AGENCY-059 Branch is read-only on the Update form")
    public void tc059_branchIsReadOnlyOnUpdateForm() {
        UpdateAgency_Page form = new SearchAgency_Page(driver).open().searchByCode(agencyCode).clickEditPen(agencyCode);

        String displayedBranch = form.branch();
        System.out.println("[TC-059] Branch value = \"" + displayedBranch + "\" editable="
                + form.branchFieldIsEditable());
        System.out.println("[TC-059] Partially automated: the DOM-level read-only properties are asserted "
                + "below. \"Click the control and confirm no list opens\" stays manual -- a missing panel "
                + "cannot be distinguished from a panel this locator does not find.");

        Assert.assertFalse(form.branchFieldIsEditable(),
                "Branch must not be editable from inside the Agency Update form. PO-10 excluded the entire "
                        + "Branch-change test area on exactly this basis, so if Branch has become editable "
                        + "here, that exclusion needs revisiting and TC-AGENCY-052's retired questions return. "
                        + "Observed Branch value: \"" + displayedBranch + "\".");
    }
}
