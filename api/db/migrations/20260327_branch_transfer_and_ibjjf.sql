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
