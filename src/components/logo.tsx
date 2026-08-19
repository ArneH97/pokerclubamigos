/**
 * Het clubmerk: een rode pokerfiche naast "Amigo's" in handschrift, met een
 * streep eronder alsof iemand het er snel bij heeft gezet.
 */
export function Logo({
  size = "md",
  withDe = true,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  withDe?: boolean;
}) {
  const woord = {
    sm: "text-[1.6rem]",
    md: "text-[2.1rem]",
    lg: "text-5xl sm:text-6xl",
    xl: "text-6xl sm:text-8xl",
  }[size];

  const chip = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12 sm:h-14 sm:w-14",
    xl: "h-16 w-16 sm:h-20 sm:w-20",
  }[size];

  const de = {
    sm: "text-[0.55rem]",
    md: "text-[0.62rem]",
    lg: "text-[0.7rem] sm:text-xs",
    xl: "text-xs sm:text-sm",
  }[size];

  const streep = size === "lg" || size === "xl";

  return (
    <span className="inline-flex items-center gap-2.5 leading-none sm:gap-3">
      <Chip className={`${chip} shrink-0`} />

      <span className="inline-flex flex-col leading-none">
        {withDe ? (
          <span
            className={`${de} mb-0.5 font-semibold uppercase tracking-[0.3em] text-ink-2`}
          >
            De
          </span>
        ) : null}

        <span className="relative inline-block">
          <span
            className={`${woord} block font-bold text-brand`}
            style={{
              fontFamily: "var(--font-hand)",
              transform: "rotate(-2deg)",
              transformOrigin: "left center",
            }}
          >
            Amigo&apos;s
          </span>

          {streep ? (
            <svg
              viewBox="0 0 200 12"
              aria-hidden
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 h-2 w-full text-brand/45"
            >
              <path
                d="M3 8.5C42 3.6 88 2.4 128 4.2c24 1.1 46 3 69 5.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          ) : null}
        </span>
      </span>
    </span>
  );
}

/** Pokerfiche met inkepingen en een schoppen in het midden. */
export function Chip({ className = "" }: { className?: string }) {
  const inkepingen = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <circle cx="24" cy="24" r="23" className="fill-brand" />

      {inkepingen.map((hoek) => (
        <rect
          key={hoek}
          x="21.7"
          y="2.6"
          width="4.6"
          height="5.8"
          rx="1.5"
          className="fill-surface"
          transform={`rotate(${hoek} 24 24)`}
        />
      ))}

      <circle
        cx="24"
        cy="24"
        r="16.2"
        fill="none"
        className="stroke-surface"
        strokeWidth="1.6"
        opacity="0.55"
      />

      <path
        className="fill-surface"
        d="M24 12.6c-.2 0-.4.1-.55.24C22.3 14.2 17.2 17.4 17.2 21.4c0 2.2 1.7 3.8 3.75 3.8.94 0 1.75-.3 2.36-.82-.17 1.58-.84 3-1.84 3.85-.3.25-.12.78.28.78h4.5c.4 0 .58-.53.28-.78-1-.85-1.67-2.27-1.84-3.85.61.52 1.42.82 2.36.82 2.06 0 3.75-1.6 3.75-3.8 0-4-5.1-7.2-6.25-8.56a.72.72 0 0 0-.55-.24Z"
      />
    </svg>
  );
}

/** Los schoppensymbool, voor accenten. */
export function Spade({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 2.2c-.3 0-.6.13-.82.36C9.5 4.34 3.4 8.2 3.4 13.02c0 2.66 2.03 4.6 4.5 4.6 1.13 0 2.1-.36 2.83-.98-.2 1.9-1 3.6-2.2 4.62-.36.3-.15.94.33.94h6.28c.48 0 .69-.63.33-.94-1.2-1.03-2-2.72-2.2-4.62.73.62 1.7.98 2.83.98 2.47 0 4.5-1.94 4.5-4.6 0-4.83-6.1-8.68-7.78-10.46A1.14 1.14 0 0 0 12 2.2Z" />
    </svg>
  );
}
