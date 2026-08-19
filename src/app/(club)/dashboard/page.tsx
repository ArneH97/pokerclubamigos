import Link from "next/link";
import { FeedCard } from "@/components/feed-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PotMeter } from "@/components/pot-meter";
import { StatTile } from "@/components/stat-tile";
import { Card, CardTitle, Empty, buttonClass } from "@/components/ui";
import { money, num, shortDate, signedMoney } from "@/lib/format";
import {
  getActiveSeason,
  getClubTotals,
  requireMember,
} from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { FeedItem, LeaderboardRow, MemberLedger } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { member } = await requireMember();
  const season = await getActiveSeason();

  if (!season) {
    return (
      <Card>
        <CardTitle>Nog geen seizoen</CardTitle>
        <Empty>
          Er loopt nog geen seizoen. De beheerder maakt er eerst één aan bij
          Seizoen.
        </Empty>
      </Card>
    );
  }

  const supabase = await createClient();
  const totals = await getClubTotals();

  const [{ data: board }, { data: feed }, { data: myLikes }, { data: ledger }] =
    await Promise.all([
      supabase
        .from("leaderboard")
        .select("*")
        .eq("season_id", season.id)
        .order("contributed", { ascending: false }),
      supabase
        .from("feed")
        .select("*")
        .eq("season_id", season.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("result_likes").select("result_id").eq("member_id", member.id),
      supabase
        .from("member_ledger")
        .select("*")
        .eq("member_id", member.id)
        .maybeSingle(),
    ]);

  const rows = (board ?? []) as LeaderboardRow[];
  const items = (feed ?? []) as FeedItem[];
  const mine = (ledger as MemberLedger | null) ?? null;
  const liked = new Set(
    ((myLikes ?? []) as { result_id: string }[]).map((l) => l.result_id),
  );

  const me = rows.find((r) => r.member_id === member.id);
  const myRank = rows.findIndex((r) => r.member_id === member.id) + 1;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Dag {member.nickname?.trim() || member.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            {season.name} · {shortDate(season.starts_on)} —{" "}
            {shortDate(season.ends_on)}
          </p>
        </div>
        <Link href="/ingave" className={buttonClass}>
          Resultaat ingeven
        </Link>
      </div>

      <PotMeter
        pot={num(totals.pot)}
        pending={num(totals.openstaand)}
        target={num(season.target_amount)}
        seasonName={season.name}
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Jij geeft nog door"
          value={money(num(mine?.openstaand))}
          detail="Zit al in de pot, moet nog bij Guido geraken"
          accent="s3"
        />
        <StatTile
          label="Bijgedragen dit seizoen"
          value={money(num(me?.contributed))}
          detail={
            myRank > 0 ? `Plaats ${myRank} van ${rows.length}` : "Nog niets ingegeven"
          }
          accent="s1"
        />
        <StatTile
          label="Al afgerekend"
          value={money(num(mine?.ontvangen))}
          detail="Dat geld is al doorgegeven"
          accent="s2"
        />
        <StatTile
          label="Jouw winst"
          value={signedMoney(num(me?.profit))}
          detail={`Over ${num(me?.entries)} ingave${num(me?.entries) === 1 ? "" : "s"}`}
          accent="s7"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardTitle hint="Gerangschikt op bijdrage aan de pot">
            Wie draagt het meest bij
          </CardTitle>
          {rows.length === 0 ? (
            <Empty>Nog niemand heeft een resultaat ingegeven.</Empty>
          ) : (
            <LeaderboardTable rows={rows} highlightId={member.id} />
          )}
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-ink">Laatst op het prikbord</h2>
          <Link
            href="/prikbord"
            className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink"
          >
            Alles bekijken
          </Link>
        </div>

        {items.length === 0 ? (
          <Card>
            <Empty>
              Nog niets te zien. Geef je eerste cash in en trap het prikbord af.
            </Empty>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                likedByMe={liked.has(item.id)}
                currentMemberId={member.id}
                isAdmin={member.role === "admin"}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
