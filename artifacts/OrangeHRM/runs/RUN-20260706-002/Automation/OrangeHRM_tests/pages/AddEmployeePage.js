// Page Object — PIM Add Employee (/web/index.php/pim/addEmployee)
// Confirmed via RUN-20260706-002/discovery/pim_add_employee_raw_snapshot.md
// SAFETY: per Project Context v2 §5, this form must never be submitted to completion in
// this project's automation — every method here is written so Full Name is never filled,
// meaning clickSave() can never actually persist a new employee, regardless of what the
// Employee Id field contains.
class AddEmployeePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.employeeIdInput = page.locator('label:has-text("Employee Id") ~ input, label:has-text("Employee Id") + input').first();
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.photoConstraintText = page.getByText(/Accepts jpg/i);
    this.requiredMessages = page.getByText('Required', { exact: true });
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/addEmployee');
  }

  async fillEmployeeId(value) {
    await this.employeeIdInput.fill(value);
  }

  /** Clicks Save with whatever is currently in the form. Full Name is intentionally never
   *  filled by this Page Object, so this can never persist a real employee record. */
  async clickSave() {
    await this.saveButton.click();
  }

  async getRequiredErrorCount() {
    return this.requiredMessages.count();
  }

  async getPhotoConstraintText() {
    return this.photoConstraintText.innerText();
  }
}

module.exports = { AddEmployeePage };
