# Manual Test Checklist (Mobile MVP)

## Pre-condicoes
1. API backend rodando em `http://127.0.0.1:3000` (ou IP LAN no `.env`).
2. Banco com seed aplicado (`aluno@jjappgym.dev` / `123456`).
3. App mobile iniciado com `npm run start`.

## Roteiro rapido
1. Login
- Abrir app.
- Entrar com usuario seed.
- Resultado esperado: acesso liberado e tabs exibidas.

2. Sessao persistida
- Fechar app completamente.
- Abrir novamente.
- Resultado esperado: sessao restaurada sem novo login.

3. Dashboard
- Ir para aba `Dashboard`.
- Resultado esperado: bloco com proxima aula, progresso, metas e media de feedback.

4. Aulas
- Ir para aba `Aulas`.
- Resultado esperado: lista com `id`, titulo, `class_category`, instrutor e faixa.

5. Progresso
- Ir para aba `Progresso`.
- Resultado esperado: dados de progresso e bloco IBJJF.

6. Check-in por botao (positivo)
- Ir para aba `Checkin`.
- Informar `classSessionId` valido dentro da janela.
- Resultado esperado: mensagem de sucesso com `attendanceId`.

7. Check-in por botao (negativo)
- Repetir check-in fora da janela valida.
- Resultado esperado: mensagem amigavel com horario de abertura/fechamento.

8. Check-in por QR
- Gerar token no endpoint admin `POST /api/v1/admin/checkins/qr-token`.
- Inserir token na aba `Checkin`.
- Resultado esperado: sucesso no check-in por QR.

9. Metas
- Ir para aba `Metas`.
- Criar meta com titulo e opcionalmente alvo/unidade.
- Clicar `+1 progresso`.
- Resultado esperado: meta criada e atualizada na lista.

10. Feedback
- Ir para aba `Feedback`.
- Resultado esperado: listar feedbacks visiveis do instrutor.

11. Logout
- Tocar `Sair`.
- Resultado esperado: voltar para tela de login e limpar sessao local.

## Evidencias recomendadas
1. Print da tela de login.
2. Print de cada aba principal.
3. Print de sucesso e erro de check-in.
4. Print de criacao/atualizacao de meta.

