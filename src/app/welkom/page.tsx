import { redirect } from "next/navigation";
import { ProfileForm } from "@/app/(club)/profiel/profile-form";
import { Logo } from "@/components/logo";
import { Notice } from "@/components/ui";
import { requireMember } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WelkomPage() {
  const { member } = await requireMember({ allowNoNickname: true });
  if (member.nickname?.trim()) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-10">
      <Logo size="lg" />

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink">
        Welkom bij de club, {member.full_name.split(" ")[0]}
      </h1>
      <p className="mt-2 text-lg text-ink-2">
        Nog één ding voor we beginnen: onder welke naam ken de rest jou?
      </p>

      <div className="mt-6">
        <Notice>
          Iedere Amigo heeft zijn eigen naam aan tafel. Kies de jouwe — die
          komt overal terug, dus kies er een waar je mee kan leven.
        </Notice>
      </div>

      <div className="card mt-6 p-6 sm:p-7">
        <ProfileForm nickname={member.nickname} firstTime />
      </div>
    </main>
  );
}
