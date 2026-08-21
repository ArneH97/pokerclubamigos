import Link from "next/link";
import {
  addCommentAction,
  deleteCommentAction,
  toggleLikeAction,
} from "@/app/(club)/prikbord/actions";
import { Avatar } from "@/components/avatar";
import { money, num, shortDate } from "@/lib/format";
import type { FeedItem, ResultComment } from "@/lib/types";

function displayName(c: ResultComment) {
  return c.members?.nickname?.trim() || c.members?.full_name || "Amigo";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "net";
  if (min < 60) return `${min} min`;
  const uur = Math.round(min / 60);
  if (uur < 24) return `${uur} u`;
  const dag = Math.round(uur / 24);
  if (dag < 7) return `${dag} d`;
  return new Date(iso).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "short",
  });
}

export function FeedCard({
  item,
  likedByMe,
  currentMemberId,
  isAdmin,
  comments = [],
  compact = false,
}: {
  item: FeedItem;
  likedByMe: boolean;
  currentMemberId: string;
  isAdmin: boolean;
  comments?: ResultComment[];
  compact?: boolean;
}) {
  const profit = num(item.profit);
  const won = profit > 0;
  // Eerste plaats is de echte winnaar; wie geld meenam zonder te winnen is
  // wel in the money geëindigd. Allebei feest, het ene net iets luider.
  const kampioen = item.finish_position === 1;
  const plaats = item.finish_position;

  return (
    <article className={`card relative overflow-hidden ${won ? "card-win" : ""}`}>
      {won ? (
        <>
          <div className="win-lint" aria-hidden />
          <Confetti />
        </>
      ) : null}

      <div className="relative p-5 sm:p-6">
        <header className="flex items-start gap-3">
          <Avatar name={item.display_name} id={item.member_id} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">
              {item.display_name}
              {item.member_id === currentMemberId ? (
                <span className="ml-2 rounded-full bg-s1/15 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
                  jij
                </span>
              ) : null}
            </p>
            <p className="text-xs text-ink-muted">
              {shortDate(item.played_on)} · {item.tournament?.trim() || item.venue}
              {item.finish_position ? ` · ${item.finish_position}e plaats` : ""}
            </p>
          </div>
          <span className="shrink-0 text-xs text-ink-muted">
            {timeAgo(item.created_at)}
          </span>
        </header>

        <p className="mt-4 text-lg text-ink">
          {won ? (
            <>
              cashte <strong>{money(item.cashout)}</strong> uit een buy-in van{" "}
              <strong>{money(item.buyin)}</strong>
            </>
          ) : (
            <>
              speelde voor <strong>{money(item.buyin)}</strong> en eindigde niet
              ITM
            </>
          )}
        </p>

        {won ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="win-badge inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold">
              <Trophy />
              {kampioen
                ? "Winnaar"
                : plaats
                  ? `${plaats}e plaats · ITM`
                  : "In the money"}
            </span>
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold text-ink tabular">
              +{money(profit)}
            </span>
          </div>
        ) : null}

        {item.note?.trim() ? (
          <p className="mt-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
            {item.note}
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-center">
          <div className="bg-surface px-2 py-3">
            <dt className="text-[11px] text-ink-muted">Buy-in</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink tabular">
              {money(item.buyin)}
            </dd>
          </div>
          <div className="bg-surface px-2 py-3">
            <dt className="text-[11px] text-ink-muted">Cash-out</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink tabular">
              {money(item.cashout)}
            </dd>
          </div>
          <div className={`px-2 py-3 ${won ? "bg-s4/12" : "bg-surface"}`}>
            <dt className="text-[11px] text-ink-muted">In de pot</dt>
            <dd className="mt-0.5 text-sm font-semibold text-ink tabular">
              {money(item.contribution)}
            </dd>
          </div>
        </dl>
      </div>

      <footer className="flex items-center gap-2 border-t border-line px-5 py-3 sm:px-6">
        <form action={toggleLikeAction}>
          <input type="hidden" name="result_id" value={item.id} />
          <input type="hidden" name="liked" value={String(likedByMe)} />
          <button
            aria-pressed={likedByMe}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              likedByMe
                ? "border-brand/40 bg-brand/10 text-ink"
                : "border-line text-ink-2 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <Heart filled={likedByMe} />
            <span className="tabular">{item.like_count}</span>
            <span className="sr-only">
              {likedByMe ? "Like weghalen" : "Liken"}
            </span>
          </button>
        </form>

        {compact ? (
          <Link
            href="/prikbord"
            className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink"
          >
            {item.comment_count} reactie{item.comment_count === 1 ? "" : "s"}
          </Link>
        ) : (
          <span className="text-sm text-ink-muted">
            {item.comment_count} reactie{item.comment_count === 1 ? "" : "s"}
          </span>
        )}
      </footer>

      {compact ? null : (
        <div className="border-t border-line bg-surface-2/60 px-5 py-4 sm:px-6">
          {comments.length > 0 ? (
            <ul className="mb-4 space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar name={displayName(c)} id={c.member_id} size="sm" />
                  <div className="min-w-0 flex-1 rounded-2xl bg-surface px-3.5 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">
                        {displayName(c)}
                      </p>
                      <span className="shrink-0 text-[11px] text-ink-muted">
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-2">
                      {c.body}
                    </p>
                    {c.member_id === currentMemberId || isAdmin ? (
                      <form action={deleteCommentAction} className="mt-1">
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-[11px] text-ink-muted underline underline-offset-2 hover:text-critical">
                          verwijderen
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <form action={addCommentAction} className="flex gap-2">
            <input type="hidden" name="result_id" value={item.id} />
            <input
              name="body"
              required
              maxLength={600}
              placeholder="Schrijf iets…"
              className="w-full rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-s1 focus:ring-2 focus:ring-s1/30"
            />
            <button className="shrink-0 rounded-full bg-s1 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
              Plaats
            </button>
          </form>
        </div>
      )}
    </article>
  );
}

function Trophy() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 text-s4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5v1a3.5 3.5 0 0 0 3 3.46" />
      <path d="M17 6h2.5v1a3.5 3.5 0 0 1-3 3.46" />
      <path d="M12 14v3.5" />
      <path d="M8.5 20.5h7" />
      <path d="M9.5 20.5c.4-1.9 1-3 2.5-3s2.1 1.1 2.5 3" />
    </svg>
  );
}

/**
 * Wat snippers in de rechterbovenhoek van een winnende post. Puur versiering,
 * dus verborgen voor schermlezers en niet aanklikbaar.
 */
function Confetti() {
  return (
    <svg
      viewBox="0 0 160 90"
      aria-hidden
      className="pointer-events-none absolute right-0 top-0 h-24 w-44 opacity-60"
      fill="none"
    >
      <rect x="18" y="14" width="7" height="3" rx="1.5" fill="var(--s2)" transform="rotate(-24 18 14)" />
      <rect x="52" y="30" width="6" height="3" rx="1.5" fill="var(--s1)" transform="rotate(38 52 30)" />
      <rect x="96" y="12" width="8" height="3" rx="1.5" fill="var(--brand)" transform="rotate(-14 96 12)" />
      <rect x="120" y="44" width="6" height="3" rx="1.5" fill="var(--s3)" transform="rotate(52 120 44)" />
      <rect x="140" y="18" width="7" height="3" rx="1.5" fill="var(--s4)" transform="rotate(-40 140 18)" />
      <rect x="74" y="56" width="6" height="3" rx="1.5" fill="var(--s5)" transform="rotate(20 74 56)" />
      <circle cx="38" cy="46" r="2.2" fill="var(--s4)" />
      <circle cx="112" cy="26" r="2" fill="var(--s5)" />
      <circle cx="150" cy="58" r="2.2" fill="var(--s2)" />
      <circle cx="66" cy="16" r="1.8" fill="var(--s3)" />
      <circle cx="88" cy="42" r="1.8" fill="var(--s1)" />
    </svg>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-4 w-4 ${filled ? "text-brand" : "text-ink-muted"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.5S3.5 15.2 3.5 9.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.5 2.1c0 5.8-8.5 11.1-8.5 11.1Z"
      />
    </svg>
  );
}
