# Cronograma Geral - JJ App Gym

Atualizado em: 2026-04-06

## Visao executiva
- Status atual: **Go-Live Controlado**
- Fase atual: **Transicao para Estabilizacao Pos-Go-Live**
- Horizonte planejado: 12 semanas (MVP estabilizado + inicio V2)

## Linha do tempo (resumo)
1. Fase 0 - Descoberta e definicao tecnica (Concluida)
- Periodo: 2026-03-20 a 2026-03-24
- Entregas: stack definida (React Native, Fastify, PostgreSQL, OCI), escopo MVP e arquitetura base.

2. Fase 1 - Backend MVP+ (Concluida)
- Periodo: 2026-03-24 a 2026-03-31
- Entregas: auth, classes, check-in botao/QR, historico, progresso IBJJF por perfil, metas, feedback, transferencias com trilha BI.

3. Fase 2 - Mobile MVP+ (Concluida)
- Periodo: 2026-03-31 a 2026-04-01
- Entregas: app modular em abas, sessao segura, biometria opcional, telemetria interna, guias/checklists de QA.

4. Fase 3 - Release Readiness (Concluida)
- Periodo: 2026-04-01
- Entregas: CI, templates de governanca, runbooks de RC e go-live, preflight automatizado, checkpoint RC final GO.

5. Fase 4 - Go-Live Controlado (Em andamento)
- Periodo alvo: 2026-04-02 a 2026-04-05
- Objetivo: executar janela de lancamento e monitorar 24h.
- Criterios de conclusao:
  - smoke funcional sem bloqueador critico;
  - comunicacao de go-live concluida;
  - monitoramento inicial registrado.

6. Fase 5 - Estabilizacao pos-go-live (Em preparacao)
- Periodo alvo: 2026-04-06 a 2026-04-20
- Objetivo: corrigir defeitos de producao e melhorar confiabilidade.
- Entregas esperadas:
  - reducao de incidentes;
  - melhoria de UX de fluxos criticos;
  - baseline de metricas de uso (check-in, login, metas).

7. Fase 6 - Inicio V2 (Planejada)
- Periodo alvo: 2026-04-21 a 2026-06-15
- Escopo inicial V2:
  - notificacoes push;
  - mensageria interna (fase 1);
  - area do aluno com conteudo por faixa.

## Marcos e checkpoints
- `checkpoint-2026-03-31-mvpplus-backend-ready`
- `checkpoint-2026-04-01-1026-2026-04-01-ci-pipeline`
- `checkpoint-2026-04-01-2044-2026-04-01-rc-final-go`

## Riscos principais do cronograma
1. Atraso na validacao funcional final antes de go-live.
2. Ajustes de ambiente/operacao na OCI durante janela de lancamento.
3. Volume de correcao pos-go-live acima do esperado.

## Mitigacoes
1. Usar runbook de go-live e preflight antes de cada janela.
2. Priorizar correcoes P0/P1 na estabilizacao.
3. Replanejar escopo V2 semanalmente com base em dados reais.
