import Link from "next/link";
import { redirect } from "next/navigation";
import { Chip, Logo, Spade } from "@/components/logo";
import { getMember } from "@/lib/session";

export const dynamic = "force-dynamic";

const WAARDEN = [
  {
    titel: "Plezier",
    tekst:
      "We spelen om te winnen, maar we komen voor de avond zelf. Wie na een bad beat het hardst kan lachen, heeft eigenlijk ook gewonnen.",
    tint: "bg-s1/10",
    dot: "bg-s1",
    kantel: "sm:-rotate-1",
  },
  {
    titel: "Eerlijkheid",
    tekst:
      "Aan onze tafel wordt niets mooier gemaakt dan het is. Je verlies geef je even open toe als je grootste cash.",
    tint: "bg-s2/10",
    dot: "bg-s2",
    kantel: "sm:rotate-1",
  },
  {
    titel: "Loyaliteit",
    tekst:
      "Amigo's laten elkaar niet vallen. Niet aan de tafel, en al zeker niet ernaast.",
    tint: "bg-s3/10",
    dot: "bg-s3",
    kantel: "sm:-rotate-1",
  },
  {
    titel: "Gezelligheid",
    tekst:
      "De kaarten zijn het excuus. Het echte spel is samenzijn — met een pint, een verhaal en veel te veel lawaai.",
    tint: "bg-s4/12",
    dot: "bg-s4",
    kantel: "sm:rotate-1",
  },
];

const BRIEFJES = [
  { tekst: "“Nog eentje dan.”", kantel: "-rotate-2", tint: "bg-s4/15" },
  { tekst: "“Ik had die call moeten maken.”", kantel: "rotate-1", tint: "bg-s3/12" },
  { tekst: "“Wie rijdt er volgende keer?”", kantel: "-rotate-1", tint: "bg-s1/10" },
];

export default async function LandingPage() {
  const { member } = await getMember();
  if (member) redirect("/prikbord");

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="safe-x mx-auto flex max-w-5xl items-center justify-between py-5">
        <Logo size="sm" />
        <Link
          href="/login"
          className="rounded-full border border-line bg-surface/80 px-4 py-2 text-sm font-medium text-ink-2 backdrop-blur transition hover:bg-surface hover:text-ink"
        >
          Inloggen
        </Link>
      </header>

      <main className="safe-x mx-auto max-w-5xl">
        {/* Hero ---------------------------------------------------------- */}
        <section className="pb-10 pt-8 text-center sm:pb-16 sm:pt-16">
          <p className="hand text-xl text-ink-2 sm:text-2xl">welkom bij</p>

          <div className="mt-3 flex justify-center">
            <Logo size="xl" withDe={false} />
          </div>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
            Een hoop vrienden uit Aalst die elkaar tegenkwamen aan de pokertafel
            en er nooit meer zijn weggegaan. Geen bestuur, geen statuten — wel
            altijd iemand die de kaarten meebrengt.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {["Aalst", "Al jaren", "Altijd één stoel vrij"].map((chip, i) => (
              <span
                key={chip}
                className={`rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink-2 ${
                  ["sm:-rotate-2", "", "sm:rotate-2"][i]
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        </section>

        {/* Hoe het begon -------------------------------------------------- */}
        <section className="py-6 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
            <div className="card p-6 sm:-rotate-1 sm:p-9">
              <h2 className="hand text-3xl text-ink sm:text-4xl">
                Hoe het begon
              </h2>
              <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-2">
                <p>
                  Zonder plan, zoals de beste dingen. Een handvol vrienden dat
                  elkaar week na week terugvond aan dezelfde tornooitafels in
                  Aalst. Eerst toevallig. Daarna omdat het anders gewoon niet
                  hetzelfde was.
                </p>
                <p>
                  Je herkent ons van ver: wij zijn diegenen die te luid lachen,
                  die na afloop blijven plakken om nog eens hand voor hand te
                  overlopen, en die altijd nog wel iemand kennen die er volgende
                  keer bij moet zijn.
                </p>
                <p className="hand text-2xl text-brand sm:text-3xl">
                  Zo werd het een ploeg.
                </p>
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {BRIEFJES.map((b) => (
                <li
                  key={b.tekst}
                  className={`rounded-2xl border border-line px-5 py-4 ${b.tint} ${b.kantel}`}
                >
                  <p className="hand text-2xl text-ink">{b.tekst}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Waarden -------------------------------------------------------- */}
        <section className="py-10 sm:py-16">
          <div className="text-center">
            <h2 className="hand text-3xl text-ink sm:text-4xl">
              Waar we voor staan
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-ink-2">
              Vier dingen die nooit op papier hebben gestaan, en die toch
              iedereen kent.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {WAARDEN.map((w) => (
              <article
                key={w.titel}
                className={`rounded-3xl border border-line p-6 ${w.tint} ${w.kantel}`}
              >
                <div className="flex items-center gap-2.5">
                  <span aria-hidden className={`h-3 w-3 rounded-full ${w.dot}`} />
                  <h3 className="hand text-3xl text-ink">{w.titel}</h3>
                </div>
                <p className="mt-2 leading-relaxed text-ink-2">{w.tekst}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Meer dan poker -------------------------------------------------- */}
        <section className="py-6 sm:py-10">
          <div className="card p-6 sm:rotate-1 sm:p-9">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              <div>
                <h2 className="hand text-3xl text-ink sm:text-4xl">
                  Meer dan poker
                </h2>
                <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-2">
                  <p>
                    Wie denkt dat het bij kaarten blijft, kent ons niet. Door het
                    jaar heen trekken we er geregeld samen op uit — de ene keer
                    goed voorbereid, de andere keer omdat iemand een idee had en
                    niemand nee zei.
                  </p>
                  <p>
                    Samen aan tafel, ergens naartoe rijden, een dag die uitloopt
                    tot &apos;s avonds laat. Het zijn die momenten waar we het
                    jaar later aan afmeten.
                  </p>
                </div>
              </div>

              <ul className="grid gap-2.5 sm:grid-cols-2">
                {[
                  "Samen aan tafel",
                  "Uitstappen",
                  "Tornooien in groep",
                  "Een dag die uitloopt",
                  "Verjaardagen",
                  "En wat er ook opduikt",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3"
                  >
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        ["bg-s1", "bg-s2", "bg-s3", "bg-s4", "bg-s5", "bg-s7"][i]
                      }`}
                    />
                    <span className="text-sm font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Slot ------------------------------------------------------------ */}
        <section className="py-14 text-center sm:py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <div className="flex gap-2 text-brand" aria-hidden>
              <Spade className="h-5 w-5" />
              <Spade className="h-5 w-5 opacity-60" />
              <Spade className="h-5 w-5 opacity-30" />
            </div>
            <p className="hand mt-5 text-4xl leading-tight text-ink sm:text-5xl">
              Eens een Amigo,
              <br />
              altijd een Amigo.
            </p>
            <p className="mt-4 text-lg text-ink-2">
              De kaarten worden geschud, de stoelen schuiven bij, en het gaat
              gewoon weer verder.
            </p>
          </div>
        </section>
      </main>

      <footer className="safe-x mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-line py-8 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <Chip className="h-5 w-5" />
          De Amigo&apos;s · Aalst
        </span>
        <Link
          href="/login"
          className="font-medium underline underline-offset-4 hover:text-ink-2"
        >
          Ledenzone
        </Link>
      </footer>
    </div>
  );
}
