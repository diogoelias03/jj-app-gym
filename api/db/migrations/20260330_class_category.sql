begin;

alter table class_sessions
  add column if not exists class_category text;

update class_sessions
set class_category = case
  when lower(title) like '%rola%' then 'rola'
  when lower(title) like '%tecnica%' then 'tecnica'
  when lower(title) like '%drill%' then 'drill'
  when lower(title) like '%condicionamento%' then 'condicionamento'
  else 'fundamentos'
end
where class_category is null;

alter table class_sessions
  alter column class_category set default 'fundamentos';

alter table class_sessions
  alter column class_category set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_session_category_check'
  ) then
    alter table class_sessions
      add constraint class_session_category_check
      check (
        class_category in ('fundamentos', 'tecnica', 'rola', 'drill', 'condicionamento')
      );
  end if;
end $$;

commit;
