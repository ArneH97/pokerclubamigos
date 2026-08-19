import { ProfileForm } from "./profile-form";
import { Card, CardTitle, PageTitle } from "@/components/ui";
import { money, num } from "@/lib/format";
import { requireMember } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { MemberLedger } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfielPage() {
  const { member, user } = await requireMember();
  const supabase = await createClient();

  const { data } = await supabase
    .from("member_ledger")
    .select("*")
    .eq("member_id", member.id)
    .maybeSingle();

  const ledger = (data as MemberLedger | null) ?? null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle sub={user.email ?? undefined}>Jouw profiel</PageTitle>

      <Card>
        <ProfileForm nickname={member.nickname} />
      </Card>

      <div className="mt-6">
        <Card>
          <CardTitle>Jouw bijdrage</CardTitle>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              {
                k: "Bijgedragen",
                v: money(num(ledger?.bijgedragen)),
                d: "Alles wat jij al in de pot stak",
              },
              {
                k: "Nog te storten",
                v: money(num(ledger?.openstaand)),
                d: "Afrekening op het einde van het seizoen",
              },
              {
                k: "Al gestort",
                v: money(num(ledger?.gestort)),
                d: "Dat zit al in de kas",
              },
            ].map((item) => (
              <div key={item.k} className="bg-surface px-4 py-4">
                <dt className="text-xs text-ink-muted">{item.k}</dt>
                <dd className="mt-1 text-xl font-semibold text-ink">{item.v}</dd>
                <p className="mt-0.5 text-xs text-ink-muted">{item.d}</p>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
