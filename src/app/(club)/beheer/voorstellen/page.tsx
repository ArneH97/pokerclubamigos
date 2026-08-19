import { deleteProposalAction, setProposalStatusAction } from "../actions";
import { ProposalForm } from "../forms";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { money, num, shortDate } from "@/lib/format";
import { getActiveSeason, getClubTotals, requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSSEN: { waarde: Proposal["status"]; label: string }[] = [
  { waarde: "open", label: "open zetten" },
  { waarde: "gekozen", label: "dit wordt het" },
  { waarde: "gesloten", label: "afsluiten" },
];

export default async function BeheerVoorstellenPage() {
  await requireAdmin();
  const season = await getActiveSeason();
  const totals = await getClubTotals();

  if (!season) {
    return (
      <Card>
        <Empty>Maak eerst een seizoen aan bij Seizoen.</Empty>
      </Card>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("proposal_board")
    .select("*")
    .eq("season_id", season.id)
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false });

  const proposals = (data ?? []) as Proposal[];

  return (
    <>
      <PageTitle sub="Zet ideeën klaar, de groep stemt. Wat het wordt, beslis je hier.">
        Voorstellen
      </PageTitle>

      <Card>
        <CardTitle hint={`${money(num(totals.pot))} in de pot`}>
          Nieuw voorstel
        </CardTitle>
        <ProposalForm seasonId={season.id} />
      </Card>

      <div className="mt-6">
        <Card>
          <CardTitle hint={`${proposals.length}`}>Ingediend</CardTitle>

          {proposals.length === 0 ? (
            <Empty>Nog geen voorstellen.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {proposals.map((p) => (
                <li key={p.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {p.title}
                        <span className="ml-2 text-xs font-normal text-ink-muted">
                          {p.status}
                        </span>
                      </p>
                      <p className="text-xs text-ink-muted">
                        {num(p.votes)} stem{num(p.votes) === 1 ? "" : "men"} ·{" "}
                        {shortDate(p.created_at.slice(0, 10))}
                        {p.estimated_cost != null
                          ? ` · ${money(p.estimated_cost)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {STATUSSEN.filter((s) => s.waarde !== p.status).map((s) => (
                        <form key={s.waarde} action={setProposalStatusAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value={s.waarde} />
                          <button className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                            {s.label}
                          </button>
                        </form>
                      ))}
                      <form action={deleteProposalAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-xs text-ink-muted underline underline-offset-2 hover:text-critical">
                          weg
                        </button>
                      </form>
                    </div>
                  </div>

                  {p.description?.trim() ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink-2">
                      {p.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Notice>
          Zodra je een voorstel op <strong>dit wordt het</strong> zet, kan er
          niet meer op gestemd worden. Leg de kosten achteraf vast bij
          Activiteiten — dan gaat het geld af bij wie er effectief bij was.
        </Notice>
      </div>
    </>
  );
}
