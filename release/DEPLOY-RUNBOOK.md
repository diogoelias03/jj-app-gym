# Deploy Runbook - API (Docker)

## Objetivo
Subir API + PostgreSQL em stack containerizada para ambiente de deploy/local de validacao.

## Pre-requisitos
1. Docker Desktop ativo.
2. Portas livres:
- `3000` (API)
- `5432` (PostgreSQL)

## Subir stack
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-api-local.ps1
```

## Validar API
```powershell
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:3000/health"
```

## Smoke recomendado
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\go-live-smoke.ps1 -BaseUrl "http://127.0.0.1:3000" -AdminKey "local-admin-key"
```

## Parar stack
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-api-local.ps1 -Down
```

## Observacoes
- O banco e inicializado automaticamente com `schema.sql` e `seed.sql`.
- Dados persistem no volume `pgdata_jj_gym`.
- Para reset total, use `docker compose down -v` com cuidado.

