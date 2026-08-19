import { Suspense } from "react";
import { HashHandler } from "./hash-handler";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

export default function HashPage() {
  return (
    <main className="safe-x mx-auto flex min-h-dvh max-w-md flex-col justify-center py-10">
      <div className="card p-8">
        <Logo />
        <Suspense
          fallback={<p className="mt-6 text-sm text-ink-2">Even geduld…</p>}
        >
          <HashHandler />
        </Suspense>
      </div>
    </main>
  );
}
