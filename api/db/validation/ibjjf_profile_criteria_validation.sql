-- 1) Deve haver 20 regras (5 perfis x 4 transicoes de faixa)
select count(*) as total_rules
from ibjjf_profile_belt_criteria;

-- 2) Deve haver 4 transicoes por perfil
select
  profile_code,
  count(*) as rules_per_profile
from ibjjf_profile_belt_criteria
group by profile_code
order by profile_code;

-- 3) Nao pode haver duplicidade de regra por perfil/transicao
select
  profile_code,
  belt_current_id,
  belt_next_id,
  count(*) as qty
from ibjjf_profile_belt_criteria
group by profile_code, belt_current_id, belt_next_id
having count(*) > 1;

-- 4) Regras invalidas de tempo/idade (esperado: zero linhas)
select *
from ibjjf_profile_belt_criteria
where min_time_current_belt_months < 0
   or min_age_years < 0;

-- 5) Todas as regras devem apontar para documento oficial preenchido
select *
from ibjjf_profile_belt_criteria
where source_document_version is null
   or source_document_version = ''
   or source_document_path is null
   or source_document_path = '';

-- 6) Visao de auditoria para BI/analise
select
  c.profile_code,
  p.name as profile_name,
  b1.name as belt_current,
  b2.name as belt_next,
  c.min_time_current_belt_months,
  c.min_age_years,
  c.requires_instructor_approval,
  c.source_document_version,
  c.source_page_or_section
from ibjjf_profile_belt_criteria c
join ibjjf_profiles p on p.code = c.profile_code
join belts b1 on b1.id = c.belt_current_id
join belts b2 on b2.id = c.belt_next_id
order by c.profile_code, b1.rank_order;
