import Link from "next/link";
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
import type { LeaderboardRow, MemberLedger } from "@/lib/types";

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

  const [{ data: board }, { data: ledger }] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("*")
      .eq("season_id", season.id)
      .order("contributed", { ascending: false }),
    supabase
      .from("member_ledger")
      .select("*")
      .eq("member_id", member.id)
      .maybeSingle(),
  ]);

  const rows = (board ?? []) as LeaderboardRow[];
  const mine = (ledger as MemberLedger | null) ?? null;

  const me = rows.find((r) => r.member_id === member.id);
  const myRank = rows.findIndex((r) => r.member_id === member.id) + 1;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="hand text-4xl leading-none text-ink sm:text-5xl">
            De pot
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            {season.name} · {shortDate(season.starts_on)} —{" "}
            {shortDate(season.ends_on)}
          </p>
        </div>
        <Link href="/prikbord" className={buttonClass}>
          Naar het prikbord
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

    </>
  );
}
