"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createResultAction, type ResultFormState } from "./actions";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";
import { money } from "@/lib/format";

function parse(value: string) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      {pending ? "Opslaan…" : "Resultaat opslaan"}
    </button>
  );
}

export function ResultForm({ today }: { today: string }) {
  const [state, action] = useActionState<ResultFormState, FormData>(
    createResultAction,
    null,
  );
  const [buyin, setBuyin] = useState("");
  const [cashout, setCashout] = useState("");

  const profit = parse(cashout) - parse(buyin);
  const contribution = Math.round(Math.max(profit, 0) * 10) / 100;
  const touched = buyin !== "" || cashout !== "";

  return (
    <form action={action} className="space-y-5">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Buy-in" hint="Alles wat je erin stak, herentries inbegrepen.">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="buyin"
              inputMode="decimal"
              required
              placeholder="50"
              value={buyin}
              onChange={(e) => setBuyin(e.target.value)}
            />
          </div>
        </Field>

        <Field label="Cash-out" hint="Wat je uitbetaald kreeg. Niets? Zet 0.">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
              €
            </span>
            <input
              className={`${inputClass} pl-8`}
              name="cashout"
              inputMode="decimal"
              required
              placeholder="400"
              value={cashout}
              onChange={(e) => setCashout(e.target.value)}
            />
          </div>
        </Field>
      </div>

      {/* Live berekening — exact wat de database straks opslaat. */}
      <div
        aria-live="polite"
        className="rounded-2xl border border-line bg-surface-2 p-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-sm text-ink-2">Voor de pot (10% van de winst)</p>
            <p className="mt-1 text-3xl font-semibold text-ink">
              {money(touched ? contribution : 0)}
            </p>
          </div>
          <p className="text-sm text-ink-muted tabular">
            {touched
              ? profit > 0
                ? `winst ${money(profit)} × 10%`
                : "geen winst, dus geen bijdrage"
              : "vul buy-in en cash-out in"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Datum">
          <input
            className={inputClass}
            type="date"
            name="played_on"
            required
            defaultValue={today}
          />
        </Field>

        <Field label="Plaats">
          <input
            className={inputClass}
            name="venue"
            defaultValue="Aalst"
            placeholder="Aalst"
          />
        </Field>

        <Field label="Tornooi" hint="Optioneel.">
          <input
            className={inputClass}
            name="tournament"
            placeholder="Vrijdagavond deepstack"
          />
        </Field>

        <Field label="Eindplaats" hint="Optioneel.">
          <input
            className={inputClass}
            name="finish_position"
            type="number"
            min={1}
            placeholder="3"
          />
        </Field>
      </div>

      <Field label="Notitie" hint="Optioneel — bad beat, chop, wat je kwijt wil.">
        <textarea className={inputClass} name="note" rows={2} />
      </Field>

      <SubmitButton />
    </form>
  );
}
