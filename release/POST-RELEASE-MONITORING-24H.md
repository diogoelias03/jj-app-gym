# Post-Release Monitoring (24h)

## Janela de acompanhamento
- Inicio: [preencher]
- Fim: [preencher]
- Responsavel primario: [preencher]
- Backup: [preencher]

## Cadencia recomendada
- Primeiras 2h: check a cada 15 min.
- 2h a 8h: check a cada 30 min.
- 8h a 24h: check a cada 1h.

## Sinais a monitorar
1. API:
- erro 5xx;
- falha de autenticacao fora do padrao;
- latencia anormal em endpoints principais.

2. Mobile:
- falha de login;
- falha de check-in;
- erros de sessao/biometria.

3. Produto:
- queda de check-ins;
- anomalias de uso nas telas principais.

## Tabela de registro
- Horario | Status | Indicador | Acao tomada | Responsavel

## Criterio de escalacao
- Incidente critico: acionar canal tecnico imediatamente.
- Incidente alto: corrigir ou rollback em ate 30 min.
- Incidente medio/baixo: registrar e tratar no proximo ciclo.

