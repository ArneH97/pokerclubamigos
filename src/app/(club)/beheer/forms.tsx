"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  adminAddResultAction,
  createActivityAction,
  createMemberAction,
  createProposalAction,
  deleteMemberAction,
  resetMemberPasswordAction,
  saveSeasonAction,
  setMemberShareAction,
  type AdminFormState,
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

  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Naam">
          <input className={inputClass} name="full_name" required placeholder="Jan Janssens" />
        </Field>
        <Field label="E-mailadres" hint="Hiermee logt hij in.">
          <input
            className={inputClass}
            type="email"
            name="email"
            required
            placeholder="jan@voorbeeld.be"
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
              defaultChecked
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
        </div>
      </fieldset>

      <Submit label="Lid toevoegen" />
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
        <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
          nieuw wachtwoord
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
