# Backlog MVP - App Gym Schedule

## Priorizacao
- P0: obrigatorio para lancar
- P1: importante para qualidade da versao 1
- P2: evolucao apos go-live

## Epico 1 - Acesso e seguranca

### US-001 (P0) - Login do aluno
Como aluno, quero entrar no app com email e senha para acessar minha area.

Criterios de aceite:
- Login valida credenciais no backend.
- Token de sessao e retornado ao app.
- Mensagem de erro clara para credencial invalida.

### US-002 (P0) - Perfis de acesso
Como administrador, quero controlar permissao por perfil para proteger operacoes sensiveis.

Criterios de aceite:
- Perfis minimos: aluno, instrutor, admin.
- Rotas sensiveis exigem perfil correto.
- Acesso nao autorizado retorna erro padrao.

### US-003 (P1) - Endurecimento de conta
Como aluno, quero melhorar a seguranca da conta para evitar acesso indevido.

Criterios de aceite:
- Alteracao de senha com politica minima.
- Encerramento de sessao (logout) funcional.
- Registro de ultimo acesso visivel ao usuario.

## Epico 2 - Filiais e estrutura academica

### US-004 (P0) - Cadastro de filial
Como admin, quero cadastrar filial para operar multiplas unidades.

Criterios de aceite:
- Cadastro com nome, endereco e status.
- Listagem de filiais ativas/inativas.
- Edicao de dados da filial por admin.

### US-005 (P0) - Vinculo aluno-filial
Como aluno, quero estar vinculado a uma filial para ver minhas aulas corretas.

Criterios de aceite:
- Aluno possui filial ativa.
- Agenda exibida respeita filial selecionada.
- Troca de filial registra historico de alteracao.

### US-013 (P0) - Solicitar troca de filial com aprovacao admin
Como aluno, quero solicitar troca de filial para que o admin avalie e aprove/rejeite.

Criterios de aceite:
- Aluno cria solicitacao com justificativa.
- Apenas admin aprova/rejeita.
- Aprovacao atualiza filial do aluno automaticamente.

### US-014 (P0) - Trilha de eventos de troca para BI
Como time de produto, quero registrar eventos de troca de filial para gerar insights de UX no BI.

Criterios de aceite:
- Cada etapa gera evento (solicitada, aprovada/rejeitada, filial atualizada).
- Eventos incluem timestamp, origem/destino e ator.
- Dados ficam consultaveis por request e por periodo.

## Epico 3 - Agenda e presenca

### US-006 (P0) - Grade de aulas por faixa
Como aluno, quero ver aulas por faixa/categoria para treinar no nivel correto.

Criterios de aceite:
- Aula possui faixa/categoria associada.
- Filtros por filial, faixa e data.
- Lista mostra horario, professor e vagas.

### US-016 (P0) - Tag de categoria definida pelo admin na criacao da aula
Como admin, quero definir uma tag de categoria na aula para orientar melhor os alunos na visualizacao da agenda.

Criterios de aceite:
- Na criacao da aula, admin escolhe uma categoria valida.
- Categorias validas: fundamentos, tecnica, rola, drill, condicionamento.
- Aluno visualiza a categoria na listagem de aulas.

### US-007 (P0) - Check-in de aula
Como aluno, quero marcar presenca para registrar participacao.

Criterios de aceite:
- Check-in permitido apenas dentro da janela da aula.
- Presenca duplicada na mesma aula e bloqueada.
- Instrutor/admin conseguem visualizar presencas.

### US-008 (P1) - Historico de aulas concluidas
Como aluno, quero acompanhar aulas concluidas para medir constancia.

Criterios de aceite:
- Historico ordenado por data.
- Filtro por periodo.
- Total de aulas concluidas por periodo.

### US-017 (P2) - Filtro opcional de aulas por categoria (V3/V4)
Como aluno, quero filtrar aulas por categoria quando eu quiser uma busca mais refinada.

Criterios de aceite:
- Filtro de categoria e opcional na agenda.
- Nao bloqueia fluxo principal de selecao/check-in do aluno.
- Pode ser ativado por feature flag em versoes futuras.

## Epico 4 - Graduacao e progresso

### US-009 (P0) - Regras de progressao
Como instrutor, quero configurar criterios de progressao para avaliar alunos.

Criterios de aceite:
- Regras por faixa (ex.: quantidade minima de aulas).
- Parametros editaveis por instrutor/admin.
- Alteracoes ficam auditaveis.

### US-015 (P0) - Criterio oficial IBJJF por faixa
Como gestor tecnico, quero parametrizar regras oficiais por faixa usando documento de referencia da IBJJF.

Criterios de aceite:
- Sistema possui estrutura para regra oficial por faixa.
- Regra referencia documento/versao oficial.
- Endpoint de progresso exibe indicadores IBJJF relevantes.

### US-010 (P0) - Contador para proxima graduacao
Como aluno, quero ver meu progresso para a proxima graduacao para manter motivacao.

Criterios de aceite:
- Percentual de progresso exibido no app.
- Baseado em regras ativas da faixa.
- Atualizacao apos confirmacao de nova presenca.

## Epico 5 - Operacao e qualidade

### US-011 (P0) - Observabilidade basica
Como time tecnico, quero monitorar erros e latencia para agir rapido em incidentes.

Criterios de aceite:
- Logs estruturados em API.
- Metricas basicas de uptime e erro.
- Alerta para indisponibilidade da API.

### US-012 (P1) - Pipeline CI
Como equipe, quero validacao automatica para reduzir regressao.

Criterios de aceite:
- Pipeline roda lint e testes.
- Build de app e API validado em pull request.
- Bloqueio de merge com pipeline falhando.

## Definicao de pronto (MVP)
- Todas as historias P0 concluidas e testadas.
- Testes E2E dos fluxos criticos: login, agenda, check-in, progresso.
- Ambiente de producao ativo com monitoramento minimo.
