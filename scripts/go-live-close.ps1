param(
  [Parameter(Mandatory = $true)]
  [string]$LogPath,
  [Parameter(Mandatory = $true)]
  [ValidateSet("GO", "GO COM RISCO", "ROLLBACK")]
  [string]$FinalStatus,
  [string]$Summary = ""
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $LogPath)) {
  throw "LogPath nao encontrado: $LogPath"
}

$content = Get-Content $LogPath -Raw
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$safeSummary = if ([string]::IsNullOrWhiteSpace($Summary)) { "Sem observacoes adicionais." } else { $Summary }

$content = $content -replace "Status final: \[GO / GO COM RISCO / ROLLBACK\]", "Status final: $FinalStatus"
$content = $content -replace "Data/Hora fim: \[preencher\]", "Data/Hora fim: $now"
$content = $content -replace "Resumo final: \[preencher\]", "Resumo final: $safeSummary"

Set-Content -Path $LogPath -Value $content -Encoding UTF8
Write-Output "Log de go-live encerrado: $LogPath"
Write-Output "Status final: $FinalStatus"

