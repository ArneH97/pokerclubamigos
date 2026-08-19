-- ============================================================================
--  De Amigos — uitbreiding 2
--
--  Wat hier bijkomt:
--   · prikbord: likes en reacties op een cash
--   · één pot, met per Amigo een aandeel — enkel om te beschermen wie niet
--     meegaat naar een activiteit
--   · activiteiten: de kost gaat uit de pot, behalve het geld van wie er
--     niet bij was
--   · voorstellen waar de groep op stemt
--   · meldingen
--   · elke Amigo kiest zelf zijn spelernaam, en die moet uniek zijn
--
--  Draait bovenop 0001. Je mag dit script gerust een tweede keer uitvoeren.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Spelernaam
--  De bijnaam wordt overal getoond, dus twee dezelfde kan niet.
-- ---------------------------------------------------------------------------
create unique index if not exists members_nickname_unique
  on public.members (lower(btrim(nickname)))
  where nickname is not null and btrim(nickname) <> '';

-- ---------------------------------------------------------------------------
--  Prikbord
-- ---------------------------------------------------------------------------
create table if not exists public.result_likes (
  result_id  uuid        not null references public.results (id) on delete cascade,
  member_id  uuid        not null references public.members (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (result_id, member_id)
);

create table if not exists public.result_comments (
  id         uuid        primary key default gen_random_uuid(),
  result_id  uuid        not null references public.results (id) on delete cascade,
  member_id  uuid        not null references public.members (id) on delete cascade,
  body       text        not null check (char_length(btrim(body)) between 1 and 600),
  created_at timestamptz not null default now()
);

create index if not exists result_comments_result_idx
  on public.result_comments (result_id, created_at);

-- ---------------------------------------------------------------------------
--  Correcties op het aandeel van één Amigo
--  Hiermee zet Guido de bedragen uit zijn Excel over, en rechtzettingen
--  achteraf. De som van alle aandelen is de pot.
-- ---------------------------------------------------------------------------
create table if not exists public.member_adjustments (
  id         uuid          primary key default gen_random_uuid(),
  member_id  uuid          not null references public.members (id) on delete cascade,
  amount     numeric(10,2) not null,
  kind       text          not null default 'correctie'
                 check (kind in ('startsaldo', 'correctie')),
  reason     text          not null,
  created_by uuid          references public.members (id) on delete set null,
  created_at timestamptz   not null default now()
);

create index if not exists member_adjustments_member_idx
  on public.member_adjustments (member_id, created_at desc);

-- ---------------------------------------------------------------------------
--  Activiteiten
--  De totale kost gaat uit de pot. Wie er niet bij was, zijn aandeel blijft
--  onaangeroerd staan; de rest wordt naar verhouding aangesproken. Hoe dat
--  precies verdeeld zit tussen de aanwezigen maakt niet uit — het is één pot.
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id          uuid          primary key default gen_random_uuid(),
  name        text          not null check (char_length(btrim(name)) between 1 and 120),
  happened_on date          not null,
  total_cost  numeric(10,2) not null check (total_cost >= 0),
  note        text,
  created_by  uuid          references public.members (id) on delete set null,
  created_at  timestamptz   not null default now()
);

-- Wat er per aanwezige Amigo uit zijn aandeel gehaald is. Nooit meer dan wat
-- hij had staan, dus een aandeel kan nooit onder nul gaan.
create table if not exists public.activity_charges (
  activity_id uuid          not null references public.activities (id) on delete cascade,
  member_id   uuid          not null references public.members (id) on delete cascade,
  amount      numeric(10,2) not null default 0 check (amount >= 0),
  primary key (activity_id, member_id)
);

-- ---------------------------------------------------------------------------
--  Voorstellen
-- ---------------------------------------------------------------------------
create table if not exists public.proposals (
  id             uuid          primary key default gen_random_uuid(),
  season_id      uuid          not null references public.seasons (id) on delete cascade,
  title          text          not null check (char_length(btrim(title)) between 1 and 120),
  description    text,
  estimated_cost numeric(10,2) check (estimated_cost is null or estimated_cost >= 0),
  status         text          not null default 'open'
                   check (status in ('open', 'gekozen', 'gesloten')),
  created_by     uuid          references public.members (id) on delete set null,
  created_at     timestamptz   not null default now()
);

create table if not exists public.proposal_votes (
  proposal_id uuid        not null references public.proposals (id) on delete cascade,
  member_id   uuid        not null references public.members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (proposal_id, member_id)
);

-- ---------------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------------
alter table public.result_likes       enable row level security;
alter table public.result_comments    enable row level security;
alter table public.member_adjustments enable row level security;
alter table public.activities         enable row level security;
alter table public.activity_charges   enable row level security;
alter table public.proposals          enable row level security;
alter table public.proposal_votes     enable row level security;

drop policy if exists likes_select on public.result_likes;
create policy likes_select on public.result_likes
  for select to authenticated using (public.is_member());

drop policy if exists likes_insert_own on public.result_likes;
create policy likes_insert_own on public.result_likes
  for insert to authenticated
  with check (public.is_member() and member_id = auth.uid());

drop policy if exists likes_delete_own on public.result_likes;
create policy likes_delete_own on public.result_likes
  for delete to authenticated
  using (member_id = auth.uid() or public.is_admin());

drop policy if exists comments_select on public.result_comments;
create policy comments_select on public.result_comments
  for select to authenticated using (public.is_member());

drop policy if exists comments_insert_own on public.result_comments;
create policy comments_insert_own on public.result_comments
  for insert to authenticated
  with check (public.is_member() and member_id = auth.uid());

drop policy if exists comments_delete_own on public.result_comments;
create policy comments_delete_own on public.result_comments
  for delete to authenticated
  using (member_id = auth.uid() or public.is_admin());

-- Geld: iedereen mag alles zien (transparant), enkel beheer schrijft.
drop policy if exists adjustments_select on public.member_adjustments;
create policy adjustments_select on public.member_adjustments
  for select to authenticated using (public.is_member());

drop policy if exists adjustments_admin on public.member_adjustments;
create policy adjustments_admin on public.member_adjustments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists activities_select on public.activities;
create policy activities_select on public.activities
  for select to authenticated using (public.is_member());

drop policy if exists activities_admin on public.activities;
create policy activities_admin on public.activities
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists charges_select on public.activity_charges;
create policy charges_select on public.activity_charges
  for select to authenticated using (public.is_member());

drop policy if exists charges_admin on public.activity_charges;
create policy charges_admin on public.activity_charges
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists proposals_select on public.proposals;
create policy proposals_select on public.proposals
  for select to authenticated using (public.is_member());

drop policy if exists proposals_admin on public.proposals;
create policy proposals_admin on public.proposals
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists votes_select on public.proposal_votes;
create policy votes_select on public.proposal_votes
  for select to authenticated using (public.is_member());

drop policy if exists votes_insert_own on public.proposal_votes;
create policy votes_insert_own on public.proposal_votes
  for insert to authenticated
  with check (
    public.is_member()
    and member_id = auth.uid()
    and exists (select 1 from public.proposals p
                where p.id = proposal_id and p.status = 'open')
  );

drop policy if exists votes_delete_own on public.proposal_votes;
create policy votes_delete_own on public.proposal_votes
  for delete to authenticated
  using (
    member_id = auth.uid()
    and exists (select 1 from public.proposals p
                where p.id = proposal_id and p.status = 'open')
  );

-- ---------------------------------------------------------------------------
--  Views
-- ---------------------------------------------------------------------------

-- Per Amigo: zijn aandeel in de pot.
-- Een bijdrage telt mee zodra ze ingegeven is — of het geld al bij Guido
-- geraakt is of niet verandert daar niets aan. 'openstaand' is enkel een
-- lijstje voor Guido van wat hij nog moet ontvangen.
drop view if exists public.member_ledger;
create view public.member_ledger
with (security_invoker = on) as
select
  m.id                                                 as member_id,
  coalesce(nullif(btrim(m.nickname), ''), m.full_name) as display_name,
  m.full_name,
  m.is_active,
  m.role,
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id and r.is_paid), 0)              as ontvangen,
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id and not r.is_paid), 0)          as openstaand,
  coalesce((select sum(r.contribution) from public.results r
            where r.member_id = m.id), 0)                            as bijgedragen,
  coalesce((select sum(a.amount) from public.member_adjustments a
            where a.member_id = m.id), 0)                            as correcties,
  coalesce((select sum(c.amount) from public.activity_charges c
            where c.member_id = m.id), 0)                            as verbruikt,
  greatest(
    coalesce((select sum(r.contribution) from public.results r
              where r.member_id = m.id), 0)
    + coalesce((select sum(a.amount) from public.member_adjustments a
              where a.member_id = m.id), 0)
    - coalesce((select sum(c.amount) from public.activity_charges c
              where c.member_id = m.id), 0),
    0)                                                               as aandeel
from public.members m;

-- De pot: de som van alle aandelen. 'openstaand' zegt enkel hoeveel daarvan
-- nog fysiek bij Guido moet geraken.
drop view if exists public.club_totals;
create view public.club_totals
with (security_invoker = on) as
select
  coalesce(sum(l.aandeel), 0)              as pot,
  coalesce(sum(l.openstaand), 0)           as openstaand,
  coalesce(sum(l.ontvangen), 0)            as ontvangen,
  count(*) filter (where l.is_active)::int as leden
from public.member_ledger l;

-- Per seizoen: hoeveel er dit jaar is bijgedragen.
drop view if exists public.season_totals;
create view public.season_totals
with (security_invoker = on) as
select
  s.id            as season_id,
  s.name,
  s.target_amount,
  s.starts_on,
  s.ends_on,
  s.is_active,
  coalesce((select sum(r.contribution) from public.results r where r.season_id = s.id), 0)
                  as contributions,
  coalesce((select sum(r.contribution) from public.results r
            where r.season_id = s.id and r.is_paid), 0)
                  as contributions_received,
  coalesce((select sum(r.profit) from public.results r where r.season_id = s.id), 0)
                  as profit,
  (select count(*) from public.results r where r.season_id = s.id)::int
                  as entries,
  (select count(distinct r.member_id) from public.results r where r.season_id = s.id)::int
                  as contributors
from public.seasons s;

-- Prikbord
drop view if exists public.feed;
create view public.feed
with (security_invoker = on) as
select
  r.id, r.member_id, r.season_id, r.played_on, r.venue, r.tournament,
  r.finish_position, r.buyin, r.cashout, r.profit, r.contribution,
  r.is_paid, r.note, r.created_at,
  m.full_name,
  coalesce(nullif(btrim(m.nickname), ''), m.full_name)                         as display_name,
  (select count(*) from public.result_likes l where l.result_id = r.id)::int    as like_count,
  (select count(*) from public.result_comments c where c.result_id = r.id)::int as comment_count
from public.results r
join public.members m on m.id = r.member_id;

-- Leaderboard per seizoen
drop view if exists public.leaderboard;
create view public.leaderboard
with (security_invoker = on) as
select
  r.season_id,
  m.id                                                 as member_id,
  coalesce(nullif(btrim(m.nickname), ''), m.full_name) as display_name,
  m.full_name,
  count(*)::int                                        as entries,
  count(*) filter (where r.profit > 0)::int            as cashes,
  sum(r.contribution)                                  as contributed,
  sum(r.contribution) filter (where r.is_paid)         as paid,
  sum(r.profit)                                        as profit,
  sum(r.buyin)                                         as buyin,
  max(r.played_on)                                     as last_played
from public.results r
join public.members m on m.id = r.member_id
group by r.season_id, m.id, m.nickname, m.full_name;

-- Activiteiten met wat er effectief uit de pot ging
drop view if exists public.activity_board;
create view public.activity_board
with (security_invoker = on) as
select
  a.id, a.name, a.happened_on, a.total_cost, a.note, a.created_at,
  (select count(*) from public.activity_charges c where c.activity_id = a.id)::int
    as participants,
  coalesce((select sum(c.amount) from public.activity_charges c
            where c.activity_id = a.id), 0) as uit_de_pot
from public.activities a;

-- Voorstellen met stemmenteller
drop view if exists public.proposal_board;
create view public.proposal_board
with (security_invoker = on) as
select
  p.id, p.season_id, p.title, p.description, p.estimated_cost, p.status,
  p.created_at, p.created_by,
  coalesce(nullif(btrim(m.nickname), ''), m.full_name)                           as author,
  (select count(*) from public.proposal_votes v where v.proposal_id = p.id)::int as votes
from public.proposals p
left join public.members m on m.id = p.created_by;

-- ---------------------------------------------------------------------------
--  Rechten
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on
  public.result_likes, public.result_comments, public.member_adjustments,
  public.activities, public.activity_charges,
  public.proposals, public.proposal_votes
  to authenticated;

grant select on
  public.member_ledger, public.club_totals, public.season_totals,
  public.feed, public.leaderboard, public.activity_board, public.proposal_board
  to authenticated;

-- ============================================================================
--  Meldingen
--  Worden door de database zelf aangemaakt, zodat ze nooit vergeten worden:
--   · iemand geeft een nieuwe cash in  -> alle andere Amigos
--   · iemand liket jouw cash           -> jij
--   · iemand reageert op jouw cash     -> jij, en wie er al reageerde
-- ============================================================================

create table if not exists public.notifications (
  id         uuid        primary key default gen_random_uuid(),
  member_id  uuid        not null references public.members (id) on delete cascade,
  actor_id   uuid        references public.members (id) on delete cascade,
  kind       text        not null check (kind in ('nieuwe_cash', 'like', 'reactie')),
  result_id  uuid        references public.results (id) on delete cascade,
  comment_id uuid        references public.result_comments (id) on delete cascade,
  is_read    boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_member_idx
  on public.notifications (member_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (member_id) where not is_read;

alter table public.notifications enable row level security;

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for select to authenticated using (member_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (member_id = auth.uid()) with check (member_id = auth.uid());

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (member_id = auth.uid());

create or replace function public.notify_new_result()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.cashout > new.buyin then
    insert into public.notifications (member_id, actor_id, kind, result_id)
    select m.id, new.member_id, 'nieuwe_cash', new.id
    from public.members m
    where m.is_active and m.id <> new.member_id;
  end if;
  return new;
end;
$$;

drop trigger if exists results_notify on public.results;
create trigger results_notify
  after insert on public.results
  for each row execute function public.notify_new_result();

create or replace function public.notify_like()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (member_id, actor_id, kind, result_id)
  select r.member_id, new.member_id, 'like', new.result_id
  from public.results r
  where r.id = new.result_id and r.member_id <> new.member_id;
  return new;
end;
$$;

drop trigger if exists likes_notify on public.result_likes;
create trigger likes_notify
  after insert on public.result_likes
  for each row execute function public.notify_like();

create or replace function public.notify_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (member_id, actor_id, kind, result_id, comment_id)
  select r.member_id, new.member_id, 'reactie', new.result_id, new.id
  from public.results r
  where r.id = new.result_id and r.member_id <> new.member_id;

  insert into public.notifications (member_id, actor_id, kind, result_id, comment_id)
  select distinct c.member_id, new.member_id, 'reactie', new.result_id, new.id
  from public.result_comments c
  join public.results r on r.id = new.result_id
  where c.result_id = new.result_id
    and c.id <> new.id
    and c.member_id <> new.member_id
    and c.member_id <> r.member_id;

  return new;
end;
$$;

drop trigger if exists comments_notify on public.result_comments;
create trigger comments_notify
  after insert on public.result_comments
  for each row execute function public.notify_comment();

drop view if exists public.notification_feed;
create view public.notification_feed
with (security_invoker = on) as
select
  n.id, n.member_id, n.kind, n.is_read, n.created_at, n.result_id, n.actor_id,
  coalesce(nullif(btrim(a.nickname), ''), a.full_name) as actor_name,
  r.cashout, r.buyin, r.contribution, r.played_on, r.tournament, r.venue,
  c.body                                               as comment_body
from public.notifications n
left join public.members a on a.id = n.actor_id
left join public.results r on r.id = n.result_id
left join public.result_comments c on c.id = n.comment_id;

grant select, update, delete on public.notifications to authenticated;
grant select on public.notification_feed to authenticated;
