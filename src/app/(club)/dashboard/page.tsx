import Link from "next/link";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { PotMeter } from "@/components/pot-meter";
import { StatTile } from "@/components/stat-tile";
import { Card, CardTitle, Empty, buttonClass } from "@/components/ui";
import { money, num, shortDate, signedMoney } from "@/lib/format";
import { getActiveSeason, getSeasonTotals, requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow, Result } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { member } = await requireMember();
  const season = await getActiveSeason();

  if (!season) {
    return (
      <Card>
        <CardTitle>Nog geen seizoen</CardTitle>
        <Empty>
          De voorzitter moet eerst een seizoen met streefbedrag aanmaken bij
          Beheer.
        </Empty>
      </Card>
    );
  }

  const supabase = await createClient();
  const totals = await getSeasonTotals(season.id);

  const [{ data: board }, { data: mine }] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("*")
      .eq("season_id", season.id)
      .order("contributed", { ascending: false }),
    supabase
      .from("results")
      .select("*")
      .eq("season_id", season.id)
      .eq("member_id", member.id)
      .order("played_on", { ascending: false })
      .limit(5),
  ]);

  const rows = (board ?? []) as LeaderboardRow[];
  const myResults = (mine ?? []) as Result[];
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
            {shortDate(season.starts_on)} — {shortDate(season.ends_on)}
          </p>
        </div>
        <Link href="/ingave" className={buttonClass}>
          Resultaat ingeven
        </Link>
      </div>

      <PotMeter
        pot={num(totals?.pot)}
        paid={num(totals?.pot_paid)}
        target={num(season.target_amount)}
        seasonName={season.name}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Jouw bijdrage"
          value={money(num(me?.contributed))}
          detail={myRank > 0 ? `Plaats ${myRank} van ${rows.length}` : "Nog niets ingegeven"}
          accent="s1"
        />
        <StatTile
          label="Jouw winst"
          value={signedMoney(num(me?.profit))}
          detail={`Over ${num(me?.entries)} ingave${num(me?.entries) === 1 ? "" : "s"}`}
          accent="s2"
        />
        <StatTile
          label="Jouw cashes"
          value={`${num(me?.cashes)}×`}
          detail="Tornooien waar je in the money zat"
          accent="s4"
        />
        <StatTile
          label="Amigo's die bijdroegen"
          value={`${num(totals?.contributors)}`}
          detail={`${num(totals?.entries)} ingaves dit seizoen`}
          accent="s7"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle
            hint={
              <Link href="/leaderboard" className="underline underline-offset-4">
                Volledig
              </Link>
            }
          >
            Top 5 van de pot
          </CardTitle>
          {rows.length === 0 ? (
            <Empty>Nog niemand heeft een resultaat ingegeven.</Empty>
          ) : (
            <LeaderboardTable
              rows={rows.slice(0, 5)}
              highlightId={member.id}
              compact
            />
          )}
        </Card>

        <Card>
          <CardTitle
            hint={
              <Link href="/resultaten" className="underline underline-offset-4">
                Alles
              </Link>
            }
          >
            Jouw laatste resultaten
          </CardTitle>
          {myResults.length === 0 ? (
            <Empty>
              Je hebt nog niets ingegeven. Doe dat na je volgende cash in Aalst.
            </Empty>
          ) : (
            <ul className="divide-y divide-line">
              {myResults.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.tournament?.trim() || r.venue}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {shortDate(r.played_on)} · buy-in {money(num(r.buyin))} ·
                      cash-out {money(num(r.cashout))}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-ink tabular">
                      {money(num(r.contribution))}
                    </p>
                    <p className="text-xs text-ink-muted tabular">
                      {signedMoney(num(r.profit))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
