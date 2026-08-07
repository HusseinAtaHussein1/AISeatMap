#!/usr/bin/env node
// Verifies the Tool Development branch boundary: no project-owned data may be tracked.
//
// WHY THIS EXISTS
// The repository keeps two long-lived branches with intentionally different tracked contents:
//
//   tool-development   the reusable product        — platform_core_data/ has ZERO tracked files
//   platform-testing   product + dogfooding data   — platform_core_data/ is tracked on purpose
//
// A merge in the wrong direction (platform-testing -> tool-development) would silently reintroduce
// 900+ project files into the distributable product, and nothing about that merge would look wrong
// in a diff summary. This check makes that failure loud and deterministic.
//
// WHY A DECLARATION FILE RATHER THAN A BRANCH NAME
// The obvious implementation is `if (branch === 'tool-development')`. It is also wrong: the branches
// most likely to reintroduce project data are the `feature/*` branches cut FROM tool-development, and
// a name check does not cover them. Worse, a detached HEAD or a renamed branch silently disables the
// check exactly when it matters.
//
// So the boundary is declared by a FILE — `.toolonly` — committed on tool-development. Any branch cut
// from it inherits the declaration automatically, and any branch without it (platform-testing, and
// anything cut from that) is not subject to the invariant and cannot fail this check. The declaration
// travels with the tree it describes, which is the only thing that reliably tracks intent.
//
// This is a repository validation, not a git hook. Nothing is installed into .git/, so a fresh clone
// behaves identically and CI can run the same command a developer runs.
//
// Usage:  node scripts/verifyBranchBoundary.js
// Exit:   0 = boundary satisfied, or not declared (nothing to enforce)
//         1 = boundary declared AND violated

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DECLARATION = '.toolonly';

/** Paths that must have zero tracked files when the boundary is declared. */
const FORBIDDEN_TREES = ['platform_core_data'];

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function main() {
  const declarationPath = path.join(ROOT, DECLARATION);

  if (!fs.existsSync(declarationPath)) {
    // Not a tool-only tree. platform-testing tracks project data deliberately, and must never fail
    // this check for doing exactly what it exists to do.
    console.log(`verifyBranchBoundary: no ${DECLARATION} declaration — this tree may track project data. OK.`);
    return 0;
  }

  let branch = '(unknown)';
  try {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  } catch { /* detached HEAD or no git — the declaration still governs */ }

  const violations = [];
  for (const tree of FORBIDDEN_TREES) {
    let tracked = '';
    try {
      tracked = git(['ls-files', '--', tree]);
    } catch (err) {
      console.error(`verifyBranchBoundary: could not run git ls-files (${err.message}).`);
      return 1;
    }
    const files = tracked.split('\n').filter(Boolean);
    if (files.length) violations.push({ tree, files });
  }

  if (!violations.length) {
    console.log(`verifyBranchBoundary: ${DECLARATION} declared on "${branch}" — `
      + `${FORBIDDEN_TREES.join(', ')} has zero tracked files. Boundary intact.`);
    return 0;
  }

  console.error(`\nverifyBranchBoundary: BOUNDARY VIOLATED on "${branch}".\n`);
  console.error(`This tree declares ${DECLARATION}, so it is a Tool Development tree and must not `
    + 'track project-owned data.\n');
  for (const v of violations) {
    console.error(`  ${v.tree}/ — ${v.files.length} tracked file(s), e.g.:`);
    for (const f of v.files.slice(0, 8)) console.error(`      ${f}`);
    if (v.files.length > 8) console.error(`      … and ${v.files.length - 8} more`);
  }
  console.error('\nMost likely cause: platform-testing was merged into a Tool Development branch.');
  console.error('Project data flows one way only —\n');
  console.error('    feature/*  ->  tool-development  ->  platform-testing\n');
  console.error('To fix without losing anything:');
  console.error('    git rm -r --cached platform_core_data     # untrack; files stay on disk');
  console.error('    git commit -m "chore(repo): restore the tool-development boundary"\n');
  console.error('If a genuine Tool capability was added on platform-testing, promote only the');
  console.error('Tool-owned files (cherry-pick or a scoped diff) rather than merging the branch.\n');
  return 1;
}

if (require.main === module) process.exitCode = main();

module.exports = { main, DECLARATION, FORBIDDEN_TREES };
