import { money, moneyShort } from "@/lib/format";

/**
 * De pot tegenover het spaardoel.
 * Hero-cijfer + één meter: gevulde balk in het accent, lege track in een
 * lichtere stap van dezelfde blauwe ramp, zodat de stand over de hele balk
 * leesbaar blijft. Bereikt hij het doel, dan schakelt de vulling naar groen
 * mét label — kleur draagt de boodschap nooit alleen.
 */
export function PotMeter({
  pot,
  pending,
  target,
  seasonName,
}: {
  /** Wat er effectief in de kas zit: de som van alle saldo's. */
  pot: number;
  /** Bijdragen die nog gestort moeten worden. */
  pending: number;
  target: number;
  seasonName: string;
}) {
  const safeTarget = target > 0 ? target : 0;
  const pct = safeTarget > 0 ? Math.min((pot / safeTarget) * 100, 100) : 0;
  const reached = safeTarget > 0 && pot >= safeTarget;
  const remaining = Math.max(safeTarget - pot, 0);

  return (
    <section className="card overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-ink-2">
            In de pot · {seasonName}
          </p>
          {reached ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-good/12 px-3 py-1 text-xs font-semibold text-ink">
              <span
                aria-hidden
                className="grid h-4 w-4 place-items-center rounded-full bg-good text-[10px] text-white"
              >
                ✓
              </span>
              Spaardoel gehaald
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          {money(pot)}
        </p>
        <p className="mt-1.5 text-sm text-ink-2">
          {safeTarget > 0 ? (
            <>
              van {moneyShort(safeTarget)} spaardoel
              {reached ? null : <> · nog {money(remaining)} te gaan</>}
            </>
          ) : (
            <>Nog geen spaardoel ingesteld</>
          )}
        </p>

        <div
          className="mt-6"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={safeTarget || 100}
          aria-valuenow={Math.round(pot)}
          aria-valuetext={`${money(pot)} van ${money(safeTarget)}`}
          aria-label="Voortgang van de clubkas"
        >
          <div className="h-6 w-full overflow-hidden rounded-full bg-track">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                reached ? "bg-good" : "bg-s1"
              }`}
              style={{ width: `${Math.max(pct, pot > 0 ? 2 : 0)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-ink-muted tabular">
            <span>{moneyShort(0)}</span>
            <span className="font-semibold text-ink-2">{Math.round(pct)}%</span>
            <span>{safeTarget > 0 ? moneyShort(safeTarget) : "—"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
        <div className="bg-surface px-6 py-4">
          <p className="text-xs text-ink-muted">Nog te storten door de leden</p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {money(pending)}
          </p>
        </div>
        <div className="bg-surface px-6 py-4">
          <p className="text-xs text-ink-muted">Samen straks</p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {money(pot + pending)}
          </p>
        </div>
      </div>
    </section>
  );
}
