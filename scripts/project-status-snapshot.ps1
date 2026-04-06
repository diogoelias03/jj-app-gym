param(
  [string]$Owner = "Time JJ App Gym"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $repoRoot "release\reports"
if (!(Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir "project-status-$timestamp.md"

$branch = (git -C $repoRoot rev-parse --abbrev-ref HEAD).Trim()
$head = (git -C $repoRoot log -1 --oneline).Trim()
$lastTag = (git -C $repoRoot tag --sort=-creatordate | Select-Object -First 1)
$statusShort = ((git -C $repoRoot status --short | Out-String).Trim())
$workingTree = if ([string]::IsNullOrWhiteSpace($statusShort)) { "limpo" } else { "com pendencias" }

$latestGoNoGo = Get-ChildItem -Path $reportDir -Filter "go-nogo-*.md" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

$latestSmoke = Get-ChildItem -Path $reportDir -Filter "go-live-smoke-*.md" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

$latestGoNoGoName = if ($latestGoNoGo) { $latestGoNoGo.Name } else { "N/A" }
$latestSmokeName = if ($latestSmoke) { $latestSmoke.Name } else { "N/A" }

$lines = @()
$lines += "# Project Status Snapshot"
$lines += ""
$lines += "- Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "- Responsavel: $Owner"
$lines += "- Branch: $branch"
$lines += "- Commit atual: $head"
$lines += "- Ultimo checkpoint/tag: $lastTag"
$lines += "- Working tree: $workingTree"
$lines += ""
$lines += "## Estado de release"
$lines += "- RC final: concluido (GO)"
$lines += "- Go-live controlado: em andamento"
$lines += "- Estabilizacao: proxima fase"
$lines += ""
$lines += "## Evidencias recentes"
$lines += "- Ultimo go/no-go report: $latestGoNoGoName"
$lines += "- Ultimo go-live smoke report: $latestSmokeName"
$lines += ""
$lines += "## Proximos passos recomendados"
$lines += "1. Executar rodada final de QA funcional e anexar evidencias."
$lines += "2. Rodar go-live smoke sem dry-run na janela de lancamento."
$lines += "3. Encerrar janela com go-live-close e comunicar status final."

Set-Content -Path $reportPath -Value ($lines -join "`r`n") -Encoding UTF8
Write-Output "Snapshot gerado: $reportPath"
