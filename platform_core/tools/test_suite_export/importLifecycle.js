// Lifecycle import — pull the reviewer's `Review` / `Automation` decisions back OUT of the
// workbook and into the authored Markdown suite.
//
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// WHY THIS DOES NOT BREAK "THE MARKDOWN IS THE AUTHORED ARTIFACT"
// ─────────────────────────────────────────────────────────────────────────────────────────────────
// §9.1's rule is that the workbook is DERIVED, so the two renderings can never disagree. Every
// column obeys it — except the two that do not describe the test case at all. `Review` and
// `Automation` record a HUMAN DECISION taken after generation (test-design-skill §6.3), and the
// human takes it in the spreadsheet, because that is where reviewing a 52-row suite actually
// happens. Before this tool existed there were only two outcomes, and both were bad:
//
//   1. The reviewer edits the workbook — and the next export silently discards the decisions,
//      which is precisely the "hand-edit is silently overwritten" failure §9.1 warns about.
//   2. The reviewer is told to hand-edit 52 Markdown blocks instead — so the review either does not
//      happen or happens in a copy nothing reads.
//
// So the direction of derivation is preserved and made explicit: the Markdown remains the single
// authored artifact, and this tool MOVES the decision into it, after which the workbook is
// regenerated from the Markdown as always. The import is deliberately narrow — ONLY the two
// lifecycle columns. A Title, Steps, or Expected Result edited in the workbook is NOT imported and
// is still discarded on the next export, because those are derived content and editing them there
// is the mistake §9.1 exists to prevent.
//
// The asymmetry in one line: content flows Markdown -> Excel; decisions flow Excel -> Markdown.

'use strict';

const fs = require('fs');
const path = require('path');

const { readWorkbook, WorkbookReadError } = require('./readWorkbook');
const { LIFECYCLE_FIELDS, LIFECYCLE_VALUES } = require('./parseTestCases');

class ImportError extends Error {}

const ID_PATTERN = /^(?:#{2,4})\s*(TC-[A-Za-z0-9_-]+)/;
const FIELD_LABEL = { review: 'Review', automation: 'Automation' };

/** `approved` / `APPROVED` -> `Approved`; anything else -> null (never silently coerced). */
function normalize(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  return LIFECYCLE_VALUES.find((v) => v.toLowerCase() === text.toLowerCase()) || null;
}

/**
 * The reviewer's decisions, keyed by Test Case ID, read out of the workbook.
 * @returns {{decisions: Map<string, {review: string|null, automation: string|null}>,
 *            warnings: string[]}}
 */
function readDecisions(xlsxPath) {
  const { rows } = readWorkbook(xlsxPath);
  const warnings = [];

  const headerIndex = rows.findIndex((r) => r.includes('Test Case ID'));
  if (headerIndex === -1) {
    throw new ImportError(
      `${path.basename(xlsxPath)} has no "Test Case ID" header row — is it a Manual Test Suite workbook?`
    );
  }
  const header = rows[headerIndex];
  const idCol = header.indexOf('Test Case ID');
  const cols = {};
  for (const field of LIFECYCLE_FIELDS) {
    const at = header.indexOf(FIELD_LABEL[field]);
    if (at === -1) {
      throw new ImportError(
        `${path.basename(xlsxPath)} has no "${FIELD_LABEL[field]}" column. It predates the `
        + '2026-08-01 lifecycle columns — re-export it from the Markdown first, then review.'
      );
    }
    cols[field] = at;
  }

  const decisions = new Map();
  for (let r = headerIndex + 1; r < rows.length; r += 1) {
    const id = String(rows[r][idCol] ?? '').trim();
    if (!id) continue;
    if (decisions.has(id)) {
      warnings.push(`${id}: appears more than once in the workbook — the last row wins.`);
    }

    const entry = {};
    for (const field of LIFECYCLE_FIELDS) {
      const raw = rows[r][cols[field]];
      const value = normalize(raw);
      if (raw !== undefined && String(raw).trim() && !value) {
        warnings.push(
          `${id}: ${FIELD_LABEL[field]} is "${String(raw).trim()}", which is not one of `
          + `${LIFECYCLE_VALUES.join(' / ')} — left unchanged in the Markdown.`
        );
      }
      entry[field] = value;
    }
    decisions.set(id, entry);
  }

  return { decisions, warnings };
}

/**
 * Rewrite the Markdown suite's lifecycle fields in place.
 *
 * Operates on RAW TEXT rather than re-rendering parsed cases, deliberately: re-rendering would
 * reformat the whole authored document — the reviewer's prose, spacing, and tables — to whatever
 * shape the parser round-trips to, turning a two-value change into an unreviewable diff.
 *
 * @param {string} markdownPath
 * @param {string} [xlsxPath]  defaults to the sibling workbook
 * @param {{dryRun?: boolean}} [options]
 */
function importLifecycle(markdownPath, xlsxPath, options = {}) {
  const xlsx = xlsxPath || markdownPath.replace(/\.md$/, '.xlsx');
  if (!fs.existsSync(markdownPath)) throw new ImportError(`No such suite document: ${markdownPath}`);
  if (!fs.existsSync(xlsx)) {
    throw new ImportError(
      `No workbook beside ${path.basename(markdownPath)} (${path.basename(xlsx)}).\n`
      + 'Export it first, review it, then import.'
    );
  }

  let decisions;
  let warnings;
  try {
    ({ decisions, warnings } = readDecisions(xlsx));
  } catch (err) {
    if (err instanceof WorkbookReadError) throw new ImportError(err.message);
    throw err;
  }

  // A workbook older than its Markdown was generated before the current text — importing from it is
  // still valid for the two columns, but the reviewer may have been reading superseded case content,
  // so it is reported rather than assumed harmless.
  if (fs.statSync(xlsx).mtimeMs < fs.statSync(markdownPath).mtimeMs) {
    warnings.push(
      `${path.basename(xlsx)} is OLDER than ${path.basename(markdownPath)} — the review may have `
      + 'been made against superseded case text. Check before relying on it.'
    );
  }

  const original = fs.readFileSync(markdownPath, 'utf8');
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  const lines = original.split(/\r?\n/);

  const changes = [];
  const seenInMarkdown = new Set();
  let currentId = null;
  // Where a field is absent entirely, it is inserted after the last field line of that case rather
  // than appended blindly — keeping Review/Automation last, which is the workbook's column order.
  const pendingInsertions = [];
  let lastFieldLine = -1;
  let caseFields = {};

  const flushCase = () => {
    if (!currentId || !decisions.has(currentId)) return;
    const wanted = decisions.get(currentId);
    for (const field of LIFECYCLE_FIELDS) {
      if (!wanted[field] || caseFields[field] !== undefined) continue;
      pendingInsertions.push({ at: lastFieldLine, id: currentId, field, value: wanted[field] });
      changes.push({ id: currentId, field, from: '(absent)', to: wanted[field] });
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const idMatch = ID_PATTERN.exec(lines[i]);
    if (idMatch) {
      flushCase();
      currentId = idMatch[1];
      seenInMarkdown.add(currentId);
      caseFields = {};
      lastFieldLine = i;
      continue;
    }
    if (!currentId) continue;

    const fieldMatch = /^\*\*([A-Za-z ]+):\*\*(.*)$/.exec(lines[i]);
    if (!fieldMatch) continue;
    lastFieldLine = i;

    const key = fieldMatch[1].trim().toLowerCase();
    if (!LIFECYCLE_FIELDS.includes(key)) continue;

    const existing = fieldMatch[2].trim();
    caseFields[key] = existing;

    const wanted = decisions.get(currentId);
    if (!wanted || !wanted[key] || wanted[key] === existing) continue;

    changes.push({ id: currentId, field: key, from: existing || '(blank)', to: wanted[key] });
    lines[i] = `**${FIELD_LABEL[key]}:** ${wanted[key]}`;
  }
  flushCase();

  // Applied back-to-front so earlier insertions do not shift later line numbers.
  for (const ins of pendingInsertions.sort((a, b) => b.at - a.at)) {
    lines.splice(ins.at + 1, 0, '', `**${FIELD_LABEL[ins.field]}:** ${ins.value}`);
  }

  for (const id of decisions.keys()) {
    if (!seenInMarkdown.has(id)) {
      warnings.push(`${id}: in the workbook but not in the Markdown — no case to update. A row added in the spreadsheet is not a test case; author it in the Markdown.`);
    }
  }

  const updated = lines.join(newline);
  const written = !options.dryRun && updated !== original;
  if (written) fs.writeFileSync(markdownPath, updated);

  return {
    markdownPath,
    xlsxPath: xlsx,
    caseCount: seenInMarkdown.size,
    changes,
    warnings,
    written,
  };
}

module.exports = { importLifecycle, readDecisions, ImportError };
