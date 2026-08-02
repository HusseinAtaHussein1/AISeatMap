// Case Index sync — make the suite document's own summary table DERIVED from its case bodies.
//
// WHY. A suite document opens with a Case Index that repeats each case's Title, Tier, Priority, Tags,
// Review, and Automation. That table is hand-maintained, which makes it a SECOND record of facts the
// case bodies already state — and a second record drifts. It drifted immediately in practice: a
// reviewer's decisions and a rewritten case title landed in the bodies while the index still showed
// the superseded values, so the file disagreed with itself about which cases were approved.
//
// This is the same argument that makes the workbook generated rather than authored (§9.1), applied one
// level down, inside the Markdown. The case body is authoritative; the index is rendered from it.
//
// Totals ("Tier breakdown", "Total Test Cases", the lifecycle roll-up) are recomputed for the same
// reason: a count that is maintained by hand is a count that is eventually wrong, and a wrong total
// in the document's header is what a reader trusts most and checks least.

'use strict';

const fs = require('fs');
const path = require('path');

class IndexSyncError extends Error {}

const CASE_HEADING = /^#{2,4}\s*(TC-[A-Za-z0-9_-]+)\s*(?:—|--|-)\s*(.+?)\s*$/;
const BARE_HEADING = /^#{2,4}\s*(TC-[A-Za-z0-9_-]+)\s*$/;
const TIERS = ['E2E', 'Scenario', 'Atomic'];
const LIFECYCLE_DEFAULT = 'Pending';

/** Every case in the document, in document order, read from the bodies alone. */
function readCases(markdown) {
  const lines = markdown.split(/\r?\n/);
  const cases = [];
  let current = null;

  for (const line of lines) {
    const withTitle = CASE_HEADING.exec(line);
    const bare = withTitle ? null : BARE_HEADING.exec(line);
    if (withTitle || bare) {
      current = {
        id: (withTitle || bare)[1],
        title: withTitle ? withTitle[2] : '',
        priority: '', tags: '', review: '', automation: '',
      };
      cases.push(current);
      continue;
    }
    if (!current) continue;

    const field = /^\*\*([A-Za-z ]+):\*\*(.*)$/.exec(line);
    if (!field) continue;
    const key = field[1].trim().toLowerCase();
    const val = field[2].trim();

    // A heading title wins over a later **Title:** field — same precedence as parseTestCases.
    if (key === 'title' && !current.title) current.title = val;
    else if (key === 'priority') current.priority = val;
    else if (key === 'tags') current.tags = val;
    else if (key === 'review') current.review = val;
    else if (key === 'automation') current.automation = val;
  }

  for (const c of cases) {
    // Tier is not a field — it is the Granularity Tier carried in Tags (§6.0.1). Checked most-
    // specific first, since "E2E" and "Scenario" may both appear in a composite tag list.
    c.tier = TIERS.find((t) => new RegExp(`\\b${t}\\b`, 'i').test(c.tags)) || '';
    if (!c.review) c.review = LIFECYCLE_DEFAULT;
    if (!c.automation) c.automation = LIFECYCLE_DEFAULT;
  }
  return cases;
}

/** Escape a cell so a pipe inside a title cannot break the table it is rendered into. */
const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').trim();

function indexRow(c) {
  return `| ${cell(c.id)} | ${cell(c.title)} | ${cell(c.tier)} | ${cell(c.priority)} | `
    + `${cell(c.tags)} | ${cell(c.review)} | ${cell(c.automation)} |`;
}

function tally(cases, field) {
  const counts = {};
  for (const c of cases) counts[c[field]] = (counts[c[field]] || 0) + 1;
  return counts;
}

/** `{Atomic: 46, Scenario: 5}` -> `46 Atomic · 5 Scenario`, in TIERS order. */
function tierBreakdown(cases) {
  const counts = tally(cases, 'tier');
  return [...TIERS].reverse()
    .filter((t) => counts[t])
    .map((t) => `${counts[t]} ${t}`)
    .join(' · ');
}

/**
 * Rewrite the Case Index table, the Tier breakdown, the lifecycle roll-up line, and the header's
 * Total Test Cases from the case bodies.
 *
 * @param {string} markdownPath
 * @param {{dryRun?: boolean}} [options]
 */
function syncCaseIndex(markdownPath, options = {}) {
  if (!fs.existsSync(markdownPath)) throw new IndexSyncError(`No such suite document: ${markdownPath}`);

  const original = fs.readFileSync(markdownPath, 'utf8');
  const newline = original.includes('\r\n') ? '\r\n' : '\n';
  const lines = original.split(/\r?\n/);
  const cases = readCases(original);
  if (!cases.length) throw new IndexSyncError(`No test cases found in ${path.basename(markdownPath)}.`);

  const byId = new Map(cases.map((c) => [c.id, c]));
  const changes = [];
  const warnings = [];
  const seen = new Set();

  // Locate the index table: the header row naming the columns, then its contiguous body rows.
  const headerAt = lines.findIndex((l) => /^\|\s*Test Case ID\s*\|/.test(l));
  if (headerAt === -1) {
    throw new IndexSyncError(
      `${path.basename(markdownPath)} has no Case Index table (a row starting "| Test Case ID |").`
    );
  }

  let firstRow = headerAt + 1;
  if (/^\|[\s:|-]+\|$/.test(lines[firstRow] || '')) firstRow += 1;
  let lastRow = firstRow;
  while (lastRow < lines.length && /^\|\s*TC-/.test(lines[lastRow])) lastRow += 1;

  for (let i = firstRow; i < lastRow; i += 1) {
    const id = (/^\|\s*(TC-[A-Za-z0-9_-]+)\s*\|/.exec(lines[i]) || [])[1];
    if (!id) continue;
    seen.add(id);
    const c = byId.get(id);
    if (!c) {
      warnings.push(`${id}: listed in the Case Index but has no case body — a stale row, left in place for you to remove.`);
      continue;
    }
    const rendered = indexRow(c);
    if (lines[i].trim() !== rendered) {
      changes.push({ id, from: lines[i].trim(), to: rendered });
      lines[i] = rendered;
    }
  }

  // Cases missing from the index are appended, in document order, after the last existing row.
  const missing = cases.filter((c) => !seen.has(c.id));
  if (missing.length) {
    lines.splice(lastRow, 0, ...missing.map(indexRow));
    for (const c of missing) changes.push({ id: c.id, from: '(absent from index)', to: indexRow(c) });
  }

  let text = lines.join(newline);

  const replaceLine = (pattern, next, label) => {
    const m = pattern.exec(text);
    if (!m) return;
    if (m[0].trim() !== next.trim()) {
      changes.push({ id: label, from: m[0].trim(), to: next.trim() });
      text = text.replace(pattern, next);
    }
  };

  replaceLine(/^\*\*Tier breakdown:\*\*.*$/m, `**Tier breakdown:** ${tierBreakdown(cases)}`, '(tier breakdown)');
  replaceLine(/^\| Total Test Cases \| .* \|$/m, `| Total Test Cases | ${cases.length} |`, '(total)');

  // Zeros are shown rather than omitted: "0 Rejected" states that nothing was rejected, whereas an
  // absent entry reads as "not tracked" — and the difference matters at a review gate.
  const roll = (field) => {
    const t = tally(cases, field);
    return ['Pending', 'Approved', 'Rejected'].map((k) => `${t[k] || 0} ${k}`).join(' · ');
  };
  const label = (/^\*\*(Lifecycle[^:]*):\*\*/m.exec(text) || [])[1] || 'Lifecycle breakdown';
  replaceLine(
    /^\*\*Lifecycle[^:]*:\*\*.*$/m,
    `**${label}:** Review — ${roll('review')} · Automation — ${roll('automation')}`,
    '(lifecycle roll-up)',
  );

  const written = !options.dryRun && text !== original;
  if (written) fs.writeFileSync(markdownPath, text);

  return { markdownPath, caseCount: cases.length, changes, warnings, written, cases };
}

module.exports = { syncCaseIndex, readCases, IndexSyncError };
