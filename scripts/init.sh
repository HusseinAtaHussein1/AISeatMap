#!/usr/bin/env bash
# Install the Agentic AI Testing Platform into a project, from a git clone.
#
# This is the clone route. It is a thin wrapper: it locates this checkout and hands off to the same
# bin/agentic-testing.js that `npx agentic-testing` runs, so the two install paths cannot diverge.
#
# Usage:
#   ./scripts/init.sh                      # install into the current directory
#   ./scripts/init.sh /path/to/my-app      # install into that project
#   ./scripts/init.sh /path/to/my-app --dry-run
#
# Any flag bin/agentic-testing.js accepts works here; everything is passed straight through.

set -euo pipefail

# These paths are handed to node, which on Windows is a native program: it cannot resolve the
# /c/... form Git Bash's `pwd` reports. `pwd -W` gives it C:/... instead. A no-op elsewhere.
abspath() (
  cd "$1" || exit 1
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) pwd -W ;;
    *) pwd ;;
  esac
)

SCRIPT_DIR="$(abspath "$(dirname "${BASH_SOURCE[0]}")")"
PACKAGE_ROOT="$(abspath "${SCRIPT_DIR}/..")"
CLI="${PACKAGE_ROOT}/bin/agentic-testing.js"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is required but was not found on PATH." >&2
  echo "Install Node.js 18.17 or newer, then re-run this script." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
NODE_MINOR="$(node -p 'process.versions.node.split(".")[1]')"
if [ "${NODE_MAJOR}" -lt 18 ] || { [ "${NODE_MAJOR}" -eq 18 ] && [ "${NODE_MINOR}" -lt 17 ]; }; then
  echo "Error: Node.js 18.17 or newer is required (found $(node -v))." >&2
  exit 1
fi

if [ ! -f "${CLI}" ]; then
  echo "Error: ${CLI} not found — is this a complete checkout?" >&2
  exit 1
fi

# First non-flag argument is the target; everything else passes through untouched.
TARGET=""
PASSTHROUGH=()
for arg in "$@"; do
  case "${arg}" in
    -*) PASSTHROUGH+=("${arg}") ;;
    *)  if [ -z "${TARGET}" ]; then TARGET="${arg}"; else PASSTHROUGH+=("${arg}"); fi ;;
  esac
done
if [ -z "${TARGET}" ]; then TARGET="$(abspath .)"; fi

echo "Platform:  ${PACKAGE_ROOT}"
echo "Target:    ${TARGET}"
echo ""

exec node "${CLI}" init --target "${TARGET}" ${PASSTHROUGH[@]+"${PASSTHROUGH[@]}"}
