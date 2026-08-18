import Link from "next/link";
import { PasswordForm } from "./password-form";
import { Logo } from "@/components/logo";
import { Notice, buttonGhostClass } from "@/components/ui";
import { getMember } from "@/lib/session";

export default async function WachtwoordPage() {
  const { user } = await getMember();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <div className="card p-8">
        <Logo />
        <h1 className="mt-5 text-2xl font-bold text-ink">
          Stel je wachtwoord in
        </h1>

        {user ? (
          <>
            <p className="mt-2 mb-5 text-sm text-ink-2">
              Voor <strong>{user.email}</strong>. Daarna kan je meteen aan de
              slag.
            </p>
            <PasswordForm />
          </>
        ) : (
          <>
            <div className="mt-4">
              <Notice tone="error">
                Deze link is verlopen of al gebruikt. Vraag een nieuwe aan via
                &apos;Wachtwoord vergeten&apos;.
              </Notice>
            </div>
            <Link href="/" className={`${buttonGhostClass} mt-5`}>
              Naar de startpagina
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
