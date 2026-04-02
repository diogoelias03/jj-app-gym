param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$Email = "aluno@jjappgym.dev",
  [string]$Password = "123456",
  [string]$AdminKey = "local-admin-key",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Add-Result {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Details = ""
  )

  $script:results += [pscustomobject]@{
    Name = $Name
    Status = $Status
    Details = $Details
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $repoRoot "release\reports"
if (!(Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir "go-live-smoke-$timestamp.md"

$results = @()
$decision = "GO"

if ($DryRun) {
  Add-Result -Name "Modo de execucao" -Status "SKIPPED" -Details "DryRun ativo (sem chamadas HTTP)."
} else {
  try {
    $health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/health"
    Add-Result -Name "API health" -Status "PASS" -Details "status=$($health.status)"
  } catch {
    Add-Result -Name "API health" -Status "FAIL" -Details $_.Exception.Message
  }

  $authHeaders = $null
  try {
    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
    $login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/auth/login" -ContentType "application/json" -Body $loginBody
    if (-not $login.access_token) { throw "Login sem access_token" }
    $authHeaders = @{ Authorization = "Bearer $($login.access_token)" }
    Add-Result -Name "Login aluno" -Status "PASS"
  } catch {
    Add-Result -Name "Login aluno" -Status "FAIL" -Details $_.Exception.Message
  }

  if ($authHeaders) {
    try {
      $null = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/classes?branchId=1" -Headers $authHeaders
      Add-Result -Name "Lista de aulas" -Status "PASS"
    } catch {
      Add-Result -Name "Lista de aulas" -Status "FAIL" -Details $_.Exception.Message
    }

    try {
      $null = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/progress" -Headers $authHeaders
      Add-Result -Name "Progresso" -Status "PASS"
    } catch {
      Add-Result -Name "Progresso" -Status "FAIL" -Details $_.Exception.Message
    }

    try {
      $futureClassBody = @{
        branchId = 1
        beltId = 1
        instructorId = 1
        title = "Aula Smoke Go-Live"
        classCategory = "fundamentos"
        startsAt = (Get-Date).AddDays(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        endsAt = (Get-Date).AddDays(2).AddHours(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        capacity = 20
      } | ConvertTo-Json

      $futureClass = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/admin/classes" -Headers @{ "x-admin-key" = $AdminKey } -ContentType "application/json" -Body $futureClassBody
      $qrBody = @{ classSessionId = [int]$futureClass.id; expiresInMinutes = 15 } | ConvertTo-Json
      $qr = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/admin/checkins/qr-token" -Headers @{ "x-admin-key" = $AdminKey } -ContentType "application/json" -Body $qrBody
      $checkQrBody = @{ qrToken = $qr.qrToken } | ConvertTo-Json
      $null = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/checkins/qr" -Headers $authHeaders -ContentType "application/json" -Body $checkQrBody
      Add-Result -Name "Check-in QR" -Status "PASS"
    } catch {
      Add-Result -Name "Check-in QR" -Status "FAIL" -Details $_.Exception.Message
    }
  }
}

$hasFail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count -gt 0
if ($hasFail) {
  $decision = "NO-GO"
}

$lines = @()
$lines += "# Go-Live Smoke Report"
$lines += ""
$lines += "- Data/Hora: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$lines += "- BaseUrl: $BaseUrl"
$lines += "- Decisao: **$decision**"
$lines += ""
$lines += "## Resultado"
foreach ($item in $results) {
  $line = "- [$($item.Status)] $($item.Name)"
  if (-not [string]::IsNullOrWhiteSpace($item.Details)) {
    $line += " -> $($item.Details)"
  }
  $lines += $line
}

Set-Content -Path $reportPath -Value ($lines -join "`r`n") -Encoding UTF8
Write-Output "Relatorio gerado: $reportPath"
Write-Output "Decisao: $decision"

