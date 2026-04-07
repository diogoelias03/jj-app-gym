# AI Handoff - JJ App Gym

## Repo
- URL: `https://github.com/diogoelias03/jj-app-gym`
- Branch base: `main`
- Checkpoint recomendado para retomada:
  - `checkpoint-2026-04-06-1600-2026-04-06-save-for-resume`

## Estado atual
- Backend MVP+ concluido.
- Mobile MVP+ concluido (sessao segura, biometria opcional, telemetria interna).
- Governanca pronta (CI, templates, runbooks).
- Go-live controlado em andamento.

## Arquivos de contexto prioritarios
1. `CONTEXTO-VIVO.md`
2. `CRONOGRAMA-GERAL.md`
3. `ROADMAP-3-WAVES.md`
4. `RELEASE-CHECKLIST.md`
5. `RELEASE-RC-RUNBOOK.md`
6. `release/GO-LIVE-RUNBOOK.md`
7. `release/GO-LIVE-READINESS-2026-04-02.md`

## Scripts operacionais principais
- `scripts/release-go-nogo.ps1`
- `scripts/rc-preflight.ps1`
- `scripts/go-live-start.ps1`
- `scripts/go-live-smoke.ps1`
- `scripts/go-live-close.ps1`
- `scripts/project-status-snapshot.ps1`
- `scripts/checkpoint-sync.ps1`
- `scripts/scope-guard.ps1`

## Comandos rapidos
```powershell
# 1) Snapshot executivo atual
powershell -ExecutionPolicy Bypass -File .\scripts\project-status-snapshot.ps1 -Owner "Nome"

# 2) Check tecnico de release
powershell -ExecutionPolicy Bypass -File .\scripts\release-go-nogo.ps1 -RunChecks

# 3) Preflight completo com checkpoint (se GO)
powershell -ExecutionPolicy Bypass -File .\scripts\rc-preflight.ps1 -RunChecks -CreateCheckpoint -TagSuffix "rc-go" -Push
```

## Regras de higiene
- Rodar `scripts/scope-guard.ps1` antes de sincronizar.
- Nao versionar arquivos pessoais/temporarios.
- Seguir `CONTEXTO-VIVO.md` como fonte de continuidade.

