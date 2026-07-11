// Page Object — PIM Employee List (/web/index.php/pim/viewEmployeeList)
// Confirmed via RUN-20260706-002/discovery/pim_employee_list_raw_snapshot.md
class EmployeeListPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.filterToggle = page.locator('.oxd-table-filter-header-title + button, [class*="oxd-table-filter-header"] button').first();
    this.employeeIdInput = page.locator('label:has-text("Employee Id") + input, label:has-text("Employee Id") ~ input').first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.recordsFoundText = page.getByText(/Records Found|No Records Found/);
    this.employeeRows = page.locator('.oxd-table-card');
  }

  async goto() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
  }

  async expandFilterPanel() {
    // The filter panel toggle is the chevron button beside the "Employee Information" heading.
    const heading = this.page.getByRole('heading', { name: 'Employee Information' });
    const toggle = heading.locator('xpath=following-sibling::button[1] | ../button');
    await toggle.first().click();
  }

  async filterByEmployeeId(value) {
    await this.employeeIdInput.fill(value);
    await this.searchButton.click();
  }

  async resetFilters() {
    await this.resetButton.click();
  }

  async getRecordsFoundText() {
    return this.recordsFoundText.innerText();
  }

  async clickFirstRow() {
    await this.employeeRows.first().click();
  }
}

module.exports = { EmployeeListPage };
