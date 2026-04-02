# Go-Live Runbook (MVP)

## Objetivo
Executar o go-live de forma controlada com rastreabilidade e rollback claro.

## Pre-go-live (T-60 a T-15 min)
1. Confirmar status:
- branch `main` atualizada;
- CI verde;
- checkpoint RC final existente.

2. Validar readiness:
- `RELEASE-CHECKLIST.md` revisado;
- evidencias E2E registradas;
- responsaveis de plantao definidos.

3. Preparar comunicação:
- mensagem de go-live pronta;
- canal de incidentes ativo (time tecnico + produto).

## Janela de go-live (T0)
1. Registrar inicio:
- gerar arquivo de execucao com:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\go-live-start.ps1 -Owner "Seu Nome"
```

2. Executar smoke rapido:
- API health/login/classes/checkin/progress;
- app mobile login/dashboard/checkin/metas.
- comando recomendado (API):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\go-live-smoke.ps1 -BaseUrl "http://127.0.0.1:3000" -AdminKey "local-admin-key"
```

3. Decisao de liberacao:
- se sem bloqueadores: `GO`;
- se bloqueador critico: `ROLLBACK`.

## Pos-go-live imediato (T+0 a T+60 min)
1. Monitorar erros e tempo de resposta.
2. Registrar incidentes no log de execucao.
3. Comunicar status final da janela.

## Rollback
1. Reverter para ultimo checkpoint estavel.
2. Comunicar rollback e impacto.
3. Abrir plano de correcao e nova janela.
