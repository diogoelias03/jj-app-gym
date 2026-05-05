param(
  [string]$DatabaseName = "jj_app_gym_resume_20260505",
  [string]$PostgresPassword = "OzotL47cRIdR8ulKCD",
  [int]$Port = 3000,
  [string]$AdminApiKey = "local-admin-key",
  [switch]$SkipDbSetup
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiDir = Join-Path $repoRoot "api"
$reportDir = Join-Path $repoRoot "release\reports"
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

if (!(Test-Path $psql)) {
  throw "psql nao encontrado em: $psql"
}

if (!(Test-Path $reportDir)) {
  New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

if (-not $SkipDbSetup) {
  $env:PGPASSWORD = $PostgresPassword

  $exists = & $psql -U postgres -h localhost -p 5432 -d postgres -t -A -c "select 1 from pg_database where datname = '$DatabaseName';"
  if ($exists -ne "1") {
    & $psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE $DatabaseName;"
  }

  & $psql -U postgres -h localhost -p 5432 -d $DatabaseName -f (Join-Path $apiDir "db\schema.sql")
  & $psql -U postgres -h localhost -p 5432 -d $DatabaseName -f (Join-Path $apiDir "db\seed.sql")
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $reportDir "local-api-$timestamp.log"
$databaseUrl = "postgres://postgres:$PostgresPassword@localhost:5432/$DatabaseName"

$command = @"
`$env:DATABASE_URL='$databaseUrl'
`$env:PORT='$Port'
`$env:HOST='127.0.0.1'
`$env:JWT_SECRET='local-resume-secret'
`$env:ADMIN_API_KEY='$AdminApiKey'
`$env:CHECKIN_OPEN_HOURS_BEFORE='168'
`$env:CHECKIN_CLOSE_MINUTES_AFTER='10'
cd '$apiDir'
npm run dev *> '$logPath'
"@

$process = Start-Process -FilePath powershell -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  $command
) -WindowStyle Hidden -PassThru

Write-Output "API local iniciando..."
Write-Output "PID: $($process.Id)"
Write-Output "URL: http://127.0.0.1:$Port"
Write-Output "Database: $DatabaseName"
Write-Output "Log: $logPath"
