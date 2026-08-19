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

  return (
    <article className="card overflow-hidden">
      <div className="p-5 sm:p-6">
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
              speelde voor <strong>{money(item.buyin)}</strong> en kwam er niet
              door
            </>
          )}
        </p>

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
          <div className="bg-surface px-2 py-3">
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
