param(
  [string]$Repo = "diogoelias03/jj-app-gym",
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI (gh) nao encontrado no PATH."
}

$requiredCommon = @(
  "OCI_NAMESPACE",
  "OCI_USERNAME",
  "OCI_AUTH_TOKEN",
  "OCI_REGISTRY",
  "OCI_IMAGE_REPOSITORY",
  "OKE_KUBECONFIG_B64",
  "OCI_TENANCY_OCID",
  "OCI_USER_OCID",
  "OCI_FINGERPRINT",
  "OCI_REGION",
  "OCI_PRIVATE_KEY_PEM",
  "API_JWT_SECRET",
  "API_ADMIN_API_KEY",
  "API_POSTGRES_PASSWORD"
)

$requiredDev = @(
  "API_DATABASE_URL"
)

$requiredProdOptional = @(
  "API_DATABASE_URL",
  "OCI_BACKUP_BUCKET"
)

function Get-EnvSecretNames([string]$envName, [string]$repo) {
  $lines = gh secret list --env $envName --repo $repo 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao consultar secrets do ambiente '$envName': $($lines -join ' ')"
  }
  $names = @()
  foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $names += ($line -split "`t")[0]
  }
  return $names
}

function Compare-Secrets([string[]]$required, [string[]]$existing) {
  $missing = @()
  foreach ($r in $required) {
    if ($existing -notcontains $r) {
      $missing += $r
    }
  }
  return $missing
}

try {
  $devSecrets = Get-EnvSecretNames -envName "dev" -repo $Repo
  $prodSecrets = Get-EnvSecretNames -envName "prod" -repo $Repo
  $connectivityError = ""
}
catch {
  $devSecrets = @()
  $prodSecrets = @()
  $connectivityError = $_.Exception.Message
}

$devMissing = Compare-Secrets -required ($requiredCommon + $requiredDev) -existing $devSecrets
$prodMissing = Compare-Secrets -required $requiredCommon -existing $prodSecrets
$prodOptionalMissing = Compare-Secrets -required $requiredProdOptional -existing $prodSecrets

$statusDev = if ($connectivityError -ne "") { "UNKNOWN" } elseif ($devMissing.Count -eq 0) { "PASS" } else { "FAIL" }
$statusProd = if ($connectivityError -ne "") { "UNKNOWN" } elseif ($prodMissing.Count -eq 0) { "PASS" } else { "FAIL" }
$devMissingText = if ($statusDev -eq "UNKNOWN") { "N/A (connectivity)" } elseif ($devMissing.Count -eq 0) { "none" } else { $devMissing -join ", " }
$prodMissingText = if ($statusProd -eq "UNKNOWN") { "N/A (connectivity)" } elseif ($prodMissing.Count -eq 0) { "none" } else { $prodMissing -join ", " }
$prodOptionalMissingText = if ($statusProd -eq "UNKNOWN") { "N/A (connectivity)" } elseif ($prodOptionalMissing.Count -eq 0) { "none" } else { $prodOptionalMissing -join ", " }

if ($OutputPath -eq "") {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $OutputPath = "release/reports/secrets-check-$ts.md"
}

$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and !(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$content = @"
# Secrets Validation Report

- Repo: $Repo
- Timestamp: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")

## Dev
- Status: $statusDev
- MissingRequired: $devMissingText

## Prod
- Status: $statusProd
- MissingRequired: $prodMissingText
- MissingOptional: $prodOptionalMissingText
- ConnectivityError: $connectivityError

"@

Set-Content -Path $OutputPath -Value $content -Encoding ascii

Write-Output "Relatorio gerado: $OutputPath"
Write-Output "Dev: $statusDev"
Write-Output "Prod: $statusProd"
