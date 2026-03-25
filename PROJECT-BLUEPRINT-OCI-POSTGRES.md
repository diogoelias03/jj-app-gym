# Blueprint do Projeto - App Gym Schedule (OCI + PostgreSQL)

## Objetivo
Lancar um MVP funcional do app de academia de jiu-jitsu com foco em:
- check-in/presenca em aula;
- grade por faixa/categoria;
- progresso para proximo grau/faixa;
- multi-filial;
- seguranca de acesso do aluno.

## Arquitetura recomendada (estrategia segura)
- Mobile: React Native (TypeScript).
- Backend API: Node.js + framework HTTP (NestJS ou Fastify).
- Banco: PostgreSQL gerenciado no OCI.
- Infra: OCI (VCN privada, NAT, LB/API Gateway quando necessario).
- Observabilidade: logs estruturados + monitoramento basico.

## Fases e entregaveis

### Fase 0 - Fundacao (1 semana)
1. Definir MVP fechado (escopo congelado de V1).
2. Criar backlog priorizado (MVP, V2, V3).
3. Definir arquitetura tecnica e padroes de codigo.
4. **Criar repositório no GitHub para armazenar o projeto**.
5. Configurar estrategia de branch (`main`, `develop`, `feature/*`).
6. Configurar CI inicial (lint + testes + build).

### Fase 1 - Infra + Backend Core (2 a 3 semanas)
1. Provisionar ambiente OCI para app e banco PostgreSQL.
2. Criar schema inicial:
   - students
   - instructors
   - branches
   - classes
   - enrollments
   - attendances
   - belts
   - promotions
3. Implementar autenticacao e autorizacao por papel.
4. Implementar APIs:
   - auth/login
   - agenda/listagem de aulas
   - check-in/presenca
   - progresso de graduacao
   - cadastro/gestao de filiais

### Fase 2 - App Mobile MVP (2 a 3 semanas)
1. Tela de login + seguranca basica.
2. Home com proximas aulas.
3. Check-in de aula e historico de aulas concluidas.
4. Painel de progresso para proxima graduacao.
5. Troca/gestao de filial.
6. Configuracoes de conta e seguranca.

### Fase 3 - Go-live (1 semana)
1. Testes E2E criticos (login, check-in, progresso).
2. Hardening de seguranca.
3. Ajustes de performance.
4. Deploy de producao.
5. Monitoramento e alertas basicos.

## Comparativo curto de custo-beneficio
- OCI + PostgreSQL foi escolhido para reduzir custo e complexidade no MVP.
- Mantemos desenho "migration-ready" para Oracle DB no futuro, se houver:
  - exigencia enterprise/compliance;
  - aumento de escala;
  - contratos B2B com requisito Oracle.

## Proximos passos imediatos (ordem sugerida)
1. Criar o repositorio GitHub e conectar ao projeto local.
2. Finalizar o PRD do MVP (10 a 15 historias essenciais).
3. Subir infraestrutura base OCI enxuta.
4. Implementar backend core e banco.
5. Iniciar app React Native em paralelo.
