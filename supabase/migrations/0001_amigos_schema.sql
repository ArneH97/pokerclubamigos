-- ============================================================================
--  De Amigos — clubkas & leaderboard
--  Voor een eigen, apart Supabase-project. Alles staat in het standaardschema
--  "public", dus je hoeft niets extra in te stellen bij Exposed schemas.
--
--  Plak dit volledig in de Supabase SQL Editor en voer het uit.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Leden
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text        not null,
  full_name   text        not null,
  nickname    text,
  role        text        not null default 'member' check (role in ('member', 'admin')),
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.members is
  'Wie lid is van De Amigos. Een auth-gebruiker zonder rij hier ziet niets.';

-- ---------------------------------------------------------------------------
--  Seizoenen (spaarjaar met streefbedrag)
-- ---------------------------------------------------------------------------
create table if not exists public.seasons (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  target_amount numeric(10,2) not null default 0 check (target_amount >= 0),
  starts_on     date        not null,
  ends_on       date        not null,
  is_active     boolean     not null default false,
  created_at    timestamptz not null default now(),
  check (ends_on >= starts_on)
);

-- Slechts één actief seizoen tegelijk.
create unique index if not exists seasons_one_active
  on public.seasons (is_active) where is_active;

-- ---------------------------------------------------------------------------
--  Resultaten
--  profit en contribution zijn GEGENEREERDE kolommen: de bijdrage is altijd
--  exact 10% van de winst, en 0 bij verlies. Niemand kan daarvan afwijken,
--  ook niet via de API.
-- ---------------------------------------------------------------------------
create table if not exists public.results (
  id              uuid primary key default gen_random_uuid(),
  member_id       uuid        not null references public.members (id) on delete cascade,
  season_id       uuid        not null references public.seasons (id) on delete restrict,
  played_on       date        not null,
  venue           text        not null default 'Aalst',
  tournament      text,
  finish_position int         check (finish_position is null or finish_position > 0),
  buyin           numeric(10,2) not null check (buyin >= 0),
  cashout         numeric(10,2) not null check (cashout >= 0),
  profit          numeric(10,2) generated always as (cashout - buyin) stored,
  contribution    numeric(10,2) generated always as
                    (round(greatest(cashout - buyin, 0) * 0.10, 2)) stored,
  is_paid         boolean     not null default false,
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists results_member_idx on public.results (member_id);
create index if not exists results_season_idx on public.results (season_id);
create index if not exists results_played_idx on public.results (played_on desc);

comment on column public.results.contribution is
  '10% van de winst, automatisch berekend door de database. Bij verlies: 0.';
comment on column public.results.is_paid is
  'Aangevinkt door de voorzitter zodra het geld effectief in de kas zit.';

-- updated_at bijhouden
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists results_touch_updated_at on public.results;
create trigger results_touch_updated_at
  before update on public.results
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
--  Hulpfuncties voor RLS
--  security definer, zodat de policies zelf geen RLS op members triggeren
--  (dat zou oneindige recursie geven).
-- ---------------------------------------------------------------------------
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.id = auth.uid() and m.is_active
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.id = auth.uid() and m.is_active and m.role = 'admin'
  );
$$;

-- Zoekt een bestaande auth-gebruiker op e-mail, zodat iemand die al eens
-- uitgenodigd werd geen tweede uitnodiging krijgt.
create or replace function public.find_user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = auth, public
as $$
  select u.id from auth.users u where lower(u.email) = lower(p_email) limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.find_user_id_by_email(text) to service_role;

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------
alter table public.members enable row level security;
alter table public.seasons enable row level security;
alter table public.results enable row level security;

-- Leden zien elkaar (nodig voor het leaderboard); enkel admins beheren de lijst.
drop policy if exists members_select on public.members;
create policy members_select on public.members
  for select to authenticated
  using (public.is_member());

drop policy if exists members_update_self on public.members;
create policy members_update_self on public.members
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select m.role from public.members m where m.id = auth.uid()));

drop policy if exists members_admin_all on public.members;
create policy members_admin_all on public.members
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seizoenen: iedereen leest, admin beheert.
drop policy if exists seasons_select on public.seasons;
create policy seasons_select on public.seasons
  for select to authenticated
  using (public.is_member());

drop policy if exists seasons_admin_all on public.seasons;
create policy seasons_admin_all on public.seasons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Resultaten: alles is transparant voor leden. Je beheert je eigen ingaves,
-- de voorzitter mag alles corrigeren.
drop policy if exists results_select on public.results;
create policy results_select on public.results
  for select to authenticated
  using (public.is_member());

drop policy if exists results_insert_own on public.results;
create policy results_insert_own on public.results
  for insert to authenticated
  with check (public.is_member() and member_id = auth.uid());

drop policy if exists results_update_own on public.results;
create policy results_update_own on public.results
  for update to authenticated
  using (member_id = auth.uid() and public.is_member())
  with check (member_id = auth.uid());

drop policy if exists results_delete_own on public.results;
create policy results_delete_own on public.results
  for delete to authenticated
  using (member_id = auth.uid() and public.is_member());

drop policy if exists results_admin_all on public.results;
create policy results_admin_all on public.results
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
--  Views — security_invoker zodat RLS van de lezer blijft gelden
-- ---------------------------------------------------------------------------
create or replace view public.leaderboard
with (security_invoker = on) as
select
  r.season_id,
  m.id                                            as member_id,
  coalesce(nullif(m.nickname, ''), m.full_name)   as display_name,
  m.full_name,
  count(*)::int                                   as entries,
  count(*) filter (where r.profit > 0)::int       as cashes,
  sum(r.contribution)                             as contributed,
  sum(r.contribution) filter (where r.is_paid)    as paid,
  sum(r.profit)                                   as profit,
  sum(r.buyin)                                    as buyin,
  max(r.played_on)                                as last_played
from public.results r
join public.members m on m.id = r.member_id
group by r.season_id, m.id, m.nickname, m.full_name;

create or replace view public.season_totals
with (security_invoker = on) as
select
  s.id                                                as season_id,
  s.name,
  s.target_amount,
  s.starts_on,
  s.ends_on,
  s.is_active,
  coalesce(sum(r.contribution), 0)                    as pot,
  coalesce(sum(r.contribution) filter (where r.is_paid), 0) as pot_paid,
  coalesce(sum(r.profit), 0)                          as profit,
  count(r.id)::int                                    as entries,
  count(distinct r.member_id)::int                    as contributors
from public.seasons s
left join public.results r on r.season_id = s.id
group by s.id;

-- ---------------------------------------------------------------------------
--  Rechten
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.members, public.seasons, public.results to authenticated;
grant select on public.leaderboard, public.season_totals to authenticated;

-- ---------------------------------------------------------------------------
--  Startseizoen
-- ---------------------------------------------------------------------------
insert into public.seasons (name, target_amount, starts_on, ends_on, is_active)
select 'Seizoen ' || extract(year from now())::text,
       1500,
       date_trunc('year', now())::date,
       (date_trunc('year', now()) + interval '1 year - 1 day')::date,
       true
where not exists (select 1 from public.seasons);

-- ============================================================================
--  NA HET UITVOEREN: maak jezelf beheerder.
--  Nodig jezelf eerst uit via Authentication -> Users -> Invite user, en draai
--  daarna:
--
--     insert into public.members (id, email, full_name, role)
--     select id, email, 'Arne', 'admin' from auth.users
--     where email = 'jouw@email.be'
--     on conflict (id) do update set role = 'admin';
-- ============================================================================
