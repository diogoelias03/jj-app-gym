param(
  [Parameter(Mandatory = $true)]
  [string]$KubeconfigPath
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $KubeconfigPath)) {
  throw "Arquivo nao encontrado: $KubeconfigPath"
}

$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $KubeconfigPath))
$b64 = [System.Convert]::ToBase64String($bytes)

Write-Output ""
Write-Output "Copie este valor para o secret GitHub OKE_KUBECONFIG_B64:"
Write-Output $b64
Write-Output ""

