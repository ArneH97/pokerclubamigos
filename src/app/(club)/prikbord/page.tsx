import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { Card, Empty, PageTitle, buttonClass } from "@/components/ui";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { FeedItem, ResultComment, Season } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PrikbordPage() {
  const { member } = await requireMember();
  const supabase = await createClient();

  const { data: seasonData } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  const season = (seasonData ?? null) as Season | null;

  if (!season) {
    return (
      <Card>
        <Empty>Er loopt nog geen seizoen.</Empty>
      </Card>
    );
  }

  const { data: feed } = await supabase
    .from("feed")
    .select("*")
    .eq("season_id", season.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const items = (feed ?? []) as FeedItem[];
  const ids = items.map((i) => i.id);

  const [{ data: commentData }, { data: likeData }] = await Promise.all([
    ids.length
      ? supabase
          .from("result_comments")
          .select("*, members(id, full_name, nickname)")
          .in("result_id", ids)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase.from("result_likes").select("result_id").eq("member_id", member.id),
  ]);

  const comments = ((commentData as unknown as ResultComment[]) ?? []).reduce<
    Record<string, ResultComment[]>
  >((acc, c) => {
    (acc[c.result_id] ??= []).push(c);
    return acc;
  }, {});

  const liked = new Set(
    (((likeData as unknown as { result_id: string }[]) ?? []) || []).map(
      (l) => l.result_id,
    ),
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <PageTitle sub="Elke cash van de Amigo's, met plaats voor commentaar. Zoals het hoort.">
          Prikbord
        </PageTitle>
        <Link href="/ingave" className={`${buttonClass} mb-6`}>
          Resultaat ingeven
        </Link>
      </div>

      {items.length === 0 ? (
        <Card>
          <Empty>
            Nog niets te zien. Wie geeft de eerste cash in?
          </Empty>
        </Card>
      ) : (
        <div className="mx-auto grid max-w-2xl gap-5">
          {items.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              likedByMe={liked.has(item.id)}
              currentMemberId={member.id}
              isAdmin={member.role === "admin"}
              comments={comments[item.id] ?? []}
            />
          ))}
        </div>
      )}
    </>
  );
}
