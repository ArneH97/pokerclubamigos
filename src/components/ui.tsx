import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function CardTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function PageTitle({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {children}
      </h1>
      {sub ? <p className="mt-1 text-sm text-ink-2">{sub}</p> : null}
    </header>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-2">
      {children}
    </p>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink outline-none transition placeholder:text-ink-muted focus:border-s1 focus:ring-2 focus:ring-s1/30";

export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-s1 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-s1 disabled:opacity-60";

export const buttonGhostClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-2 transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-s1 disabled:opacity-60";

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "border-line bg-surface-2 text-ink-2",
    error: "border-critical/40 bg-critical/10 text-ink",
    success: "border-good/40 bg-good/10 text-ink",
  }[tone];

  const icon = { info: "i", error: "!", success: "✓" }[tone];
  const iconColor = {
    info: "bg-ink-muted",
    error: "bg-critical",
    success: "bg-good",
  }[tone];

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${styles}`}
    >
      <span
        aria-hidden
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${iconColor}`}
      >
        {icon}
      </span>
      <span>{children}</span>
    </p>
  );
}
