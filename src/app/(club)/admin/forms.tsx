"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  inviteMemberAction,
  saveSeasonAction,
  type AdminFormState,
} from "./actions";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";
import type { Season } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      {pending ? "Bezig…" : label}
    </button>
  );
}

export function InviteForm() {
  const [state, action] = useActionState<AdminFormState, FormData>(
    inviteMemberAction,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state?.success ? <Notice tone="success">{state.success}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mailadres">
          <input
            className={inputClass}
            type="email"
            name="email"
            required
            placeholder="amigo@voorbeeld.be"
          />
        </Field>
        <Field label="Naam">
          <input
            className={inputClass}
            name="full_name"
            required
            placeholder="Jan Janssens"
          />
        </Field>
        <Field label="Bijnaam" hint="Optioneel — dit toont het leaderboard.">
          <input className={inputClass} name="nickname" placeholder="Jantje" />
        </Field>
        <Field label="Rol">
          <select className={inputClass} name="role" defaultValue="member">
            <option value="member">Lid</option>
            <option value="admin">Beheerder</option>
          </select>
        </Field>
      </div>

      <Submit label="Uitnodiging versturen" />
    </form>
  );
}

export function SeasonForm({ season }: { season: Season | null }) {
  const [state, action] = useActionState<AdminFormState, FormData>(
    saveSeasonAction,
    null,
  );

  const year = new Date().getFullYear();

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state?.success ? <Notice tone="success">{state.success}</Notice> : null}

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
        <Field label="Streefbedrag" hint="Wat we samen willen sparen voor het etentje.">
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

export function NewSeasonForm() {
  return <SeasonForm season={null} />;
}
