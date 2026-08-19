"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/prikbord");
  revalidatePath("/dashboard");
}

export async function toggleLikeAction(formData: FormData) {
  const { member } = await requireMember();
  const resultId = String(formData.get("result_id") ?? "");
  const liked = String(formData.get("liked") ?? "") === "true";
  if (!resultId) return;

  const supabase = await createClient();

  if (liked) {
    await supabase
      .from("result_likes")
      .delete()
      .eq("result_id", resultId)
      .eq("member_id", member.id);
  } else {
    await supabase
      .from("result_likes")
      .insert({ result_id: resultId, member_id: member.id });
  }

  refresh();
}

export async function addCommentAction(formData: FormData) {
  const { member } = await requireMember();
  const resultId = String(formData.get("result_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!resultId || !body) return;

  const supabase = await createClient();
  await supabase.from("result_comments").insert({
    result_id: resultId,
    member_id: member.id,
    body: body.slice(0, 600),
  });

  refresh();
}

export async function deleteCommentAction(formData: FormData) {
  await requireMember();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // RLS laat enkel je eigen reactie toe (of alles, als je beheerder bent).
  const supabase = await createClient();
  await supabase.from("result_comments").delete().eq("id", id);

  refresh();
}
