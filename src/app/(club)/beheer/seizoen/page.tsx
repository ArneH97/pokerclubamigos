import { SeasonForm } from "../forms";
import { StatTile } from "@/components/stat-tile";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { money, num, shortDate } from "@/lib/format";
import { getActiveSeason, getSeasonTotals, requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Season } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SeizoenPage() {
  await requireAdmin();
  const season = await getActiveSeason();
  const totals = season ? await getSeasonTotals(season.id) : null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("seasons")
    .select("*")
    .order("starts_on", { ascending: false });
  const seasons = (data ?? []) as Season[];

  return (
    <>
      <PageTitle sub="Het spaardoel en de periode waarover de ranglijst loopt.">
        Seizoen
      </PageTitle>

      {season ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <StatTile
            label="Bijgedragen dit seizoen"
            value={money(num(totals?.contributions))}
            detail={`${num(totals?.entries)} ingaves`}
            accent="s1"
          />
          <StatTile
            label="Waarvan ontvangen"
            value={money(num(totals?.contributions_received))}
            detail="De rest moet nog doorgegeven worden"
            accent="s3"
          />
          <StatTile
            label="Spaardoel"
            value={money(num(season.target_amount))}
            detail={`${shortDate(season.starts_on)} — ${shortDate(season.ends_on)}`}
            accent="s4"
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle hint={season ? "Actief" : "Nog geen seizoen"}>
            {season ? "Huidig seizoen aanpassen" : "Eerste seizoen aanmaken"}
          </CardTitle>
          <SeasonForm season={season} />
        </Card>

        <Card>
          <CardTitle>Nieuw seizoen starten</CardTitle>
          <p className="mb-4 text-sm text-ink-2">
            Een nieuw seizoen zet het huidige op non-actief en begint met een
            verse ranglijst. De saldo&apos;s van de Amigos blijven gewoon
            staan — die lopen door over de seizoenen heen.
          </p>
          <SeasonForm season={null} />
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardTitle hint={`${seasons.length}`}>Alle seizoenen</CardTitle>
          {seasons.length === 0 ? (
            <Empty>Nog geen seizoenen.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {seasons.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {s.name}
                      {s.is_active ? (
                        <span className="ml-2 rounded-full bg-good/12 px-2 py-0.5 text-[11px] font-semibold text-ink">
                          actief
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {shortDate(s.starts_on)} — {shortDate(s.ends_on)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink tabular">
                    {money(num(s.target_amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Notice>
          De pot zelf hoort niet bij een seizoen: die is de som van wat er per
          Amigo in het potje staat en loopt gewoon door. Geld uitgeven doe je
          via <strong>Activiteiten</strong>.
        </Notice>
      </div>
    </>
  );
}
