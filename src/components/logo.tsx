/**
 * Woordmerk van de club: "De Amigo's" met Amigo's in clubrood,
 * met een schoppensymbool als accent.
 */
export function Logo({
  size = "md",
  withDe = true,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  withDe?: boolean;
}) {
  const word = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl sm:text-5xl",
    xl: "text-5xl sm:text-7xl",
  }[size];

  const de = {
    sm: "text-[0.6rem]",
    md: "text-[0.7rem]",
    lg: "text-xs sm:text-sm",
    xl: "text-sm sm:text-base",
  }[size];

  const pip = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6 sm:h-7 sm:w-7",
    xl: "h-8 w-8 sm:h-10 sm:w-10",
  }[size];

  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <Spade className={`${pip} shrink-0 text-brand`} />
      <span className="inline-flex flex-col leading-none">
        {withDe ? (
          <span
            className={`${de} font-semibold uppercase tracking-[0.28em] text-ink-2`}
          >
            De
          </span>
        ) : null}
        <span
          className={`${word} font-black tracking-tight text-brand`}
          style={{ letterSpacing: "-0.02em" }}
        >
          Amigo&apos;s
        </span>
      </span>
    </span>
  );
}

export function Spade({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 2.2c-.3 0-.6.13-.82.36C9.5 4.34 3.4 8.2 3.4 13.02c0 2.66 2.03 4.6 4.5 4.6 1.13 0 2.1-.36 2.83-.98-.2 1.9-1 3.6-2.2 4.62-.36.3-.15.94.33.94h6.28c.48 0 .69-.63.33-.94-1.2-1.03-2-2.72-2.2-4.62.73.62 1.7.98 2.83.98 2.47 0 4.5-1.94 4.5-4.6 0-4.83-6.1-8.68-7.78-10.46A1.14 1.14 0 0 0 12 2.2Z" />
    </svg>
  );
}
