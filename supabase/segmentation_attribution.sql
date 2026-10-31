-- Segmentation + referral attribution support.
--
-- Idempotent: safe to re-run. Apply in the Supabase SQL editor.
--
-- WHY
-- The segmentation API folds anonymous shadow history into the authenticated
-- customer, which needs an index to stay fast, and the receipt referral loop needs
-- somewhere to store who sent the receipt that brought a new visitor in.

-- ── 1. Referral attribution on shadow_profiles ───────────────────────────────
-- Write-once by convention (set only when currently null). If a later organic visit
-- overwrote the source, the loop would always look like it produced nothing.

alter table if exists public.shadow_profiles
    add column if not exists referred_by_shadow_id text,
    add column if not exists referral_source text,
    add column if not exists referral_landing text;

comment on column public.shadow_profiles.referred_by_shadow_id is
    'Shadow id of the merchant whose shared artefact brought this visitor in. Immutable once set.';
comment on column public.shadow_profiles.referral_source is
    'receipt | status | broadcast | referral. NULL means organic.';

create index if not exists shadow_profiles_referred_by_idx
    on public.shadow_profiles (referred_by_shadow_id)
    where referred_by_shadow_id is not null;

-- ── 2. Event scan indexes ────────────────────────────────────────────────────
-- /api/admin/segments scans telemetry_events by recency and folds rows in by
-- user_id. Without these, the 120-day lookback table-scans and the admin console
-- degrades linearly with usage.

create index if not exists telemetry_events_created_at_idx
    on public.telemetry_events (created_at desc);

create index if not exists telemetry_events_user_id_created_at_idx
    on public.telemetry_events (user_id, created_at desc)
    where user_id is not null;

create index if not exists telemetry_events_shadow_id_created_at_idx
    on public.telemetry_events (shadow_id, created_at desc);

-- ── 3. Identity resolution integrity ────────────────────────────────────────
-- Shadow history must follow the merchant across authentication. This guard keeps a
-- shadow row from being re-pointed at a second account, which would silently merge
-- two merchants into one timeline.

create or replace function public.guard_shadow_retarget()
returns trigger
language plpgsql
as $body$
begin
    if old.user_id is not null
       and new.user_id is not null
       and old.user_id is distinct from new.user_id then
        raise exception
            'shadow_profiles % is already resolved to user %; refusing to retarget to %',
            old.id, old.user_id, new.user_id;
    end if;
    return new;
end;
$body$;

drop trigger if exists shadow_profiles_retarget_guard on public.shadow_profiles;

create trigger shadow_profiles_retarget_guard
    before update on public.shadow_profiles
    for each row execute function public.guard_shadow_retarget();

-- ── 4. Buyer-contact containment ────────────────────────────────────────────
-- Buyer phone numbers arrive inside telemetry_events.properties. They must never
-- reach a marketing list. This view is the only contact surface the app should use,
-- and it exposes the merchant's own number exclusively.

create or replace view public.merchant_contactable as
select
    id as shadow_id,
    user_id,
    business_name,
    contact_phone,
    contact_email,
    last_active_at,
    (contact_phone is not null and char_length(regexp_replace(contact_phone, '[^0-9]', '', 'g')) >= 10)
        as reachable_on_whatsapp
from public.shadow_profiles
-- A buyer number must never be used as a merchant contact. Merchant phone is
-- captured separately in extractMerchantPhone; this view simply refuses to invent one.
where contact_phone is not null or contact_email is not null;

comment on view public.merchant_contactable is
    'Merchant-owned contact details only. Buyer data in telemetry_events.properties is intentionally excluded.';