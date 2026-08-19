import { LeaderboardTable } from "@/components/leaderboard-table";
import { SeasonSelect } from "@/components/season-select";
import { StatTile } from "@/components/stat-tile";
import { Card, CardTitle, Empty, PageTitle } from "@/components/ui";
import { money, num } from "@/lib/format";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow, Season, SeasonTotals } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ seizoen?: string }>;
}) {
  const { member } = await requireMember();
  const { seizoen } = await searchParams;
  const supabase = await createClient();

  const { data: seasonData } = await supabase
    .from("seasons")
    .select("*")
    .order("starts_on", { ascending: false });

  const seasons = (seasonData ?? []) as Season[];
  const season =
    seasons.find((s) => s.id === seizoen) ??
    seasons.find((s) => s.is_active) ??
    seasons[0];

  if (!season) {
    return (
      <Card>
        <Empty>Er is nog geen seizoen aangemaakt.</Empty>
      </Card>
    );
  }

  const [{ data: board }, { data: totalsData }] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("*")
      .eq("season_id", season.id)
      .order("contributed", { ascending: false }),
    supabase
      .from("season_totals")
      .select("*")
      .eq("season_id", season.id)
      .maybeSingle(),
  ]);

  const rows = (board ?? []) as LeaderboardRow[];
  const totals = (totalsData ?? null) as SeasonTotals | null;
  const top = rows[0];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageTitle sub="Gerangschikt op wat je in de pot stak. Wie het meest wint, betaalt het meest van het etentje.">
          Leaderboard
        </PageTitle>

        {seasons.length > 1 ? (
          <div className="mb-6">
            <SeasonSelect seasons={seasons} current={season.id} />
          </div>
        ) : null}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Totale pot"
          value={money(num(totals?.pot))}
          detail={`Streefbedrag ${money(num(season.target_amount))}`}
          accent="s1"
        />
        <StatTile
          label="Grootste bijdrage"
          value={top ? money(num(top.contributed)) : "—"}
          detail={top ? top.display_name : "Nog geen ingaves"}
          accent="s2"
        />
        <StatTile
          label="Gemiddelde per lid"
          value={
            rows.length ? money(num(totals?.pot) / rows.length) : money(0)
          }
          detail={`${rows.length} leden droegen bij`}
          accent="s3"
        />
      </div>

      <Card>
        <CardTitle hint={season.name}>Bijdrage aan de pot</CardTitle>
        {rows.length === 0 ? (
          <Empty>Nog geen resultaten dit seizoen.</Empty>
        ) : (
          <LeaderboardTable rows={rows} highlightId={member.id} />
        )}
      </Card>
    </>
  );
}
