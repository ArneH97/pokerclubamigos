import { ProposalCard } from "@/components/proposal-card";
import { Card, Empty, Notice, PageTitle } from "@/components/ui";
import { money, num } from "@/lib/format";
import { getActiveSeason, getClubTotals, requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VoorstellenPage() {
  const { member } = await requireMember();
  const season = await getActiveSeason();

  if (!season) {
    return (
      <Card>
        <Empty>Er loopt nog geen seizoen.</Empty>
      </Card>
    );
  }

  const supabase = await createClient();
  const totals = await getClubTotals();

  const [{ data: proposalData }, { data: voteData }, { count: memberCount }] =
    await Promise.all([
      supabase
        .from("proposal_board")
        .select("*")
        .eq("season_id", season.id)
        .order("votes", { ascending: false })
        .order("created_at", { ascending: true }),
      supabase
        .from("proposal_votes")
        .select("proposal_id")
        .eq("member_id", member.id),
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  const proposals = (proposalData ?? []) as Proposal[];
  const voted = new Set(
    ((voteData ?? []) as { proposal_id: string }[]).map((v) => v.proposal_id),
  );

  const open = proposals.filter((p) => p.status === "open");
  const rest = proposals.filter((p) => p.status !== "open");
  const maxVotes = Math.max(...open.map((p) => num(p.votes)), 0);

  return (
    <>
      <PageTitle sub="Wat doen we met de pot? Stem op wat jou het beste lijkt — je mag op meerdere ideeën stemmen.">
        Voorstellen
      </PageTitle>

      <div className="mb-6">
        <Notice>
          Er zit momenteel <strong>{money(num(totals.pot))}</strong> in de pot.
          De beheerders zetten de voorstellen klaar; de groep beslist.
        </Notice>
      </div>

      {proposals.length === 0 ? (
        <Card>
          <Empty>
            Er staan nog geen voorstellen klaar. Heb je een idee? Zeg het tegen
            Arne of Guido.
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-4">
          {open.map((p, i) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              votedByMe={voted.has(p.id)}
              totalMembers={memberCount ?? 0}
              maxVotes={maxVotes}
              leading={i === 0 && num(p.votes) > 0}
            />
          ))}

          {rest.length > 0 ? (
            <>
              <h2 className="mt-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
                Afgehandeld
              </h2>
              {rest.map((p) => (
                <ProposalCard
                  key={p.id}
                  proposal={p}
                  votedByMe={voted.has(p.id)}
                  totalMembers={memberCount ?? 0}
                  maxVotes={Math.max(...rest.map((x) => num(x.votes)), 1)}
                  leading={false}
                />
              ))}
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
