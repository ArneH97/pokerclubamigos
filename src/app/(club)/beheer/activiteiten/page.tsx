import {
  deleteActivityAction,
  removeChargeAction,
  updateChargeAction,
} from "../actions";
import { ActivityForm } from "../forms";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { money, num, shortDate } from "@/lib/format";
import { getClubTotals, requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Activity, MemberLedger } from "@/lib/types";

export const dynamic = "force-dynamic";

type Charge = {
  activity_id: string;
  member_id: string;
  amount: number;
  members: { full_name: string; nickname: string | null } | null;
};

export default async function ActiviteitenPage() {
  await requireAdmin();
  const totals = await getClubTotals();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: ledgerData }, { data: activityData }, { data: chargeData }] =
    await Promise.all([
      supabase
        .from("member_ledger")
        .select("*")
        .eq("is_active", true)
        .order("display_name"),
      supabase
        .from("activity_board")
        .select("*")
        .order("happened_on", { ascending: false })
        .limit(25),
      supabase.from("activity_charges").select("*, members(full_name, nickname)"),
    ]);

  const members = (ledgerData ?? []) as MemberLedger[];
  const activities = (activityData ?? []) as Activity[];
  const charges = ((chargeData ?? []) as Charge[]).reduce<
    Record<string, Charge[]>
  >((acc, c) => {
    (acc[c.activity_id] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <PageTitle sub={`Er zit ${money(num(totals.pot))} in de pot.`}>
        Activiteiten
      </PageTitle>

      <Card>
        <CardTitle>Nieuwe activiteit</CardTitle>
        <ActivityForm members={members} today={today} />
        <div className="mt-4">
          <Notice>
            De kost gaat uit de pot, maar het geld van wie er niet bij was blijft
            gewoon staan voor de volgende keer. Onder de aanwezigen wordt naar
            verhouding aangesproken — het blijft één pot, dus die verdeling zie
            je verder nergens terug.
          </Notice>
        </div>
      </Card>

      <div className="mt-6 grid gap-4">
        {activities.length === 0 ? (
          <Card>
            <Empty>Nog geen activiteiten vastgelegd.</Empty>
          </Card>
        ) : (
          activities.map((a) => {
            const regels = (charges[a.id] ?? []).sort(
              (x, y) => num(y.amount) - num(x.amount),
            );
            const buiten =
              Math.round((num(a.total_cost) - num(a.uit_de_pot)) * 100) / 100;

            return (
              <Card key={a.id}>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-ink">{a.name}</h2>
                    <p className="text-xs text-ink-muted">
                      {shortDate(a.happened_on)} · kost {money(a.total_cost)} ·{" "}
                      {money(a.uit_de_pot)} uit de pot · {a.participants} aanwezig
                    </p>
                    {a.note?.trim() ? (
                      <p className="mt-2 text-sm text-ink-2">{a.note}</p>
                    ) : null}
                  </div>
                  <form action={deleteActivityAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-critical">
                      terugdraaien
                    </button>
                  </form>
                </div>

                {buiten > 0.004 ? (
                  <div className="mb-4">
                    <Notice tone="error">
                      {money(buiten)} van de kost kon niet uit de pot komen — dat
                      deel is buiten de pot betaald.
                    </Notice>
                  </div>
                ) : null}

                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-medium text-ink-2 underline underline-offset-4 hover:text-ink">
                    Bekijk wat er per Amigo uit de pot ging
                  </summary>

                  <ul className="mt-3 divide-y divide-line">
                    {regels.map((c) => (
                      <li
                        key={c.member_id}
                        className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                      >
                        <span className="text-sm text-ink">
                          {c.members?.nickname?.trim() || c.members?.full_name}
                        </span>

                        <div className="flex items-center gap-2">
                          <form
                            action={updateChargeAction}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="activity_id" value={a.id} />
                            <input type="hidden" name="member_id" value={c.member_id} />
                            <div className="relative">
                              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                                €
                              </span>
                              <input
                                name="amount"
                                inputMode="decimal"
                                defaultValue={num(c.amount).toFixed(2)}
                                className="w-24 rounded-xl border border-line bg-surface py-1.5 pl-6 pr-2 text-right text-sm text-ink tabular outline-none focus:border-s1"
                              />
                            </div>
                            <button className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                              zet
                            </button>
                          </form>

                          <form action={removeChargeAction}>
                            <input type="hidden" name="activity_id" value={a.id} />
                            <input type="hidden" name="member_id" value={c.member_id} />
                            <button className="text-xs text-ink-muted underline underline-offset-2 hover:text-critical">
                              weg
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
