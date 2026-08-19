"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LID = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prikbord", label: "Prikbord" },
  { href: "/ingave", label: "Resultaat ingeven" },
  { href: "/voorstellen", label: "Voorstellen" },
  { href: "/meldingen", label: "Meldingen" },
];

const BEHEER = [
  { href: "/beheer", label: "Financiën" },
  { href: "/beheer/leden", label: "Leden" },
  { href: "/beheer/activiteiten", label: "Activiteiten" },
  { href: "/beheer/ingave", label: "Cash toevoegen" },
  { href: "/beheer/voorstellen", label: "Voorstellen" },
  { href: "/beheer/seizoen", label: "Seizoen" },
];

export function ModeSwitch() {
  const pathname = usePathname();
  const inBeheer = pathname.startsWith("/beheer");

  return (
    <div
      role="group"
      aria-label="Modus"
      className="inline-flex rounded-full border border-line bg-surface-2 p-1"
    >
      <Link
        href="/dashboard"
        aria-current={inBeheer ? undefined : "true"}
        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
          inBeheer ? "text-ink-2 hover:text-ink" : "bg-surface text-ink shadow-sm"
        }`}
      >
        Lid
      </Link>
      <Link
        href="/beheer"
        aria-current={inBeheer ? "true" : undefined}
        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
          inBeheer ? "bg-brand text-white shadow-sm" : "text-ink-2 hover:text-ink"
        }`}
      >
        Beheer
      </Link>
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const inBeheer = pathname.startsWith("/beheer");
  const links = inBeheer ? BEHEER : LID;

  return (
    <nav aria-label="Hoofdmenu" className="-mx-1 overflow-x-auto">
      <ul className="flex gap-1 whitespace-nowrap px-1 py-1">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/beheer" && pathname.startsWith(`${link.href}/`));

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? inBeheer
                      ? "bg-brand text-white"
                      : "bg-s1 text-white"
                    : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
