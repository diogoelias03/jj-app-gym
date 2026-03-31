# MVP Readiness Checklist

## Ambiente
- [x] Node.js 20+ instalado
- [x] npm funcional
- [x] PostgreSQL local configurado
- [x] `.env` configurado na pasta `api/`

## Banco de dados
- [x] Schema aplicado
- [x] Seed aplicado
- [x] Migracoes MVP aplicadas (ver `api/db/migrations/APPLY-ORDER.md`)
- [x] Carga oficial IBJJF aplicada
- [x] Validacao IBJJF executada

## Backend (MVP + MVP+ atual)
- [x] Auth JWT
- [x] Check-in por botao
- [x] Check-in por QR token
- [x] Janela de check-in parametrizada
- [x] Agenda com tag de categoria da aula
- [x] Progresso por `profile_code` + IBJJF
- [x] Historico de aulas concluidas
- [x] Metas do aluno (baseline)
- [x] Feedback de instrutor (texto + nota)
- [x] Dashboard consolidado para home do app
- [x] Troca de filial com aprovacao admin
- [x] Eventos de troca para BI

## Operacao
- [x] Repositorio GitHub conectado
- [x] Commits locais organizados em blocos
- [x] Checkpoints/tag criados em marcos importantes

## Validacao rapida
- [x] Build TypeScript (`npm run build`)
- [x] Smoke test manual por endpoints
- [x] Script de smoke test criado (`api/scripts/mvp-smoke.ps1`)
