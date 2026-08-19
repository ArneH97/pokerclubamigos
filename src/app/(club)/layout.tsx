import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";
import { Avatar } from "@/components/avatar";
import { BottomNav } from "@/components/bottom-nav";
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
      <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/90 backdrop-blur">
        <div className="safe-x mx-auto max-w-6xl">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-auto sm:py-4">
            <Link href="/prikbord" aria-label="Naar het prikbord">
              <Logo size="sm" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              {member.role === "admin" ? <ModeSwitch /> : null}

              {/* Op de telefoon zit alles achter je eigen knop; de rest van
                  het menu staat onderaan. */}
              <Link
                href="/profiel"
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-1 transition hover:bg-surface-2 sm:pr-3"
                aria-label="Jouw profiel"
              >
                <Avatar name={name} id={member.id} size="sm" />
                <span className="hidden max-w-32 truncate text-sm font-medium text-ink-2 sm:inline">
                  {name}
                </span>
              </Link>

              <Link
                href="/meldingen"
                className="relative hidden rounded-full border border-line p-2 text-ink-2 transition hover:bg-surface-2 hover:text-ink md:inline-flex"
                aria-label={unread > 0 ? `Meldingen, ${unread} nieuw` : "Meldingen"}
              >
                <Bell />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white tabular">
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </Link>

              <form action={signOutAction} className="hidden md:block">
                <button className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink">
                  Afmelden
                </button>
              </form>
            </div>
          </div>

          {/* Op een telefoon staat het menu onderaan. */}
          <div className="hidden pb-2 md:block">
            <Nav />
          </div>
        </div>
      </header>

      <main className="safe-x mx-auto max-w-6xl py-6 pb-28 sm:py-10 md:pb-10">
        {children}
      </main>

      <footer className="safe-x mx-auto hidden max-w-6xl pb-10 text-xs text-ink-muted md:block">
        De Amigos · Aalst
      </footer>

      <BottomNav unread={unread} />
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
