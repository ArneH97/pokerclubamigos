-- ============================================================================
--  De Amigos — uitbreiding 5
--
--  Wat je als beheerder handmatig instelt (het startsaldo uit de Excel, een
--  correctie) telt mee voor de pot, maar het geld zit nog niet bij Guido.
--  Daarom krijgt een aanpassing nu — net als een ingegeven cash — een vinkje
--  'al ontvangen'. Zolang dat niet aan staat, verschijnt het bedrag bij
--  'nog te ontvangen'.
--
--  Alles wat er nu al in staat, wordt op openstaand gezet.
--
--  Draaien: Supabase -> SQL Editor -> New query -> plakken -> Run.
--  Herhalen mag: er wordt niets dubbel geteld.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  1. Het vinkje
-- ---------------------------------------------------------------------------
-- De kolom komt binnen met default false, dus alles wat er nu al in staat
-- gaat vanzelf op openstaand. Daarom geen aparte update: draai je dit later
-- nog eens, dan blijft staan wat je intussen afgevinkt hebt.
alter table public.member_adjustments
  add column if not exists is_paid boolean not null default false;

comment on column public.member_adjustments.is_paid is
  'Staat het geld van deze aanpassing al fysiek bij de penningmeester?';

-- ---------------------------------------------------------------------------
--  2. De views opnieuw, met de aanpassingen mee in ontvangen/openstaand
-- ---------------------------------------------------------------------------
drop view if exists public.club_totals;
drop view if exists public.member_ledger;

create view public.member_ledger
with (security_invoker = on) as
select
  m.id                                                 as member_id,
  coalesce(nullif(btrim(m.nickname), ''), m.full_name) as display_name,
  m.full_name,
  m.is_active,
  m.role,

  -- Wat er effectief bij de penningmeester zit: afgevinkte cashes én
  -- afgevinkte handmatige aanpassingen.
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id and r.is_paid), 0)
  + coalesce((select sum(a.amount) from public.member_adjustments a
            where a.member_id = m.id and a.is_paid), 0)                as ontvangen,

  -- Wat hij nog moet ophalen: alles wat nog niet afgevinkt is.
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id and not r.is_paid), 0)
  + coalesce((select sum(a.amount) from public.member_adjustments a
            where a.member_id = m.id and not a.is_paid), 0)            as openstaand,

  -- Enkel de ingegeven cashes, los van betaald of niet.
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id), 0)                              as bijgedragen,

  coalesce((select sum(a.amount) from public.member_adjustments a
            where a.member_id = m.id), 0)                              as correcties,

  coalesce((select sum(c.amount) from public.activity_charges c
            where c.member_id = m.id), 0)                              as verbruikt,

  -- Het aandeel in de pot: alles wat ingegeven is, betaald of niet, min wat
  -- er voor hem uit de pot ging. Nooit onder nul.
  greatest(
    coalesce((select sum(r.contribution) from public.results r
              where r.member_id = m.id), 0)
    + coalesce((select sum(a.amount) from public.member_adjustments a
              where a.member_id = m.id), 0)
    - coalesce((select sum(c.amount) from public.activity_charges c
              where c.member_id = m.id), 0),
    0)                                                                 as aandeel
from public.members m;

comment on view public.member_ledger is
  'Per lid: bijgedragen, ontvangen, openstaand en het aandeel in de pot.';

create view public.club_totals
with (security_invoker = on) as
select
  coalesce(sum(l.aandeel), 0)              as pot,
  coalesce(sum(l.openstaand), 0)           as openstaand,
  coalesce(sum(l.ontvangen), 0)            as ontvangen,
  count(*) filter (where l.is_active)::int as leden
from public.member_ledger l;

comment on view public.club_totals is
  'De pot in totaal, plus hoeveel daarvan nog bij de penningmeester moet geraken.';

grant select on public.member_ledger, public.club_totals to authenticated;

-- ---------------------------------------------------------------------------
--  Controle
-- ---------------------------------------------------------------------------
-- select display_name, bijgedragen, correcties, ontvangen, openstaand, aandeel
-- from public.member_ledger order by aandeel desc;
--
-- select * from public.club_totals;
