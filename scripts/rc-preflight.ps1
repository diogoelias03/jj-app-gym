param(
  [switch]$RunChecks = $true,
  [switch]$CreateCheckpoint,
  [string]$TagSuffix = "rc-preflight",
  [switch]$Push
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Output "== RC Preflight =="
Write-Output "Repo: $repoRoot"

if ($RunChecks) {
  Write-Output "Executando go/no-go com checks tecnicos..."
  powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "release-go-nogo.ps1") -RunChecks
} else {
  Write-Output "Executando go/no-go sem checks tecnicos..."
  powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "release-go-nogo.ps1")
}

$reportDir = Join-Path $repoRoot "release\reports"
$latestReport = Get-ChildItem -Path $reportDir -Filter "go-nogo-*.md" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $latestReport) {
  throw "Nao foi possivel localizar relatorio de go/no-go."
}

Write-Output "Relatorio mais recente: $($latestReport.FullName)"

$reportContent = Get-Content $latestReport.FullName -Raw
$decision = "INDEFINIDO"
if ($reportContent -match "Decisao preliminar:\s+\*\*(.+)\*\*") {
  $decision = $Matches[1]
}

Write-Output "Decisao preliminar detectada: $decision"

if ($CreateCheckpoint) {
  if ($decision -ne "GO") {
    throw "Checkpoint bloqueado: decisao atual e '$decision'. Ajuste os pontos pendentes e rode novamente."
  }

  $message = "checkpoint: rc preflight go"
  $checkpointScript = Join-Path $PSScriptRoot "checkpoint-sync.ps1"

  if ($Push) {
    powershell -ExecutionPolicy Bypass -File $checkpointScript -Message $message -TagSuffix $TagSuffix -Push
  } else {
    powershell -ExecutionPolicy Bypass -File $checkpointScript -Message $message -TagSuffix $TagSuffix
  }
}

Write-Output "RC preflight concluido."

