begin;

insert into ibjjf_profiles (code, name)
values
  ('adult_male', 'Adulto Masculino'),
  ('adult_female', 'Adulto Feminino'),
  ('juvenil', 'Juvenil'),
  ('master_male', 'Master Masculino'),
  ('master_female', 'Master Feminino')
on conflict (code) do update
set name = excluded.name;

alter table students
  add column if not exists profile_code text;

update students
set profile_code = 'adult_male'
where profile_code is null;

alter table students
  alter column profile_code set default 'adult_male';

alter table students
  alter column profile_code set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_students_profile_code'
  ) then
    alter table students
      add constraint fk_students_profile_code
      foreign key (profile_code)
      references ibjjf_profiles(code);
  end if;
end $$;

commit;
