const TINTS = [
  "bg-s1/18",
  "bg-s2/18",
  "bg-s3/18",
  "bg-s4/22",
  "bg-s5/20",
  "bg-s7/18",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Rond schijfje met initialen. De tint hoort bij de persoon, niet bij de plaats in een lijst. */
export function Avatar({
  name,
  id,
  size = "md",
}: {
  name: string;
  id: string;
  size?: "sm" | "md";
}) {
  const tint =
    TINTS[
      Math.abs(
        [...id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7),
      ) % TINTS.length
    ];

  const box = size === "sm" ? "h-7 w-7 text-[11px]" : "h-10 w-10 text-sm";

  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full font-bold text-ink ${tint} ${box}`}
    >
      {initials(name)}
    </span>
  );
}
