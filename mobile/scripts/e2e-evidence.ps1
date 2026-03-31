param(
  [string]$Tester = "Equipe QA",
  [string]$Environment = "local",
  [string]$OutputDir = "evidence"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$targetDir = Join-Path $root $OutputDir
if (!(Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$filePath = Join-Path $targetDir "e2e-mobile-$timestamp.md"

$content = @"
# Evidencia E2E Mobile - JJ App Gym

- Data/Hora: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Tester: $Tester
- Ambiente: $Environment
- App: mobile (Expo)
- API Base URL: [preencher]
- Commit validado: [preencher]

## Resultado Geral
- Status: [PASS/FAIL]
- Observacoes gerais: [preencher]

## Casos Executados
1. Login: [PASS/FAIL]
2. Sessao persistida: [PASS/FAIL]
3. Dashboard: [PASS/FAIL]
4. Aulas: [PASS/FAIL]
5. Progresso: [PASS/FAIL]
6. Check-in botao positivo: [PASS/FAIL]
7. Check-in botao negativo: [PASS/FAIL]
8. Check-in QR: [PASS/FAIL]
9. Metas criar/atualizar: [PASS/FAIL]
10. Feedback instrutor: [PASS/FAIL]
11. Seguranca biometria: [PASS/FAIL]
12. Telemetria (aba + eventos): [PASS/FAIL]
13. Logout: [PASS/FAIL]

## Evidencias (prints/videos)
- Login: [caminho-do-arquivo]
- Dashboard: [caminho-do-arquivo]
- Check-in sucesso: [caminho-do-arquivo]
- Check-in erro amigavel: [caminho-do-arquivo]
- Metas: [caminho-do-arquivo]
- Seguranca/biometria: [caminho-do-arquivo]
- Telemetria: [caminho-do-arquivo]

## Defeitos Encontrados
- DEF-001: [descricao, severidade, reproducao]
- DEF-002: [descricao, severidade, reproducao]

"@

Set-Content -Path $filePath -Value $content -Encoding UTF8
Write-Output "Arquivo de evidencia criado: $filePath"

