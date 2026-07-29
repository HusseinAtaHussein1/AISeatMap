// Module Manager tools — public API barrel.
// See workflows_and_pipelines/pipeline/module_architecture.md §6.6.

module.exports = {
  ...require('./moduleSlug'),
  ...require('./moduleRegistry'),
  ...require('./activeModule'),
  ...require('./moduleScaffold'),
  ...require('./automationState'),
  ...require('./moduleDrift'),
  ...require('./moduleSummary'),
};
