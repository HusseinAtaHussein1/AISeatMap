#!/usr/bin/env bash
# End-to-end verification: pack the real package, install it into three realistic target repos, and
# assert the properties that matter. Failures are loud and the script exits non-zero.
set -uo pipefail

REPO="${1:?usage: e2e.sh <platform repo> <workdir>}"
WORK="${2:?usage: e2e.sh <platform repo> <workdir>}"

PASS=0
FAIL=0
ok()   { printf '  \033[32mPASS\033[0m %s\n' "$1"; PASS=$((PASS+1)); }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; FAIL=$((FAIL+1)); }
check(){ if eval "$2"; then ok "$1"; else bad "$1"; fi }

rm -rf "$WORK"; mkdir -p "$WORK"

# Absolute from here on. run_install() cd's into the target project before invoking the CLI, so a
# relative $WORK would re-resolve against that project and the packed CLI would not be found.
# On Git Bash/MSYS `pwd` reports /c/..., which npm and node cannot resolve because they are
# native Windows programs. `pwd -W` gives them C:/... instead. Same accommodation as the
# `tar --force-local` below, and a no-op everywhere else.
abspath() (
  cd "$1" || exit 1
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) pwd -W ;;
    *) pwd ;;
  esac
)
WORK="$(abspath "$WORK")"
REPO="$(abspath "$REPO")"

# The skill set is read from the repo under test, never hardcoded. A literal count goes stale the
# moment a skill is added or renamed, and a stale assertion is worse than none: it then fails for
# a reason unrelated to whatever change triggered the run. Names, not a count — a count cannot
# tell a renamed skill from a correctly installed one.
SKILLS="$(ls "$REPO/.claude/skills" | sort | tr '\n' ' ')"
SKILL_COUNT="$(ls "$REPO/.claude/skills" | wc -l)"
if [ "$SKILL_COUNT" -eq 0 ]; then
  echo "  FAIL: $REPO/.claude/skills is empty — there is nothing to verify against"; exit 1
fi
echo "Verifying against $SKILL_COUNT skills: $SKILLS"

# Fixtures first: make-fixtures.sh rm -rf's its own base dir, so building it after unpacking the
# package would delete the package.
bash "$(dirname "$0")/make-fixtures.sh" "$WORK/fixtures" >/dev/null 2>&1

cd "$REPO"

echo "=============================================================="
echo " 1. npm pack (runs prepack -> verifyPackable)"
echo "=============================================================="
# prepack writes to stdout, so filter to the .tgz line rather than blindly taking the last one.
npm pack --pack-destination "$WORK" >"$WORK/pack.log" 2>&1
TARBALL="$(grep -oE '[A-Za-z0-9@._-]+\.tgz' "$WORK/pack.log" | tail -1)"
if [ -z "$TARBALL" ] || [ ! -f "$WORK/$TARBALL" ]; then
  echo "  FAIL: npm pack produced no tarball"; exit 1
fi
ok "npm pack produced $TARBALL"

# Unpack it: this is exactly what a consumer receives from the registry.
mkdir -p "$WORK/pkg"
tar --force-local -xzf "$WORK/$TARBALL" -C "$WORK/pkg"
PKG="$WORK/pkg/package"
check "the package contains bin/agentic-testing.js"        "[ -f '$PKG/bin/agentic-testing.js' ]"
check "the package contains every skill ($SKILL_COUNT)"    "[ \"\$(ls '$PKG/.claude/skills' | sort | tr '\n' ' ')\" = \"\$SKILLS\" ]"
check "the package contains platform_core/tools"           "[ -d '$PKG/platform_core/tools' ]"
check "the package contains the pipeline spec"             "[ -f '$PKG/workflows_and_pipelines/pipeline/pipeline.md' ]"
check "the package contains Platform Knowledge patterns"   "[ -d '$PKG/platform_core/knowledge/patterns' ]"
check "the package does NOT contain a project PRD"         "[ ! -f '$PKG/platform_core_data/knowledge_base/PRD.md' ]"
check "the package does NOT contain runs/ history"         "[ ! -d '$PKG/platform_core_data/runs' ]"
check "the package does NOT contain node_modules"          "[ ! -d '$PKG/node_modules' ]"

CLI="node $PKG/bin/agentic-testing.js"

# ---------------------------------------------------------------------------------------------
run_install() {  # name, dir, extra flags
  echo ""
  echo "=============================================================="
  echo " $1"
  echo "=============================================================="
  ( cd "$2" && eval "$CLI init --target '$2' --yes $3" ) >"$WORK/$(basename "$2").log" 2>&1
  local rc=$?
  if [ $rc -ne 0 ]; then
    bad "init exited $rc"; tail -20 "$WORK/$(basename "$2").log" | sed 's/^/      /'
    return 1
  fi
  ok "init completed"
}

# =============================================================================================
# 2. BROWNFIELD — Playwright app with an existing suite
# =============================================================================================
APP="$WORK/brownfield-playwright"
cp -r "$WORK/fixtures/brownfield-playwright" "$APP"

HOST_COMMITS_BEFORE=$(git -C "$APP" rev-list --count HEAD)
SRC_HASH_BEFORE=$(sha1sum "$APP/src/components/Cart.tsx" | cut -d' ' -f1)
SPEC_HASH_BEFORE=$(sha1sum "$APP/tests/e2e/user-login.spec.ts" | cut -d' ' -f1)
PKGJSON_BEFORE=$(sha1sum "$APP/package.json" | cut -d' ' -f1)

run_install "2. BROWNFIELD — Playwright app" "$APP" ""

check "tool folder created"                       "[ -d '$APP/agentic-testing-tool' ]"
check "platform_core copied"                      "[ -f '$APP/agentic-testing-tool/platform_core/tools/platform_paths/paths.js' ]"
check "pipeline spec copied"                      "[ -f '$APP/agentic-testing-tool/workflows_and_pipelines/pipeline/pipeline.md' ]"
check "blank PRD scaffolded"                      "[ -f '$APP/agentic-testing-tool/platform_core_data/knowledge_base/PRD.md' ]"
check "runs shape scaffolded"                     "[ -d '$APP/agentic-testing-tool/platform_core_data/runs' ]"
check "Platform Knowledge installed"              "[ -d '$APP/agentic-testing-tool/platform_core/knowledge/patterns' ]"
check "every skill installed for Claude Code ($SKILL_COUNT)" "[ \"\$(ls '$APP/.claude/skills' | sort | tr '\n' ' ')\" = \"\$SKILLS\" ]"
check ".mcp.json created"                         "[ -f '$APP/.mcp.json' ]"
check "tool folder has its own git repo"          "[ -d '$APP/agentic-testing-tool/.git' ]"

echo ""
echo "  -- the target project must be untouched --"
check "app source unchanged"                      "[ \$(sha1sum '$APP/src/components/Cart.tsx' | cut -d' ' -f1) = '$SRC_HASH_BEFORE' ]"
check "existing spec unchanged"                   "[ \$(sha1sum '$APP/tests/e2e/user-login.spec.ts' | cut -d' ' -f1) = '$SPEC_HASH_BEFORE' ]"
check "package.json unchanged"                    "[ \$(sha1sum '$APP/package.json' | cut -d' ' -f1) = '$PKGJSON_BEFORE' ]"
check "playwright.config.ts unchanged"            "git -C '$APP' diff --quiet -- playwright.config.ts"
check "CI workflow untouched"                     "git -C '$APP' diff --quiet -- .github/workflows/ci.yml"
check "no commits added to the host repo"         "[ \$(git -C '$APP' rev-list --count HEAD) -eq $HOST_COMMITS_BEFORE ]"
# The tool folder must not appear at all (it is gitignored). The only host changes permitted are
# the three install-time fragments of pipeline.md 13.5, each written once with confirmation.
check "tool folder invisible to host git"         "! git -C '$APP' status --porcelain | grep -q 'agentic-testing-tool'"
check "host changes are ONLY the 13.5 fragments"  "[ -z \"\$(git -C '$APP' status --porcelain | grep -vE '(^ M \.gitignore|\.claude/|\.mcp\.json)')\" ]"
check "host .gitignore kept its own rules"        "grep -q '^node_modules/' '$APP/.gitignore'"
check "host .gitignore ignores the tool folder"   "grep -q 'agentic-testing-tool/' '$APP/.gitignore'"
check ".env still ignored by the host"            "grep -q '^.env' '$APP/.gitignore'"

echo ""
echo "  -- detection and configuration --"
CFG="$APP/agentic-testing-tool/platform.config.json"
check "automationRoot is the real test dir"       "grep -q '\"automationRoot\": \"tests/e2e\"' '$CFG'"
check "framework detected as Playwright"          "grep -q 'Playwright' '$CFG'"
check "writeAllowlist scoped to tests/e2e"        "grep -q 'tests/e2e/\*\*' '$CFG'"
check "targetRoot is relative"                    "grep -q '\"targetRoot\": \"\\.\\.\"' '$CFG'"
check "doctor validates the installation"         "$CLI doctor --target '$APP' >/dev/null 2>&1"

echo ""
echo "  -- the write boundary actually holds --"
BOUNDARY="$WORK/boundary.js"
cat > "$BOUNDARY" <<'JS'
const path = require('path');
const app = process.argv[2];
const paths = require(path.join(app, 'agentic-testing-tool/platform_core/tools/platform_paths/paths.js'));
const roots = paths.resolveRoots({ startDir: path.join(app, 'agentic-testing-tool'), fresh: true });
const w = (p) => paths.canWrite(path.join(app, p), roots);
const r = (p) => paths.canRead(path.join(app, p), roots);
const results = {
  writeTest: w('tests/e2e/new.spec.ts'),
  writeSrc: w('src/components/Cart.tsx'),
  writeCi: w('.github/workflows/ci.yml'),
  writePkg: w('package.json'),
  readEnv: r('.env'),
  readSrc: r('src/components/Cart.tsx'),
};
console.log(JSON.stringify(results));
JS
BOUND=$(node "$BOUNDARY" "$APP")
check "CAN write into tests/e2e"                  "echo '$BOUND' | grep -q '\"writeTest\":true'"
check "CANNOT write app source"                   "echo '$BOUND' | grep -q '\"writeSrc\":false'"
check "CANNOT write CI config"                    "echo '$BOUND' | grep -q '\"writeCi\":false'"
check "CANNOT write package.json"                 "echo '$BOUND' | grep -q '\"writePkg\":false'"
check "CANNOT read .env (secret denylist)"        "echo '$BOUND' | grep -q '\"readEnv\":false'"
check "CAN read app source (technical facts)"     "echo '$BOUND' | grep -q '\"readSrc\":true'"

echo ""
echo "  -- idempotency --"
GI_BEFORE=$(sha1sum "$APP/.gitignore" | cut -d' ' -f1)
MCP_BEFORE=$(sha1sum "$APP/.mcp.json" | cut -d' ' -f1)
PRD_BEFORE=$(sha1sum "$APP/agentic-testing-tool/platform_core_data/knowledge_base/PRD.md" | cut -d' ' -f1)
echo "# OUR REAL REQUIREMENTS" > "$APP/agentic-testing-tool/platform_core_data/knowledge_base/PRD.md"
PRD_EDITED=$(sha1sum "$APP/agentic-testing-tool/platform_core_data/knowledge_base/PRD.md" | cut -d' ' -f1)
( cd "$APP" && eval "$CLI init --target '$APP' --yes" ) >/dev/null 2>&1
check "re-install leaves .gitignore identical"    "[ \$(sha1sum '$APP/.gitignore' | cut -d' ' -f1) = '$GI_BEFORE' ]"
check "re-install leaves .mcp.json identical"     "[ \$(sha1sum '$APP/.mcp.json' | cut -d' ' -f1) = '$MCP_BEFORE' ]"
check "re-install NEVER overwrites your PRD"      "[ \$(sha1sum '$APP/agentic-testing-tool/platform_core_data/knowledge_base/PRD.md' | cut -d' ' -f1) = '$PRD_EDITED' ]"

# =============================================================================================
# 3. BROWNFIELD — Maven/SHAFT, tests at depth 6
# =============================================================================================
JAPP="$WORK/brownfield-shaft"
cp -r "$WORK/fixtures/brownfield-shaft" "$JAPP"
run_install "3. BROWNFIELD — Maven/SHAFT (depth-6 tests)" "$JAPP" ""
JCFG="$JAPP/agentic-testing-tool/platform.config.json"
check "found the deep Maven test tree"            "grep -q 'src/test/java' '$JCFG'"
check "framework detected as SHAFT"               "grep -q 'SHAFT' '$JCFG'"
check "java source untouched"                     "git -C '$JAPP' diff --quiet -- src/"
check "no commits added to the host repo"         "[ \$(git -C '$JAPP' rev-list --count HEAD) -eq 1 ]"

# =============================================================================================
# 4. GREENFIELD — no tests at all
# =============================================================================================
GAPP="$WORK/greenfield-node"
cp -r "$WORK/fixtures/greenfield-node" "$GAPP"
run_install "4. GREENFIELD — Express app with no tests" "$GAPP" ""
check "greenfield noted in the log"               "grep -qi 'greenfield' '$WORK/greenfield-node.log'"
check "suggested tests/e2e"                       "grep -q 'tests/e2e' '$GAPP/agentic-testing-tool/platform.config.json'"
check "did NOT scaffold an application"           "[ \$(ls '$GAPP/src' | wc -l) -eq 1 ]"
check "did NOT create a test dir yet"             "[ ! -d '$GAPP/tests' ]"
check "app source untouched"                      "git -C '$GAPP' diff --quiet -- src/"

# =============================================================================================
# 5. ADVERSARIAL — host gitignores the tool folder, no nested repo
# =============================================================================================
echo ""
echo "=============================================================="
echo " 5. ADVERSARIAL — gitignored tool folder, git.mode=off"
echo "=============================================================="
AAPP="$WORK/adversarial"
cp -r "$WORK/fixtures/brownfield-playwright" "$AAPP"
( cd "$AAPP" && eval "$CLI init --target '$AAPP' --yes --git-mode off" ) >"$WORK/adversarial.log" 2>&1
check "init succeeded with git off"               "[ -d '$AAPP/agentic-testing-tool' ]"
check "warned that protection is unavailable"     "grep -qi 'three-way-merge protection' '$WORK/adversarial.log'"
check "created no nested repo"                    "[ ! -d '$AAPP/agentic-testing-tool/.git' ]"

DEGRADED="$WORK/degraded.js"
cat > "$DEGRADED" <<'JS'
// The merge must degrade honestly rather than fabricate a successful, verified promotion.
const path = require('path'); const fs = require('fs'); const os = require('os');
const app = process.argv[2];
const lc = path.join(app, 'agentic-testing-tool/platform_core/tools/automation_lifecycle');
const { computeMergePlan } = require(path.join(lc, 'mergePlan.js'));
const { applyMerge } = require(path.join(lc, 'mergeApply.js'));
const baseline = fs.mkdtempSync(path.join(os.tmpdir(), 'deg-b-'));
const working  = fs.mkdtempSync(path.join(os.tmpdir(), 'deg-w-'));
fs.writeFileSync(path.join(working, 'New.java'), 'x');
const plan = computeMergePlan(baseline, working, null, { gitMode: 'off', execFileSync: () => { throw new Error('no git'); } });
const res = applyMerge(baseline, working, plan, { project: 'P', packageName: 'K', runFolder: 'R' },
  { gitMode: 'off', apply: true, now: new Date(), execFileSync: () => { throw new Error('no git'); } });
console.log(JSON.stringify({
  degradedMode: plan.degradedMode,
  warned: plan.warnings.some(w => w.includes('three-way conflict detection is unavailable')),
  applied: res.applied, committed: res.committed,
  fileWritten: fs.existsSync(path.join(baseline, 'New.java')),
}));
JS
DEG=$(node "$DEGRADED" "$AAPP" 2>&1)
check "merge reports degradedMode=no-git"         "echo '$DEG' | grep -q '\"degradedMode\":\"no-git\"'"
check "merge warns, verbatim per pipeline 12.4"   "echo '$DEG' | grep -q '\"warned\":true'"
check "files still written to the baseline"       "echo '$DEG' | grep -q '\"fileWritten\":true'"
check "but committed is FALSE (no fake success)"  "echo '$DEG' | grep -q '\"committed\":false'"

# =============================================================================================
# 6. Clone route parity
# =============================================================================================
echo ""
echo "=============================================================="
echo " 6. CLONE ROUTE — scripts/init.sh must match npx exactly"
echo "=============================================================="
CAPP="$WORK/clone-route"
cp -r "$WORK/fixtures/greenfield-node" "$CAPP"
bash "$PKG/scripts/init.sh" "$CAPP" --yes >"$WORK/clone.log" 2>&1
check "init.sh completed"                         "[ -d '$CAPP/agentic-testing-tool' ]"
check "clone route wrote the same config"         "diff <(sed 's/\"detectedAt\":.*/X/' '$GAPP/agentic-testing-tool/platform.config.json') <(sed 's/\"detectedAt\":.*/X/' '$CAPP/agentic-testing-tool/platform.config.json') >/dev/null"

echo ""
echo "=============================================================="
printf " RESULT: \033[32m%d passed\033[0m, " "$PASS"
if [ "$FAIL" -gt 0 ]; then printf "\033[31m%d failed\033[0m\n" "$FAIL"; else printf "0 failed\n"; fi
echo "=============================================================="
[ "$FAIL" -eq 0 ]
