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

create table if not exists ibjjf_belt_criteria (
  id bigserial primary key,
  belt_id bigint not null references belts(id),
  min_time_current_belt_months int,
  min_age_years int,
  requires_instructor_approval boolean not null default true,
  source_document_path text not null,
  source_document_version text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (belt_id)
);

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

create table if not exists branch_transfer_requests (
  id bigserial primary key,
  student_id bigint not null references students(id),
  current_branch_id bigint not null references branches(id),
  requested_branch_id bigint not null references branches(id),
  status text not null check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reason text not null,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  review_notes text
);

create table if not exists branch_transfer_events (
  id bigserial primary key,
  request_id bigint not null references branch_transfer_requests(id) on delete cascade,
  event_type text not null check (event_type in ('requested', 'approved', 'rejected', 'branch_updated', 'cancelled')),
  actor_type text not null check (actor_type in ('student', 'admin', 'system')),
  actor_id bigint,
  from_branch_id bigint references branches(id),
  to_branch_id bigint references branches(id),
  event_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_branch_transfer_requests_student_status
  on branch_transfer_requests(student_id, status);

create index if not exists idx_branch_transfer_requests_status_requested_at
  on branch_transfer_requests(status, requested_at);

create index if not exists idx_branch_transfer_events_request_id
  on branch_transfer_events(request_id);
