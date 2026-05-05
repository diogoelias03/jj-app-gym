# Runbook - Retomada sem OCI

## Objetivo
Permitir evolucao e validacao local do JJ App Gym enquanto nao houver ambiente OCI ativo.

## Status em 2026-05-05
- OCI/OKE esta desprovisionado para reducao de custo.
- Workflows agendados de OKE foram desativados.
- Docker nao esta disponivel no PATH desta maquina.
- PostgreSQL local 17 esta ativo em `localhost:5432`.
- Smoke MVP local executado com sucesso contra `http://127.0.0.1:3000`.

## Banco local usado na retomada
- Host: `localhost`
- Porta: `5432`
- Usuario: `postgres`
- Banco: `jj_app_gym_resume_20260505`

## Subir API local com PostgreSQL local
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-api-local-postgres.ps1
```

## Smoke MVP
```powershell
powershell -ExecutionPolicy Bypass -File .\api\scripts\mvp-smoke.ps1 -BaseUrl "http://127.0.0.1:3000" -AdminKey "local-admin-key"
```

## Resultado esperado
```text
health.status: ok
login: ok
classes.count: 2
dashboard.currentBelt: Branca
goals.created.id: <id>
feedback.created.id: <id>
checkin.qr.method: qr
== Smoke completed successfully ==
```

## Quando Docker estiver disponivel
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-api-local.ps1
```

## Quando OCI voltar
- Reativar schedules dos workflows OKE somente depois de provisionar ambiente.
- Validar secrets GitHub.
- Rodar smoke manual antes de religar schedules automaticos.
