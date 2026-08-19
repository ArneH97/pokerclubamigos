"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function markAllReadAction() {
  const { member } = await requireMember();
  const supabase = await createClient();

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("member_id", member.id)
    .eq("is_read", false);

  revalidatePath("/", "layout");
}

export async function clearNotificationsAction() {
  const { member } = await requireMember();
  const supabase = await createClient();

  await supabase.from("notifications").delete().eq("member_id", member.id);
  revalidatePath("/", "layout");
}
