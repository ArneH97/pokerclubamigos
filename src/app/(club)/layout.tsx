import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Nav } from "@/components/nav";
import { requireMember } from "@/lib/session";

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member } = await requireMember();
  const name = member.nickname?.trim() || member.full_name;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line/70 bg-surface/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Logo />
              <span className="text-base font-bold tracking-tight text-ink">
                De Amigo&apos;s
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-ink-2 sm:inline">{name}</span>
              <form action={signOutAction}>
                <button className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink">
                  Afmelden
                </button>
              </form>
            </div>
          </div>

          <div className="pb-2">
            <Nav isAdmin={member.role === "admin"} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-ink-muted sm:px-8">
        Pokerclub De Amigo&apos;s · 10% van elke winst gaat in de pot
      </footer>
    </div>
  );
}
