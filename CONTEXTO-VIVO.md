# Contexto Vivo - JJ App Gym

Atualizado em: 2026-04-09 (America/Sao_Paulo) - bloco em execucao

## Objetivo do projeto
- Transformar a ideia do app de academia de jiu-jitsu em produto real.
- Entregar MVP funcional com:
  - check-in (botao + QR),
  - grade de aulas,
  - progresso de graduacao,
  - metas do aluno,
  - feedback do instrutor,
  - seguranca de sessao.

## Stack e arquitetura definidas
- Mobile: React Native (Expo) + TypeScript.
- Backend: Node.js + Fastify + TypeScript.
- Banco: PostgreSQL.
- Cloud alvo: OCI.
- Infra: Terraform.
- Repositorio: `https://github.com/diogoelias03/jj-app-gym.git`.

## Estado atual do produto
- Backend MVP+ pronto e validado:
  - auth JWT,
  - dashboard,
  - classes com `classCategory`,
  - check-in por botao e QR,
  - historico de presencas,
  - progresso IBJJF por `profile_code`,
  - metas do aluno,
  - feedback do instrutor,
  - solicitacao/aprovacao de troca de filial com trilha para BI.
- Mobile MVP avancado:
  - app modular com abas/telas separadas,
  - sessao persistida com `expo-secure-store`,
  - biometria opcional para restaurar sessao,
  - telemetria interna (eventos + resumo + tela `Telemetria`),
  - checklist/manual de testes e geracao de evidencias E2E.

## Governanca e qualidade (repo)
- CI GitHub Actions ativo:
  - API: `npm ci`, `typecheck`, `build`.
  - Mobile: `npm ci`, `typecheck`.
- Templates e processos adicionados:
  - PR template,
  - issue templates (bug/feature),
  - CODEOWNERS,
  - `CONTRIBUTING.md`,
  - `RELEASE-CHECKLIST.md`,
  - `RELEASE-RC-RUNBOOK.md`,
  - `scripts/release-go-nogo.ps1`,
  - `scripts/rc-preflight.ps1`.

## Decisoes de negocio consolidadas
- Categoria de aula no MVP: tag informativa criada pelo admin (`fundamentos`, `tecnica`, `rola`, `drill`, `condicionamento`), sem filtro de aluno agora (filtro fica para V3/V4).
- Troca de filial: aluno solicita; admin aprova/rejeita; eventos ficam registrados para BI.
- Progresso por faixa: regra oficial IBJJF ligada ao `profile_code` do aluno.

## Git/GitHub - checkpoints relevantes
- Checkpoints ja sincronizados:
  - `checkpoint-2026-03-27-profile-progress`
  - `checkpoint-2026-03-31-mvpplus-backend-ready`
  - `checkpoint-2026-03-31-1635-2026-03-31-mobile-telemetry-e2e`
  - `checkpoint-2026-04-01-1026-2026-04-01-ci-pipeline`
  - `checkpoint-2026-04-01-1449-2026-04-01-governance-context`
  - `checkpoint-2026-04-01-rc-runbook-go-nogo`
  - `checkpoint-2026-04-01-1705-2026-04-01-rc-preflight-go`
  - `checkpoint-2026-04-01-2044-2026-04-01-rc-final-go`
- Ultimo commit sincronizado: `a733d0c` (`chore(release): ignore local artifacts and add rc preflight command`).

## Estado de release candidate
- Preflight RC executado com checks tecnicos e decisao preliminar `GO`.
- Relatorio mais recente gerado em:
  - `release/reports/go-nogo-20260401-204144.md` (artefato local).
- Pipeline de checkpoint RC executada com tag de retomada.
- Pacote minimo de evidencias versionado:
  - `release/RC-FINAL-GO-2026-04-01.md`.
- Kit operacional de go-live adicionado:
  - `release/GO-LIVE-RUNBOOK.md`,
  - `release/POST-RELEASE-MONITORING-24H.md`,
  - `scripts/go-live-start.ps1`.

## Cronograma geral atualizado
- Cronograma executivo consolidado em:
  - `CRONOGRAMA-GERAL.md`.
- Estado de fase:
  - RC final: concluido (GO),
  - Go-live controlado: em andamento,
  - Estabilizacao: proxima fase.

## Bloco atual (2026-04-02)
- Documento inicial consolidado e alinhado ao estado real:
  - `docs/JANELA-CONTEXTO-CONSOLIDADA-2026-04-02.md`.
- Novo status de prontidao para janela de lancamento:
  - `release/GO-LIVE-READINESS-2026-04-02.md`.
- Check tecnico do bloco:
  - `release-go-nogo.ps1 -RunChecks` com decisao preliminar `GO`.
- Automacao adicional de go-live adicionada:
  - `scripts/go-live-smoke.ps1` para smoke test da API com relatorio.

## Bloco atual (2026-04-03)
- Fechamento operacional da janela de go-live adicionado:
  - `scripts/go-live-close.ps1`.
- Templates de comunicacao para janela de lancamento adicionados:
  - `release/GO-LIVE-COMMUNICATION-TEMPLATES.md`.

## Bloco atual (2026-04-06)
- Higiene de sincronizacao reforcada:
  - `.gitignore` atualizado para artefatos pessoais/temporarios (`codex pessoal/`, `~$*.xlsx`).
  - `scripts/scope-guard.ps1` adicionado para checar arquivos fora de escopo antes do push.
- Acao combinada com usuario:
  - remover no proximo ciclo de sincronizacao os 3 arquivos fora de escopo ja versionados.
- Novo apoio de gestao executiva:
  - `scripts/project-status-snapshot.ps1` para gerar snapshot em `release/reports/`.
- Cronograma geral atualizado para refletir fase atual:
  - `CRONOGRAMA-GERAL.md`.

## Bloco atual (2026-04-07)
- Deploy base da API estruturado com Docker:
  - `api/Dockerfile`
  - `deploy/docker-compose.api-postgres.yml`
  - `scripts/deploy-api-local.ps1`
  - `release/DEPLOY-RUNBOOK.md`
- Deploy OCI estruturado:
  - workflow `.github/workflows/deploy-oci-api.yml` (build/push OCIR + rollout OKE opcional),
  - manifests `deploy/oke/`,
  - runbook `release/OCI-DEPLOY-RUNBOOK.md`,
  - utilitario `scripts/prepare-kubeconfig-secret.ps1`.

## Bloco atual (2026-04-09)
- Deploy OCI destravado e validado:
  - secrets OCI completos em `dev`/`prod` (OCIR + OKE kubeconfig + credenciais OCI API key),
  - workflow `Deploy OCI API` ajustado para autenticar no OKE com OCI CLI,
  - manifest OKE com `imagePullSecrets` para OCIR privado,
  - aplicacao do deployment com imagem real (sem `REPLACE_IMAGE`) no pipeline,
  - etapa de debug de rollout melhorada (describe + logs de todos os pods).
- Infra OKE estabilizada para agendamento:
  - node pool publico escalado para 1 no (`ACTIVE`) via OCI CLI.
- Status final do workflow:
  - run `24197083033` com `Build and Publish to OCIR` e `Rollout on OKE` em `success`.
- Ajuste de disponibilidade da API:
  - endpoint `GET /health/live` adicionado para probes de liveness/readiness sem dependencia de banco.

## Pendencia imediata
- Configurar `API_DATABASE_URL` do ambiente `dev` para um PostgreSQL acessivel pelo OKE.
- Enquanto o `DATABASE_URL` apontar para `localhost`, o endpoint `GET /health` (deep check) continuara retornando `500`.

## Trigger de atualizacao (2026-04-09)
- Usuario solicitou: "atualiza o resumo de contexto" e seguir com proximo bloco.
- Proximo bloco ativo: fechar conectividade de banco no ambiente `dev` para remover `500` no `GET /health`.

## Regra de manutencao deste resumo
- Atualizar este arquivo ao fim de cada bloco.
- Atualizar sempre que houver a trigger:
  - "atualiza o resumo de contexto"
