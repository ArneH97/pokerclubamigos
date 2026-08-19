import { ResultForm } from "./result-form";
import { Card, Empty, Notice, PageTitle } from "@/components/ui";
import { getActiveSeason, requireMember } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function IngavePage() {
  await requireMember();
  const season = await getActiveSeason();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle sub="De site rekent zelf 10% van je winst af en telt die meteen bij de pot.">
        Resultaat ingeven
      </PageTitle>

      {season ? (
        <Card>
          <ResultForm today={today} />
        </Card>
      ) : (
        <Card>
          <Empty>
            Er loopt geen seizoen. De beheerder moet er eerst een aanmaken.
          </Empty>
        </Card>
      )}

      <div className="mt-5 space-y-3">
        <Notice>
          <strong>Je bijdrage staat meteen in de pot.</strong> Het geld zelf
          geef je door wanneer het uitkomt — vaak bij een etentje. Guido vinkt
          dan af dat hij het ontvangen heeft; de pot verandert daar niet van.
        </Notice>
        <Notice>
          Een fout ingegeven? Je kan je eigen ingave verwijderen op het
          prikbord, zolang Guido het geld nog niet afgevinkt heeft. De beheerder
          kan alles corrigeren.
        </Notice>
      </div>
    </div>
  );
}
