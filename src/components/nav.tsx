"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ingave", label: "Resultaat ingeven" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/resultaten", label: "Alle resultaten" },
];

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Beheer" }] : LINKS;

  return (
    <nav aria-label="Hoofdmenu" className="-mx-1 overflow-x-auto">
      <ul className="flex gap-1 whitespace-nowrap px-1 py-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-s1 text-white"
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
