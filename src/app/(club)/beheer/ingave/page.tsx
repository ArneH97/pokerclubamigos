import { RetroResultForm } from "../forms";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { getActiveSeason, requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BeheerIngavePage() {
  await requireAdmin();
  const season = await getActiveSeason();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("is_active", true)
    .order("full_name");
  const members = (data ?? []) as Member[];

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle sub="Een cash ingeven namens een Amigo, ook van vroeger dit jaar.">
        Cash toevoegen
      </PageTitle>

      {season ? (
        <Card>
          <CardTitle hint={season.name}>Resultaat</CardTitle>
          <RetroResultForm members={members} seasonId={season.id} today={today} />
        </Card>
      ) : (
        <Card>
          <Empty>Maak eerst een seizoen aan bij Seizoen.</Empty>
        </Card>
      )}

      <div className="mt-5">
        <Notice>
          Gebruik dit om de cashes van vóór de site in te halen. Vink
          &apos;zit al in de kas&apos; aan als dat geld al betaald is — anders
          komt het bij het openstaande bedrag van dat lid.
        </Notice>
      </div>
    </div>
  );
}
