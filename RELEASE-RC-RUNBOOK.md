# Release Candidate Runbook (MVP)

## Objetivo
Executar uma rodada objetiva de go/no-go antes de promover o MVP para release.

## Entradas obrigatorias
1. Branch `main` atualizada.
2. CI verde no GitHub Actions.
3. Evidencias E2E da rodada atual.
4. Defeitos criticos revisados.

## Passo a passo
1. Gerar relatorio automatizado:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\release-go-nogo.ps1 -RunChecks
```

Opcional (recomendado): usar preflight consolidado:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\rc-preflight.ps1 -RunChecks
```

2. Executar checklist funcional:
- `mobile/MANUAL-TEST-CHECKLIST.md`
- `mobile/E2E-EVIDENCE-GUIDE.md`

3. Revisar riscos abertos:
- bugs criticos/altos ainda abertos;
- pendencias de seguranca e dados.

4. Reuniao rapida de go/no-go:
- participantes: produto, tecnico, operacao;
- decisao: `GO`, `GO COM RISCO`, ou `NO-GO`.

5. Se `GO`, gerar checkpoint final:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\checkpoint-sync.ps1 -Message "checkpoint: rc mvp go" -TagSuffix "rc-mvp-go" -Push
```

Alternativa em comando unico (somente se decisao for GO):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\rc-preflight.ps1 -RunChecks -CreateCheckpoint -TagSuffix "rc-mvp-go" -Push
```

## Criterios minimos para GO
- API build/typecheck ok.
- Mobile typecheck ok.
- CI verde.
- Sem bug critico aberto.
- Rollback definido.

## Saidas esperadas
- Relatorio em `release/reports/`.
- Evidencias de QA em `mobile/evidence/`.
- Tag de checkpoint para retomada.
