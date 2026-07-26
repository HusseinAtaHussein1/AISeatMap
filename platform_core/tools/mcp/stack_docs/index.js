// Stack Docs tools — public API barrel. See platform_core/tools/mcp/README.md §2.

module.exports = {
  ...require('./detectStack'),
  ...require('./planQueries'),
};
