param(
  [switch]$FailOnFound
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

$forbiddenPatterns = @(
  "^codex pessoal/",
  "^.+/~\$.*\.xlsx$",
  "^.+/~\$.*\.docx$"
)

function Matches-Forbidden {
  param([string]$Path)

  foreach ($pattern in $forbiddenPatterns) {
    if ($Path -match $pattern) {
      return $true
    }
  }
  return $false
}

$tracked = git -C $repoRoot ls-files
$staged = git -C $repoRoot diff --cached --name-only
$untracked = git -C $repoRoot ls-files --others --exclude-standard

$trackedHits = @($tracked | Where-Object { Matches-Forbidden $_ })
$stagedHits = @($staged | Where-Object { Matches-Forbidden $_ })
$untrackedHits = @($untracked | Where-Object { Matches-Forbidden $_ })

$lines = @()
$lines += "== Scope Guard =="
$lines += "Repo: $repoRoot"
$lines += ""
$lines += "Tracked forbidden files: $($trackedHits.Count)"
foreach ($item in $trackedHits) { $lines += " - $item" }
$lines += ""
$lines += "Staged forbidden files: $($stagedHits.Count)"
foreach ($item in $stagedHits) { $lines += " - $item" }
$lines += ""
$lines += "Untracked forbidden files: $($untrackedHits.Count)"
foreach ($item in $untrackedHits) { $lines += " - $item" }

$output = $lines -join "`r`n"
Write-Output $output

$foundAny = ($trackedHits.Count + $stagedHits.Count + $untrackedHits.Count) -gt 0

if ($FailOnFound -and $foundAny) {
  throw "Scope guard encontrou arquivos fora de escopo."
}

