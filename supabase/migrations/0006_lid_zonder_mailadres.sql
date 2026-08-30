-- ============================================================================
--  De Amigos — uitbreiding 6
--
--  Een lid toevoegen als je enkel naam en spelernaam hebt, zonder mailadres.
--
--  Elk lid hangt aan een account (members.id verwijst naar auth.users), en
--  zo'n account heeft altijd een adres nodig. Daarom krijgt zo'n lid een
--  plaatshouder op een subdomein zonder mailserver — daar vertrekt nooit iets
--  naartoe. De vlag hieronder onthoudt dat het adres nog ingevuld moet worden,
--  zodat de bulkmails dat lid overslaan en het beheer het duidelijk toont.
--
--  Zodra je het echte adres invult, wordt het account bijgewerkt en gaat de
--  vlag uit.
--
--  Draaien: Supabase -> SQL Editor -> New query -> plakken -> Run.
--  Herhalen mag.
-- ============================================================================

alter table public.members
  add column if not exists email_pending boolean not null default false;

comment on column public.members.email_pending is
  'True zolang dit lid enkel een plaatshouder-adres heeft en er dus geen mail naartoe mag.';

-- Bestaande leden hebben allemaal een echt adres, dus die blijven op false.
