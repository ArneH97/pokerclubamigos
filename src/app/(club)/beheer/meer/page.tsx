import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const LINKS = [
  {
    href: "/beheer",
    titel: "Financiën",
    tekst: "De pot, het aandeel per Amigo en wie nog moet afrekenen.",
    kleur: "bg-s1",
  },
  {
    href: "/beheer/leden",
    titel: "Leden",
    tekst: "Uitnodigen, rollen, wachtwoorden.",
    kleur: "bg-s2",
  },
  {
    href: "/beheer/activiteiten",
    titel: "Activiteiten",
    tekst: "Een etentje vastleggen en de kost uit de pot halen.",
    kleur: "bg-s3",
  },
  {
    href: "/beheer/ingave",
    titel: "Cash toevoegen",
    tekst: "Een resultaat ingeven namens een Amigo.",
    kleur: "bg-s4",
  },
  {
    href: "/beheer/voorstellen",
    titel: "Voorstellen",
    tekst: "Ideeën klaarzetten en de stemming afsluiten.",
    kleur: "bg-s5",
  },
  {
    href: "/beheer/seizoen",
    titel: "Seizoen",
    tekst: "Naam, periode en spaardoel.",
    kleur: "bg-s7",
  },
];

export default async function MeerPage() {
  await requireAdmin();

  return (
    <>
      <PageTitle sub="Alles wat je als beheerder kan doen.">Beheer</PageTitle>

      <ul className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="card flex items-start gap-3 p-5 transition hover:bg-surface-2"
            >
              <span
                aria-hidden
                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${link.kleur}`}
              />
              <span>
                <span className="block font-semibold text-ink">{link.titel}</span>
                <span className="mt-0.5 block text-sm text-ink-2">
                  {link.tekst}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
