param(
  [string]$Namespace = "jj-gym",
  [string]$OutputDir = "release/backups",
  [string]$EnvironmentName = "prod",
  [string]$KubeconfigPath = ""
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  throw "kubectl nao encontrado no PATH. Instale o kubectl antes de executar o backup."
}

if ($KubeconfigPath -ne "") {
  $env:KUBECONFIG = (Resolve-Path $KubeconfigPath).Path
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$pod = (kubectl -n $Namespace get pods -l app=jj-gym-postgres -o jsonpath="{.items[0].metadata.name}")
if ([string]::IsNullOrWhiteSpace($pod)) {
  throw "Nao foi encontrado pod do PostgreSQL no namespace '$Namespace'."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $OutputDir "pg-$EnvironmentName-$timestamp.sql"

kubectl -n $Namespace exec $pod -- sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U jj_app_gym -d jj_app_gym -h 127.0.0.1' > $backupPath

if (!(Test-Path $backupPath)) {
  throw "Falha ao gerar backup em '$backupPath'."
}

$size = (Get-Item $backupPath).Length
if ($size -lt 200) {
  throw "Backup gerado parece invalido (arquivo muito pequeno: $size bytes)."
}

Write-Output "Backup concluido: $backupPath"
