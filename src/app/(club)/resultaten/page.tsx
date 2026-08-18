import { deleteOwnResultAction } from "@/app/(club)/ingave/actions";
import { SeasonSelect } from "@/components/season-select";
import { Card, CardTitle, Empty, PageTitle } from "@/components/ui";
import { money, num, shortDate, signedMoney } from "@/lib/format";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { ResultWithMember, Season } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ResultatenPage({
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

  const { data } = await supabase
    .from("results")
    .select("*, members(id, full_name, nickname)")
    .eq("season_id", season.id)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false });

  const results = (data ?? []) as ResultWithMember[];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageTitle sub="Alles staat open voor elk lid. Zo weet iedereen waar de kas vandaan komt.">
          Alle resultaten
        </PageTitle>
        {seasons.length > 1 ? (
          <div className="mb-6">
            <SeasonSelect seasons={seasons} current={season.id} />
          </div>
        ) : null}
      </div>

      <Card>
        <CardTitle hint={`${results.length} ingaves · ${season.name}`}>
          Ingaves
        </CardTitle>

        {results.length === 0 ? (
          <Empty>Nog geen resultaten dit seizoen.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-ink-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Datum</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Lid</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Tornooi</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Buy-in</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Cash-out</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Winst</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">In de pot</th>
                  <th scope="col" className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const name =
                    r.members?.nickname?.trim() ||
                    r.members?.full_name ||
                    "Onbekend";
                  const isMine = r.member_id === member.id;

                  return (
                    <tr key={r.id} className="border-b border-line/70 last:border-0">
                      <td className="whitespace-nowrap py-2.5 pr-3 text-ink-2 tabular">
                        {shortDate(r.played_on)}
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-ink">
                        {name}
                        {isMine ? (
                          <span className="ml-2 rounded-full bg-s1/15 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
                            jij
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-2">
                        {r.tournament?.trim() || r.venue}
                        {r.finish_position ? (
                          <span className="text-ink-muted"> · {r.finish_position}e</span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-ink-2 tabular">
                        {money(num(r.buyin))}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-ink-2 tabular">
                        {money(num(r.cashout))}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-ink-2 tabular">
                        {signedMoney(num(r.profit))}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold text-ink tabular">
                        {money(num(r.contribution))}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              r.is_paid
                                ? "bg-good/12 text-ink"
                                : "bg-surface-2 text-ink-2"
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`h-1.5 w-1.5 rounded-full ${
                                r.is_paid ? "bg-good" : "bg-ink-muted"
                              }`}
                            />
                            {r.is_paid ? "betaald" : "open"}
                          </span>

                          {isMine && !r.is_paid ? (
                            <form action={deleteOwnResultAction}>
                              <input type="hidden" name="id" value={r.id} />
                              <button className="text-xs font-medium text-ink-muted underline underline-offset-4 hover:text-critical">
                                verwijder
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
