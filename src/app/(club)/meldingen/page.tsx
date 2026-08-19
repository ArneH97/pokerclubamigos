import Link from "next/link";
import { after } from "next/server";
import { clearNotificationsAction, markAllReadAction } from "./actions";
import { Avatar } from "@/components/avatar";
import { Card, Empty, PageTitle, buttonGhostClass } from "@/components/ui";
import { money, num } from "@/lib/format";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function timeAgo(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
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

function tekst(n: NotificationItem) {
  const wie = n.actor_name ?? "Een Amigo";
  if (n.kind === "like") return `${wie} vindt jouw cash leuk.`;
  if (n.kind === "reactie")
    return `${wie} reageerde: “${(n.comment_body ?? "").slice(0, 140)}”`;
  return `${wie} cashte ${money(num(n.cashout))} en stak ${money(
    num(n.contribution),
  )} in de pot.`;
}

const DOT: Record<NotificationItem["kind"], string> = {
  nieuwe_cash: "bg-s2",
  like: "bg-brand",
  reactie: "bg-s1",
};

export default async function MeldingenPage() {
  const { member } = await requireMember();
  const supabase = await createClient();

  const { data } = await supabase
    .from("notification_feed")
    .select("*")
    .eq("member_id", member.id)
    .order("created_at", { ascending: false })
    .limit(80);

  const items = (data ?? []) as NotificationItem[];

  // Pas nadat de pagina verstuurd is op gelezen zetten, zodat je nog ziet
  // wat er nieuw was.
  after(async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("member_id", member.id)
      .eq("is_read", false);
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle sub="Wat er ondertussen gebeurd is bij de Amigo's.">
          Meldingen
        </PageTitle>
        {items.length > 0 ? (
          <div className="mb-6 flex gap-2">
            <form action={markAllReadAction}>
              <button className={buttonGhostClass}>Alles gelezen</button>
            </form>
            <form action={clearNotificationsAction}>
              <button className={buttonGhostClass}>Wissen</button>
            </form>
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <Card>
          <Empty>Nog geen meldingen. Zodra er iets gebeurt, zie je het hier.</Empty>
        </Card>
      ) : (
        <ul className="grid gap-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href="/prikbord"
                className={`flex items-start gap-3 rounded-2xl border p-4 transition hover:bg-surface-2 ${
                  n.is_read
                    ? "border-line bg-surface"
                    : "border-s1/30 bg-s1/6"
                }`}
              >
                <Avatar
                  name={n.actor_name ?? "Amigo"}
                  id={n.actor_id ?? n.id}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">{tekst(n)}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {timeAgo(n.created_at)}
                    {n.tournament?.trim() || n.venue
                      ? ` · ${n.tournament?.trim() || n.venue}`
                      : ""}
                  </p>
                </div>
                <span
                  aria-hidden
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.is_read ? "bg-transparent" : DOT[n.kind]
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
