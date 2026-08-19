-- ============================================================================
--  De Amigos — uitbreiding 3
--
--  Laat beheerders zien wie zijn uitnodiging al opende en wie zijn profiel
--  afwerkte. Die informatie zit in auth.users, waar gewone queries niet bij
--  kunnen — vandaar een functie die enkel voor beheerders rijen teruggeeft.
--
--  Draai dit in de Supabase SQL Editor. Herhalen mag.
-- ============================================================================

create or replace function public.member_auth_status()
returns table (
  member_id           uuid,
  last_sign_in_at     timestamptz,
  email_confirmed_at  timestamptz,
  invited_at          timestamptz,
  created_at          timestamptz
)
language sql
stable
security definer
set search_path = auth, public
as $$
  select u.id, u.last_sign_in_at, u.email_confirmed_at, u.invited_at, u.created_at
  from auth.users u
  where public.is_admin();
$$;

comment on function public.member_auth_status is
  'Aanmeldgegevens per lid. Geeft enkel rijen terug aan beheerders.';

revoke all on function public.member_auth_status() from public, anon;
grant execute on function public.member_auth_status() to authenticated, service_role;
