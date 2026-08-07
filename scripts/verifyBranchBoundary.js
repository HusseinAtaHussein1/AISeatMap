#!/usr/bin/env node
// Verifies the branch boundary between the two long-lived branches, in BOTH directions.
//
// WHY THIS EXISTS
// The repository keeps two long-lived branches with intentionally different tracked contents:
//
//   tool-development   the reusable product        — platform_core_data/ has ZERO tracked files
//   platform-testing   product + dogfooding data   — platform_core_data/ is tracked on purpose
//
// Two opposite accidents are possible, and each is silent in a diff summary:
//
//   1. CONTAMINATION — platform-testing is merged into a Tool Development branch, dragging 900+
//      project files into the distributable product.
//   2. DATA LOSS — tool-development is merged into platform-testing, and the deletion commit that
//      created the boundary is replayed, wiping every run, module, and piece of execution evidence.
//
// The second is the more dangerous of the two, because it happens on the *normal* promotion path.
// A guard that only checked for contamination would wave it straight through.
//
// WHY DECLARATION FILES RATHER THAN BRANCH NAMES
// The obvious implementation is `if (branch === 'tool-development')`. It is also wrong: the branches
// most likely to breach the boundary are the `feature/*` branches cut FROM one of these two, and a
// name check does not cover them. A detached HEAD or a renamed branch silently disables it, exactly
// when it matters most.
//
// So each side declares itself with a committed file, inherited automatically by anything branched
// from it:
//
//   .toolonly       this tree is Tool Development   -> platform_core_data MUST be empty
//   .platformdata   this tree is Platform Testing   -> platform_core_data MUST be populated
//
// The declaration travels with the tree it describes, which is the only thing that reliably tracks
// intent across renames, forks and detached checkouts.
//
// This is a repository validation, not a git hook. Nothing is installed into .git/, so a fresh clone
// behaves identically and CI runs the same command a developer runs.
//
// Usage:  node scripts/verifyBranchBoundary.js   (or: npm run verify:boundary)
// Exit:   0 = boundary satisfied, or undeclared (nothing to enforce)
//         1 = a declared boundary is violated

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const TOOL_DECLARATION = '.toolonly';
const DATA_DECLARATION = '.platformdata';

/** The tree whose tracked-file count defines the boundary. */
const DATA_TREE = 'platform_core_data';

/**
 * Below this, a Platform Testing tree is considered to have lost its project data rather than to be
 * legitimately sparse. A populated dogfooding branch carries hundreds of files; a handful means
 * something removed them. The threshold is deliberately low so a genuinely small-but-real data root
 * still passes, and only a wipe trips it.
 */
const MIN_DATA_FILES = 25;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function trackedIn(tree) {
  return git(['ls-files', '--', tree]).split('\n').filter(Boolean);
}

function currentBranch() {
  try {
    return git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  } catch {
    return '(unknown)';
  }
}

function main() {
  const isTool = fs.existsSync(path.join(ROOT, TOOL_DECLARATION));
  const isData = fs.existsSync(path.join(ROOT, DATA_DECLARATION));
  const branch = currentBranch();

  if (isTool && isData) {
    console.error(`\nverifyBranchBoundary: CONTRADICTORY DECLARATIONS on "${branch}".\n`);
    console.error(`  ${TOOL_DECLARATION}     says this is a Tool Development tree (no project data)`);
    console.error(`  ${DATA_DECLARATION} says this is a Platform Testing tree (project data required)\n`);
    console.error('A tree cannot be both. This almost always means tool-development was merged into');
    console.error(`platform-testing without rejecting ${TOOL_DECLARATION}. Remove the declaration that does`);
    console.error('not belong on this branch — do not delete both to silence the check.\n');
    return 1;
  }

  let tracked;
  try {
    tracked = trackedIn(DATA_TREE);
  } catch (err) {
    console.error(`verifyBranchBoundary: could not run git ls-files (${err.message}).`);
    return 1;
  }

  // --- Tool Development: project data must be absent -------------------------------------------
  if (isTool) {
    if (tracked.length === 0) {
      console.log(`verifyBranchBoundary: ${TOOL_DECLARATION} declared on "${branch}" — `
        + `${DATA_TREE} has zero tracked files. Boundary intact.`);
      return 0;
    }
    console.error(`\nverifyBranchBoundary: BOUNDARY VIOLATED on "${branch}" — project data contamination.\n`);
    console.error(`This tree declares ${TOOL_DECLARATION}, so it is a Tool Development tree and must not`);
    console.error(`track project-owned data. ${DATA_TREE}/ has ${tracked.length} tracked file(s), e.g.:\n`);
    for (const f of tracked.slice(0, 8)) console.error(`      ${f}`);
    if (tracked.length > 8) console.error(`      … and ${tracked.length - 8} more`);
    console.error('\nMost likely cause: platform-testing was merged into a Tool Development branch.');
    console.error('Project evidence flows one way only —\n');
    console.error('    feature/*  ->  tool-development  ->  platform-testing\n');
    console.error('To fix without losing anything:');
    console.error(`    git rm -r --cached ${DATA_TREE}     # untrack; files stay on disk`);
    console.error('    git commit -m "chore(repo): restore the tool-development boundary"\n');
    console.error('If a genuine Tool capability was added on platform-testing, promote only the');
    console.error('Tool-owned files (cherry-pick, or a scoped diff) rather than merging the branch.\n');
    return 1;
  }

  // --- Platform Testing: project data must be present -------------------------------------------
  // This is the Option D guard. The dangerous direction is the NORMAL one: promoting
  // tool-development into platform-testing replays the deletion commit that created the boundary
  // unless the one-time baseline merge already rejected it.
  if (isData) {
    if (tracked.length >= MIN_DATA_FILES) {
      console.log(`verifyBranchBoundary: ${DATA_DECLARATION} declared on "${branch}" — `
        + `${DATA_TREE} has ${tracked.length} tracked files. Boundary intact.`);
      return 0;
    }
    console.error(`\nverifyBranchBoundary: BOUNDARY VIOLATED on "${branch}" — project data loss.\n`);
    console.error(`This tree declares ${DATA_DECLARATION}, so it is a Platform Testing tree and must`);
    console.error(`carry the dogfooding data. ${DATA_TREE}/ has only ${tracked.length} tracked file(s)`);
    console.error(`(expected at least ${MIN_DATA_FILES}).\n`);
    console.error('Most likely cause: tool-development was merged in and the platform_core_data');
    console.error('deletion that created the Tool boundary was replayed.\n');
    console.error('Do NOT commit this. Recover before doing anything else:\n');
    console.error('    git merge --abort                      # if the merge is still in progress');
    console.error(`    git checkout HEAD -- ${DATA_TREE}   # or restore from the pre-merge commit`);
    console.error('    git checkout <last-good-commit> -- platform_core_data\n');
    console.error('The one-time baseline merge should have made this impossible. If it fires on a');
    console.error('routine promotion, the baseline merge is missing from this branch\'s history.\n');
    return 1;
  }

  // --- Undeclared ---------------------------------------------------------------------------------
  console.log(`verifyBranchBoundary: no ${TOOL_DECLARATION} or ${DATA_DECLARATION} declaration on `
    + `"${branch}" — no boundary is enforced for this tree.`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { main, TOOL_DECLARATION, DATA_DECLARATION, DATA_TREE, MIN_DATA_FILES };
