begin;

create table if not exists class_checkin_qr_tokens (
  id bigserial primary key,
  class_session_id bigint not null references class_sessions(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_class_checkin_qr_tokens_session
  on class_checkin_qr_tokens(class_session_id);

commit;
