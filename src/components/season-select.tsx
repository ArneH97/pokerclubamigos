"use client";

import { useRouter } from "next/navigation";
import type { Season } from "@/lib/types";

export function SeasonSelect({
  seasons,
  current,
}: {
  seasons: Season[];
  current: string;
}) {
  const router = useRouter();

  return (
    <div>
      <label className="block text-xs text-ink-muted" htmlFor="seizoen">
        Seizoen
      </label>
      <select
        id="seizoen"
        defaultValue={current}
        onChange={(e) => router.push(`?seizoen=${e.target.value}`)}
        className="mt-1 block rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink"
      >
        {seasons.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
