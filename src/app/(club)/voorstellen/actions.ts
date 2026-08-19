"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function toggleVoteAction(formData: FormData) {
  const { member } = await requireMember();
  const proposalId = String(formData.get("proposal_id") ?? "");
  const voted = String(formData.get("voted") ?? "") === "true";
  if (!proposalId) return;

  const supabase = await createClient();

  if (voted) {
    await supabase
      .from("proposal_votes")
      .delete()
      .eq("proposal_id", proposalId)
      .eq("member_id", member.id);
  } else {
    await supabase
      .from("proposal_votes")
      .insert({ proposal_id: proposalId, member_id: member.id });
  }

  revalidatePath("/voorstellen");
  revalidatePath("/beheer/voorstellen");
}
