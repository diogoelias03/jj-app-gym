param(
  [string]$Branch = "main",
  [int]$MaxAttempts = 5,
  [int]$DelaySeconds = 20
)

$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $PSNativeCommandUseErrorActionPreference = $false
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $repoRoot "release\reports"
if (!(Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

function Invoke-GitPush([string[]]$GitArgs) {
  try {
    $output = & git -C $repoRoot @GitArgs 2>&1
    $code = $LASTEXITCODE
  }
  catch {
    $output = $_.Exception.Message
    $code = 1
  }
  return @{
    Code = $code
    Output = ($output -join "`n")
  }
}

function Get-AheadCount {
  $statusLine = (& git -C $repoRoot status --short --branch | Select-Object -First 1)
  if ($statusLine -match "\[ahead ([0-9]+)\]") {
    return [int]$Matches[1]
  }
  return 0
}

$pushMainOk = $false
$mainOutput = ""

for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
  Write-Output ("Tentativa {0}/{1}: push branch '{2}'..." -f $attempt, $MaxAttempts, $Branch)
  $result = Invoke-GitPush -GitArgs @("push", "origin", $Branch)
  $mainOutput = $result.Output
  if ($result.Code -eq 0) {
    $pushMainOk = $true
    break
  }
  Write-Output "Falha no push da branch. Aguardando $DelaySeconds s para nova tentativa."
  if ($attempt -lt $MaxAttempts) {
    Start-Sleep -Seconds $DelaySeconds
  }
}

$pushTagsOk = $false
$tagsOutput = ""
if ($pushMainOk) {
  Write-Output "Push da branch concluido. Enviando tags..."
  $tagResult = Invoke-GitPush -GitArgs @("push", "origin", "--tags")
  $tagsOutput = $tagResult.Output
  $pushTagsOk = ($tagResult.Code -eq 0)
}

$ahead = Get-AheadCount
$head = (& git -C $repoRoot log -1 --oneline).Trim()
$recentCommits = (& git -C $repoRoot log --oneline -n 10) -join "`n"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir "push-sync-$timestamp.md"

$status = if ($pushMainOk -and $pushTagsOk) { "SUCCESS" } elseif ($pushMainOk) { "PARTIAL" } else { "FAILED" }

$reportLines = @()
$reportLines += "# Push Sync Report"
$reportLines += ""
$reportLines += "- Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")"
$reportLines += "- Branch: $Branch"
$reportLines += "- Status: $status"
$reportLines += "- AheadCount: $ahead"
$reportLines += "- HEAD: $head"
$reportLines += ""
$reportLines += "## Push branch output"
$reportLines += '```'
$reportLines += $mainOutput
$reportLines += '```'
$reportLines += ""
$reportLines += "## Push tags output"
$reportLines += '```'
$reportLines += $tagsOutput
$reportLines += '```'
$reportLines += ""
$reportLines += "## Recent commits"
$reportLines += '```'
$reportLines += $recentCommits
$reportLines += '```'
$report = $reportLines -join "`r`n"

Set-Content -Path $reportPath -Value $report -Encoding ascii

Write-Output "Relatorio: $reportPath"
if ($status -eq "SUCCESS") {
  Write-Output "Sincronizacao completa com sucesso."
  exit 0
}

if ($status -eq "PARTIAL") {
  Write-Output "Branch enviada, mas houve falha ao enviar tags. Tente novamente mais tarde."
  exit 1
}

Write-Output "Nao foi possivel sincronizar agora (rede possivelmente indisponivel)."
exit 1
