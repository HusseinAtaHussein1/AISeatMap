// Test Suite Export — Stage 3's Markdown -> Excel renderer.
//
// The Manual Test Suite is authored once, in Markdown, and the .xlsx is generated from it. See
// parseTestCases.js for why derivation (rather than authoring both) is what enforces
// test-design-skill/SKILL.md §9's "two renderings of one test case set — they must never diverge."

'use strict';

const { exportSuite, exportSuiteDir, ExportError, SUITE_FILENAME } = require('./exportSuites');
const { parseTestCases, toRows, FIELDS, REQUIRED_FIELDS, STEP_JOINER } = require('./parseTestCases');
const { buildWorkbook } = require('./xlsxWriter');

module.exports = {
  // Primary surface
  exportSuite,
  exportSuiteDir,
  ExportError,
  // Building blocks, for a caller assembling a workbook from its own records
  parseTestCases,
  toRows,
  buildWorkbook,
  // The §6.1 field contract
  FIELDS,
  REQUIRED_FIELDS,
  STEP_JOINER,
  SUITE_FILENAME,
};
