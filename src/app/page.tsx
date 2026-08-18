import { redirect } from "next/navigation";
import { LoginForm } from "@/app/login-form";
import { Logo } from "@/components/logo";
import { getMember } from "@/lib/session";

const FOUTEN: Record<string, string> = {
  login: "Log eerst even in om die pagina te bekijken.",
  link: "Die link werkte niet meer. Vraag een nieuwe aan hieronder.",
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ fout?: string }>;
}) {
  const { member } = await getMember();
  if (member) redirect("/dashboard");

  const { fout } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-5 py-10 sm:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_minmax(0,26rem)] lg:gap-16">
        <div>
          <Logo size="lg" />
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            De Amigo&apos;s
          </h1>
          <p className="mt-3 max-w-lg text-lg text-ink-2">
            Onze pokerclub uit Aalst. Van elke winst gaat 10% in de pot — en aan
            het eind van het jaar eten we die samen op.
          </p>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "Geef je resultaat in",
                d: "Buy-in en cash-out. De 10% rekent de site zelf uit.",
                c: "bg-s1",
              },
              {
                t: "Volg de pot",
                d: "Iedereen ziet live hoe ver we van het streefbedrag zitten.",
                c: "bg-s2",
              },
              {
                t: "Bekijk het leaderboard",
                d: "Wie draagt het meest bij aan het etentje?",
                c: "bg-s3",
              },
            ].map((item) => (
              <div key={item.t} className="card p-4">
                <span
                  aria-hidden
                  className={`mb-2.5 block h-2.5 w-2.5 rounded-full ${item.c}`}
                />
                <dt className="text-sm font-semibold text-ink">{item.t}</dt>
                <dd className="mt-1 text-sm text-ink-2">{item.d}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-6 sm:p-8">
          <LoginForm initialError={fout ? FOUTEN[fout] : undefined} />
          <p className="mt-6 border-t border-line pt-4 text-xs text-ink-muted">
            Nog geen account? De voorzitter nodigt je uit per e-mail.
          </p>
        </div>
      </div>
    </main>
  );
}
