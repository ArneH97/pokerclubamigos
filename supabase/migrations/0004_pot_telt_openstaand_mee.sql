-- ============================================================================
--  De Amigos — uitbreiding 4
--
--  Het geld telt mee voor de pot zodra een cash ingegeven is, ook als het
--  briefje nog niet bij Guido geraakt is. 'openstaand' blijft bestaan, maar
--  enkel als lijstje voor Guido van wat hij nog moet ophalen.
--
--  Dit vervangt enkel twee views. Er wordt geen data aangeraakt en je mag
--  dit zo vaak herhalen als je wil.
--
--  Draaien: Supabase -> SQL Editor -> New query -> plakken -> Run.
-- ============================================================================

-- Per Amigo: zijn aandeel in de pot.
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
  -- wat Guido al fysiek ontvangen heeft
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id and r.is_paid), 0)              as ontvangen,
  -- wat hij nog moet ophalen
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id and not r.is_paid), 0)          as openstaand,
  -- alles samen, betaald of niet
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id), 0)                            as bijgedragen,
  coalesce((select sum(a.amount) from public.member_adjustments a
            where a.member_id = m.id), 0)                            as correcties,
  coalesce((select sum(c.amount) from public.activity_charges c
            where c.member_id = m.id), 0)                            as verbruikt,
  -- het aandeel: alle bijdragen + correcties - wat er voor hem uit de pot ging.
  -- greatest(...,0) zodat een aandeel nooit onder nul zakt.
  greatest(
    coalesce((select sum(r.contribution) from public.results r
              where r.member_id = m.id), 0)
    + coalesce((select sum(a.amount) from public.member_adjustments a
              where a.member_id = m.id), 0)
    - coalesce((select sum(c.amount) from public.activity_charges c
              where c.member_id = m.id), 0),
    0)                                                               as aandeel
from public.members m;

comment on view public.member_ledger is
  'Per lid: bijgedragen, ontvangen, openstaand en het aandeel in de pot.';

-- De pot: de som van alle aandelen.
create view public.club_totals
with (security_invoker = on) as
select
  coalesce(sum(l.aandeel), 0)              as pot,
  coalesce(sum(l.openstaand), 0)           as openstaand,
  coalesce(sum(l.ontvangen), 0)            as ontvangen,
  count(*) filter (where l.is_active)::int as leden
from public.member_ledger l;

comment on view public.club_totals is
  'De pot in totaal, plus hoeveel daarvan nog bij Guido moet geraken.';

grant select on public.member_ledger, public.club_totals to authenticated;

-- ---------------------------------------------------------------------------
--  Controle: bijgedragen en aandeel horen nu gelijk te zijn zolang er nog
--  geen activiteit betaald is.
-- ---------------------------------------------------------------------------
-- select display_name, bijgedragen, ontvangen, openstaand, aandeel
-- from public.member_ledger order by aandeel desc;
--
-- select * from public.club_totals;
