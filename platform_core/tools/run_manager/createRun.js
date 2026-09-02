// Run creation — the one code path that brings a run into existence.
//
// WHY THIS EXISTS
// Run creation used to be a prose checklist in each workflow's Step 1 ("allocate a name, prepare the
// workspace, write run.json, create the Run Manifest, activate"). Prose can be skipped: the code-state
// anchor (`targetRef`, run_manager.md §5.8) was written only because a spec line said to, so a run
// created any other way silently lost the ability to answer "has the app moved since?". `cli.js refine`
// was the only path that actually wrote it, and it did so with inline logic nothing else could reuse.
//
// This module makes the invariants STRUCTURAL rather than remembered:
//   - `targetRef` is captured here, always. A run cannot be created without an anchor attempt, and a
//     null anchor carries its reason (`targetRefReason`) instead of being silently absent.
//   - `metadata/` and `RunManifest.md` are created here, always — §6 says metadata/ is the one folder
//     every run has, and the Manifest is the orchestrator's own source of truth.
//   - Activation is a separate, explicit step (`activate: true`), because run_manager.md §5.7 Rule 3
//     makes the pointer the Run Manager's to write and §5.9 keeps creation and switching distinct.
//
// It does NOT create stage folders. A run only ever has folders for stages it actually reached
// (run_manager.md §6) — pre-creating them was the 2026-07-17 behaviour that revision removed.
//
// See workflows_and_pipelines/pipeline/run_manager.md §5.10.

const fs = require('fs');
const path = require('path');

const { generateRunFolderName, parseRunFolderName } = require('./runFolderName');
const { captureTargetRef } = require('./targetRef');
const { setActiveRun } = require('./activeRun');
const { renderRunManifest } = require('./runManifest');

class CreateRunError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CreateRunError';
  }
}

/** run.json fields whose value is a platform spec version we record rather than invent (§7). */
const UNVERSIONED = 'unversioned';

/**
 * Validates the NDC Core Service run-ownership fields on a run.json object.
 *
 * See module_architecture.md, NDC Core Service section, "run ownership scope exclusivity". A run may
 * carry four OPTIONAL fields — `service`, `feature`, `supplier`, `sharedScope` — all defaulting to
 * `null`, exactly like `modules[]` is already an optional key elsewhere in this platform. This keeps
 * EVERY non-NDC run (agency, branch, or any run that never sets `service`) entirely unaffected: the
 * function returns immediately, with no field checked, when `service` and `feature` are both null.
 *
 * Once a run IS NDC-scoped (`service` and `feature` both set), exactly two shapes are legal:
 *   - a Supplier run:      `supplier` set,   `sharedScope` null
 *   - a shared-scope run:  `supplier` null,  `sharedScope` set
 * A run naming BOTH or NEITHER is a contradiction — a run cannot be simultaneously supplier-specific
 * and cross-supplier, and an NDC-scoped run that names neither has not actually picked a scope. Both
 * are rejected here, mechanically, rather than left to a convention nothing enforces.
 *
 * @param {{service?: string|null, feature?: string|null, supplier?: string|null, sharedScope?: string|null}} runJson
 * @throws {CreateRunError} when the run is NDC-scoped and its ownership fields are contradictory
 */
function validateNdcRunScope(runJson = {}) {
  const service = runJson.service ?? null;
  const feature = runJson.feature ?? null;
  const supplier = runJson.supplier ?? null;
  const sharedScope = runJson.sharedScope ?? null;

  // Not an NDC-scoped run — untouched, exactly as every run written before these fields existed.
  if (service === null && feature === null) return;

  if (!service || !feature) {
    throw new CreateRunError(
      'An NDC-scoped run requires BOTH `service` and `feature` set. Got ' +
      `service=${JSON.stringify(service)}, feature=${JSON.stringify(feature)}.`
    );
  }
  if (supplier !== null && sharedScope !== null) {
    throw new CreateRunError(
      'An NDC-scoped run must never set both `supplier` and `sharedScope` — a run is EITHER a ' +
      'Supplier run or a shared-scope run, never both. Got ' +
      `supplier=${JSON.stringify(supplier)}, sharedScope=${JSON.stringify(sharedScope)}.`
    );
  }
  if (supplier === null && sharedScope === null) {
    throw new CreateRunError(
      'An NDC-scoped run (service and feature both set) must pick EXACTLY ONE of `supplier` or ' +
      '`sharedScope` — neither is set.'
    );
  }
}

/**
 * Creates a run folder with its metadata, and optionally makes it the active run.
 *
 * @param {string} runsDir - absolute path to platform_core_data/runs
 * @param {object} opts
 * @param {string} opts.scope - canonical Run Scope (§5.2)
 * @param {string} opts.target - Module/UserStory/Feature this run targets (§5.3)
 * @param {Date} opts.now - explicit; never defaulted internally (matches generateRunFolderName)
 * @param {string} [opts.targetRoot] - Target Project root, for the code-state anchor (§5.8)
 * @param {string[]} [opts.scopePaths] - in-scope paths the anchor is scoped to
 * @param {Function} [opts.execFileSync] - injected for the anchor's git calls
 * @param {string} [opts.folderName] - pre-generated name; otherwise generated here
 * @param {string} [opts.workflow] - first_run / user_story_run / bug_fix_run / 'unversioned'
 * @param {string} [opts.createdBy]
 * @param {object} [opts.extraRunJson] - additional run.json fields (e.g. lineage on a refinement)
 * @param {boolean} [opts.activate=false] - write the Active Run pointer to this run
 * @param {boolean} [opts.manifest=true] - create metadata/RunManifest.md
 * @returns {{folderName: string, runDir: string, runJson: object, anchor: object, activated: boolean, manifestPath: string|null}}
 */
function createRun(runsDir, opts = {}) {
  const {
    scope, target, now, targetRoot, scopePaths = [], execFileSync,
    workflow, createdBy, extraRunJson = {}, activate = false, manifest = true,
  } = opts;

  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new CreateRunError('createRun requires an explicit valid `now` Date.');
  }
  if (!scope && !opts.folderName) {
    throw new CreateRunError('createRun requires a `scope` (or a pre-generated `folderName`).');
  }
  // Validated BEFORE any folder is created — a rejected NDC ownership shape must leave nothing
  // behind, exactly like every other createRun() validation failure.
  validateNdcRunScope(extraRunJson);

  let existingNames = [];
  try {
    existingNames = fs.readdirSync(runsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => e.name);
  } catch { /* fresh runs dir — created below */ }

  const folderName = opts.folderName
    || generateRunFolderName({ scope, target }, { existingNames, now });

  const runDir = path.join(runsDir, folderName);
  if (fs.existsSync(runDir)) {
    throw new CreateRunError(
      `Run folder ${folderName} already exists. Run creation never overwrites an existing run — ` +
      'a run folder is immutable once written (run_manager.md §6).'
    );
  }

  // metadata/ is the one folder every run has (§6). Stage folders are created by the stages
  // themselves, when they actually write — never pre-created here.
  fs.mkdirSync(path.join(runDir, 'metadata'), { recursive: true });

  // The anchor is captured unconditionally. When there is no target root or no git, the result carries
  // targetRef: null WITH a stated reason — an unversioned target is not an unchanged one (§5.8), and
  // that distinction only survives if the reason is recorded at creation.
  const anchor = (targetRoot && execFileSync)
    ? captureTargetRef(targetRoot, { scopePaths, capturedAt: now, execFileSync })
    : {
      targetRef: null,
      targetRefScope: scopePaths,
      targetRefCapturedAt: now.toISOString(),
      targetRepoRoot: null,
      targetRefReason: targetRoot
        ? 'no execFileSync provided — the code-state anchor could not be captured'
        : 'no Target Project root resolved — the code-state anchor could not be captured',
    };

  const parsed = parseRunFolderName(folderName);
  const runJson = {
    folderName,
    index: parsed.index ?? null,
    scope: scope ?? parsed.scope ?? null,
    target: target ?? parsed.target ?? null,
    workflow: workflow || UNVERSIONED,
    ...anchor,
    createdBy: createdBy || 'Run Manager',
    startedTime: now.toISOString(),
    status: 'Preparing',
    // NDC Core Service run-ownership fields — optional, default null, zero impact on any non-NDC
    // run (see validateNdcRunScope's header).
    service: null,
    feature: null,
    supplier: null,
    sharedScope: null,
    ...extraRunJson,
  };
  validateNdcRunScope(runJson);
  writeJson(path.join(runDir, 'metadata', 'run.json'), runJson);

  let manifestPath = null;
  if (manifest) {
    manifestPath = path.join(runDir, 'metadata', 'RunManifest.md');
    fs.writeFileSync(manifestPath, renderRunManifest({ runJson, now }), 'utf8');
  }

  let activated = false;
  if (activate) {
    setActiveRun(runsDir, folderName, {
      now,
      setBy: createdBy || 'Run Manager',
      note: workflow ? `created by ${workflow}` : undefined,
    });
    activated = true;
  }

  return { folderName, runDir, runJson, anchor, activated, manifestPath };
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

/**
 * Backfills the code-state anchor onto an existing run that has none.
 *
 * Runs created before §5.8 (or while git was unavailable) carry no `targetRef`, so drift reports
 * `unknown-no-anchor` forever. Backfilling anchors them to *now*, which is honest only if stated:
 * the recorded `targetRefBackfilled` flag and reason say the anchor is the code state at backfill
 * time, NOT at the run's execution — so nobody later mistakes it for evidence the run was verified
 * against that commit.
 *
 * @param {string} runsDir
 * @param {string} folderName
 * @param {{now: Date, targetRoot: string, scopePaths?: string[], execFileSync: Function, force?: boolean}} opts
 * @returns {{updated: boolean, reason: string, anchor: object|null}}
 */
function backfillTargetRef(runsDir, folderName, opts = {}) {
  const { now, targetRoot, scopePaths = [], execFileSync, force = false } = opts;
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new CreateRunError('backfillTargetRef requires an explicit valid `now` Date.');
  }

  const file = path.join(runsDir, folderName, 'metadata', 'run.json');
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return { updated: false, reason: `${folderName} has no readable metadata/run.json`, anchor: null };
  }

  if (meta.targetRef && !force) {
    return {
      updated: false,
      anchor: null,
      reason: `${folderName} already has targetRef ${String(meta.targetRef).slice(0, 7)} — ` +
        'refusing to overwrite a real anchor (pass force to replace it deliberately)',
    };
  }

  const anchor = captureTargetRef(targetRoot, { scopePaths, capturedAt: now, execFileSync });
  const next = {
    ...meta,
    ...anchor,
    // The honesty flag: this anchor describes the code at backfill time, not at execution time.
    targetRefBackfilled: true,
    targetRefReason:
      `${anchor.targetRefReason} — BACKFILLED at ${now.toISOString()}: this is the code state when ` +
      'the anchor was added, not when the run executed, so drift measured from it understates what ' +
      'actually changed since the run.',
  };
  writeJson(file, next);
  return { updated: true, reason: 'anchor backfilled', anchor: next };
}

module.exports = {
  CreateRunError,
  createRun,
  backfillTargetRef,
  validateNdcRunScope,
};
