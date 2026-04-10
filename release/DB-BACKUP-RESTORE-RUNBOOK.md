# Runbook - Backup e Restore PostgreSQL no OKE

## Objetivo
Executar backup e restore do PostgreSQL interno (`jj-gym-postgres`) usado nos ambientes `dev` e `prod`.

## Pre-requisitos
- `kubectl` instalado na maquina local.
- Acesso ao cluster OKE com kubeconfig valido.
- Namespace com banco: `jj-gym`.

## 1) Backup
Comando:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pg-backup-oke.ps1 -Namespace jj-gym -EnvironmentName prod -KubeconfigPath ".\.secrets\oke-kubeconfig"
```

Resultado esperado:
- Arquivo `.sql` em `release/backups/`.

## 2) Restore
Comando:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pg-restore-oke.ps1 -InputPath ".\release\backups\pg-prod-YYYYMMDD-HHMMSS.sql" -Namespace jj-gym -KubeconfigPath ".\.secrets\oke-kubeconfig"
```

## 3) Validacao rapida apos restore
Comando:

```powershell
kubectl -n jj-gym exec deploy/jj-gym-postgres -- sh -lc 'PGPASSWORD="$POSTGRES_PASSWORD" psql -U jj_app_gym -d jj_app_gym -h 127.0.0.1 -c "select now();"'
```

## 4) Frequencia recomendada
- `prod`: backup diario (janela de baixa movimentacao).
- `dev`: backup antes de mudancas estruturais.

## 5) Automacao no GitHub Actions
Workflow:
- `.github/workflows/backup-oke-postgres.yml`

Comportamento:
- agendado diariamente para `prod` (UTC 05:00),
- execucao manual para `dev` ou `prod`,
- gera artifact `.sql.gz` com retencao de 14 dias.
- se o secret `OCI_BACKUP_BUCKET` estiver definido, envia copia para OCI Object Storage.

## 6) Secret opcional para retencao longa
- `OCI_BACKUP_BUCKET`: nome do bucket OCI para armazenar backups de longo prazo.
