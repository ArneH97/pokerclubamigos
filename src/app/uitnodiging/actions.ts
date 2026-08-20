"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Wisselt de token uit de mail pas in wanneer iemand écht op de knop duwt.
 * Mailscanners en voorbeeldweergaves halen de pagina wel op, maar versturen
 * dit formulier niet — zo raakt de link niet opgebruikt voor de ontvanger
 * hem opent.
 *
 * We proberen meerdere soorten. Een token hoort bij één soort (invite,
 * recovery, magiclink…), en als het mailsjabloon een ander soort vermeldt dan
 * waarmee de token gemaakt is, faalt de controle met "invalid or expired".
 * Een mislukte poging verbruikt de token niet, dus doorproberen is veilig en
 * scheelt een hoop gepuzzel met sjablonen.
 */
const SOORTEN: EmailOtpType[] = ["recovery", "invite", "magiclink", "email", "signup"];

export async function bevestigUitnodigingAction(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const opgegeven = String(formData.get("type") ?? "recovery") as EmailOtpType;
  const next = String(formData.get("next") ?? "/wachtwoord");
  const safeNext = next.startsWith("/") ? next : "/wachtwoord";

  const terug = (melding: string) =>
    `/uitnodiging?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(
      opgegeven,
    )}&next=${encodeURIComponent(safeNext)}&fout=${encodeURIComponent(melding)}`;

  if (!tokenHash) redirect(terug("De link is onvolledig."));

  // Een pkce_-token hoort bij de browser die de mail aanvroeg en kan door de
  // ontvanger nooit ingewisseld worden. Beter meteen eerlijk zijn.
  if (tokenHash.startsWith("pkce_")) {
    redirect(
      terug(
        "Deze mail is met een oude instelling verstuurd en kan niet werken. Vraag Arne of Guido om een nieuwe link.",
      ),
    );
  }

  const supabase = await createClient();
  const volgorde = [opgegeven, ...SOORTEN.filter((s) => s !== opgegeven)];

  let gelukt = false;
  let laatsteFout = "Deze link werkt niet meer.";

  for (const soort of volgorde) {
    const { error } = await supabase.auth.verifyOtp({
      type: soort,
      token_hash: tokenHash,
    });
    if (!error) {
      gelukt = true;
      break;
    }
    laatsteFout = error.message;
  }

  if (!gelukt) redirect(terug(laatsteFout));

  revalidatePath("/", "layout");
  redirect(safeNext);
}
