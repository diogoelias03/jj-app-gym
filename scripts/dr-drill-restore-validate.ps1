param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath,
  [string]$Namespace = "jj-gym",
  [string]$KubeconfigPath = "",
  [string]$ReportPath = ""
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  throw "kubectl nao encontrado no PATH. Instale o kubectl antes de executar o DR drill."
}

if (!(Test-Path $BackupPath)) {
  throw "Arquivo de backup nao encontrado: $BackupPath"
}

if ($KubeconfigPath -ne "") {
  $env:KUBECONFIG = (Resolve-Path $KubeconfigPath).Path
}

if ($ReportPath -eq "") {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $ReportPath = "release/reports/dr-drill-$ts.md"
}

$reportDir = Split-Path -Parent $ReportPath
if ($reportDir -and !(Test-Path $reportDir)) {
  New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
}

$pod = (kubectl -n $Namespace get pods -l app=jj-gym-postgres -o jsonpath="{.items[0].metadata.name}")
if ([string]::IsNullOrWhiteSpace($pod)) {
  throw "Nao foi encontrado pod do PostgreSQL no namespace '$Namespace'."
}

$tempDb = "jj_app_gym_drill_" + (Get-Date -Format "yyyyMMddHHmmss")
$start = Get-Date

try {
  kubectl -n $Namespace exec $pod -- sh -lc "PGPASSWORD=`"`$POSTGRES_PASSWORD`" psql -v ON_ERROR_STOP=1 -U jj_app_gym -d postgres -h 127.0.0.1 -c 'CREATE DATABASE $tempDb;'"

  Get-Content -Path $BackupPath | kubectl -n $Namespace exec -i $pod -- sh -lc "PGPASSWORD=`"`$POSTGRES_PASSWORD`" psql -v ON_ERROR_STOP=1 -U jj_app_gym -d $tempDb -h 127.0.0.1"

  $tablesCount = kubectl -n $Namespace exec $pod -- sh -lc "PGPASSWORD=`"`$POSTGRES_PASSWORD`" psql -t -A -U jj_app_gym -d $tempDb -h 127.0.0.1 -c ""select count(*) from information_schema.tables where table_schema='public' and table_name in ('branches','belts','students','class_sessions','attendances');"""
  $beltsCount = kubectl -n $Namespace exec $pod -- sh -lc "PGPASSWORD=`"`$POSTGRES_PASSWORD`" psql -t -A -U jj_app_gym -d $tempDb -h 127.0.0.1 -c 'select count(*) from belts;'"

  $tablesCount = $tablesCount.Trim()
  $beltsCount = $beltsCount.Trim()

  if ([int]$tablesCount -lt 5) {
    throw "Validacao falhou: nem todas as tabelas essenciais foram restauradas."
  }

  if ([int]$beltsCount -lt 5) {
    throw "Validacao falhou: dados essenciais de belts nao encontrados."
  }

  $status = "PASS"
  $notes = "Restore em banco temporario concluido com validacoes basicas."
}
catch {
  $status = "FAIL"
  $notes = $_.Exception.Message
  throw
}
finally {
  try {
    kubectl -n $Namespace exec $pod -- sh -lc "PGPASSWORD=`"`$POSTGRES_PASSWORD`" psql -v ON_ERROR_STOP=1 -U jj_app_gym -d postgres -h 127.0.0.1 -c 'DROP DATABASE IF EXISTS $tempDb;'"
  } catch {
  }

  $end = Get-Date
  $duration = [int]($end - $start).TotalSeconds

  $content = @"
# DR Drill Report

- Status: $status
- Namespace: $Namespace
- Postgres pod: $pod
- Backup: $BackupPath
- Temp DB: $tempDb
- DurationSeconds: $duration
- Notes: $notes
"@
  Set-Content -Path $ReportPath -Value $content -Encoding ascii
}

Write-Output "DR drill concluido: $status"
Write-Output "Relatorio: $ReportPath"

