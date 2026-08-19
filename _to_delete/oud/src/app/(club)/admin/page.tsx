import {
  adminDeleteResultAction,
  markMemberPaidAction,
  setMemberActiveAction,
  setMemberRoleAction,
  togglePaidAction,
} from "./actions";
import { InviteForm, SeasonForm } from "./forms";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { money, num, shortDate } from "@/lib/format";
import { getActiveSeason, requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardRow, Member, ResultWithMember } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { member: me } = await requireAdmin();
  const season = await getActiveSeason();
  const supabase = await createClient();

  const [{ data: memberData }, boardRes, resultsRes] = await Promise.all([
    supabase.from("members").select("*").order("full_name"),
    season
      ? supabase
          .from("leaderboard")
          .select("*")
          .eq("season_id", season.id)
          .order("contributed", { ascending: false })
      : Promise.resolve({ data: [] }),
    season
      ? supabase
          .from("results")
          .select("*, members(id, full_name, nickname)")
          .eq("season_id", season.id)
          .order("played_on", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
  ]);

  const members = (memberData ?? []) as Member[];
  const board = ((boardRes as { data: unknown }).data ?? []) as LeaderboardRow[];
  const results = ((resultsRes as { data: unknown }).data ?? []) as ResultWithMember[];

  const openPerMember = board
    .map((r) => ({ ...r, open: num(r.contributed) - num(r.paid) }))
    .filter((r) => r.open > 0.004);

  return (
    <>
      <PageTitle sub="Alleen jij en de andere beheerders zien deze pagina.">
        Beheer
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle hint="Ze krijgen een mail met een link">
            Lid uitnodigen
          </CardTitle>
          <InviteForm />
          <div className="mt-4">
            <Notice>
              Zit iemand al in je andere pokerapp op ditzelfde Supabase-project?
              Dan wordt er geen nieuwe uitnodiging verstuurd — die persoon krijgt
              gewoon toegang met het bestaande wachtwoord.
            </Notice>
          </div>
        </Card>

        <Card>
          <CardTitle hint={season ? "Actief seizoen" : "Nog geen seizoen"}>
            Seizoen en streefbedrag
          </CardTitle>
          <SeasonForm season={season} />
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardTitle hint={`${members.length} leden`}>Ledenlijst</CardTitle>
          {members.length === 0 ? (
            <Empty>Nog geen leden.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-muted">
                    <th scope="col" className="py-2 pr-3 font-medium">Naam</th>
                    <th scope="col" className="py-2 pr-3 font-medium">E-mail</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Rol</th>
                    <th scope="col" className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-line/70 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-ink">
                        {m.full_name}
                        {m.nickname ? (
                          <span className="text-ink-muted"> · {m.nickname}</span>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-2">{m.email}</td>
                      <td className="py-2.5 pr-3">
                        {m.id === me.id ? (
                          <span className="text-ink-2">beheerder (jij)</span>
                        ) : (
                          <form action={setMemberRoleAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input
                              type="hidden"
                              name="role"
                              value={m.role === "admin" ? "member" : "admin"}
                            />
                            <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                              {m.role === "admin" ? "beheerder" : "lid"} · wissel
                            </button>
                          </form>
                        )}
                      </td>
                      <td className="py-2.5">
                        {m.id === me.id ? (
                          <span className="text-ink-2">actief</span>
                        ) : (
                          <form action={setMemberActiveAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input
                              type="hidden"
                              name="is_active"
                              value={m.is_active ? "false" : "true"}
                            />
                            <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                              {m.is_active ? "actief · zet uit" : "inactief · zet aan"}
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {season ? (
        <>
          <div className="mt-6">
            <Card>
              <CardTitle hint="Vink af zodra het geld in de kas zit">
                Nog te innen
              </CardTitle>
              {openPerMember.length === 0 ? (
                <Empty>Alles is betaald. Netjes.</Empty>
              ) : (
                <ul className="divide-y divide-line">
                  {openPerMember.map((r) => (
                    <li
                      key={r.member_id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {r.display_name}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {money(num(r.paid))} van {money(num(r.contributed))}{" "}
                          ontvangen
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink tabular">
                          {money(r.open)}
                        </span>
                        <form action={markMemberPaidAction}>
                          <input type="hidden" name="member_id" value={r.member_id} />
                          <input type="hidden" name="season_id" value={season.id} />
                          <button className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface-2">
                            Alles ontvangen
                          </button>
                        </form>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardTitle hint="Laatste 50">Ingaves corrigeren</CardTitle>
              {results.length === 0 ? (
                <Empty>Nog geen ingaves dit seizoen.</Empty>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs text-ink-muted">
                        <th scope="col" className="py-2 pr-3 font-medium">Datum</th>
                        <th scope="col" className="py-2 pr-3 font-medium">Lid</th>
                        <th scope="col" className="py-2 pr-3 text-right font-medium">Buy-in</th>
                        <th scope="col" className="py-2 pr-3 text-right font-medium">Cash-out</th>
                        <th scope="col" className="py-2 pr-3 text-right font-medium">In de pot</th>
                        <th scope="col" className="py-2 font-medium">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.id} className="border-b border-line/70 last:border-0">
                          <td className="whitespace-nowrap py-2.5 pr-3 text-ink-2 tabular">
                            {shortDate(r.played_on)}
                          </td>
                          <td className="py-2.5 pr-3 text-ink">
                            {r.members?.nickname?.trim() || r.members?.full_name}
                          </td>
                          <td className="py-2.5 pr-3 text-right text-ink-2 tabular">
                            {money(num(r.buyin))}
                          </td>
                          <td className="py-2.5 pr-3 text-right text-ink-2 tabular">
                            {money(num(r.cashout))}
                          </td>
                          <td className="py-2.5 pr-3 text-right font-semibold text-ink tabular">
                            {money(num(r.contribution))}
                          </td>
                          <td className="py-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <form action={togglePaidAction}>
                                <input type="hidden" name="id" value={r.id} />
                                <input
                                  type="hidden"
                                  name="is_paid"
                                  value={r.is_paid ? "false" : "true"}
                                />
                                <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                                  {r.is_paid ? "betaald · maak open" : "open · vink af"}
                                </button>
                              </form>
                              <form action={adminDeleteResultAction}>
                                <input type="hidden" name="id" value={r.id} />
                                <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-critical">
                                  verwijder
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}
