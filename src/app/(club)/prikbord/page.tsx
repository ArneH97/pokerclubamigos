import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { PotStrip } from "@/components/pot-strip";
import { Card, Empty, buttonClass } from "@/components/ui";
import { num } from "@/lib/format";
import { getActiveSeason, getClubTotals, requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { FeedItem, ResultComment } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PrikbordPage() {
  const { member } = await requireMember();
  const season = await getActiveSeason();
  const voornaam = member.nickname?.trim() || member.full_name.split(" ")[0];

  if (!season) {
    return (
      <Card>
        <Empty>
          Er loopt nog geen seizoen. De beheerder maakt er eerst één aan.
        </Empty>
      </Card>
    );
  }

  const supabase = await createClient();
  const totals = await getClubTotals();

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="hand text-4xl leading-none text-ink sm:text-5xl">
            Dag {voornaam}
          </h1>
          <p className="mt-1.5 text-sm text-ink-2">
            Dit is wat de Amigos de laatste tijd hebben uitgespookt.
          </p>
        </div>
        <Link href="/ingave" className={`${buttonClass} hidden sm:inline-flex`}>
          Resultaat ingeven
        </Link>
      </div>

      <PotStrip
        pot={num(totals.pot)}
        target={num(season.target_amount)}
        seasonName={season.name}
      />

      <div className="mt-5 grid gap-5">
        {items.length === 0 ? (
          <Card>
            <Empty>
              Nog niets te zien. Wie geeft de eerste cash in?
            </Empty>
          </Card>
        ) : (
          items.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              likedByMe={liked.has(item.id)}
              currentMemberId={member.id}
              isAdmin={member.role === "admin"}
              comments={comments[item.id] ?? []}
            />
          ))
        )}
      </div>
    </div>
  );
}
