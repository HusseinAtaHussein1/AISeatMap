# Install the Agentic AI Testing Platform into a project, from a git clone.
#
# The Windows counterpart to init.sh. Like it, this is a thin wrapper that hands off to the same
# bin/agentic-testing.js `npx agentic-testing` runs, so the install paths cannot diverge.
#
# Usage:
#   .\scripts\init.ps1                        # install into the current directory
#   .\scripts\init.ps1 C:\work\my-app         # install into that project
#   .\scripts\init.ps1 C:\work\my-app -DryRun
#
# Pass additional CLI flags after -- , e.g.:
#   .\scripts\init.ps1 C:\work\my-app -- --git-mode host-repo --yes

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Target,

    [switch]$DryRun,
    [switch]$Yes,

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Passthrough
)

$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $PSScriptRoot
$cli = Join-Path $packageRoot 'bin\agentic-testing.js'

$node = Get-Command node -ErrorAction SilentlyContinue
if ($null -eq $node) {
    Write-Error "node is required but was not found on PATH. Install Node.js 18.17 or newer, then re-run this script."
    exit 1
}

$version = (& node -p 'process.versions.node')
$parts = $version.Split('.')
if ([int]$parts[0] -lt 18 -or ([int]$parts[0] -eq 18 -and [int]$parts[1] -lt 17)) {
    Write-Error "Node.js 18.17 or newer is required (found v$version)."
    exit 1
}

if (-not (Test-Path $cli)) {
    Write-Error "$cli not found - is this a complete checkout?"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($Target)) {
    $Target = (Get-Location).Path
}

$cliArgs = @('init', '--target', $Target)
if ($DryRun) { $cliArgs += '--dry-run' }
if ($Yes)    { $cliArgs += '--yes' }
if ($Passthrough) {
    # Drop a leading '--' separator if PowerShell handed one through.
    $cliArgs += ($Passthrough | Where-Object { $_ -ne '--' })
}

Write-Host "Platform:  $packageRoot"
Write-Host "Target:    $Target"
Write-Host ""

& node $cli @cliArgs
exit $LASTEXITCODE
