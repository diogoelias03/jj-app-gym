# Contributing Guide

## Fluxo recomendado
1. Criar branch a partir de `main` (ex.: `codex/feature-nome`).
2. Implementar mudancas pequenas e incrementais.
3. Rodar validacoes locais:
   - API: `cd api && npm ci && npm run typecheck && npm run build`
   - Mobile: `cd mobile && npm ci && npm run typecheck`
4. Abrir PR usando o template padrao.
5. Garantir CI verde antes de merge.

## Padrao de commits
- `feat(scope): ...`
- `fix(scope): ...`
- `chore(scope): ...`
- `docs(scope): ...`
- `ci(scope): ...`

## Qualidade minima
- Nao quebrar contratos existentes de API sem documentacao.
- Atualizar README/docs quando houver mudanca funcional.
- Adicionar evidencias de validacao no PR.

## Seguranca
- Nunca commitar secrets ou credenciais reais.
- Usar `.env.example` para documentar variaveis necessarias.
- Preferir `SecureStore` no mobile para dados sensiveis.

