"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Wisselt de token uit de mail pas in wanneer iemand écht op de knop duwt.
 * Mailscanners en voorbeeldweergaves halen de pagina wel op, maar versturen
 * dit formulier niet — zo raakt de uitnodiging niet opgebruikt voor de
 * ontvanger hem opent.
 */
export async function bevestigUitnodigingAction(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "invite") as EmailOtpType;
  const next = String(formData.get("next") ?? "/welkom");
  const safeNext = next.startsWith("/") ? next : "/welkom";

  const terug = (melding: string) =>
    `/uitnodiging?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(
      type,
    )}&next=${encodeURIComponent(safeNext)}&fout=${encodeURIComponent(melding)}`;

  if (!tokenHash) redirect(terug("De link is onvolledig."));

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) redirect(terug(error.message));

  revalidatePath("/", "layout");
  redirect(safeNext);
}
