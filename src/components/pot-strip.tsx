import Link from "next/link";
import { money, moneyShort } from "@/lib/format";

/**
 * Smalle stand van de pot, bovenaan het prikbord.
 * Zelfde ramp als de grote meter: gevulde balk in het accent, lege track in
 * een lichtere stap van hetzelfde blauw.
 */
export function PotStrip({
  pot,
  target,
  seasonName,
}: {
  pot: number;
  target: number;
  seasonName: string;
}) {
  const safeTarget = target > 0 ? target : 0;
  const pct = safeTarget > 0 ? Math.min((pot / safeTarget) * 100, 100) : 0;
  const reached = safeTarget > 0 && pot >= safeTarget;

  return (
    <Link
      href="/dashboard"
      className="card block p-4 transition hover:bg-surface-2 sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-xs text-ink-muted">In de pot · {seasonName}</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {money(pot)}
          </p>
        </div>
        <p className="text-sm text-ink-2">
          {safeTarget > 0 ? (
            reached ? (
              <span className="font-semibold">Spaardoel gehaald</span>
            ) : (
              <>
                nog {money(safeTarget - pot)} tot {moneyShort(safeTarget)}
              </>
            )
          ) : (
            <>geen spaardoel ingesteld</>
          )}
        </p>
      </div>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTarget || 100}
        aria-valuenow={Math.round(pot)}
        aria-label="Stand van de clubkas"
      >
        <div
          className={`h-full rounded-full ${reached ? "bg-good" : "bg-s1"}`}
          style={{ width: `${Math.max(pct, pot > 0 ? 2 : 0)}%` }}
        />
      </div>
    </Link>
  );
}
