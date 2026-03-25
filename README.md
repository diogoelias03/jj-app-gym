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
