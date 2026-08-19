"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Tab = {
  href: string;
  label: string;
  icon: ReactNode;
  accent?: boolean;
  badge?: number;
};

/**
 * Vaste menubalk onderaan, enkel op kleine schermen.
 * Vijf plaatsen van gelijke breedte; de balk zit tegen de onderrand met
 * ruimte voor de streep van de iPhone eronder.
 */
export function BottomNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const inBeheer = pathname.startsWith("/beheer");

  const lid: Tab[] = [
    { href: "/prikbord", label: "Prikbord", icon: <IconBoard /> },
    { href: "/dashboard", label: "De pot", icon: <IconPot /> },
    { href: "/ingave", label: "Ingeven", icon: <IconPlus />, accent: true },
    { href: "/voorstellen", label: "Stemmen", icon: <IconVote /> },
    { href: "/meldingen", label: "Meldingen", icon: <IconBell />, badge: unread },
  ];

  const beheer: Tab[] = [
    { href: "/beheer", label: "Geld", icon: <IconEuro /> },
    { href: "/beheer/leden", label: "Leden", icon: <IconUsers /> },
    { href: "/beheer/activiteiten", label: "Activiteit", icon: <IconCalendar /> },
    { href: "/beheer/ingave", label: "Cash", icon: <IconPlus />, accent: true },
    { href: "/beheer/meer", label: "Meer", icon: <IconMore /> },
  ];

  const tabs = inBeheer ? beheer : lid;

  return (
    <nav
      aria-label="Hoofdmenu"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
    >
      <ul className="flex items-stretch">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== "/beheer" && pathname.startsWith(`${tab.href}/`));

          return (
            <li key={tab.href} className="min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-1 px-0.5 pb-1.5 pt-2"
              >
                <span
                  className={`relative grid h-8 w-8 place-items-center rounded-full transition ${
                    tab.accent
                      ? inBeheer
                        ? "bg-brand text-white"
                        : "bg-s1 text-white"
                      : active
                        ? inBeheer
                          ? "bg-brand/12 text-ink"
                          : "bg-s1/12 text-ink"
                        : "text-ink-muted"
                  }`}
                >
                  {tab.icon}
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -right-1.5 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white tabular">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`w-full truncate text-center text-[10.5px] leading-none ${
                    active ? "font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconBoard() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5-1 0-2-.15-2.9-.43L4 20.5l1.4-3.6C4.5 15.7 4 14.2 4 12.5 4 8.9 7.6 6 12 6s8 2.9 8 6.5Z" />
    </svg>
  );
}

function IconPot() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <ellipse cx="12" cy="7" rx="7" ry="2.6" />
      <path d="M5 7v4.5c0 1.44 3.13 2.6 7 2.6s7-1.16 7-2.6V7" />
      <path d="M5 11.5V16c0 1.44 3.13 2.6 7 2.6s7-1.16 7-2.6v-4.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden
      {...strokeProps}
      strokeWidth={2.4}
    >
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

function IconVote() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <path d="M5 12.5 10 17l9-10" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <path d="M6.5 9.5a5.5 5.5 0 1 1 11 0c0 2.9.6 4.6 1.4 5.6.4.5 0 1.2-.6 1.2H5.7c-.6 0-1-.7-.6-1.2.8-1 1.4-2.7 1.4-5.6Z" />
      <path d="M10.2 19a2 2 0 0 0 3.6 0" />
    </svg>
  );
}

function IconEuro() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <path d="M16.5 7.5a5.5 5.5 0 0 0-8.9 2M16.5 16.5a5.5 5.5 0 0 1-8.9-2M5 10.5h7M5 13.5h7" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c.6-2.9 2.8-4.5 5.5-4.5s4.9 1.6 5.5 4.5" />
      <path d="M16 6.6a3 3 0 0 1 0 5.8M17.5 14.8c1.7.6 2.8 1.9 3.2 4.2" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden {...strokeProps}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <circle cx="6" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="18" cy="12" r="1.7" />
    </svg>
  );
}
