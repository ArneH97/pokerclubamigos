"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: string } | null;

const VERBODEN = /[^\p{L}\p{N} '._-]/u;

function refresh() {
  revalidatePath("/", "layout");
}

/** Spelernaam kiezen of aanpassen. Die naam staat overal: prikbord, ranglijst, reacties. */
export async function saveProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { member } = await requireMember({ allowNoNickname: true });

  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (nickname.length < 2) {
    return { error: "Kies een spelernaam van minstens 2 tekens." };
  }
  if (nickname.length > 24) {
    return { error: "Hou het bij maximaal 24 tekens." };
  }
  if (VERBODEN.test(nickname)) {
    return { error: "Gebruik enkel letters, cijfers, spaties en - _ . '" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .update({ nickname })
    .eq("id", member.id);

  if (error) {
    if (error.code === "23505") {
      return { error: `"${nickname}" is al bezet door een andere Amigo. Kies iets anders.` };
    }
    return { error: `Opslaan lukte niet: ${error.message}` };
  }

  if (password || confirm) {
    if (password.length < 8) {
      return {
        error:
          "Je spelernaam is bewaard, maar het wachtwoord niet: kies er een van minstens 8 tekens.",
      };
    }
    if (password !== confirm) {
      return {
        error: "Je spelernaam is bewaard, maar de twee wachtwoorden zijn niet gelijk.",
      };
    }

    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      return { error: `Spelernaam bewaard, wachtwoord niet: ${pwError.message}` };
    }
  }

  refresh();

  if (!member.nickname?.trim()) redirect("/prikbord");
  return { success: "Bewaard." };
}
