/** Vier gekleurde chips die "De Amigo's" markeren. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const chip = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const offset = size === "lg" ? "-ml-3" : "-ml-2";

  return (
    <span className="inline-flex items-center" aria-hidden>
      <span className={`${chip} rounded-full bg-s1 ring-2 ring-surface`} />
      <span className={`${chip} ${offset} rounded-full bg-s2 ring-2 ring-surface`} />
      <span className={`${chip} ${offset} rounded-full bg-s4 ring-2 ring-surface`} />
      <span className={`${chip} ${offset} rounded-full bg-s3 ring-2 ring-surface`} />
    </span>
  );
}
