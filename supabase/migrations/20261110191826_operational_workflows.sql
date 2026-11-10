-- Operational fields and safe server-side helpers for the interactive demo.

alter table public.orchestra_prospects
  add column request_text text,
  add column qualification_subject text,
  add column interest_level text check (interest_level in ('high', 'medium', 'low', 'unknown')),
  add column qualification_confidence smallint check (qualification_confidence between 0 and 100),
  add column next_action text,
  add column qualified_at timestamptz;

alter table public.orchestra_conversations
  add column external_session_id text,
  add column scenario text check (scenario in ('colis', 'dentiste', 'garagiste'));

create unique index orchestra_conversations_organization_session_key
  on public.orchestra_conversations (organization_id, external_session_id)
  where external_session_id is not null;

alter table public.orchestra_follow_ups
  add column generation_source text not null default 'manual'
    check (generation_source in ('manual', 'cron'));

create or replace function public.orchestra_adjust_stock(
  p_organization_id bigint,
  p_product_id bigint,
  p_quantity_delta integer,
  p_reason text,
  p_correlation_id uuid
)
returns public.orchestra_products
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_product public.orchestra_products;
begin
  if p_quantity_delta = 0 then
    raise exception 'quantity_delta_must_not_be_zero';
  end if;

  if char_length(trim(p_reason)) < 2 or char_length(p_reason) > 500 then
    raise exception 'invalid_stock_reason';
  end if;

  update public.orchestra_products
  set quantity_available = quantity_available + p_quantity_delta,
      updated_at = now()
  where organization_id = p_organization_id
    and id = p_product_id
    and is_active
    and quantity_available + p_quantity_delta >= 0
  returning * into updated_product;

  if not found then
    raise exception 'product_not_found_or_insufficient_stock';
  end if;

  insert into public.orchestra_stock_movements (
    organization_id,
    product_id,
    movement_type,
    quantity_delta,
    reason,
    correlation_id
  ) values (
    p_organization_id,
    p_product_id,
    case when p_quantity_delta > 0 then 'inbound' else 'outbound' end,
    p_quantity_delta,
    trim(p_reason),
    p_correlation_id
  );

  return updated_product;
end;
$$;

revoke all on function public.orchestra_adjust_stock(bigint, bigint, integer, text, uuid)
  from public, anon, authenticated;
grant execute on function public.orchestra_adjust_stock(bigint, bigint, integer, text, uuid)
  to service_role;

insert into public.orchestra_organizations (name, slug)
values ('Orchestra Demo', 'orchestra-demo')
on conflict (slug) do update set updated_at = now();

insert into public.orchestra_agents (
  organization_id,
  agent_key,
  name,
  role_description,
  workflow_ref,
  status,
  allows_external_side_effects
)
select org.id, seed.agent_key, seed.name, seed.role_description, seed.workflow_ref, seed.status, seed.allows_external_side_effects
from public.orchestra_organizations as org
cross join (values
  ('qualification', 'Agent de qualification', 'Analyse les demandes entrantes et produit un score, un sujet et une prochaine action.', 'orchestra-qualify-prospect', 'configured', false),
  ('conversation', 'Agent conversationnel', 'Traite les scénarios colis, dentiste et garagiste avec calendrier et confirmation email.', 'chat-agent', 'verified', true),
  ('follow_up', 'Agent de relance', 'Génère des relances personnalisées soumises à validation humaine.', 'personalize-message', 'configured', false)
) as seed(agent_key, name, role_description, workflow_ref, status, allows_external_side_effects)
where org.slug = 'orchestra-demo'
on conflict (organization_id, agent_key) do update set
  name = excluded.name,
  role_description = excluded.role_description,
  workflow_ref = excluded.workflow_ref,
  status = excluded.status,
  allows_external_side_effects = excluded.allows_external_side_effects,
  updated_at = now();

insert into public.orchestra_products (
  organization_id,
  sku,
  name,
  description,
  quantity_available,
  minimum_stock,
  unit_price
)
select org.id, seed.sku, seed.name, seed.description, seed.quantity_available, seed.minimum_stock, seed.unit_price
from public.orchestra_organizations as org
cross join (values
  ('INF-KEY-01', 'Clavier mécanique Compact', 'Clavier compact pour poste de travail.', 18, 6, 79.90::numeric),
  ('INF-HDP-02', 'Casque USB Pro', 'Casque filaire avec microphone.', 3, 5, 59.00::numeric),
  ('INF-CAM-04', 'Webcam Full HD', 'Webcam 1080p pour visioconférence.', 11, 4, 69.00::numeric),
  ('INF-HUB-03', 'Hub USB-C 7 ports', 'Hub multiport pour ordinateur portable.', 0, 3, 49.90::numeric)
) as seed(sku, name, description, quantity_available, minimum_stock, unit_price)
where org.slug = 'orchestra-demo'
on conflict (organization_id, sku) do nothing;
