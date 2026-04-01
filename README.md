# App Gym Schedule

Aplicativo mobile para academias de jiu-jitsu com foco em presenca, agenda por faixa e evolucao de graduacao.

## Objetivo do MVP
- Permitir que alunos facam check-in nas aulas.
- Exibir grade de aulas por categoria/faixa.
- Mostrar progresso para o proximo grau/faixa.
- Suportar operacao multi-filial.
- Proteger o acesso do aluno com seguranca adequada.

## Stack Tecnica (fase atual)
- Mobile: React Native + TypeScript
- Backend: Node.js (API REST)
- Banco: PostgreSQL
- Cloud: Oracle Cloud Infrastructure (OCI)
- Infra as Code: Terraform

## Escopo do MVP
1. Autenticacao e autorizacao por perfil (aluno/instrutor/admin).
2. Cadastro de filiais.
3. Grade de aulas por faixa e filial.
4. Check-in/presenca em aula.
5. Historico de aulas concluidas.
6. Contador de progresso para graduacao.
7. Configuracoes de seguranca da conta.

## Arquitetura (alto nivel)
1. App React Native consome API REST autenticada por token.
2. API aplica regras de negocio (presenca, graduacao, agenda).
3. PostgreSQL persiste dados transacionais.
4. OCI hospeda rede, computacao e banco.
5. CI valida lint/testes/build a cada PR.

## Estrutura atual do repositorio
- `main.tf`, `variables.tf`, `outputs.tf`: base Terraform do lab em OCI
- `README-LAB.md`: detalhes do laboratorio de infraestrutura
- `PROJECT-BLUEPRINT-OCI-POSTGRES.md`: plano macro do projeto
- `BACKLOG-MVP.md`: backlog priorizado do produto
- `api/`: esqueleto inicial da API Node.js + PostgreSQL
- `.github/workflows/ci.yml`: pipeline CI (API typecheck/build + mobile typecheck)
- `.github/PULL_REQUEST_TEMPLATE.md`: template oficial de PR
- `.github/ISSUE_TEMPLATE/`: templates de bug/feature
- `.github/CODEOWNERS`: ownership de revisao
- `CONTRIBUTING.md`: guia de contribuicao
- `RELEASE-CHECKLIST.md`: checklist operacional de release
- `RELEASE-RC-RUNBOOK.md`: playbook de go/no-go para release candidate
- `scripts/rc-preflight.ps1`: preflight de release candidate em comando unico

## API bootstrap
1. Instale Node.js 20+.
2. Entre na pasta `api/`.
3. Rode `npm install`.
4. Copie `.env.example` para `.env` e ajuste o `DATABASE_URL`.
5. Defina um `JWT_SECRET` forte no `.env`.
6. Ajuste a janela de check-in no `.env` (padrao: abre 168h antes e fecha 10min depois).
7. Execute o schema no PostgreSQL:
   - `psql "$DATABASE_URL" -f db/schema.sql`
   - `psql "$DATABASE_URL" -f db/seed.sql`
8. Inicie a API com `npm run dev`.
9. Opcional: execute o smoke test MVP com:
   - `powershell -ExecutionPolicy Bypass -File api/scripts/mvp-smoke.ps1`

Endpoints iniciais:
- `GET /health`
- `POST /api/v1/auth/login`
- `POST /api/v1/admin/checkins/simulate-window` (admin key)
- `POST /api/v1/admin/checkins/qr-token` (admin key)
- `GET /api/v1/admin/branch-transfers/requests` (admin key)
- `POST /api/v1/admin/branch-transfers/requests/:requestId/decision` (admin key)
- `POST /api/v1/admin/classes` (admin key)
- `POST /api/v1/admin/instructor-feedback` (admin key)
- `GET /api/v1/classes` (autenticado)
- `GET /api/v1/dashboard` (autenticado)
- `POST /api/v1/checkins` (autenticado)
- `POST /api/v1/checkins/qr` (autenticado)
- `GET /api/v1/attendances/history` (autenticado)
- `GET /api/v1/progress` (autenticado)
- `GET /api/v1/goals` (autenticado)
- `POST /api/v1/goals` (autenticado)
- `PATCH /api/v1/goals/:goalId` (autenticado)
- `GET /api/v1/instructor-feedback` (autenticado)
- `POST /api/v1/branch-transfers/requests` (autenticado)
- `GET /api/v1/branch-transfers/requests/my` (autenticado)

Fluxo de autenticacao:
1. Chame `POST /api/v1/auth/login` com `email` e `password`.
2. Use `access_token` retornado no header `Authorization: Bearer <token>`.

Tag de categoria da aula (MVP):
1. O admin define `classCategory` ao criar a aula.
2. Categorias suportadas:
   - `fundamentos`
   - `tecnica`
   - `rola`
   - `drill`
   - `condicionamento`
3. O aluno visualiza a tag na agenda da aula.
4. Filtro de aulas por categoria fica para V3/V4.

Observacao de progresso IBJJF:
1. O endpoint `/api/v1/progress` aplica criterio oficial por `profile_code` do aluno.
2. Exemplo de `profile_code`: `adult_male`, `adult_female`, `juvenil`, `master_male`, `master_female`.

Configuracoes de janela de check-in:
- `CHECKIN_OPEN_HOURS_BEFORE` (padrao `168`)
- `CHECKIN_CLOSE_MINUTES_AFTER` (padrao `10`)
- `ADMIN_API_KEY` (habilita endpoint admin de simulacao)
- `QR_CHECKIN_TOKEN_EXPIRES_MINUTES` (padrao `15`)

Teste de simulacao da janela (admin):
1. Defina `ADMIN_API_KEY` no `.env`.
2. Chame:
   - `POST /api/v1/admin/checkins/simulate-window`
   - Header: `x-admin-key: <ADMIN_API_KEY>`
   - Body: `{ "classSessionId": 1, "simulatedNow": "2026-03-30T12:00:00Z" }`

Fluxo QR check-in (MVP+):
1. Admin gera token QR:
   - `POST /api/v1/admin/checkins/qr-token`
   - Header: `x-admin-key: <ADMIN_API_KEY>`
   - Body: `{ "classSessionId": 1 }`
2. App do aluno envia token:
   - `POST /api/v1/checkins/qr`
   - Header: `Authorization: Bearer <access_token>`
   - Body: `{ "qrToken": "<token_gerado>" }`

Fluxo de metas do aluno (MVP+):
1. Criar meta: `POST /api/v1/goals`
2. Listar metas: `GET /api/v1/goals`
3. Atualizar progresso/status: `PATCH /api/v1/goals/:goalId`

Resumo de dashboard (MVP+):
1. `GET /api/v1/dashboard` retorna em uma chamada:
   - proxima aula da filial do aluno;
   - progresso consolidado de graduacao;
   - resumo/top metas ativas;
   - feedback recente com media de nota.

Fluxo de feedback do instrutor (MVP+):
1. Registrar feedback (admin/instrutor): `POST /api/v1/admin/instructor-feedback`
2. Aluno consulta feedback recebido: `GET /api/v1/instructor-feedback`

## Decisoes de negocio aplicadas
1. Troca de filial:
   - aluno solicita;
   - admin aprova/rejeita;
   - sistema registra trilha de eventos para BI (`branch_transfer_events`).
2. Regra oficial por faixa (IBJJF):
   - estrutura adicionada em `ibjjf_belt_criteria`;
   - referencia ao documento oficial:
     `C:\\Users\\difarias\\.git\\Docs reference\\20251220_IBJJF_Graduacao_PT.pdf`;
   - endpoint de progresso ja retorna bloco `ibjjf` com indicadores de regra.

## Material de parametrizacao IBJJF
- Matriz para preenchimento:
  - `docs/ibjjf/ibjjf-graduation-matrix-template.csv`
- Instrucoes de preenchimento:
  - `docs/ibjjf/IBJJF-MATRIX-INSTRUCTIONS.md`

## Roadmap de produto
- Planejamento em 3 ondas (MVP+, V2, V3):
  - `ROADMAP-3-WAVES.md`

## Checklist de prontidao MVP
- `MVP-READINESS-CHECKLIST.md`

## Roadmap resumido
1. Fase 0: definicao de produto e fundacao de engenharia.
2. Fase 1: backend core + banco + autenticacao.
3. Fase 2: app mobile MVP.
4. Fase 3: testes finais, deploy e go-live.

## Proximos passos
1. Fechar PRD do MVP com regras de negocio detalhadas.
2. Criar repositorios/monorepo de aplicacao (`mobile` e `api`).
3. Provisionar ambiente OCI enxuto para desenvolvimento.
4. Implementar as primeiras APIs: auth, aulas e check-in.
