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
      <PageTitle sub="De site rekent zelf 10% van je winst af voor de pot. Betalen doe je niet nu.">
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
          <strong>Je hoeft nu niets te storten.</strong> Alles wordt bijgehouden
          en op het einde van het seizoen krijg je één afrekening met wat er van
          jou in de pot hoort. Dat bedrag stort je dan in één keer.
        </Notice>
        <Notice>
          Een fout ingegeven? Je kan je eigen ingave verwijderen op het
          prikbord, zolang ze nog niet als betaald staat. De beheerder kan alles
          corrigeren.
        </Notice>
      </div>
    </div>
  );
}
