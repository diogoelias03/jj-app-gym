param(
  [switch]$Down
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $repoRoot "deploy\docker-compose.api-postgres.yml"

if (!(Test-Path $composeFile)) {
  throw "Arquivo nao encontrado: $composeFile"
}

if ($Down) {
  docker compose -f $composeFile down
  Write-Output "Stack de deploy local parada."
  exit 0
}

docker compose -f $composeFile up -d --build
Write-Output "Stack de deploy local iniciada."
Write-Output "API: http://127.0.0.1:3000/health"

