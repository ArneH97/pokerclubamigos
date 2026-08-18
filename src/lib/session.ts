import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Member, Season, SeasonTotals } from "@/lib/types";

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

/** Beschermt clubpagina's: niet ingelogd -> login, geen lid -> uitleg. */
export async function requireMember() {
  const { user, member } = await getMember();
  if (!user) redirect("/");
  if (!member || !member.is_active) redirect("/geen-toegang");
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
