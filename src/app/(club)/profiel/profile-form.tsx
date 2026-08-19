"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfileAction, type ProfileState } from "./actions";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass} disabled={pending}>
      {pending ? "Bezig…" : label}
    </button>
  );
}

export function ProfileForm({
  nickname,
  firstTime = false,
}: {
  nickname: string | null;
  firstTime?: boolean;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    saveProfileAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state?.success ? <Notice tone="success">{state.success}</Notice> : null}

      <Field
        label="Spelernaam"
        hint="Zo sta je overal: op het prikbord, in de ranglijst en bij je reacties."
      >
        <input
          className={inputClass}
          name="nickname"
          required
          minLength={2}
          maxLength={24}
          defaultValue={nickname ?? ""}
          placeholder="Bijvoorbeeld: Jantje"
          autoFocus={firstTime}
        />
      </Field>

      <fieldset className="rounded-2xl border border-line p-4">
        <legend className="px-2 text-sm font-medium text-ink-2">
          {firstTime ? "Kies je eigen wachtwoord" : "Nieuw wachtwoord"}
        </legend>
        <p className="mb-3 text-xs text-ink-muted">
          {firstTime
            ? "Kies meteen een wachtwoord dat alleen jij kent."
            : "Laat leeg als je je huidige wachtwoord wil houden."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Wachtwoord">
            <input
              className={inputClass}
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required={firstTime}
            />
          </Field>
          <Field label="Nog eens">
            <input
              className={inputClass}
              type="password"
              name="confirm"
              autoComplete="new-password"
              minLength={8}
              required={firstTime}
            />
          </Field>
        </div>
      </fieldset>

      <Submit label={firstTime ? "Aan de slag" : "Opslaan"} />
    </form>
  );
}
