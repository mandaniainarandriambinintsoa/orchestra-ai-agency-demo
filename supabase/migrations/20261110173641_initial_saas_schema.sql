-- Orchestra prototype schema.
-- Tables use an orchestra_ prefix to stay isolated from the existing n8n
-- schema. They are server-only: no browser role receives access.

create table public.orchestra_organizations (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orchestra_organization_members (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'operator' check (role in ('owner', 'admin', 'operator', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, auth_user_id)
);

create table public.orchestra_prospects (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  external_ref text,
  full_name text not null check (char_length(full_name) between 2 and 160),
  company_name text not null check (char_length(company_name) between 2 and 180),
  email text,
  phone text,
  status text not null default 'nouveau' check (status in ('nouveau', 'en_cours', 'qualifie', 'non_qualifie', 'converti')),
  qualification_score smallint check (qualification_score between 0 and 100),
  qualification_summary text,
  source text not null default 'manual',
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.orchestra_conversations (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  prospect_id bigint not null,
  channel text not null default 'web' check (channel in ('web', 'email', 'linkedin', 'phone', 'other')),
  status text not null default 'open' check (status in ('open', 'waiting', 'closed', 'escalated')),
  agent_key text,
  summary text,
  started_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  constraint orchestra_conversations_prospect_tenant_fkey foreign key (organization_id, prospect_id)
    references public.orchestra_prospects (organization_id, id) on delete cascade,
  constraint orchestra_conversations_closed_after_start_check check (closed_at is null or closed_at >= started_at)
);

create table public.orchestra_messages (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  conversation_id bigint not null,
  direction text not null check (direction in ('inbound', 'outbound', 'internal')),
  sender_type text not null check (sender_type in ('prospect', 'human', 'agent', 'system')),
  body text not null check (char_length(body) between 1 and 20000),
  external_ref text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint orchestra_messages_conversation_tenant_fkey foreign key (organization_id, conversation_id)
    references public.orchestra_conversations (organization_id, id) on delete cascade
);

create table public.orchestra_appointments (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  prospect_id bigint not null,
  conversation_id bigint,
  title text not null check (char_length(title) between 2 and 200),
  status text not null default 'proposed' check (status in ('proposed', 'pending_confirmation', 'confirmed', 'completed', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  external_calendar_ref text,
  confirmation_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  constraint orchestra_appointments_prospect_tenant_fkey foreign key (organization_id, prospect_id)
    references public.orchestra_prospects (organization_id, id) on delete cascade,
  constraint orchestra_appointments_conversation_tenant_fkey foreign key (organization_id, conversation_id)
    references public.orchestra_conversations (organization_id, id) on delete restrict,
  constraint orchestra_appointments_valid_range_check check (ends_at > starts_at)
);

create table public.orchestra_follow_ups (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  prospect_id bigint not null,
  channel text not null check (channel in ('email', 'linkedin', 'phone', 'sms')),
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'scheduled', 'sent', 'cancelled', 'failed')),
  proposed_message text not null check (char_length(proposed_message) between 1 and 10000),
  scheduled_for timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orchestra_follow_ups_prospect_tenant_fkey foreign key (organization_id, prospect_id)
    references public.orchestra_prospects (organization_id, id) on delete cascade,
  constraint orchestra_follow_ups_approval_consistency_check check (
    (approved_at is null and approved_by is null) or
    (approved_at is not null and approved_by is not null)
  )
);

create table public.orchestra_agents (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  agent_key text not null,
  name text not null check (char_length(name) between 2 and 160),
  role_description text not null,
  workflow_ref text,
  status text not null default 'configured' check (status in ('verified', 'configured', 'simulated', 'unavailable')),
  allows_external_side_effects boolean not null default false,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, agent_key)
);

create table public.orchestra_workflow_executions (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  agent_id bigint,
  prospect_id bigint,
  conversation_id bigint,
  correlation_id uuid not null,
  idempotency_key text,
  provider_execution_ref text,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'timed_out', 'cancelled')),
  input_summary jsonb not null default '{}'::jsonb,
  output_summary jsonb not null default '{}'::jsonb,
  error_code text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  constraint orchestra_workflow_executions_agent_tenant_fkey foreign key (organization_id, agent_id)
    references public.orchestra_agents (organization_id, id) on delete restrict,
  constraint orchestra_workflow_executions_prospect_tenant_fkey foreign key (organization_id, prospect_id)
    references public.orchestra_prospects (organization_id, id) on delete restrict,
  constraint orchestra_workflow_executions_conversation_tenant_fkey foreign key (organization_id, conversation_id)
    references public.orchestra_conversations (organization_id, id) on delete restrict,
  constraint orchestra_workflow_executions_finished_after_start_check check (finished_at is null or started_at is null or finished_at >= started_at),
  unique (organization_id, correlation_id)
);

create table public.orchestra_products (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  sku text not null check (char_length(sku) between 2 and 80),
  name text not null check (char_length(name) between 2 and 180),
  description text,
  quantity_available integer not null default 0 check (quantity_available >= 0),
  minimum_stock integer not null default 0 check (minimum_stock >= 0),
  unit_price numeric(12, 2) check (unit_price is null or unit_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, sku)
);

create table public.orchestra_stock_movements (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  product_id bigint not null,
  prospect_id bigint,
  movement_type text not null check (movement_type in ('inbound', 'outbound', 'adjustment', 'reservation', 'release')),
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null check (char_length(reason) between 2 and 500),
  correlation_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint orchestra_stock_movements_product_tenant_fkey foreign key (organization_id, product_id)
    references public.orchestra_products (organization_id, id) on delete cascade,
  constraint orchestra_stock_movements_prospect_tenant_fkey foreign key (organization_id, prospect_id)
    references public.orchestra_prospects (organization_id, id) on delete restrict
);

create table public.orchestra_activity_logs (
  id bigint generated always as identity primary key,
  organization_id bigint not null references public.orchestra_organizations(id) on delete cascade,
  prospect_id bigint,
  actor_type text not null check (actor_type in ('user', 'agent', 'system')),
  actor_ref text,
  action text not null check (char_length(action) between 2 and 120),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id bigint,
  correlation_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint orchestra_activity_logs_prospect_tenant_fkey foreign key (organization_id, prospect_id)
    references public.orchestra_prospects (organization_id, id) on delete restrict
);

-- Foreign-key and access-pattern indexes. Collections are fetched using keyset
-- pagination on (created_at, id), never unbounded reads.
create index orchestra_organization_members_organization_id_idx on public.orchestra_organization_members (organization_id);
create index orchestra_organization_members_auth_user_id_idx on public.orchestra_organization_members (auth_user_id);
create index orchestra_prospects_organization_status_created_idx on public.orchestra_prospects (organization_id, status, created_at desc, id desc);
create index orchestra_prospects_organization_activity_idx on public.orchestra_prospects (organization_id, last_activity_at desc nulls last, id desc);
create unique index orchestra_prospects_organization_external_ref_key on public.orchestra_prospects (organization_id, external_ref) where external_ref is not null;
create index orchestra_conversations_prospect_started_idx on public.orchestra_conversations (organization_id, prospect_id, started_at desc, id desc);
create index orchestra_messages_conversation_sent_idx on public.orchestra_messages (organization_id, conversation_id, sent_at, id);
create unique index orchestra_messages_organization_external_ref_key on public.orchestra_messages (organization_id, external_ref) where external_ref is not null;
create index orchestra_appointments_organization_starts_idx on public.orchestra_appointments (organization_id, starts_at, id);
create index orchestra_appointments_prospect_id_idx on public.orchestra_appointments (prospect_id);
create index orchestra_appointments_conversation_id_idx on public.orchestra_appointments (conversation_id) where conversation_id is not null;
create index orchestra_follow_ups_organization_status_schedule_idx on public.orchestra_follow_ups (organization_id, status, scheduled_for nulls last, id);
create index orchestra_follow_ups_prospect_id_idx on public.orchestra_follow_ups (prospect_id);
create index orchestra_agents_organization_status_idx on public.orchestra_agents (organization_id, status);
create index orchestra_workflow_executions_organization_created_idx on public.orchestra_workflow_executions (organization_id, created_at desc, id desc);
create unique index orchestra_workflow_executions_organization_idempotency_key on public.orchestra_workflow_executions (organization_id, idempotency_key) where idempotency_key is not null;
create index orchestra_workflow_executions_agent_id_idx on public.orchestra_workflow_executions (agent_id) where agent_id is not null;
create index orchestra_workflow_executions_prospect_id_idx on public.orchestra_workflow_executions (prospect_id) where prospect_id is not null;
create index orchestra_workflow_executions_conversation_id_idx on public.orchestra_workflow_executions (conversation_id) where conversation_id is not null;
create index orchestra_products_organization_low_stock_idx on public.orchestra_products (organization_id, quantity_available, id) where is_active;
create index orchestra_stock_movements_product_created_idx on public.orchestra_stock_movements (organization_id, product_id, created_at desc, id desc);
create unique index orchestra_stock_movements_organization_correlation_key on public.orchestra_stock_movements (organization_id, correlation_id) where correlation_id is not null;
create index orchestra_stock_movements_prospect_id_idx on public.orchestra_stock_movements (prospect_id) where prospect_id is not null;
create index orchestra_activity_logs_organization_created_idx on public.orchestra_activity_logs (organization_id, created_at desc, id desc);
create index orchestra_activity_logs_prospect_id_idx on public.orchestra_activity_logs (prospect_id) where prospect_id is not null;

-- Defense in depth: the prototype currently reads and writes through trusted
-- server code only. Authenticated client policies will be added with auth UX.
alter table public.orchestra_organizations enable row level security;
alter table public.orchestra_organization_members enable row level security;
alter table public.orchestra_prospects enable row level security;
alter table public.orchestra_conversations enable row level security;
alter table public.orchestra_messages enable row level security;
alter table public.orchestra_appointments enable row level security;
alter table public.orchestra_follow_ups enable row level security;
alter table public.orchestra_agents enable row level security;
alter table public.orchestra_workflow_executions enable row level security;
alter table public.orchestra_products enable row level security;
alter table public.orchestra_stock_movements enable row level security;
alter table public.orchestra_activity_logs enable row level security;

alter table public.orchestra_organizations force row level security;
alter table public.orchestra_organization_members force row level security;
alter table public.orchestra_prospects force row level security;
alter table public.orchestra_conversations force row level security;
alter table public.orchestra_messages force row level security;
alter table public.orchestra_appointments force row level security;
alter table public.orchestra_follow_ups force row level security;
alter table public.orchestra_agents force row level security;
alter table public.orchestra_workflow_executions force row level security;
alter table public.orchestra_products force row level security;
alter table public.orchestra_stock_movements force row level security;
alter table public.orchestra_activity_logs force row level security;

revoke all on table
  public.orchestra_organizations,
  public.orchestra_organization_members,
  public.orchestra_prospects,
  public.orchestra_conversations,
  public.orchestra_messages,
  public.orchestra_appointments,
  public.orchestra_follow_ups,
  public.orchestra_agents,
  public.orchestra_workflow_executions,
  public.orchestra_products,
  public.orchestra_stock_movements,
  public.orchestra_activity_logs
from anon, authenticated;

revoke all on sequence
  public.orchestra_organizations_id_seq,
  public.orchestra_organization_members_id_seq,
  public.orchestra_prospects_id_seq,
  public.orchestra_conversations_id_seq,
  public.orchestra_messages_id_seq,
  public.orchestra_appointments_id_seq,
  public.orchestra_follow_ups_id_seq,
  public.orchestra_agents_id_seq,
  public.orchestra_workflow_executions_id_seq,
  public.orchestra_products_id_seq,
  public.orchestra_stock_movements_id_seq,
  public.orchestra_activity_logs_id_seq
from anon, authenticated;

grant all on table
  public.orchestra_organizations,
  public.orchestra_organization_members,
  public.orchestra_prospects,
  public.orchestra_conversations,
  public.orchestra_messages,
  public.orchestra_appointments,
  public.orchestra_follow_ups,
  public.orchestra_agents,
  public.orchestra_workflow_executions,
  public.orchestra_products,
  public.orchestra_stock_movements,
  public.orchestra_activity_logs
to service_role;

grant all on sequence
  public.orchestra_organizations_id_seq,
  public.orchestra_organization_members_id_seq,
  public.orchestra_prospects_id_seq,
  public.orchestra_conversations_id_seq,
  public.orchestra_messages_id_seq,
  public.orchestra_appointments_id_seq,
  public.orchestra_follow_ups_id_seq,
  public.orchestra_agents_id_seq,
  public.orchestra_workflow_executions_id_seq,
  public.orchestra_products_id_seq,
  public.orchestra_stock_movements_id_seq,
  public.orchestra_activity_logs_id_seq
to service_role;

