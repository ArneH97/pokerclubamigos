import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo, Spade } from "@/components/logo";
import { getMember } from "@/lib/session";

export const dynamic = "force-dynamic";

const WAARDEN = [
  {
    titel: "Plezier",
    tekst:
      "We spelen om te winnen, maar we komen voor de avond zelf. Wie na een bad beat het hardst kan lachen, heeft eigenlijk ook gewonnen.",
    kleur: "bg-s1",
  },
  {
    titel: "Eerlijkheid",
    tekst:
      "Aan onze tafel wordt niets mooier gemaakt dan het is. Je verlies geef je even open toe als je grootste cash.",
    kleur: "bg-s2",
  },
  {
    titel: "Loyaliteit",
    tekst:
      "Amigo's laten elkaar niet vallen. Niet aan de tafel, en al zeker niet ernaast.",
    kleur: "bg-s3",
  },
  {
    titel: "Gezelligheid",
    tekst:
      "De kaarten zijn het excuus. Het echte spel is samenzijn — met een pint, een verhaal en veel te veel lawaai.",
    kleur: "bg-s4",
  },
];

export default async function LandingPage() {
  const { member } = await getMember();
  if (member) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      {/* ---------------------------------------------------------------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo size="md" />
        <Link
          href="/login"
          className="rounded-full border border-line bg-surface/70 px-4 py-2 text-sm font-medium text-ink-2 backdrop-blur transition hover:bg-surface hover:text-ink"
        >
          Inloggen
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Hero --------------------------------------------------------- */}
        <section className="py-14 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ink-muted">
            Pokerclub · Aalst
          </p>
          <h1 className="mt-6">
            <Logo size="xl" withDe={false} />
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-2 sm:text-2xl">
            Geen club met statuten en een bestuurstafel. Een groep vrienden uit
            Aalst die elkaar tegenkwam aan de pokertafel en er nooit meer is
            weggegaan.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {["Sinds jaar en dag", "Ergens in Aalst", "Altijd één stoel vrij"].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm text-ink-2"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </section>

        {/* Het verhaal --------------------------------------------------- */}
        <section className="card overflow-hidden">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Hoe het begon
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-2">
                <p>
                  Het begon zoals de beste dingen beginnen: zonder plan. Een
                  handvol vrienden uit Aalst die elkaar week na week terugvonden
                  aan dezelfde tornooitafels. Eerst gewoon toevallig. Daarna
                  omdat het anders niet meer hetzelfde was.
                </p>
                <p>
                  Je herkent ze van ver. Het zijn diegenen die luider lachen dan
                  de rest, die na afloop blijven plakken om nog eens hand voor
                  hand te overlopen, en die altijd nog wel iemand kennen die er
                  volgende keer bij moet zijn.
                </p>
                <p>
                  Zo groeide er uit een paar losse spelers een ploeg. Geen
                  ploeg die samen speelt — aan tafel is iedereen elkaars
                  tegenstander — maar een ploeg die samen{" "}
                  <em>hoort</em>. En dat bleek net zo goed te werken.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4">
              {[
                {
                  k: "De tafel",
                  v: "Waar het begon en waar het altijd op terugkomt.",
                },
                {
                  k: "De babbel",
                  v: "Officieel na het spel. In de praktijk ook ervoor en tijdens.",
                },
                {
                  k: "De ploeg",
                  v: "Iedereen speelt voor zichzelf, niemand staat er alleen voor.",
                },
              ].map((item, i) => (
                <div
                  key={item.k}
                  className="rounded-2xl border border-line bg-surface-2 p-5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 rounded-full ${
                        ["bg-s1", "bg-s2", "bg-s3"][i]
                      }`}
                    />
                    <p className="font-semibold text-ink">{item.k}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-2">{item.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waarden ------------------------------------------------------- */}
        <section className="py-14 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Waar we voor staan
          </h2>
          <p className="mt-2 max-w-2xl text-lg text-ink-2">
            Vier dingen die nooit op papier hebben gestaan, en die toch iedereen
            kent.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WAARDEN.map((w) => (
              <article key={w.titel} className="card flex flex-col p-6">
                <span
                  aria-hidden
                  className={`mb-4 block h-3 w-3 rounded-full ${w.kleur}`}
                />
                <h3 className="text-lg font-bold text-ink">{w.titel}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {w.tekst}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Meer dan poker ------------------------------------------------ */}
        <section className="card p-7 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Meer dan poker
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-2">
                <p>
                  Wie denkt dat het bij kaarten blijft, kent de Amigo&apos;s
                  niet. Doorheen het jaar trekken we er geregeld samen op uit —
                  de ene keer goed voorbereid, de andere keer omdat iemand een
                  idee had en niemand nee zei.
                </p>
                <p>
                  Aan tafel eten, ergens naartoe rijden, een dag die uitloopt
                  tot &apos;s avonds laat: het zijn die momenten waar het jaar
                  later aan wordt afgemeten. De pokeravonden houden de groep
                  bij elkaar, de rest maakt er vrienden van.
                </p>
              </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
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
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3.5"
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
        </section>

        {/* Slot ---------------------------------------------------------- */}
        <section className="py-16 text-center sm:py-24">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <div className="flex gap-2 text-brand" aria-hidden>
              <Spade className="h-5 w-5" />
              <Spade className="h-5 w-5 opacity-60" />
              <Spade className="h-5 w-5 opacity-30" />
            </div>
            <p className="mt-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Eens een Amigo, altijd een Amigo.
            </p>
            <p className="mt-3 text-lg text-ink-2">
              De kaarten worden geschud, de stoelen schuiven bij, en het gaat
              gewoon weer verder.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-8 text-sm text-ink-muted sm:px-8">
        <span>De Amigo&apos;s · Aalst</span>
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
