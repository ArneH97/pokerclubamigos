import type { ReactNode } from "react";

type Accent = "s1" | "s2" | "s3" | "s4" | "s7";

const dot: Record<Accent, string> = {
  s1: "bg-s1",
  s2: "bg-s2",
  s3: "bg-s3",
  s4: "bg-s4",
  s7: "bg-s7",
};

/**
 * Stat tile: label · waarde · optionele toelichting.
 * De accentkleur zit in het bolletje naast het label, nooit in de tekst zelf —
 * lichte tinten zoals geel en aqua zijn onleesbaar als tekstkleur.
 */
export function StatTile({
  label,
  value,
  detail,
  accent = "s1",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: Accent;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span aria-hidden className={`h-2.5 w-2.5 rounded-full ${dot[accent]}`} />
        <span className="text-sm text-ink-2">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink sm:text-[1.75rem]">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-ink-muted">{detail}</p> : null}
    </div>
  );
}
