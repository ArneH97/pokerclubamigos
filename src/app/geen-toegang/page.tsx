import { redirect } from "next/navigation";
import { signOutAction } from "@/app/auth/actions";
import { Logo } from "@/components/logo";
import { Notice, buttonGhostClass } from "@/components/ui";
import { getMember } from "@/lib/session";

export default async function GeenToegangPage() {
  const { user, member } = await getMember();
  if (!user) redirect("/");
  if (member?.is_active) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="card p-8">
        <Logo />
        <h1 className="mt-5 text-2xl font-bold text-ink">
          Je bent nog geen lid
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          Je account werkt, maar <strong>{user.email}</strong> staat nog niet op
          de ledenlijst van De Amigo&apos;s. Vraag de voorzitter om je toe te
          voegen — daarna zie je meteen alles.
        </p>

        <div className="mt-5">
          <Notice>
            Heb je al een account via een andere pokerapp? Dat is hetzelfde
            login-account. Je hoeft niets nieuws aan te maken.
          </Notice>
        </div>

        <form action={signOutAction} className="mt-6">
          <button className={buttonGhostClass}>Afmelden</button>
        </form>
      </div>
    </main>
  );
}
