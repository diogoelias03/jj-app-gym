# Janela de Contexto Consolidada - JJ App Gym

Atualizado em: 2026-04-02

## 1) Origem do projeto
- O projeto nasceu da ideia registrada em `app gym schedule.docx`.
- Objetivo: transformar a ideia em um app real para academia de jiu-jitsu, com foco em operacao diaria, evolucao do aluno e seguranca.

## 2) Direcao tecnica consolidada
- Mobile: React Native (Expo) + TypeScript.
- Backend: Node.js + Fastify + TypeScript.
- Banco: PostgreSQL.
- Cloud alvo: OCI.
- Infra: Terraform.
- Repositorio: `https://github.com/diogoelias03/jj-app-gym.git`.

## 3) Escopo funcional consolidado (MVP+)
- Autenticacao JWT.
- Grade de aulas com categoria/tag.
- Check-in por botao e por QR.
- Janela de check-in parametrizada (168h antes ate 10 min depois).
- Historico de presencas.
- Progresso com regra IBJJF por `profile_code`.
- Metas do aluno.
- Feedback do instrutor.
- Troca de filial com aprovacao admin e trilha de eventos para BI.

## 4) Regras de negocio oficiais
- Categoria de aula no MVP e informativa (definida pelo admin).
- Filtro de categoria para aluno fica para V3/V4.
- Troca de filial: aluno solicita, admin aprova/rejeita.
- Progresso por faixa: criterios IBJJF aplicados por perfil.

## 5) Estado atual do projeto
- Backend MVP+ concluido e validado.
- Mobile MVP avancado concluido (abas modulares, sessao segura, biometria opcional, telemetria interna).
- Governanca de engenharia ativa (CI, templates, CODEOWNERS, runbooks).
- Release candidate final com decisao `GO` ja registrada.

## 6) Evidencias e governanca de release
- Checklist de release: `RELEASE-CHECKLIST.md`.
- RC runbook: `RELEASE-RC-RUNBOOK.md`.
- Go-live runbook: `release/GO-LIVE-RUNBOOK.md`.
- Monitoramento 24h: `release/POST-RELEASE-MONITORING-24H.md`.
- Pacote RC final: `release/RC-FINAL-GO-2026-04-01.md`.

## 7) Cronograma macro
- Cronograma executivo consolidado:
  - `CRONOGRAMA-GERAL.md`.
- Fase atual:
  - Go-live controlado em andamento.

## 8) Checkpoints de continuidade (principais)
- `checkpoint-2026-03-31-mvpplus-backend-ready`
- `checkpoint-2026-04-01-1026-2026-04-01-ci-pipeline`
- `checkpoint-2026-04-01-2044-2026-04-01-rc-final-go`
- `checkpoint-2026-04-01-2246-2026-04-01-save-for-resume`

## 9) Conclusao de aderencia ao contexto inicial
- O estado atual esta aderente ao contexto inicial e mais maduro.
- O projeto evoluiu de definicao/planejamento para readiness real de go-live.

