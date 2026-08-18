# De Amigo's — clubsite

Website voor pokerclub De Amigo's: leden geven hun tornooiresultaat in, de site
rekent automatisch 10% van de winst af voor de clubkas, en iedereen volgt live
de pot tegenover het streefbedrag.

Gebouwd met Next.js (App Router) + Supabase, klaar voor Vercel.

---

## In het kort

- **Login met e-mail en wachtwoord.** Leden kunnen zich niet zelf registreren:
  de voorzitter nodigt uit vanuit de beheerpagina.
- **10% wordt door de database berekend**, niet door de app. De kolom
  `contribution` is een gegenereerde kolom — er kan niemand van afwijken.
- **Eigen Supabase-project.** Losstaand van pokerleague: eigen database, eigen
  gebruikers, eigen backups.
- **RLS staat aan.** Wie inlogt maar niet in `members` staat, ziet geen enkele
  rij van de club.

---

## Stap 1 — Database klaarzetten

1. Open je Supabase-project → **SQL Editor** → **New query**.
2. Plak de volledige inhoud van `supabase/migrations/0001_amigos_schema.sql` en
   voer uit. Meer moet je in de database niet doen.

## Stap 2 — Jezelf beheerder maken

Nodig jezelf één keer uit via Supabase (**Authentication → Users → Invite user**)
met je eigen e-mailadres, of gebruik een bestaand account. Draai daarna in de
SQL Editor:

```sql
insert into public.members (id, email, full_name, role)
select id, email, 'Arne', 'admin' from auth.users
where email = 'arne@halcoservices.be'
on conflict (id) do update set role = 'admin';
```

Vanaf dan kan je alle andere leden gewoon vanuit de site uitnodigen.

## Stap 3 — Mailsjablonen instellen

De app vangt uitnodigings- en herstellinks op via `/auth/confirm`. Ga in Supabase
naar **Authentication → Emails** en pas twee sjablonen aan.

**Invite user:**

```html
<h2>Welkom bij De Amigo's</h2>
<p>Klik hieronder om je wachtwoord in te stellen.</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/wachtwoord">
    Wachtwoord instellen
  </a>
</p>
```

**Reset password:**

```html
<h2>Nieuw wachtwoord</h2>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/wachtwoord">
    Kies een nieuw wachtwoord
  </a>
</p>
```

Zet onder **Authentication → URL Configuration**:

- **Site URL**: je echte domein, bv. `https://www.deamigos.be`
- **Redirect URLs**: voeg `https://www.deamigos.be/**` toe, en
  `http://localhost:3000/**` om lokaal te kunnen testen.

## Stap 4 — Omgevingsvariabelen

Kopieer `.env.example` naar `.env.local` voor lokaal werk, en zet dezelfde
variabelen in Vercel onder **Settings → Environment Variables**:

| Variabele | Waar vind je die | Zichtbaar in de browser |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ja |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ja |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **nee — nooit delen** |
| `NEXT_PUBLIC_SITE_URL` | je eigen domein | ja |

De service role key is enkel nodig om leden uit te nodigen. Zet die nooit in een
variabele die met `NEXT_PUBLIC_` begint.

## Stap 5 — Lokaal draaien

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Stap 6 — Domein via easyhost naar Vercel

1. In Vercel: **Settings → Domains → Add** → typ je domein.
2. Vercel toont welke DNS-records je nodig hebt. Meestal:
   - `A` record voor `@` naar het IP dat Vercel toont
   - `CNAME` record voor `www` naar `cname.vercel-dns.com`
3. Log in bij easyhost → DNS-beheer van je domein → voeg die records toe.
4. Wacht tot de DNS doorgedrongen is (kan tot een paar uur duren). Vercel regelt
   het https-certificaat zelf.
5. Zet daarna `NEXT_PUBLIC_SITE_URL` in Vercel op je domein, en pas de **Site
   URL** in Supabase aan.

---

## Hoe het werkt

### Tabellen

| Tabel | Wat erin zit |
|---|---|
| `members` | Wie lid is. Verwijst naar `auth.users` van dit project. |
| `seasons` | Spaarjaar met streefbedrag. Eén seizoen is actief. |
| `results` | Elke ingave: buy-in, cash-out, datum, tornooi. `profit` en `contribution` berekent de database. |

Twee views, `leaderboard` en `season_totals`, doen het rekenwerk voor de
ranglijst en de pot.

### Rollen

- **Lid** — geeft eigen resultaten in, mag die verwijderen zolang ze niet als
  betaald zijn afgevinkt, ziet alles van de club.
- **Beheerder** — daarbovenop: leden uitnodigen en beheren, seizoen en
  streefbedrag instellen, elke ingave corrigeren of verwijderen, betalingen
  afvinken.

### Iemand twee keer uitnodigen

Dat kan geen kwaad. Bestaat het e-mailadres al als account, dan stuurt de site
géén tweede uitnodiging: die persoon wordt gewoon (opnieuw) lid en logt in met
het wachtwoord dat hij of zij al kent.

### Let op bij het gratis plan

Staat dit project op het Free-plan, dan pauzeert Supabase het na een week zonder
activiteit en zijn er geen backups. Voor een clubkas is dat vervelend: na een
rustige periode moet je het project handmatig terug wakker maken. Draait de club
er echt op, overweeg dan het Pro-plan voor deze organisatie.

---

## Structuur

```
src/
  app/
    page.tsx              landing + login
    auth/                 server actions, confirm-route voor mails
    wachtwoord/           wachtwoord instellen na uitnodiging
    geen-toegang/         ingelogd maar (nog) geen lid
    (club)/
      dashboard/          pot, eigen cijfers, top 5
      ingave/             resultaat ingeven, met live 10%-berekening
      leaderboard/        volledige ranglijst
      resultaten/         alle ingaves van de club
      admin/              beheer
  components/             potmeter, stat tiles, leaderboard, nav
  lib/                    supabase-clients, sessie, formattering
supabase/migrations/      het SQL-script
```

De kleuren van grafiek en meter komen uit een palet dat gecontroleerd is op
kleurenblindheid en contrast, in licht én donker. Wijzig ze niet zonder opnieuw
te controleren.
