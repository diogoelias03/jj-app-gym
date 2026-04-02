param(
  [Parameter(Mandatory = $true)]
  [string]$Owner
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$execDir = Join-Path $repoRoot "release\executions"
if (!(Test-Path $execDir)) {
  New-Item -ItemType Directory -Path $execDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$filePath = Join-Path $execDir "go-live-$timestamp.md"

$branch = (git -C $repoRoot rev-parse --abbrev-ref HEAD).Trim()
$head = (git -C $repoRoot log -1 --oneline).Trim()

$content = @"
# Go-Live Execution Log

- Data/Hora inicio: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Owner: $Owner
- Branch: $branch
- Commit: $head
- Status inicial: EM EXECUCAO

## Checklist da janela
1. [ ] Smoke API executado
2. [ ] Smoke Mobile executado
3. [ ] Sem bloqueador critico
4. [ ] Comunicacao de go-live enviada

## Eventos/Incidentes
- [horario] [severidade] [descricao] [acao]

## Encerramento
- Status final: [GO / GO COM RISCO / ROLLBACK]
- Data/Hora fim: [preencher]
- Resumo final: [preencher]

"@

Set-Content -Path $filePath -Value $content -Encoding UTF8
Write-Output "Log de go-live criado: $filePath"

