# Roadmap 3 Ondas - App Gym Schedule

## Criterio de priorizacao
- Impacto: valor para aluno/academia e diferenciacao de produto.
- Esforco: complexidade tecnica, dependencias e risco.
- Prioridade: alto impacto + baixo/medio esforco entra antes.

Legenda:
- Impacto: Alto, Medio, Baixo
- Esforco: Baixo, Medio, Alto

## Onda 1 - MVP+ (executar agora)
Objetivo: consolidar o core operacional e liberar UX forte para uso real.

1. Check-in por QR Code (alem do botao atual)
- Impacto: Alto
- Esforco: Medio
- Motivo: acelera operacao em aula e reduz fraude/erro de presenca.

2. Filtro de aulas por categoria (tecnica, rola, etc.)
- Impacto: Alto
- Esforco: Baixo
- Motivo: melhora descoberta da aula sem mexer em infraestrutura pesada.

3. Metas do aluno (baseline simples)
- Impacto: Medio
- Esforco: Medio
- Motivo: aumenta engajamento sem depender de IA ou analytics avancado.

4. Feedback do instrutor (texto + nota simples)
- Impacto: Alto
- Esforco: Medio
- Motivo: conecta treino com evolucao real de graduacao.

5. Visualizacao de progresso (barra e historico basico)
- Impacto: Alto
- Esforco: Medio
- Motivo: atende expectativa de "ver evolucao" no app.

6. Endurecimento de seguranca de conta (politica de senha e logout ampliado)
- Impacto: Medio
- Esforco: Baixo
- Motivo: reduz risco operacional antes de crescer base de usuarios.

## Onda 2 - V2 (escala funcional)
Objetivo: elevar retencao, comunicacao e operacao comercial.

1. Notificacoes push (aula, eventos, proximidade de graduacao)
- Impacto: Alto
- Esforco: Medio
- Dependencia: infraestrutura de notificacao e preferencias por usuario.

2. Mensageria interna (aluno x academia)
- Impacto: Alto
- Esforco: Alto
- Dependencia: modelagem de conversa, moderação e notificacao.

3. Area do aluno (manual por faixa + videos)
- Impacto: Alto
- Esforco: Medio
- Dependencia: curadoria de conteudo e permissao por nivel/faixa.

4. Servicos de recepcao e acesso a parceiros (links e fluxo guiado)
- Impacto: Medio
- Esforco: Medio
- Dependencia: acordos operacionais e jornada de usuario.

5. Relatorios de progresso para instrutores/gestao
- Impacto: Medio
- Esforco: Medio
- Dependencia: consolidacao do log BI ja implementado.

6. 2FA (email/app) para perfis sensiveis
- Impacto: Medio
- Esforco: Medio
- Dependencia: fluxo de recuperacao e suporte.

## Onda 3 - V3 (diferenciacao e monetizacao)
Objetivo: ampliar ecossistema e novas linhas de receita/engajamento.

1. Comunidade (forum/grupos de treino)
- Impacto: Alto
- Esforco: Alto
- Risco: moderacao e qualidade de conteudo.

2. Integracao com redes sociais (share de conquistas)
- Impacto: Medio
- Esforco: Medio
- Risco: politicas de plataforma e qualidade do conteudo compartilhado.

3. Pagamentos e clube de vantagens
- Impacto: Alto
- Esforco: Alto
- Risco: compliance financeiro e suporte.

4. Shop (produtos e beneficios)
- Impacto: Medio
- Esforco: Alto
- Risco: operacao de catalogo, estoque e pos-venda.

5. Biometria no app (complementar ao 2FA)
- Impacto: Medio
- Esforco: Medio
- Risco: variacoes por dispositivo/plataforma.

## Mix final (o que entra em cada onda)
- MVP+: QR check-in, categoria de aula, metas, feedback, visual de progresso, reforco de seguranca.
- V2: notificacoes, mensageria, area do aluno, servicos/parceiros, relatorios gerenciais, 2FA.
- V3: comunidade, social sharing, pagamentos/clube, shop, biometria.

## Corte recomendado para execucao imediata (primeiro sprint do MVP+)
1. Categoria de aula (baixo esforco, alto impacto).
2. QR check-in.
3. Feedback do instrutor.
4. Barra de progresso no app.

Esse corte gera ganho visivel rapido sem inflar demais o escopo tecnico.
