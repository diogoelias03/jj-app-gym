param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [string]$Namespace = "jj-gym",
  [string]$KubeconfigPath = ""
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  throw "kubectl nao encontrado no PATH. Instale o kubectl antes de executar o restore."
}

if (!(Test-Path $InputPath)) {
  throw "Arquivo de backup nao encontrado: $InputPath"
}

if ($KubeconfigPath -ne "") {
  $env:KUBECONFIG = (Resolve-Path $KubeconfigPath).Path
}

$pod = (kubectl -n $Namespace get pods -l app=jj-gym-postgres -o jsonpath="{.items[0].metadata.name}")
if ([string]::IsNullOrWhiteSpace($pod)) {
  throw "Nao foi encontrado pod do PostgreSQL no namespace '$Namespace'."
}

Get-Content -Path $InputPath | kubectl -n $Namespace exec -i $pod -- sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U jj_app_gym -d jj_app_gym -h 127.0.0.1'

Write-Output "Restore concluido a partir de: $InputPath"
