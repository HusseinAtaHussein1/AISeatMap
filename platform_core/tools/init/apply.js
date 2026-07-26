// Install execution — runs a plan from plan.js and nothing else.
//
// Every decision was already made during planning, so this file only performs operations and records
// what it did. That split is what makes `--dry-run` trustworthy: the same plan object either prints
// or executes, with no second code path that could diverge from the first.
//
// The manifest it writes is the platform's record of what it owns inside someone else's repository,
// and is what makes `upgrade` and `uninstall` possible without guesswork (pipeline.md §13.5).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const { getTemplate, CREDENTIALS_GITIGNORE } = require('./templates');
const { MANIFEST_FILENAME } = require('./plan');

const MANIFEST_VERSION = 1;

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

/**
 * Executes a plan.
 *
 * @param {object} plan from buildPlan()
 * @param {{fs?: object, now: Date, execFileSync?: Function, onProgress?: Function}} deps
 *   `now` is required, never defaulted internally, so a caller/test controls the timestamp.
 * @returns {{applied: object[], manifest: object}}
 */
function applyPlan(plan, deps) {
  const fsImpl = deps.fs || fs;
  const exec = deps.execFileSync || execFileSync;
  const onProgress = deps.onProgress || (() => {});
  if (!(deps.now instanceof Date)) {
    throw new TypeError(
      'applyPlan requires deps.now (a Date) — pass it explicitly, never default to new Date() ' +
        'internally so callers and tests stay deterministic',
    );
  }

  const applied = [];
  const record = (entry) => {
    applied.push(entry);
    onProgress(entry);
  };

  for (const op of plan.operations) {
    switch (op.op) {
      case 'mkdir': {
        fsImpl.mkdirSync(op.to, { recursive: true });
        // A .gitkeep is what keeps a held-empty category folder present in git, which is what makes
        // "this category has no entries yet" distinguishable from "this category does not exist".
        if (op.keep) {
          const keep = path.join(op.to, '.gitkeep');
          if (!fsImpl.existsSync(keep)) fsImpl.writeFileSync(keep, '', 'utf8');
        }
        record({ op: 'mkdir', path: toPosix(op.to) });
        break;
      }

      case 'copy-dir':
      case 'replace-dir': {
        if (op.op === 'replace-dir' && fsImpl.existsSync(op.to)) {
          fsImpl.rmSync(op.to, { recursive: true, force: true });
        }
        fsImpl.mkdirSync(path.dirname(op.to), { recursive: true });
        fsImpl.cpSync(op.from, op.to, { recursive: true });
        record({ op: op.op, path: toPosix(op.to), from: toPosix(op.from) });
        break;
      }

      case 'copy-file': {
        fsImpl.mkdirSync(path.dirname(op.to), { recursive: true });
        const content = fsImpl.readFileSync(op.from);
        fsImpl.writeFileSync(op.to, content);
        record({ op: 'copy-file', path: toPosix(op.to), sha256: sha256(content) });
        break;
      }

      case 'write-file': {
        fsImpl.mkdirSync(path.dirname(op.to), { recursive: true });
        fsImpl.writeFileSync(op.to, op.content, 'utf8');
        record({ op: 'write-file', path: toPosix(op.to), sha256: sha256(op.content) });
        break;
      }

      case 'write-template': {
        fsImpl.mkdirSync(path.dirname(op.to), { recursive: true });
        const content = getTemplate(op.template);
        fsImpl.writeFileSync(op.to, content, 'utf8');
        record({ op: 'write-template', path: toPosix(op.to), template: op.template, sha256: sha256(content) });

        // The credentials folder gets its own .gitignore backstop alongside the template.
        if (op.template === 'credentials.template.json') {
          const gi = path.join(path.dirname(op.to), '.gitignore');
          if (!fsImpl.existsSync(gi)) {
            fsImpl.writeFileSync(gi, CREDENTIALS_GITIGNORE, 'utf8');
            record({ op: 'write-file', path: toPosix(gi), sha256: sha256(CREDENTIALS_GITIGNORE) });
          }
        }
        break;
      }

      case 'write-config':
      case 'rewrite-config': {
        const config = stampConfig(op.config, deps.now);
        const content = `${JSON.stringify(config, null, 2)}\n`;
        fsImpl.mkdirSync(path.dirname(op.to), { recursive: true });
        fsImpl.writeFileSync(op.to, content, 'utf8');
        record({ op: op.op, path: toPosix(op.to), sha256: sha256(content) });
        break;
      }

      case 'git-init': {
        // Only when there is no repository here already — never re-init over one.
        if (!fsImpl.existsSync(path.join(op.to, '.git'))) {
          fsImpl.mkdirSync(op.to, { recursive: true });
          exec('git', ['init', '-q'], { cwd: op.to });
          record({ op: 'git-init', path: toPosix(op.to) });
        } else {
          record({ op: 'git-init-skipped', path: toPosix(op.to) });
        }
        break;
      }

      case 'write-manifest': {
        // Written last, so it describes everything above it.
        break;
      }

      default:
        throw new Error(`Unknown plan operation: ${op.op}`);
    }
  }

  const manifest = buildManifest(plan, applied, deps.now);
  const manifestOp = plan.operations.find((o) => o.op === 'write-manifest');
  if (manifestOp) {
    const content = `${JSON.stringify(manifest, null, 2)}\n`;
    fsImpl.mkdirSync(path.dirname(manifestOp.to), { recursive: true });
    fsImpl.writeFileSync(manifestOp.to, content, 'utf8');
    record({ op: 'write-manifest', path: toPosix(manifestOp.to) });
  }

  return { applied, manifest };
}

/** apply.js owns the clock, so the plan stays a pure value that can be compared across runs. */
function stampConfig(config, now) {
  if (!config.target || !config.target.detectedStack) return config;
  return {
    ...config,
    target: {
      ...config.target,
      detectedStack: { ...config.target.detectedStack, detectedAt: now.toISOString() },
    },
  };
}

function buildManifest(plan, applied, now) {
  // Paths outside the tool folder are what the platform added to somebody else's repository, so they
  // are listed separately: those are what `uninstall` must consider, and what a reviewer cares about.
  const hostWrites = applied.filter(
    (e) => e.path && !e.path.startsWith(`${plan.toolRoot}/`) && e.path !== plan.toolRoot,
  );

  return {
    manifestVersion: MANIFEST_VERSION,
    installedAt: now.toISOString(),
    toolDir: plan.toolDir,
    targetRoot: plan.targetRoot,
    toolRoot: plan.toolRoot,
    mode: plan.mode,
    gitMode: plan.gitMode,
    framework: plan.framework,
    automationRoot: plan.automationRoot,
    operations: applied,
    hostFilesTouched: hostWrites.map((e) => e.path),
    notes: plan.notes,
    warnings: plan.warnings,
  };
}

module.exports = { applyPlan, buildManifest, MANIFEST_VERSION, _internals: { sha256, stampConfig } };
