// Page Object — PIM Employee Detail (/web/index.php/pim/{tab}/empNumber/{id})
// Confirmed via RUN-20260706-002/discovery/pim_emp_detail_raw_snapshot.md
// SAFETY: read-only by design — no Save button is ever exercised by this Page Object.
const TABS = [
  'viewPersonalDetails', 'contactDetails', 'viewEmergencyContacts', 'viewDependents',
  'viewImmigration', 'viewJobDetails', 'viewSalaryList', 'viewReportToDetails',
  'viewQualifications', 'viewMemberships',
];

class EmployeeDetailPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.tabLinks = TABS.map((t) => page.locator(`a[href*="${t}"]`));
  }

  async gotoTab(tabPath, empNumber) {
    await this.page.goto(`/web/index.php/pim/${tabPath}/empNumber/${empNumber}`);
  }

  getCurrentEmpNumber() {
    const match = this.page.url().match(/empNumber\/(\d+)/);
    return match ? match[1] : null;
  }

  async countVisibleTabs() {
    let count = 0;
    for (const link of this.tabLinks) {
      if (await link.count() > 0) count += 1;
    }
    return count;
  }
}

module.exports = { EmployeeDetailPage, TABS };
