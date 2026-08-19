import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/logo";
import { getMember } from "@/lib/session";

export const dynamic = "force-dynamic";

const FOUTEN: Record<string, string> = {
  login: "Log eerst even in om die pagina te bekijken.",
  link: "Die link werkte niet meer.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fout?: string }>;
}) {
  const { member } = await getMember();
  if (member) redirect("/dashboard");

  const { fout } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-8 self-start">
        <Logo size="md" />
      </Link>

      <div className="card p-7 sm:p-8">
        <h1 className="text-xl font-bold text-ink">Ledenzone</h1>
        <p className="mt-1 mb-6 text-sm text-ink-2">
          Enkel voor leden van De Amigo&apos;s.
        </p>

        <LoginForm initialError={fout ? FOUTEN[fout] : undefined} />

        <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
          Nog geen toegang? Arne of Guido nodigen je uit per e-mail.
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 self-center text-sm text-ink-muted underline underline-offset-4 hover:text-ink-2"
      >
        Terug naar de startpagina
      </Link>
    </main>
  );
}
