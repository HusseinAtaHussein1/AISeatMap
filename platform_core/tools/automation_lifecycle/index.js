// Automation Asset Lifecycle tools — public API barrel. See
// workflows_and_pipelines/pipeline/pipeline.md §12.

module.exports = {
  ...require('./gitUtils'),
  ...require('./hashUtils'),
  ...require('./baselineCopy'),
  ...require('./mergePlan'),
  ...require('./mergeApply'),
  ...require('./cleanup'),
  ...require('./promotionRecord'),
  // Promotion as a terminal move (2026-08-17): the baseline becomes a module's single source of
  // truth, so resolution, ownership scoping and byte-identity proof all become part of the lifecycle.
  ...require('./automationRoot'),
  ...require('./baselineOwnership'),
  ...require('./promoteVerify'),
};
