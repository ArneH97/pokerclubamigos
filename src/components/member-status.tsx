export type LidStatus = "actief" | "aangemeld" | "uitgenodigd";

const STATUS: Record<
  LidStatus,
  { label: string; kort: string; dot: string; chip: string; uitleg: string }
> = {
  actief: {
    label: "Actief lid",
    kort: "actief",
    dot: "bg-good",
    chip: "bg-good/12",
    uitleg: "Spelernaam gekozen, alles in orde.",
  },
  aangemeld: {
    label: "Profiel nog niet af",
    kort: "half",
    dot: "bg-warning",
    chip: "bg-warning/18",
    uitleg: "Wel al aangemeld, maar nog geen spelernaam gekozen.",
  },
  uitgenodigd: {
    label: "Nog niet aangemeld",
    kort: "wacht",
    dot: "bg-ink-muted",
    chip: "bg-surface-2",
    uitleg: "De uitnodiging is nog niet geopend.",
  },
};

/** Bepaalt in welke fase een lid zit. */
export function bepaalStatus({
  heeftNickname,
  laatsteAanmelding,
}: {
  heeftNickname: boolean;
  laatsteAanmelding: string | null;
}): LidStatus {
  if (heeftNickname) return "actief";
  if (laatsteAanmelding) return "aangemeld";
  return "uitgenodigd";
}

export function StatusChip({ status }: { status: LidStatus }) {
  const s = STATUS[status];
  return (
    <span
      title={s.uitleg}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium text-ink ${s.chip}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export const STATUS_LABELS = STATUS;
