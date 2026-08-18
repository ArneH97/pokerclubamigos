"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export type FormState = { error?: string; success?: string } | null;

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vul je e-mailadres en wachtwoord in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        "Inloggen lukte niet. Controleer je e-mailadres en wachtwoord, of vraag een nieuw wachtwoord aan.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Vul eerst je e-mailadres in." };

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/wachtwoord`,
  });

  // Bewust altijd dezelfde boodschap: zo verklap je niet welke adressen
  // een account hebben.
  return {
    success:
      "Als dit adres bij ons bekend is, staat er zo een mail met een link in je inbox.",
  };
}

export async function updatePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Kies een wachtwoord van minstens 8 tekens." };
  }
  if (password !== confirm) {
    return { error: "De twee wachtwoorden zijn niet gelijk." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Je link is verlopen. Vraag een nieuwe aan via 'Wachtwoord vergeten' op de startpagina.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
