const euro = new Intl.NumberFormat("nl-BE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const euroCompact = new Intl.NumberFormat("nl-BE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function money(value: number | null | undefined) {
  return euro.format(Number(value ?? 0));
}

export function moneyShort(value: number | null | undefined) {
  return euroCompact.format(Number(value ?? 0));
}

export function signedMoney(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return `${n > 0 ? "+" : ""}${euro.format(n)}`;
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function num(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}
