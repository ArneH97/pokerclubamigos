import { toggleVoteAction } from "@/app/(club)/voorstellen/actions";
import { money, num } from "@/lib/format";
import type { Proposal } from "@/lib/types";

const STATUS: Record<
  Proposal["status"],
  { label: string; dot: string; chip: string }
> = {
  open: { label: "Stemmen loopt", dot: "bg-s1", chip: "bg-s1/12" },
  gekozen: { label: "Gekozen", dot: "bg-good", chip: "bg-good/12" },
  gesloten: { label: "Afgesloten", dot: "bg-ink-muted", chip: "bg-surface-2" },
};

/**
 * Eén voorstel met de stand van de stemming.
 * De balk toont het aandeel van de stemmen; het aantal staat er in cijfers
 * naast, zodat kleur nooit alleen de boodschap draagt.
 */
export function ProposalCard({
  proposal,
  votedByMe,
  totalMembers,
  maxVotes,
  leading,
}: {
  proposal: Proposal;
  votedByMe: boolean;
  totalMembers: number;
  maxVotes: number;
  leading: boolean;
}) {
  const votes = num(proposal.votes);
  const width = maxVotes > 0 ? Math.max((votes / maxVotes) * 100, votes > 0 ? 3 : 0) : 0;
  const status = STATUS[proposal.status];
  const open = proposal.status === "open";

  return (
    <article className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-ink">{proposal.title}</h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-ink ${status.chip}`}
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            {leading && open ? (
              <span className="rounded-full bg-s4/25 px-2.5 py-0.5 text-xs font-semibold text-ink">
                aan kop
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            Voorgesteld door {proposal.author ?? "de beheerder"}
            {proposal.estimated_cost != null
              ? ` · richtprijs ${money(proposal.estimated_cost)}`
              : ""}
          </p>
        </div>

        <form action={toggleVoteAction} className="shrink-0">
          <input type="hidden" name="proposal_id" value={proposal.id} />
          <input type="hidden" name="voted" value={String(votedByMe)} />
          <button
            disabled={!open}
            aria-pressed={votedByMe}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              votedByMe
                ? "border-s1/40 bg-s1/12 text-ink"
                : "border-line text-ink-2 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {votedByMe ? "✓ Jouw stem" : "Stem hierop"}
          </button>
        </form>
      </div>

      {proposal.description?.trim() ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
          {proposal.description}
        </p>
      ) : null}

      <div className="mt-5">
        <div className="h-2.5 w-full rounded-full bg-surface-2">
          <div
            className="h-full bg-s1"
            style={{
              width: `${width}%`,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted tabular">
          {votes} van {totalMembers} Amigo&apos;s
        </p>
      </div>
    </article>
  );
}
