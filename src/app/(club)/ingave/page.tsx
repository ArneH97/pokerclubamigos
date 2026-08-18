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
      <PageTitle sub="De site rekent zelf 10% van je winst uit en telt die bij de pot.">
        Resultaat ingeven
      </PageTitle>

      {season ? (
        <Card>
          <ResultForm today={today} />
        </Card>
      ) : (
        <Card>
          <Empty>
            Er loopt geen seizoen. De voorzitter moet er eerst een aanmaken.
          </Empty>
        </Card>
      )}

      <div className="mt-5">
        <Notice>
          Een fout ingegeven? Je kan je eigen ingave verwijderen bij{" "}
          <strong>Alle resultaten</strong>. De voorzitter kan alles corrigeren.
        </Notice>
      </div>
    </div>
  );
}
