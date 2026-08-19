# De Amigos — clubsite

Website voor pokerclub De Amigos uit Aalst. Een publieke startpagina over de
club, en daarachter een ledenzone met het prikbord, de spaarpot en het beheer.

Gebouwd met Next.js (App Router) + Supabase, draait op Vercel.

---

## Hoe het geld werkt

**Het is één pot.** Dat is wat de leden zien: één bedrag tegenover het
spaardoel. Niemand heeft een eigen rekening, niemand kan in het rood staan.

**Een bijdrage telt mee zodra ze ingegeven is.** Of het geld al bij Guido
geraakt is, maakt voor de pot niets uit. Dat wordt apart bijgehouden: hij ziet
per Amigo wat hij nog moet ontvangen en vinkt af wanneer het binnen is. Vaak
gebeurt dat bij een etentje, en dat hoeft de pot niet te doen schommelen.

Achter de schermen houdt de site wel bij hoeveel elke Amigo al in de pot heeft
gestoken — zijn **aandeel**. Dat dient maar voor één ding: beschermen wie niet
meegaat naar een activiteit.

**Voorbeeld.** Er zit €1.200 in de pot en we gaan eten voor €1.000. Speler X
gaat niet mee en heeft €100 in de pot. Dan gaat er €1.000 uit de pot, behalve
die €100 van X: die blijft staan voor de volgende keer. Na afloop zit er €200
in de pot, waarvan €100 nog altijd van X. Hoe de rest tussen de aanwezigen
verdeeld zit, maakt niet uit — het is één pot.

Zit er bij de aanwezigen samen te weinig, dan haalt de site eruit wat er is en
meldt ze hoeveel er van buiten de pot bij moest.

### De Excel van Guido overzetten

Ga naar **Beheer → Financiën**. Daar staat elke Amigo met een invulveldje.
Typ per speler wat er nu voor hem in het potje zit en klik **zet**. Klaar.
Vanaf dan loopt het vanzelf: elke ingegeven bijdrage komt erbij, elke activiteit
gaat eraf.

Wil je ook de oude cashes zelf in de site (voor de ranglijst en het prikbord),
gebruik dan **Beheer → Cash toevoegen** — maar zet dan het aandeel van die
speler niet óók handmatig, anders telt hetzelfde geld dubbel.

---

## Installatie

### Stap 1 — Database

Supabase → **SQL Editor**, en voer uit in deze volgorde:

1. `supabase/migrations/0001_amigos_schema.sql`
2. `supabase/migrations/0002_prikbord_voorstellen_pot.sql`
3. `supabase/migrations/0003_ledenstatus.sql`

Alle scripts mag je gerust een tweede keer draaien.

### Stap 2 — Jezelf beheerder maken

Maak in Supabase (**Authentication → Users → Add user**) een account met je
eigen e-mailadres en wachtwoord, en draai daarna:

```sql
insert into public.members (id, email, full_name, role)
select id, email, 'Arne', 'admin' from auth.users
where email = 'arne@halcoservices.be'
on conflict (id) do update set role = 'admin';
```

Daarna voeg je alle andere leden toe vanuit de site, en maak je Guido beheerder
met één klik.

### Stap 3 — Mails via Resend

Supabase verstuurt de uitnodigingen en de herstelmails. Zonder eigen SMTP mag
dat maar een paar mails per uur — met Resend erachter werkt het gewoon.

**In Supabase → Project Settings → Authentication → SMTP Settings**, zet Custom
SMTP aan en vul in:

| Veld | Waarde |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | je Resend API-sleutel (`re_…`) |
| Sender email | een adres op je geverifieerde domein, bv. `noreply@jouwdomein.be` |
| Sender name | `De Amigos` |

Let op: het afzenderdomein moet in Resend geverifieerd zijn (Domains → DNS-records
bij easyhost zetten). Een adres op een niet-geverifieerd domein wordt geweigerd.

**Daarna, onder Authentication → URL Configuration:**

- **Site URL**: precies de URL waar de site draait, bv.
  `https://pokerclubamigos.vercel.app` of je eigen domein.
- **Redirect URLs**: voeg élke URL toe waar je de site opent, met `/**` erachter:

  ```
  https://www.deamigos.be/**
  https://deamigos.be/**
  https://pokerclubamigos.vercel.app/**
  http://localhost:3000/**
  ```

Staat een adres hier niet bij, dan weigert Supabase de omleiding en zie je
`{"error":"requested path is invalid"}` op een supabase.co-pagina. Dat is dus
geen fout van de site zelf.

**En onder Authentication → Emails** de twee sjablonen vervangen. Dit is
belangrijker dan het lijkt: standaard staat er een link in die meteen wordt
ingewisseld zodra iemand — of iets — hem opent. Mailservers en virusscanners
klikken die links vaak zélf aan om ze te controleren, en dan is de uitnodiging
al opgebruikt voor je vriend hem opent. Vandaar een tussenpagina met een knop.

*Invite user:*

```html
<h2>Welkom bij De Amigos</h2>
<p>Je bent uitgenodigd voor de ledenzone.</p>
<p>
  <a href="{{ .SiteURL }}/uitnodiging?token_hash={{ .TokenHash }}&type=invite&next=/welkom">
    Aan de slag
  </a>
</p>
```

*Reset password:* — dit sjabloon wordt ook gebruikt door de knop
**mail opnieuw** bij Beheer → Leden, dus hou de tekst algemeen genoeg.

```html
<h2>Aanmelden bij De Amigos</h2>
<p>Klik hieronder om een wachtwoord in te stellen voor de ledenzone.</p>
<p>
  <a href="{{ .SiteURL }}/uitnodiging?token_hash={{ .TokenHash }}&type=recovery&next=/wachtwoord">
    Wachtwoord instellen
  </a>
</p>
```

Die pagina toont enkel een knop. Een scanner haalt de pagina op — dat mag —
maar duwt de knop niet in, dus blijft de uitnodiging geldig tot je vriend
er zelf op klikt.

Laat je de standaardsjablonen staan, dan werkt het meestal ook (de app vangt
die vorm op via `/auth/hash`), maar dan loop je wél het risico op
&quot;link verlopen&quot;-meldingen bij verse uitnodigingen.

Komt een uitnodiging toch niet aan, dan kan je bij **Beheer → Leden** kiezen
voor een startwachtwoord dat je zelf doorstuurt.

### Stap 4 — Omgevingsvariabelen

`.env.example` kopiëren naar `.env.local` voor lokaal werk, en dezelfde
variabelen in Vercel zetten onder **Settings → Environment Variables**:

| Variabele | Waar | Zichtbaar in de browser |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ja |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ja |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **nee — nooit delen** |
| `NEXT_PUBLIC_SITE_URL` | je eigen domein | ja |

De Resend-sleutel zelf hoeft niet in Vercel: die zit in de SMTP-instellingen
van Supabase.

### Stap 5 — Lokaal draaien

```bash
npm install
npm run dev
```

### Stap 6 — Domein via easyhost naar Vercel

1. Vercel → **Settings → Domains → Add** → je domein.
2. Vercel toont de DNS-records: meestal een `A` voor `@` en een `CNAME` voor
   `www` naar `cname.vercel-dns.com`.
3. Die records toevoegen in het DNS-beheer bij easyhost.
4. Zet daarna `NEXT_PUBLIC_SITE_URL` in Vercel op je domein.

Staat het project in Vercel op preset **Other**? Zet het op **Next.js**,
anders faalt de build met *&quot;No Output Directory named public&quot;*.

---

## Spelernaam

Elke Amigo kiest bij de eerste aanmelding zijn spelernaam. Die naam staat
overal: prikbord, ranglijst, reacties, meldingen en beheer. Twee keer dezelfde
naam kan niet — de database blokkeert dat.

---

## Wat zit erin

### Ledenmodus

- **Dashboard** — de pot tegenover het spaardoel, jouw eigen cijfers en de
  ranglijst van wie het meest bijdraagt.
- **Prikbord** — elke cash met buy-in, cash-out en wat er in de pot ging.
  Liken en reageren kan.
- **Resultaat ingeven** — buy-in en cash-out; de 10% rekent de database uit.
- **Voorstellen** — stemmen op wat we met de pot doen. Je mag op meerdere
  ideeën stemmen.
- **Meldingen** — als iemand een cash ingeeft, of jouw cash liket of erop
  reageert. Die meldingen worden door de database zelf aangemaakt, dus ze
  kunnen niet vergeten worden.

### Beheermodus (Arne en Guido)

Beheerders wisselen bovenaan tussen **Lid** en **Beheer**.

- **Financiën** — de pot, het aandeel per Amigo (rechtstreeks aanpasbaar), wie
  nog geld moet doorgeven, en elke ingave corrigeren of verwijderen.
- **Leden** — toevoegen, rol wisselen, op non-actief zetten, wachtwoord
  resetten, verwijderen. Per lid zie je in welke fase hij zit: nog niet
  aangemeld, wel aangemeld maar profiel niet af, of actief lid. Met **mail
  opnieuw** stuur je iemand een verse aanmeldlink; dat mag zo vaak als nodig.
- **Activiteiten** — een etentje of uitstap vastleggen. Je duidt aan wie erbij
  was; het geld van de anderen blijft staan.
- **Cash toevoegen** — een resultaat ingeven namens een lid, ook met
  terugwerkende kracht.
- **Voorstellen** — ideeën klaarzetten, stemming afsluiten, kiezen.
- **Seizoen** — naam, periode en spaardoel. De pot loopt door over seizoenen
  heen; enkel de ranglijst begint opnieuw.

---

## Structuur

```
src/
  app/
    page.tsx              publieke startpagina
    login/                inloggen en wachtwoord vergeten
    welkom/               spelernaam en eigen wachtwoord kiezen
    wachtwoord/           nieuw wachtwoord na een herstelmail
    auth/                 server actions en de link uit de mails
    (club)/
      dashboard/          pot, eigen cijfers, ranglijst
      prikbord/           feed met likes en reacties
      ingave/             resultaat ingeven
      voorstellen/        stemmen
      meldingen/          meldingen
      profiel/            spelernaam en wachtwoord
      beheer/             financiën, leden, activiteiten, seizoen, voorstellen
  components/             logo, potmeter, feedkaart, ranglijst, navigatie
  lib/                    supabase-clients, sessie, formattering
supabase/migrations/      de SQL-scripts
```

De kleuren van de meters en balken komen uit een palet dat gecontroleerd is op
kleurenblindheid en contrast, in licht én donker. Pas ze niet aan zonder
opnieuw te controleren.

Row level security staat op elke tabel: wie inlogt maar niet in `members` staat,
ziet geen enkele rij.
