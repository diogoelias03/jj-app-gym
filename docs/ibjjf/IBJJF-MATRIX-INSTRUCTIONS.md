# IBJJF Matrix - Instructions

Arquivo base: `docs/ibjjf/ibjjf-graduation-matrix-template.csv`

## Objetivo
Preencher as regras oficiais de graduacao por faixa e categoria/perfil usando o documento oficial:

`C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf`

## Como preencher
1. Preencha uma linha por transicao de faixa (`belt_current` -> `belt_next`) para cada `profile_code`.
2. Campos numericos:
   - `min_time_current_belt_months`: tempo minimo na faixa atual, em meses.
   - `min_age_years`: idade minima para elegibilidade.
3. Campo booleano:
   - `requires_instructor_approval`: `true` ou `false`.
4. Rastreabilidade:
   - `source_page_or_section`: pagina/secao exata da regra no PDF.
   - `notes`: observacoes e excecoes (ex.: juvenil, master, casos especiais).

## Validacao minima antes da carga SQL
1. Nao deixar `belt_current`/`belt_next` vazios.
2. Nao usar valores negativos para meses/idade.
3. Nao repetir combinacao:
   - `profile_code + belt_current + belt_next`.

## Proximo passo apos preenchimento
1. Salvar a matriz final no mesmo caminho (ou duplicar com sufixo `-final`).
2. Me pedir: "converter a matriz IBJJF para SQL oficial".
3. Eu gero:
   - script SQL de carga/atualizacao;
   - validações de consistência;
   - atualização dos endpoints para usar o recorte por perfil/categoria.

## Status atual
- Conversao para SQL oficial concluida:
  - `api/db/migrations/20260327_ibjjf_profile_criteria_official.sql`
- Script de validacao concluido:
  - `api/db/validation/ibjjf_profile_criteria_validation.sql`
