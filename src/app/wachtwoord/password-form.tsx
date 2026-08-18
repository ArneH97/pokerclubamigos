"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePasswordAction, type FormState } from "@/app/auth/actions";
import { Field, Notice, buttonClass, inputClass } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
      {pending ? "Even geduld…" : "Wachtwoord opslaan"}
    </button>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(
    updatePasswordAction,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Field label="Nieuw wachtwoord" hint="Minstens 8 tekens.">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <Field label="Nog eens ter controle">
        <input
          className={inputClass}
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
