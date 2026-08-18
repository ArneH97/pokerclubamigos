import { money, num, signedMoney } from "@/lib/format";
import type { LeaderboardRow } from "@/lib/types";

/**
 * Ranking op bijdrage aan de pot.
 * Eén reeks, dus één kleur en geen legende: de balk toont de verhouding,
 * de kolom ernaast het exacte bedrag. De tabel zelf is meteen de
 * toegankelijke weergave van de grafiek.
 */
export function LeaderboardTable({
  rows,
  highlightId,
  compact = false,
}: {
  rows: LeaderboardRow[];
  highlightId?: string;
  compact?: boolean;
}) {
  const max = Math.max(...rows.map((r) => num(r.contributed)), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Leaderboard: bijdrage aan de clubkas per lid
        </caption>
        <thead>
          <tr className="border-b border-line text-left text-xs text-ink-muted">
            <th scope="col" className="w-10 py-2 pr-2 font-medium">
              #
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Lid
            </th>
            <th scope="col" className="whitespace-nowrap py-2 pr-3 font-medium">
              Bijdrage aan de pot
            </th>
            <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">
              Bedrag
            </th>
            {compact ? null : (
              <>
                <th scope="col" className="whitespace-nowrap py-2 pr-3 text-right font-medium">
                  In the money
                </th>
                <th scope="col" className="whitespace-nowrap py-2 text-right font-medium">
                  Winst
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const value = num(row.contributed);
            const width = Math.max((value / max) * 100, value > 0 ? 3 : 0);
            const isMe = row.member_id === highlightId;

            return (
              <tr
                key={row.member_id}
                className={`border-b border-line/70 last:border-0 ${
                  isMe ? "bg-s1/6" : ""
                }`}
              >
                <td className="py-2.5 pr-2">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold tabular ${
                      i === 0
                        ? "bg-s4/25 text-ink"
                        : i === 1
                          ? "bg-ink-muted/25 text-ink"
                          : i === 2
                            ? "bg-s2/20 text-ink"
                            : "text-ink-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="font-medium text-ink">
                    {row.display_name}
                  </span>
                  {isMe ? (
                    <span className="ml-2 rounded-full bg-s1/15 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
                      jij
                    </span>
                  ) : null}
                </td>
                <td className="py-2.5 pr-3">
                  {/* 10px balk, afgeronde punt aan het uiteinde, vlak aan de nullijn */}
                  <div className="h-2.5 w-full min-w-24 max-w-56 rounded-l-none bg-surface-2">
                    <div
                      className="h-full bg-s1"
                      style={{
                        width: `${width}%`,
                        borderTopRightRadius: 4,
                        borderBottomRightRadius: 4,
                      }}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap py-2.5 pr-3 text-right font-semibold text-ink tabular">
                  {money(value)}
                </td>
                {compact ? null : (
                  <>
                    <td className="whitespace-nowrap py-2.5 pr-3 text-right text-ink-2 tabular">
                      {row.cashes}
                      <span className="text-ink-muted"> / {row.entries}</span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-right text-ink-2 tabular">
                      {signedMoney(row.profit)}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
