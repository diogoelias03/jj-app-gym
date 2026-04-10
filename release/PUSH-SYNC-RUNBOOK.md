# Runbook - Push Sync (rede instavel)

## Objetivo
Sincronizar branch e tags com retry automatico quando houver oscilacao/bloqueio de rede.

## Script
- `scripts/push-when-online.ps1`

## Execucao padrao
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\push-when-online.ps1
```

## Execucao com parametros
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\push-when-online.ps1 -Branch "main" -MaxAttempts 8 -DelaySeconds 30
```

## Resultado
- Gera relatorio em `release/reports/push-sync-YYYYMMDD-HHMMSS.md`.
- Status:
  - `SUCCESS`: branch e tags enviados.
  - `PARTIAL`: branch enviada, tags falharam.
  - `FAILED`: nao conseguiu enviar branch.
