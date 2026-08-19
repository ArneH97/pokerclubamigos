import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { ModeSwitch, Nav } from "@/components/nav";
import { getUnreadCount, requireMember } from "@/lib/session";

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member } = await requireMember();
  const unread = await getUnreadCount(member.id);
  const name = member.nickname?.trim() || member.full_name;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line/70 bg-surface/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-center justify-between gap-3 py-4">
            <Link href="/dashboard" aria-label="Naar het dashboard">
              <Logo size="md" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {member.role === "admin" ? <ModeSwitch /> : null}

              <Link
                href="/meldingen"
                className="relative rounded-full border border-line p-2 text-ink-2 transition hover:bg-surface-2 hover:text-ink"
                aria-label={
                  unread > 0 ? `Meldingen, ${unread} nieuw` : "Meldingen"
                }
              >
                <Bell />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white tabular">
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </Link>

              <Link
                href="/profiel"
                className="hidden text-sm font-medium text-ink-2 underline-offset-4 hover:underline sm:inline"
              >
                {name}
              </Link>

              <form action={signOutAction}>
                <button className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink">
                  Afmelden
                </button>
              </form>
            </div>
          </div>

          <div className="pb-2">
            <Nav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-ink-muted sm:px-8">
        De Amigo&apos;s · Aalst
      </footer>
    </div>
  );
}

function Bell() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 8.5a6 6 0 1 1 12 0c0 3.2.7 5 1.6 6.1.4.5 0 1.3-.6 1.3H5c-.7 0-1-.8-.6-1.3C5.3 13.5 6 11.7 6 8.5Z"
      />
      <path strokeLinecap="round" d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}
