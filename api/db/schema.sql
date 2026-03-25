create extension if not exists pgcrypto;

create table if not exists branches (
  id bigserial primary key,
  name text not null,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists belts (
  id bigserial primary key,
  name text not null unique,
  rank_order int not null unique,
  created_at timestamptz not null default now()
);

create table if not exists instructors (
  id bigserial primary key,
  full_name text not null,
  email text not null unique,
  branch_id bigint not null references branches(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id bigserial primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  branch_id bigint not null references branches(id),
  belt_id bigint not null references belts(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists class_sessions (
  id bigserial primary key,
  branch_id bigint not null references branches(id),
  belt_id bigint not null references belts(id),
  instructor_id bigint not null references instructors(id),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity int not null default 30,
  created_at timestamptz not null default now(),
  constraint class_session_time_check check (ends_at > starts_at)
);

create table if not exists attendances (
  id bigserial primary key,
  class_session_id bigint not null references class_sessions(id) on delete cascade,
  student_id bigint not null references students(id) on delete cascade,
  status text not null check (status in ('present', 'absent')),
  checked_in_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (class_session_id, student_id)
);

create table if not exists promotion_rules (
  id bigserial primary key,
  belt_id bigint not null references belts(id),
  min_classes int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (belt_id)
);

create table if not exists promotions (
  id bigserial primary key,
  student_id bigint not null references students(id),
  from_belt_id bigint not null references belts(id),
  to_belt_id bigint not null references belts(id),
  promoted_at timestamptz not null default now(),
  notes text
);
