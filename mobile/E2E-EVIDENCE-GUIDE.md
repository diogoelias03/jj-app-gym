# E2E Evidence Guide (Mobile)

## Objetivo
Padronizar a coleta de evidencias de teste manual E2E do app mobile.

## Gerar template de evidencia
No diretorio `mobile`, rode:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\e2e-evidence.ps1 -Tester "Seu Nome" -Environment "local"
```

O script cria um arquivo em `mobile/evidence/` com:
- checklist de casos;
- campos para prints;
- espaco para defeitos.

## Como preencher
1. Execute os passos do `MANUAL-TEST-CHECKLIST.md`.
2. Marque `PASS/FAIL` em cada caso.
3. Anexe caminhos de prints/videos.
4. Registre defeitos com reproducao resumida.

## Fechamento da rodada
1. Commit das evidencias (opcional por rodada):
```powershell
git add mobile/evidence
git commit -m "test(mobile): evidencia e2e rodada X"
```
2. Se necessario, abrir issue para cada defeito relevante.

