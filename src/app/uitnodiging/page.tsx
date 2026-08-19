import Link from "next/link";
import { bevestigUitnodigingAction } from "./actions";
import { Logo } from "@/components/logo";
import { Notice, buttonClass, buttonGhostClass } from "@/components/ui";

export const dynamic = "force-dynamic";

function vriendelijk(melding: string) {
  const m = melding.toLowerCase();
  if (m.includes("expired") || m.includes("invalid")) {
    return "Deze link is verlopen of werd al gebruikt. Vraag Arne of Guido om een nieuwe.";
  }
  return melding;
}

export default async function UitnodigingPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
    fout?: string;
  }>;
}) {
  const { token_hash, type, next, fout } = await searchParams;
  const soort = type === "recovery" ? "recovery" : "invite";
  const doel = next?.startsWith("/")
    ? next
    : soort === "recovery"
      ? "/wachtwoord"
      : "/welkom";

  const herstel = soort === "recovery";

  return (
    <main className="safe-x mx-auto flex min-h-dvh max-w-md flex-col justify-center py-10">
      <div className="card p-7 sm:p-8">
        <Logo />

        {token_hash ? (
          <>
            <h1 className="hand mt-6 text-4xl leading-none text-ink">
              {herstel ? "Stel je wachtwoord in" : "Welkom bij de club"}
            </h1>
            <p className="mt-3 text-ink-2">
              {herstel
                ? "Klik hieronder om verder te gaan. Daarna kies je een wachtwoord — en je spelernaam, als je die nog niet hebt."
                : "Klik hieronder om je aan te melden. Daarna kies je je spelernaam en een eigen wachtwoord."}
            </p>

            {fout ? (
              <div className="mt-5">
                <Notice tone="error">{vriendelijk(fout)}</Notice>
              </div>
            ) : null}

            <form action={bevestigUitnodigingAction} className="mt-6">
              <input type="hidden" name="token_hash" value={token_hash} />
              <input type="hidden" name="type" value={soort} />
              <input type="hidden" name="next" value={doel} />
              <button className={`${buttonClass} w-full`}>
                {herstel ? "Verder" : "Aan de slag"}
              </button>
            </form>

            <p className="mt-5 text-xs leading-relaxed text-ink-muted">
              Deze knop werkt maar één keer. Lukt het niet meer, vraag dan
              gewoon een nieuwe uitnodiging.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-xl font-bold text-ink">
              Er ontbreekt iets aan deze link
            </h1>
            <div className="mt-4">
              <Notice tone="error">
                Kopieer de volledige link uit de mail, of vraag Arne of Guido om
                een nieuwe.
              </Notice>
            </div>
            <Link href="/login" className={`${buttonGhostClass} mt-5`}>
              Naar het inlogscherm
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
