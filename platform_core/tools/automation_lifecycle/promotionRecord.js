// automation_promotion.md renderer — pure template generation, mirroring
// platform_core/tools/run_manager/runFolderName.js's own build*() functions. See pipeline.md §12
// for the field list this schema implements. This file is permanent run history and is never
// deleted by cleanup.js.

/**
 * @param {object} record
 * @param {'Merged'|'Bootstrap Migration'|'Failed'} record.promotionStatus
 * @param {string} record.mergeDate - ISO string
 * @param {string} record.approvedBy - a name/role, or "N/A — Bootstrap Migration" (never fabricated
 *   for content that hasn't actually cleared pipeline.md §5.2 Automation Approval)
 * @param {string} record.sourceRun
 * @param {string} record.workspaceDestination
 * @param {string[]} record.filesAdded
 * @param {string[]} record.filesModified
 * @param {string[]} record.filesDeleted
 * @param {{from:string,to:string}[]} record.filesRenamed
 * @param {string[]} record.discardedUntracked
 * @param {string[]} record.conflictsDetected
 * @param {string[]} record.conflictsResolved
 * @param {string} record.mergeResult
 * @param {string} [record.notes]
 * @returns {string} the full automation_promotion.md content
 */
function renderPromotionRecord(record) {
  const list = (items) => (items && items.length ? items.map((i) => `- ${i}`).join('\n') : '- (none)');
  const renameList = (renames) => (renames && renames.length
    ? renames.map((r) => `- ${r.from} → ${r.to}`).join('\n')
    : '- (none)');

  return `# Automation Promotion Record

Per workflows_and_pipelines/pipeline/pipeline.md §12 (Automation Asset Lifecycle) — this file is
permanent run history and is never deleted by Cleanup.

- **Promotion Status:** ${record.promotionStatus}
- **Merge Date:** ${record.mergeDate}
- **Approved By:** ${record.approvedBy}
- **Source Run:** ${record.sourceRun}
- **Workspace Destination:** ${record.workspaceDestination}
- **Merge Result:** ${record.mergeResult}

## Files Added
${list(record.filesAdded)}

## Files Modified
${list(record.filesModified)}

## Files Deleted
${list(record.filesDeleted)}

## Files Renamed
${renameList(record.filesRenamed)}

## Discarded Untracked Files
${list(record.discardedUntracked)}

## Conflicts Detected
${list(record.conflictsDetected)}

## Conflicts Resolved
${list(record.conflictsResolved)}

## Notes

${record.notes || '(none)'}
`;
}

module.exports = { renderPromotionRecord };
