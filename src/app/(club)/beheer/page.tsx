import {
  adminDeleteResultAction,
  deleteMemberAdjustmentAction,
  markMemberPaidAction,
  togglePaidAction,
} from "./actions";
import { ShareRowForm } from "./forms";
import { StatTile } from "@/components/stat-tile";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { money, num, shortDate } from "@/lib/format";
import { getActiveSeason, getClubTotals, requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type {
  MemberAdjustment,
  MemberLedger,
  ResultWithMember,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FinancienPage() {
  await requireAdmin();
  const season = await getActiveSeason();
  const totals = await getClubTotals();
  const supabase = await createClient();

  const [{ data: ledgerData }, { data: adjustmentData }, resultRes] =
    await Promise.all([
      supabase
        .from("member_ledger")
        .select("*")
        .order("display_name"),
      supabase
        .from("member_adjustments")
        .select("*, members(id, full_name, nickname)")
        .order("created_at", { ascending: false })
        .limit(20),
      season
        ? supabase
            .from("results")
            .select("*, members(id, full_name, nickname)")
            .eq("season_id", season.id)
            .order("played_on", { ascending: false })
            .limit(40)
        : Promise.resolve({ data: [] }),
    ]);

  const ledger = ((ledgerData ?? []) as MemberLedger[]).filter(
    (m) => m.is_active || num(m.aandeel) !== 0 || num(m.openstaand) !== 0,
  );
  const adjustments = (adjustmentData ?? []) as (MemberAdjustment & {
    members: { full_name: string; nickname: string | null } | null;
  })[];
  const results = ((resultRes as { data?: unknown })?.data ??
    []) as ResultWithMember[];

  return (
    <>
      <PageTitle sub="Eén pot. Een bijdrage telt mee zodra ze ingegeven is; of het geld al bij jou geraakt is, hou je er los van bij.">
        Financiën
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="In de pot"
          value={money(num(totals.pot))}
          detail="Alle bijdragen samen, betaald of niet"
          accent="s1"
        />
        <StatTile
          label="Al binnen"
          value={money(num(totals.pot) - num(totals.openstaand))}
          detail="Geld dat effectief bij jou zit"
          accent="s3"
        />
        <StatTile
          label="Nog te ontvangen"
          value={money(num(totals.openstaand))}
          detail="Moet nog fysiek doorgegeven worden"
          accent="s2"
        />
        <StatTile
          label="Actieve leden"
          value={`${num(totals.leden)}`}
          detail={season ? season.name : "Geen seizoen"}
          accent="s7"
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardTitle hint={`Samen ${money(num(totals.pot))}`}>
            Aandeel per Amigo
          </CardTitle>

          <div className="mb-4">
            <Notice>
              Hier neem je de Excel over: typ per Amigo wat er nu voor hem in het
              potje zit en klik <strong>zet</strong>. Verder loopt het vanzelf —
              elke ingegeven bijdrage komt erbij, elke activiteit gaat eraf.
            </Notice>
          </div>

          {ledger.length === 0 ? (
            <Empty>Nog geen leden.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-muted">
                    <th scope="col" className="py-2 pr-3 font-medium">Amigo</th>
                    <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">
                      Aandeel in de pot
                    </th>
                    <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">
                      Nog te ontvangen
                    </th>
                    <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">
                      Al ontvangen
                    </th>
                    <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">
                      Verbruikt
                    </th>
                    <th scope="col" className="py-2 font-medium">Afrekening</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((m) => (
                    <tr key={m.member_id} className="border-b border-line/70 align-top last:border-0">
                      <td className="py-3 pr-3">
                        <span className="font-medium text-ink">{m.display_name}</span>
                        {m.is_active ? null : (
                          <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted">
                            non-actief
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <ShareRowForm memberId={m.member_id} current={num(m.aandeel)} />
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-right text-ink-2 tabular">
                        {money(m.openstaand)}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-right text-ink-2 tabular">
                        {money(m.ontvangen)}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-right text-ink-2 tabular">
                        {money(m.verbruikt)}
                      </td>
                      <td className="py-3">
                        {num(m.openstaand) > 0 && season ? (
                          <form action={markMemberPaidAction}>
                            <input type="hidden" name="member_id" value={m.member_id} />
                            <input type="hidden" name="season_id" value={season.id} />
                            <button className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                              heb ik ontvangen
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-ink-muted">—</span>
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

      <div className="mt-6">
        <Card>
          <CardTitle hint="Laatste 20">Handmatige aanpassingen</CardTitle>
          {adjustments.length === 0 ? (
            <Empty>Nog geen aanpassingen.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {adjustments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {a.members?.nickname?.trim() || a.members?.full_name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {a.reason} · {shortDate(a.created_at.slice(0, 10))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-sm font-semibold tabular ${
                        num(a.amount) < 0 ? "text-critical" : "text-ink"
                      }`}
                    >
                      {num(a.amount) > 0 ? "+" : ""}
                      {money(a.amount)}
                    </span>
                    <form action={deleteMemberAdjustmentAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-xs text-ink-muted underline underline-offset-2 hover:text-critical">
                        terugdraaien
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {season ? (
        <div className="mt-6">
          <Card>
            <CardTitle hint="Laatste 40">Ingaves corrigeren</CardTitle>
            {results.length === 0 ? (
              <Empty>Nog geen ingaves dit seizoen.</Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs text-ink-muted">
                      <th scope="col" className="py-2 pr-3 font-medium">Datum</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Amigo</th>
                      <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">Buy-in</th>
                      <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">Cash-out</th>
                      <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">In de pot</th>
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
                        <td className="whitespace-nowrap py-2.5 pr-3 text-right text-ink-2 tabular">
                          {money(num(r.buyin))}
                        </td>
                        <td className="whitespace-nowrap py-2.5 pr-3 text-right text-ink-2 tabular">
                          {money(num(r.cashout))}
                        </td>
                        <td className="whitespace-nowrap py-2.5 pr-3 text-right font-semibold text-ink tabular">
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
                              <button className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                                {r.is_paid ? "ontvangen · maak open" : "open · vink af"}
                              </button>
                            </form>
                            <form action={adminDeleteResultAction}>
                              <input type="hidden" name="id" value={r.id} />
                              <button className="text-xs font-medium text-ink-muted underline underline-offset-2 hover:text-critical">
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
      ) : null}
    </>
  );
}
