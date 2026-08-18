"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminFormState = { error?: string; success?: string } | null;

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  revalidatePath("/resultaten");
}

/**
 * Nodigt een lid uit. Bestaat het e-mailadres al als account (bijvoorbeeld via
 * de andere pokerapp op ditzelfde Supabase-project), dan sturen we geen
 * uitnodiging maar geven we die persoon gewoon toegang tot de club.
 */
export async function inviteMemberAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const role = String(formData.get("role") ?? "member") === "admin" ? "admin" : "member";

  if (!email || !email.includes("@")) return { error: "Vul een geldig e-mailadres in." };
  if (!fullName) return { error: "Vul de naam van het lid in." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY ontbreekt in de omgevingsvariabelen. Zonder die sleutel kan er niemand uitgenodigd worden.",
    };
  }

  const siteUrl = await getSiteUrl();

  const { data: existingId, error: lookupError } = await admin.rpc(
    "find_user_id_by_email",
    { p_email: email },
  );
  if (lookupError) return { error: `Opzoeken mislukte: ${lookupError.message}` };

  let userId = existingId as string | null;
  let hadAccount = Boolean(userId);

  if (!userId) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/confirm?next=/wachtwoord`,
    });
    if (error || !data?.user) {
      return { error: `Uitnodigen mislukte: ${error?.message ?? "onbekende fout"}` };
    }
    userId = data.user.id;
    hadAccount = false;
  }

  const { error: insertError } = await admin
    .from("members")
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        nickname: nickname || null,
        role,
        is_active: true,
      },
      { onConflict: "id" },
    );

  if (insertError) return { error: `Toevoegen mislukte: ${insertError.message}` };

  refresh();
  return {
    success: hadAccount
      ? `${fullName} had al een account en is nu lid. Die kan meteen inloggen met het bestaande wachtwoord.`
      : `${fullName} is uitgenodigd. Er staat een mail klaar op ${email}.`,
  };
}

export async function setMemberRoleAction(formData: FormData) {
  const { member } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "member") === "admin" ? "admin" : "member";

  // Jezelf degraderen kan de club zonder beheerder achterlaten.
  if (id === member.id) return;

  const supabase = await createClient();
  await supabase.from("members").update({ role }).eq("id", id);
  refresh();
}

export async function setMemberActiveAction(formData: FormData) {
  const { member } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";

  if (id === member.id) return;

  const supabase = await createClient();
  await supabase.from("members").update({ is_active: isActive }).eq("id", id);
  refresh();
}

export async function saveSeasonAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const target = Number(String(formData.get("target_amount") ?? "0").replace(",", "."));
  const startsOn = String(formData.get("starts_on") ?? "");
  const endsOn = String(formData.get("ends_on") ?? "");

  if (!name) return { error: "Geef het seizoen een naam." };
  if (!Number.isFinite(target) || target < 0) return { error: "Vul een geldig streefbedrag in." };
  if (!startsOn || !endsOn) return { error: "Vul begin- en einddatum in." };
  if (endsOn < startsOn) return { error: "De einddatum ligt voor de begindatum." };

  const supabase = await createClient();
  const payload = { name, target_amount: target, starts_on: startsOn, ends_on: endsOn };

  if (id) {
    const { error } = await supabase.from("seasons").update(payload).eq("id", id);
    if (error) return { error: error.message };
    refresh();
    return { success: "Seizoen bijgewerkt." };
  }

  // Nieuw seizoen wordt meteen het actieve; het oude gaat op inactief.
  const { error: deactivateError } = await supabase
    .from("seasons")
    .update({ is_active: false })
    .eq("is_active", true);
  if (deactivateError) return { error: deactivateError.message };

  const { error } = await supabase
    .from("seasons")
    .insert({ ...payload, is_active: true });
  if (error) return { error: error.message };

  refresh();
  return { success: "Nieuw seizoen aangemaakt en geactiveerd." };
}

export async function togglePaidAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isPaid = String(formData.get("is_paid") ?? "") === "true";

  const supabase = await createClient();
  await supabase.from("results").update({ is_paid: isPaid }).eq("id", id);
  refresh();
}

export async function markMemberPaidAction(formData: FormData) {
  await requireAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const seasonId = String(formData.get("season_id") ?? "");
  if (!memberId || !seasonId) return;

  const supabase = await createClient();
  await supabase
    .from("results")
    .update({ is_paid: true })
    .eq("member_id", memberId)
    .eq("season_id", seasonId)
    .eq("is_paid", false);
  refresh();
}

export async function adminDeleteResultAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("results").delete().eq("id", id);
  refresh();
}
