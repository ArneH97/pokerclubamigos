import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ClubTotals, Member, Season, SeasonTotals } from "@/lib/types";

export async function getMember() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, member: null as Member | null };

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, member: (data as Member | null) ?? null };
}

/**
 * Beschermt de ledenzone.
 * Niet ingelogd -> login. Geen lid -> uitleg. Nog geen spelernaam gekozen ->
 * eerst dat afronden, want die naam wordt overal gebruikt.
 */
export async function requireMember({ allowNoNickname = false } = {}) {
  const { user, member } = await getMember();
  if (!user) redirect("/login");
  if (!member || !member.is_active) redirect("/geen-toegang");
  if (!allowNoNickname && !member.nickname?.trim()) redirect("/welkom");
  return { user, member };
}

export async function requireAdmin() {
  const { user, member } = await requireMember();
  if (member.role !== "admin") redirect("/dashboard");
  return { user, member };
}

export async function getActiveSeason() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  return (data as Season | null) ?? null;
}

export async function getSeasonTotals(seasonId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("season_totals")
    .select("*")
    .eq("season_id", seasonId)
    .maybeSingle();
  return (data as SeasonTotals | null) ?? null;
}

/** De pot: de som van alle saldo's, plus wat er nog gestort moet worden. */
export async function getClubTotals() {
  const supabase = await createClient();
  const { data } = await supabase.from("club_totals").select("*").maybeSingle();
  return (
    (data as ClubTotals | null) ?? {
      pot: 0,
      openstaand: 0,
      pot_verwacht: 0,
      leden: 0,
    }
  );
}

export async function getUnreadCount(memberId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("is_read", false);
  return count ?? 0;
}
