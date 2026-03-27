insert into branches (name, address)
values
  ('Matriz Centro', 'Rua Exemplo, 100'),
  ('Filial Zona Sul', 'Avenida Exemplo, 200')
on conflict do nothing;

insert into belts (name, rank_order)
values
  ('Branca', 1),
  ('Azul', 2),
  ('Roxa', 3),
  ('Marrom', 4),
  ('Preta', 5)
on conflict do nothing;

insert into instructors (full_name, email, branch_id)
values
  ('Professor Carlos', 'carlos@jjappgym.dev', 1)
on conflict (email) do nothing;

insert into students (full_name, email, password_hash, branch_id, belt_id)
values
  (
    'Aluno Demo',
    'aluno@jjappgym.dev',
    crypt('123456', gen_salt('bf')),
    1,
    1
  )
on conflict (email) do nothing;

insert into class_sessions (branch_id, belt_id, instructor_id, title, starts_at, ends_at, capacity)
values
  (1, 1, 1, 'Fundamentos Branca', now() + interval '1 day', now() + interval '1 day 1 hour', 25),
  (1, 2, 1, 'Tecnicas Azul', now() + interval '2 day', now() + interval '2 day 1 hour', 20)
on conflict do nothing;

insert into promotion_rules (belt_id, min_classes, active)
values
  (1, 40, true),
  (2, 60, true),
  (3, 80, true),
  (4, 100, true),
  (5, 120, true)
on conflict (belt_id) do nothing;

insert into ibjjf_belt_criteria (
  belt_id,
  min_time_current_belt_months,
  min_age_years,
  requires_instructor_approval,
  source_document_path,
  source_document_version,
  notes
)
values
  (1, null, null, true, 'C:\\Users\\difarias\\.git\\Docs reference\\20251220_IBJJF_Graduacao_PT.pdf', '20251220_IBJJF_Graduacao_PT', 'Regra oficial deve ser detalhada por categoria (adulto/master/juvenil) com base no documento.'),
  (2, null, null, true, 'C:\\Users\\difarias\\.git\\Docs reference\\20251220_IBJJF_Graduacao_PT.pdf', '20251220_IBJJF_Graduacao_PT', 'Regra oficial deve ser detalhada por categoria (adulto/master/juvenil) com base no documento.'),
  (3, null, null, true, 'C:\\Users\\difarias\\.git\\Docs reference\\20251220_IBJJF_Graduacao_PT.pdf', '20251220_IBJJF_Graduacao_PT', 'Regra oficial deve ser detalhada por categoria (adulto/master/juvenil) com base no documento.'),
  (4, null, null, true, 'C:\\Users\\difarias\\.git\\Docs reference\\20251220_IBJJF_Graduacao_PT.pdf', '20251220_IBJJF_Graduacao_PT', 'Regra oficial deve ser detalhada por categoria (adulto/master/juvenil) com base no documento.'),
  (5, null, null, true, 'C:\\Users\\difarias\\.git\\Docs reference\\20251220_IBJJF_Graduacao_PT.pdf', '20251220_IBJJF_Graduacao_PT', 'Regra oficial deve ser detalhada por categoria (adulto/master/juvenil) com base no documento.')
on conflict (belt_id) do nothing;
