"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminAddResultAction,
  bulkResendAction,
  bulkStartPasswordsAction,
  createActivityAction,
  createMemberAction,
  createProposalAction,
  deleteMemberAction,
  makeAccessLinksAction,
  resendInviteAction,
  resetMemberPasswordAction,
  saveSeasonAction,
  setMemberEmailAction,
  setMemberShareAction,
  type AdminFormState,
  type BulkState,
  type LinkState,
} from "./actions";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";
import { money } from "@/lib/format";
import type { Member, MemberLedger, Season } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      {pending ? "Bezig…" : label}
    </button>
  );
}

function Feedback({ state }: { state: AdminFormState }) {
  if (state?.error) return <Notice tone="error">{state.error}</Notice>;
  if (state?.success) return <Notice tone="success">{state.success}</Notice>;
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Leden                                                                      */
/* -------------------------------------------------------------------------- */

export function MemberForm() {
  const [state, action] = useActionState<AdminFormState, FormData>(
    createMemberAction,
    null,
  );
  // Zonder mailadres verdwijnt het adresveld: anders staat er een verplicht
  // vakje dat je niet kan invullen.
  const [methode, setMethode] = useState("mail");
  const zonderMail = methode === "later";

  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naam">
          <input className={inputClass} name="full_name" required placeholder="Jan Janssens" />
        </Field>
        <Field
          label="E-mailadres"
          hint={
            zonderMail
              ? "Niet nodig — je vult het later aan bij de ledenlijst."
              : "Hiermee logt hij in."
          }
        >
          <input
            className={inputClass}
            type="email"
            name="email"
            required={!zonderMail}
            disabled={zonderMail}
            placeholder={zonderMail ? "later" : "jan@voorbeeld.be"}
          />
        </Field>
        <Field
          label="Spelernaam"
          hint="Laat leeg — dan kiest hij die zelf bij de eerste aanmelding."
        >
          <input className={inputClass} name="nickname" placeholder="Jantje" />
        </Field>
        <Field label="Rol">
          <select className={inputClass} name="role" defaultValue="member">
            <option value="member">Lid</option>
            <option value="admin">Beheerder</option>
          </select>
        </Field>
      </div>

      <fieldset className="rounded-2xl border border-line p-4">
        <legend className="px-2 text-sm font-medium text-ink-2">
          Hoe krijgt hij toegang?
        </legend>
        <div className="mt-1 space-y-2">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="method"
              value="mail"
              checked={methode === "mail"}
              onChange={() => setMethode("mail")}
              className="mt-1 h-4 w-4 accent-[var(--s1)]"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Uitnodiging per e-mail
              </span>
              <span className="block text-xs text-ink-muted">
                Hij krijgt een link en kiest zelf een wachtwoord.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="method"
              value="wachtwoord"
              checked={methode === "wachtwoord"}
              onChange={() => setMethode("wachtwoord")}
              className="mt-1 h-4 w-4 accent-[var(--s1)]"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Startwachtwoord dat ik zelf doorstuur
              </span>
              <span className="block text-xs text-ink-muted">
                Handig als de mail niet aankomt.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name="method"
              value="later"
              checked={methode === "later"}
              onChange={() => setMethode("later")}
              className="mt-1 h-4 w-4 accent-[var(--s1)]"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Nog geen mailadres
              </span>
              <span className="block text-xs text-ink-muted">
                Enkel naam en spelernaam. Hij telt meteen mee voor de pot; het
                adres en het wachtwoord vul je later aan.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <Submit label="Lid toevoegen" />
    </form>
  );
}

/**
 * Voor een lid dat nog geen mailadres had: adres invullen en meteen kiezen wat
 * er daarna gebeurt. Staat dicht tot je erop klikt, zodat de ledenlijst
 * overzichtelijk blijft.
 */
export function AddEmailButton({
  id,
  name,
  current,
  pending,
}: {
  id: string;
  name: string;
  current: string;
  pending: boolean;
}) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    setMemberEmailAction,
    null,
  );
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
            pending
              ? "border border-s2/50 bg-s2/12 text-ink"
              : "border border-line text-ink-2 hover:bg-surface-2"
          }`}
        >
          {pending ? "mailadres toevoegen" : "adres wijzigen"}
        </button>
        {state?.success ? (
          <p className="mt-1.5 max-w-xs rounded-lg bg-good/10 px-2 py-1 text-xs font-semibold text-ink">
            {state.success}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="w-full max-w-xs space-y-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="name" value={name} />
      <input
        className={inputClass}
        type="email"
        name="email"
        required
        autoFocus
        defaultValue={pending ? "" : current}
        placeholder="jan@voorbeeld.be"
        aria-label={`E-mailadres van ${name}`}
      />
      <select className={inputClass} name="daarna" defaultValue="wachtwoord">
        <option value="wachtwoord">en zet een startwachtwoord klaar</option>
        <option value="mail">en stuur de uitnodiging per mail</option>
        <option value="niets">en verder niets</option>
      </select>
      <div className="flex items-center gap-2">
        <Submit label="Bewaren" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-muted underline underline-offset-2"
        >
          laat maar
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function ResetPasswordButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    resetMemberPasswordAction,
    null,
  );

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="name" value={name} />
        <button
          title="Zet een startwachtwoord klaar dat je zelf doorstuurt"
          className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2"
        >
          wachtwoord
        </button>
      </form>
      {state?.success ? (
        <p className="mt-1.5 rounded-lg bg-good/10 px-2 py-1 text-xs font-semibold text-ink">
          {state.success}
        </p>
      ) : null}
      {state?.error ? (
        <p className="mt-1.5 text-xs text-critical">{state.error}</p>
      ) : null}
    </div>
  );
}

export function DeleteMemberButton({ id }: { id: string }) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    deleteMemberAction,
    null,
  );
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <div>
        <button
          onClick={() => setArmed(true)}
          className="text-xs font-medium text-ink-muted underline underline-offset-2 hover:text-critical"
        >
          verwijderen
        </button>
        {state?.error ? (
          <p className="mt-1.5 max-w-xs text-xs text-critical">{state.error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button className="rounded-full bg-critical px-2.5 py-1 text-xs font-semibold text-white">
        echt verwijderen
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-xs text-ink-muted underline underline-offset-2"
      >
        laat maar
      </button>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Saldo's                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Eén regel uit de tabel: het aandeel van een Amigo rechtstreeks zetten.
 * Zo neem je de Excel over zonder na te denken over plus of min.
 */
export function ShareRowForm({
  memberId,
  current,
}: {
  memberId: string;
  current: number;
}) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    setMemberShareAction,
    null,
  );

  return (
    <div>
      <form action={action} className="flex items-center justify-end gap-2">
        <input type="hidden" name="member_id" value={memberId} />
        <input type="hidden" name="current" value={current} />
        <input type="hidden" name="kind" value="correctie" />
        <div className="relative">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            €
          </span>
          <input
            name="amount"
            inputMode="decimal"
            defaultValue={Number(current).toFixed(2)}
            aria-label="Aandeel in de pot"
            className="w-24 rounded-xl border border-line bg-surface py-1.5 pl-6 pr-2 text-right text-sm text-ink tabular outline-none focus:border-s1 focus:ring-2 focus:ring-s1/30"
          />
        </div>
        <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
          zet
        </button>
      </form>
      {state?.error ? (
        <p className="mt-1 text-right text-xs text-critical">{state.error}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Activiteiten                                                               */
/* -------------------------------------------------------------------------- */

export function ActivityForm({
  members,
  today,
}: {
  members: MemberLedger[];
  today: string;
}) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    createActivityAction,
    null,
  );
  const [cost, setCost] = useState("");
  const [aanwezig, setAanwezig] = useState<string[]>(
    members.map((m) => m.member_id),
  );

  const bedrag = Number(cost.replace(",", ".")) || 0;
  const beschikbaar = members
    .filter((m) => aanwezig.includes(m.member_id))
    .reduce((a, m) => a + Number(m.aandeel), 0);
  const beschermd = members
    .filter((m) => !aanwezig.includes(m.member_id))
    .reduce((a, m) => a + Number(m.aandeel), 0);
  const uitDePot = Math.min(bedrag, beschikbaar);
  const tekort = Math.max(bedrag - beschikbaar, 0);

  function toggle(id: string) {
    setAanwezig((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <form action={action} className="space-y-5">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Wat was het?">
          <input
            className={inputClass}
            name="name"
            required
            placeholder="Etentje bij David"
          />
        </Field>
        <Field label="Wanneer">
          <input
            className={inputClass}
            type="date"
            name="happened_on"
            required
            defaultValue={today}
          />
        </Field>
        <Field label="Totale kost">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="total_cost"
              inputMode="decimal"
              required
              placeholder="1000"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </Field>
      </div>

      <fieldset>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <legend className="text-sm font-medium text-ink-2">Wie was erbij?</legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAanwezig(members.map((m) => m.member_id))}
              className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2"
            >
              iedereen
            </button>
            <button
              type="button"
              onClick={() => setAanwezig([])}
              className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2"
            >
              niemand
            </button>
          </div>
        </div>
        <p className="mb-3 text-xs text-ink-muted">
          Vink af wie er niet bij was — dat geld blijft in de pot staan voor de
          volgende keer.
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const aan = aanwezig.includes(m.member_id);
            return (
              <label
                key={m.member_id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition ${
                  aan ? "border-s1/40 bg-s1/8" : "border-line hover:bg-surface-2"
                }`}
              >
                <input
                  type="checkbox"
                  name="participants"
                  value={m.member_id}
                  checked={aan}
                  onChange={() => toggle(m.member_id)}
                  className="h-4 w-4 accent-[var(--s1)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {m.display_name}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {aan ? "was erbij" : `${money(m.aandeel)} blijft staan`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div
        aria-live="polite"
        className="rounded-2xl border border-line bg-surface-2 p-4"
      >
        <p className="text-sm text-ink-2">Gaat uit de pot</p>
        <p className="mt-1 text-3xl font-semibold text-ink">{money(uitDePot)}</p>
        <p className="mt-1 text-sm text-ink-muted">
          {beschermd > 0
            ? `${money(beschermd)} blijft staan voor wie er niet bij was.`
            : "Iedereen doet mee, dus de volledige kost gaat uit de pot."}
        </p>
        {tekort > 0 ? (
          <p className="mt-2 text-sm font-medium text-critical">
            Er zit {money(tekort)} te weinig in de pot — dat deel moet er van
            buiten bij komen.
          </p>
        ) : null}
      </div>

      <Field label="Notitie" hint="Optioneel.">
        <textarea className={inputClass} name="note" rows={2} />
      </Field>

      <Submit label="Activiteit vastleggen" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Seizoen                                                                    */
/* -------------------------------------------------------------------------- */

export function SeasonForm({ season }: { season: Season | null }) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    saveSeasonAction,
    null,
  );
  const year = new Date().getFullYear();

  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      {season ? <input type="hidden" name="id" value={season.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naam">
          <input
            className={inputClass}
            name="name"
            required
            defaultValue={season?.name ?? `Seizoen ${year}`}
          />
        </Field>
        <Field label="Spaardoel">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="target_amount"
              inputMode="decimal"
              required
              defaultValue={season?.target_amount ?? 1500}
            />
          </div>
        </Field>
        <Field label="Begint op">
          <input
            className={inputClass}
            type="date"
            name="starts_on"
            required
            defaultValue={season?.starts_on ?? `${year}-01-01`}
          />
        </Field>
        <Field label="Eindigt op">
          <input
            className={inputClass}
            type="date"
            name="ends_on"
            required
            defaultValue={season?.ends_on ?? `${year}-12-31`}
          />
        </Field>
      </div>

      <Submit label={season ? "Seizoen opslaan" : "Seizoen aanmaken"} />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cash toevoegen namens een lid                                              */
/* -------------------------------------------------------------------------- */

export function RetroResultForm({
  members,
  seasonId,
  today,
}: {
  members: Member[];
  seasonId: string;
  today: string;
}) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    adminAddResultAction,
    null,
  );
  const [buyin, setBuyin] = useState("");
  const [cashout, setCashout] = useState("");

  const profit =
    (Number(cashout.replace(",", ".")) || 0) - (Number(buyin.replace(",", ".")) || 0);
  const bijdrage = Math.round(Math.max(profit, 0) * 10) / 100;

  return (
    <form action={action} className="space-y-5">
      <Feedback state={state} />
      <input type="hidden" name="season_id" value={seasonId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Van wie?">
          <select className={inputClass} name="member_id" required defaultValue="">
            <option value="" disabled>
              Kies een Amigo
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nickname?.trim() || m.full_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Datum" hint="Mag gerust in het verleden liggen.">
          <input
            className={inputClass}
            type="date"
            name="played_on"
            required
            defaultValue={today}
          />
        </Field>
        <Field label="Buy-in">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="buyin"
              inputMode="decimal"
              required
              value={buyin}
              onChange={(e) => setBuyin(e.target.value)}
            />
          </div>
        </Field>
        <Field label="Cash-out">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="cashout"
              inputMode="decimal"
              required
              value={cashout}
              onChange={(e) => setCashout(e.target.value)}
            />
          </div>
        </Field>
        <Field label="Tornooi" hint="Optioneel.">
          <input className={inputClass} name="tournament" />
        </Field>
        <Field label="Plaats">
          <input className={inputClass} name="venue" defaultValue="Aalst" />
        </Field>
      </div>

      <div
        aria-live="polite"
        className="rounded-2xl border border-line bg-surface-2 p-4"
      >
        <p className="text-sm text-ink-2">Voor de pot (10% van de winst)</p>
        <p className="mt-1 text-2xl font-semibold text-ink">{money(bijdrage)}</p>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3">
        <input
          type="checkbox"
          name="is_paid"
          className="h-4 w-4 accent-[var(--s3)]"
        />
        <span className="text-sm text-ink-2">
          Dit geld heb ik al ontvangen
        </span>
      </label>

      <Field label="Notitie" hint="Optioneel.">
        <textarea className={inputClass} name="note" rows={2} />
      </Field>

      <Submit label="Cash toevoegen" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Voorstellen                                                                */
/* -------------------------------------------------------------------------- */

export function ProposalForm({ seasonId }: { seasonId: string }) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    createProposalAction,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      <input type="hidden" name="season_id" value={seasonId} />

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Field label="Titel">
          <input
            className={inputClass}
            name="title"
            required
            placeholder="Etentje bij David"
          />
        </Field>
        <Field label="Richtprijs" hint="Optioneel.">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="estimated_cost"
              inputMode="decimal"
              placeholder="450"
            />
          </div>
        </Field>
      </div>

      <Field label="Toelichting" hint="Optioneel — wat houdt het in?">
        <textarea className={inputClass} name="description" rows={3} />
      </Field>

      <Submit label="Voorstel klaarzetten" />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Startwachtwoorden in bulk                                                  */
/* -------------------------------------------------------------------------- */

export function BulkPasswordsForm() {
  const [state, action] = useActionState<BulkState, FormData>(
    bulkStartPasswordsAction,
    null,
  );
  const [gekopieerd, setGekopieerd] = useState(false);

  const tekst = (state?.regels ?? [])
    .map((r) => `${r.naam} — ${r.email} — wachtwoord: ${r.wachtwoord}`)
    .join("\n");

  return (
    <div className="space-y-4">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}

      <form action={action} className="flex flex-wrap items-end gap-3">
        <Field label="Voor wie?">
          <select className={inputClass} name="bereik" defaultValue="nieuw">
            <option value="nieuw">Wie nog geen spelernaam koos</option>
            <option value="iedereen">Iedereen (ook wie al binnen is)</option>
          </select>
        </Field>
        <Submit label="Startwachtwoorden klaarzetten" />
      </form>

      {state?.regels?.length ? (
        <div className="rounded-2xl border border-good/40 bg-good/8 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">
              {state.regels.length} wachtwoord
              {state.regels.length === 1 ? "" : "en"} klaargezet
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(tekst).then(
                  () => setGekopieerd(true),
                  () => setGekopieerd(false),
                );
              }}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-2"
            >
              {gekopieerd ? "Gekopieerd" : "Kopieer alles"}
            </button>
          </div>

          <p className="mt-2 text-xs text-ink-2">
            Stuur elke Amigo zijn eigen regel door. Bij de eerste aanmelding
            kiest hij een spelernaam en een eigen wachtwoord.
          </p>

          <textarea
            readOnly
            rows={Math.min(state.regels.length + 1, 14)}
            value={tekst}
            className="mt-3 w-full rounded-xl border border-line bg-surface p-3 font-mono text-xs text-ink"
          />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mail opnieuw versturen                                                     */
/* -------------------------------------------------------------------------- */

export function ResendInviteButton({ email }: { email: string }) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    resendInviteAction,
    null,
  );

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <button
          title="Stuur de aanmeldmail opnieuw naar dit adres"
          className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2"
        >
          mail
        </button>
      </form>
      {state?.success ? (
        <p className="mt-1.5 text-xs font-semibold text-good-text">
          {state.success}
        </p>
      ) : null}
      {state?.error ? (
        <p className="mt-1.5 max-w-xs text-xs text-critical">{state.error}</p>
      ) : null}
    </div>
  );
}

export function BulkResendForm() {
  const [state, action] = useActionState<AdminFormState, FormData>(
    bulkResendAction,
    null,
  );

  return (
    <div className="space-y-4">
      <Feedback state={state} />
      <form action={action} className="flex flex-wrap items-end gap-3">
        <Field label="Naar wie?">
          <select className={inputClass} name="bereik" defaultValue="nieuw">
            <option value="nieuw">Wie nog niet binnen is</option>
            <option value="iedereen">Alle actieve leden</option>
          </select>
        </Field>
        <Submit label="Mail versturen" />
      </form>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toegangslinks zonder mail                                                  */
/* -------------------------------------------------------------------------- */

function LinkLijst({ links }: { links: NonNullable<LinkState>["links"] }) {
  if (!links?.length) return null;

  const alles = links.map((l) => `${l.naam}: ${l.url}`).join("\n\n");

  return (
    <div className="space-y-3">
      <Notice tone="success">
        {links.length} link{links.length === 1 ? "" : "s"} klaar. Stuur ze door
        via WhatsApp — elke link werkt één keer.
      </Notice>

      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.email} className="rounded-2xl border border-line p-3">
            <p className="text-sm font-semibold text-ink">{l.naam}</p>
            <p className="mb-2 text-xs text-ink-muted">{l.email}</p>
            <input
              readOnly
              value={l.url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-ink-2"
            />
          </li>
        ))}
      </ul>

      {links.length > 1 ? (
        <div>
          <p className="mb-1.5 text-sm font-medium text-ink-2">Alles in één keer</p>
          <textarea
            readOnly
            rows={5}
            value={alles}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-ink-2"
          />
        </div>
      ) : null}
    </div>
  );
}

export function AccessLinkButton({ email }: { email: string }) {
  const [state, action] = useActionState<LinkState, FormData>(
    makeAccessLinksAction,
    null,
  );

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="email" value={email} />
        <button
          title="Maak een aanmeldlink die je zelf doorstuurt, bv. via WhatsApp"
          className="whitespace-nowrap rounded-full border border-s1/40 bg-s1/10 px-2.5 py-1 text-xs font-semibold text-ink hover:bg-s1/15"
        >
          link
        </button>
      </form>
      {state?.error ? (
        <p className="mt-1.5 max-w-xs text-xs text-critical">{state.error}</p>
      ) : null}
      {state?.links?.length ? (
        <input
          readOnly
          value={state.links[0].url}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-1.5 w-56 rounded-lg border border-line bg-surface-2 px-2 py-1 text-[11px] text-ink-2"
        />
      ) : null}
    </div>
  );
}

export function BulkLinksForm() {
  const [state, action] = useActionState<LinkState, FormData>(
    makeAccessLinksAction,
    null,
  );

  return (
    <div className="space-y-4">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}

      <form action={action} className="flex flex-wrap items-end gap-3">
        <Field label="Voor wie?">
          <select className={inputClass} name="bereik" defaultValue="nieuw">
            <option value="nieuw">Wie nog niet binnen is</option>
            <option value="iedereen">Alle actieve leden</option>
          </select>
        </Field>
        <Submit label="Links maken" />
      </form>

      <LinkLijst links={state?.links} />
    </div>
  );
}
