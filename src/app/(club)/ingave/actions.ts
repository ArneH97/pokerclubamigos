"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveSeason, requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type ResultFormState = { error?: string } | null;

function toAmount(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").replace(",", ".").trim();
  if (raw === "") return NaN;
  return Number(raw);
}

export async function createResultAction(
  _prev: ResultFormState,
  formData: FormData,
): Promise<ResultFormState> {
  const { member } = await requireMember();
  const season = await getActiveSeason();
  if (!season) return { error: "Er loopt geen seizoen. Vraag het aan de voorzitter." };

  const buyin = toAmount(formData.get("buyin"));
  const cashout = toAmount(formData.get("cashout"));
  const playedOn = String(formData.get("played_on") ?? "");
  const venue = String(formData.get("venue") ?? "").trim() || "Aalst";
  const tournament = String(formData.get("tournament") ?? "").trim();
  const positionRaw = String(formData.get("finish_position") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!Number.isFinite(buyin) || buyin < 0) {
    return { error: "Vul een geldige buy-in in." };
  }
  if (!Number.isFinite(cashout) || cashout < 0) {
    return { error: "Vul een geldige cash-out in. Niets gewonnen? Zet 0." };
  }
  if (!playedOn) return { error: "Kies de datum van het tornooi." };
  if (playedOn < season.starts_on || playedOn > season.ends_on) {
    return { error: `Die datum valt buiten het huidige seizoen (${season.name}).` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("results").insert({
    member_id: member.id,
    season_id: season.id,
    played_on: playedOn,
    venue,
    tournament: tournament || null,
    finish_position: positionRaw ? Number(positionRaw) : null,
    buyin,
    cashout,
    note: note || null,
  });

  if (error) return { error: `Opslaan lukte niet: ${error.message}` };

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/resultaten");
  redirect("/dashboard?opgeslagen=1");
}

export async function deleteOwnResultAction(formData: FormData) {
  const { member } = await requireMember();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("results").delete().eq("id", id).eq("member_id", member.id);

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/resultaten");
}
