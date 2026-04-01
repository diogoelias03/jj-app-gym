param(
  [switch]$RunChecks
)

$ErrorActionPreference = "Continue"

function Get-CheckResult {
  param(
    [string]$Name,
    [scriptblock]$Command
  )

  try {
    & $Command | Out-Null
    return [pscustomobject]@{
      Name = $Name
      Status = "PASS"
      Details = ""
    }
  } catch {
    return [pscustomobject]@{
      Name = $Name
      Status = "FAIL"
      Details = $_.Exception.Message
    }
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $repoRoot "release\reports"
if (!(Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir "go-nogo-$timestamp.md"

$branch = (git -C $repoRoot rev-parse --abbrev-ref HEAD).Trim()
$head = (git -C $repoRoot log -1 --oneline).Trim()
$statusOutput = git -C $repoRoot status --short
$statusShort = (($statusOutput | Out-String).Trim())
$workingTreeClean = [string]::IsNullOrWhiteSpace($statusShort)

$results = @()
$results += [pscustomobject]@{
  Name = "Git working tree limpo"
  Status = $(if ($workingTreeClean) { "PASS" } else { "WARN" })
  Details = $(if ($workingTreeClean) { "" } else { $statusShort })
}

if ($RunChecks) {
  $results += Get-CheckResult -Name "API typecheck" -Command {
    npm --prefix (Join-Path $repoRoot "api") run typecheck
  }
  $results += Get-CheckResult -Name "API build" -Command {
    npm --prefix (Join-Path $repoRoot "api") run build
  }
  $results += Get-CheckResult -Name "Mobile typecheck" -Command {
    npm --prefix (Join-Path $repoRoot "mobile") run typecheck
  }
} else {
  $results += [pscustomobject]@{
    Name = "Checks tecnicos"
    Status = "SKIPPED"
    Details = "Executar script com -RunChecks para validar localmente."
  }
}

$failed = $results | Where-Object { $_.Status -eq "FAIL" }
$warns = $results | Where-Object { $_.Status -eq "WARN" }

$decision = if ($failed.Count -gt 0) {
  "NO-GO"
} elseif ($warns.Count -gt 0) {
  "GO COM RISCO"
} else {
  "GO"
}

$lines = @()
$lines += "# Go/No-Go Report (MVP RC)"
$lines += ""
$lines += "- Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "- Branch: $branch"
$lines += "- Commit: $head"
$lines += "- Decisao preliminar: **$decision**"
$lines += ""
$lines += "## Resultado dos checks"

foreach ($item in $results) {
  $line = "- [$($item.Status)] $($item.Name)"
  if (-not [string]::IsNullOrWhiteSpace($item.Details)) {
    $line += " -> $($item.Details)"
  }
  $lines += $line
}

$lines += ""
$lines += "## Acoes recomendadas"
if ($decision -eq "NO-GO") {
  $lines += "1. Corrigir falhas tecnicas antes de promover release."
  $lines += "2. Reexecutar script com `-RunChecks`."
}
elseif ($decision -eq "GO COM RISCO") {
  $lines += "1. Revisar warnings (ex.: working tree nao limpo)."
  $lines += "2. Confirmar aceitacao de risco no go/no-go."
}
else {
  $lines += "1. Executar checkpoint/tag final de RC."
  $lines += "2. Registrar evidencias finais da rodada."
}

Set-Content -Path $reportPath -Value ($lines -join "`r`n") -Encoding UTF8
Write-Output "Relatorio gerado: $reportPath"
Write-Output "Decisao preliminar: $decision"
