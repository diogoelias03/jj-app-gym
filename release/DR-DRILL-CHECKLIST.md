# DR Drill Checklist (Guiado)

## Objetivo
Validar a capacidade de restaurar o banco em ambiente controlado sem impacto no banco principal.

## Pre-drill
1. Confirmar janela de execucao e responsavel de plantao.
2. Garantir acesso ao cluster (`kubectl`) e kubeconfig valido.
3. Gerar backup recente:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pg-backup-oke.ps1 -Namespace jj-gym -EnvironmentName prod -KubeconfigPath ".\.secrets\oke-kubeconfig"
```

## Execucao do drill
1. Rodar validacao de restore em banco temporario:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dr-drill-restore-validate.ps1 -BackupPath ".\release\backups\pg-prod-YYYYMMDD-HHMMSS.sql" -Namespace jj-gym -KubeconfigPath ".\.secrets\oke-kubeconfig"
```
2. Confirmar resultado:
- `Status: PASS` no relatorio gerado em `release/reports/`.

## Pos-drill
1. Registrar duracao total e eventuais falhas.
2. Definir acoes de melhoria (tempo de restore, cobertura de validacao, automacao).
3. Arquivar relatorio no historico de operacao.

## Criterio de aprovacao
- Restore conclui sem erro.
- Banco temporario criado e removido com sucesso.
- Tabelas essenciais restauradas.
- Dados basicos (`belts`) restaurados.

## Automacao no GitHub Actions
- Workflow: `.github/workflows/dr-drill-oke-postgres.yml`
- Execucao:
  - manual para `dev`/`prod`,
  - agendada mensalmente no dia 1 (UTC 06:00) para `prod`.
- Saida:
  - relatorio de DR drill como artifact com retencao de 30 dias.
