begin;

create table if not exists ibjjf_profiles (
  code text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists ibjjf_profile_belt_criteria (
  id bigserial primary key,
  profile_code text not null references ibjjf_profiles(code),
  belt_current_id bigint not null references belts(id),
  belt_next_id bigint not null references belts(id),
  min_time_current_belt_months int not null default 0 check (min_time_current_belt_months >= 0),
  min_age_years int not null default 0 check (min_age_years >= 0),
  requires_instructor_approval boolean not null default true,
  source_document_version text not null,
  source_document_path text not null,
  source_page_or_section text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_code, belt_current_id, belt_next_id)
);

create index if not exists idx_ibjjf_profile_belt_criteria_profile
  on ibjjf_profile_belt_criteria(profile_code);

insert into ibjjf_profiles (code, name)
values
  ('adult_male', 'Adulto Masculino'),
  ('adult_female', 'Adulto Feminino'),
  ('juvenil', 'Juvenil'),
  ('master_male', 'Master Masculino'),
  ('master_female', 'Master Feminino')
on conflict (code) do update
set name = excluded.name;

insert into ibjjf_profile_belt_criteria (
  profile_code,
  belt_current_id,
  belt_next_id,
  min_time_current_belt_months,
  min_age_years,
  requires_instructor_approval,
  source_document_version,
  source_document_path,
  source_page_or_section,
  notes
)
values
  ('adult_male', (select id from belts where name = 'Branca'), (select id from belts where name = 'Azul'), 0, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 II (p.7); Art. 3.1.3 I-II (p.9)', 'Faixa Branca nao exige tempo minimo; idade minima para Azul = 16.'),
  ('adult_male', (select id from belts where name = 'Azul'), (select id from belts where name = 'Roxa'), 24, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 III (p.7); Art. 3.1.3 II (p.9)', 'Excecoes oficiais: 12 meses para cadastro anterior Cinza/Amarela/Laranja; 0 meses para Verde, Azul Juvenil ou Campeao Mundial adulto azul.'),
  ('adult_male', (select id from belts where name = 'Roxa'), (select id from belts where name = 'Marrom'), 18, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 IV (p.7); Art. 3.1.3 III (p.9)', 'Excecoes oficiais: 12 meses para Azul Juvenil; 0 meses para Laranja/Verde+Azul Juvenil, Roxa Juvenil ou Campeao Mundial adulto roxa.'),
  ('adult_male', (select id from belts where name = 'Marrom'), (select id from belts where name = 'Preta'), 12, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 V (p.7); Art. 3.1.3 IV (p.9)', 'Excecoes oficiais: 0 meses para Campeao Mundial adulto marrom; preta aos 18 apenas para campeao mundial adulto marrom.'),
  ('adult_female', (select id from belts where name = 'Branca'), (select id from belts where name = 'Azul'), 0, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 II (p.7); Art. 3.1.3 I-II (p.9)', 'Faixa Branca nao exige tempo minimo; idade minima para Azul = 16.'),
  ('adult_female', (select id from belts where name = 'Azul'), (select id from belts where name = 'Roxa'), 24, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 III (p.7); Art. 3.1.3 II (p.9)', 'Excecoes oficiais: 12 meses para cadastro anterior Cinza/Amarela/Laranja; 0 meses para Verde, Azul Juvenil ou Campeao Mundial adulto azul.'),
  ('adult_female', (select id from belts where name = 'Roxa'), (select id from belts where name = 'Marrom'), 18, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 IV (p.7); Art. 3.1.3 III (p.9)', 'Excecoes oficiais: 12 meses para Azul Juvenil; 0 meses para Laranja/Verde+Azul Juvenil, Roxa Juvenil ou Campeao Mundial adulto roxa.'),
  ('adult_female', (select id from belts where name = 'Marrom'), (select id from belts where name = 'Preta'), 12, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 V (p.7); Art. 3.1.3 IV (p.9)', 'Excecoes oficiais: 0 meses para Campeao Mundial adulto marrom; preta aos 18 apenas para campeao mundial adulto marrom.'),
  ('juvenil', (select id from belts where name = 'Branca'), (select id from belts where name = 'Azul'), 0, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 II (p.7); Art. 3.1.2 I-II (p.9)', 'Sem tempo minimo em Branca e Azul no Juvenil.'),
  ('juvenil', (select id from belts where name = 'Azul'), (select id from belts where name = 'Roxa'), 0, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 III (p.7); Art. 3.1.2 II-III (p.9)', 'Faixa Azul Juvenil sem tempo minimo.'),
  ('juvenil', (select id from belts where name = 'Roxa'), (select id from belts where name = 'Marrom'), 18, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 IV (p.7); Art. 3.1.2 III e 3.1.3 III (p.9)', 'Juvenil elegivel a Marrom apenas no Adulto; permanencia em Roxa segue regra da categoria Adulto.'),
  ('juvenil', (select id from belts where name = 'Marrom'), (select id from belts where name = 'Preta'), 12, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 V (p.7); Art. 3.1.3 IV (p.9)', 'Transicao ocorre no Adulto; preta aos 18 apenas para campeao mundial adulto marrom.'),
  ('master_male', (select id from belts where name = 'Branca'), (select id from belts where name = 'Azul'), 0, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 II (p.7); Art. 3.1.3 I-II (p.9)', 'Masters seguem regra de tempo da secao Adulto/Masters.'),
  ('master_male', (select id from belts where name = 'Azul'), (select id from belts where name = 'Roxa'), 24, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 III (p.7); Art. 3.1.3 II (p.9)', 'Excecoes oficiais da Faixa Azul tambem se aplicam.'),
  ('master_male', (select id from belts where name = 'Roxa'), (select id from belts where name = 'Marrom'), 18, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 IV (p.7); Art. 3.1.3 III (p.9)', 'Excecoes oficiais da Faixa Roxa tambem se aplicam.'),
  ('master_male', (select id from belts where name = 'Marrom'), (select id from belts where name = 'Preta'), 12, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 V (p.7); Art. 3.1.3 IV (p.9)', 'Excecao oficial: 0 meses para Campeao Mundial adulto marrom.'),
  ('master_female', (select id from belts where name = 'Branca'), (select id from belts where name = 'Azul'), 0, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 II (p.7); Art. 3.1.3 I-II (p.9)', 'Masters seguem regra de tempo da secao Adulto/Masters.'),
  ('master_female', (select id from belts where name = 'Azul'), (select id from belts where name = 'Roxa'), 24, 16, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 III (p.7); Art. 3.1.3 II (p.9)', 'Excecoes oficiais da Faixa Azul tambem se aplicam.'),
  ('master_female', (select id from belts where name = 'Roxa'), (select id from belts where name = 'Marrom'), 18, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 IV (p.7); Art. 3.1.3 III (p.9)', 'Excecoes oficiais da Faixa Roxa tambem se aplicam.'),
  ('master_female', (select id from belts where name = 'Marrom'), (select id from belts where name = 'Preta'), 12, 18, true, '20251220_IBJJF_Graduacao_PT', 'C:\Users\difarias\.git\Docs reference\20251220_IBJJF_Graduacao_PT.pdf', 'Art. 2.1.2 V (p.7); Art. 3.1.3 IV (p.9)', 'Excecao oficial: 0 meses para Campeao Mundial adulto marrom.')
on conflict (profile_code, belt_current_id, belt_next_id) do update
set
  min_time_current_belt_months = excluded.min_time_current_belt_months,
  min_age_years = excluded.min_age_years,
  requires_instructor_approval = excluded.requires_instructor_approval,
  source_document_version = excluded.source_document_version,
  source_document_path = excluded.source_document_path,
  source_page_or_section = excluded.source_page_or_section,
  notes = excluded.notes,
  updated_at = now();

commit;
