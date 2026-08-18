"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  loginAction,
  requestResetAction,
  type FormState,
} from "@/app/auth/actions";
import {
  Field,
  Notice,
  buttonClass,
  buttonGhostClass,
  inputClass,
} from "@/components/ui";

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${buttonClass} w-full`} disabled={pending}>
      {pending ? "Even geduld…" : children}
    </button>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [loginState, login] = useActionState<FormState, FormData>(
    loginAction,
    null,
  );
  const [resetState, reset] = useActionState<FormState, FormData>(
    requestResetAction,
    null,
  );

  if (mode === "reset") {
    return (
      <form action={reset} className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Nieuw wachtwoord</h2>
          <p className="mt-1 text-sm text-ink-2">
            We sturen je een link waarmee je een nieuw wachtwoord kan instellen.
          </p>
        </div>

        {resetState?.error ? (
          <Notice tone="error">{resetState.error}</Notice>
        ) : null}
        {resetState?.success ? (
          <Notice tone="success">{resetState.success}</Notice>
        ) : null}

        <Field label="E-mailadres">
          <input
            className={inputClass}
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="jij@voorbeeld.be"
          />
        </Field>

        <SubmitButton>Stuur me een link</SubmitButton>

        <button
          type="button"
          onClick={() => setMode("login")}
          className={`${buttonGhostClass} w-full`}
        >
          Terug naar inloggen
        </button>
      </form>
    );
  }

  return (
    <form action={login} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Inloggen</h2>
        <p className="mt-1 text-sm text-ink-2">
          Enkel voor leden van De Amigo&apos;s.
        </p>
      </div>

      {loginState?.error ? (
        <Notice tone="error">{loginState.error}</Notice>
      ) : initialError ? (
        <Notice tone="error">{initialError}</Notice>
      ) : null}

      <Field label="E-mailadres">
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="jij@voorbeeld.be"
        />
      </Field>

      <Field label="Wachtwoord">
        <input
          className={inputClass}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </Field>

      <SubmitButton>Inloggen</SubmitButton>

      <button
        type="button"
        onClick={() => setMode("reset")}
        className="w-full text-center text-sm font-medium text-ink-2 underline underline-offset-4 hover:text-ink"
      >
        Wachtwoord vergeten?
      </button>
    </form>
  );
}
