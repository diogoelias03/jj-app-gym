begin;

create table if not exists student_goals (
  id bigserial primary key,
  student_id bigint not null references students(id) on delete cascade,
  title text not null,
  description text,
  target_value numeric(10,2),
  current_value numeric(10,2) not null default 0,
  unit text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_student_goals_student_status
  on student_goals(student_id, status);

create table if not exists instructor_feedback (
  id bigserial primary key,
  student_id bigint not null references students(id) on delete cascade,
  instructor_id bigint not null references instructors(id),
  class_session_id bigint references class_sessions(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  feedback_text text not null,
  visible_to_student boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_instructor_feedback_student_created
  on instructor_feedback(student_id, created_at desc);

commit;
