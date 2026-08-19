"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Notice, buttonGhostClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

/**
 * Vangt het geval waarin Supabase de sessie in het anker van de URL zet
 * (#access_token=…). Een server ziet dat stuk nooit, dus doet de browser het.
 */
export function HashHandler() {
  const params = useSearchParams();
  const [fout, setFout] = useState<string | null>(null);

  const next = params.get("next") ?? "/prikbord";
  const safeNext = next.startsWith("/") ? next : "/prikbord";

  useEffect(() => {
    let actief = true;

    const afhandelen = async (): Promise<string | null> => {
      const velden = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      const melding = velden.get("error_description") ?? velden.get("error");
      if (melding) return melding.replace(/\+/g, " ");

      const accessToken = velden.get("access_token");
      const refreshToken = velden.get("refresh_token");
      if (!accessToken || !refreshToken) {
        return "Deze link bevat geen geldige gegevens meer. Waarschijnlijk is hij al gebruikt of verlopen.";
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return error.message;

      window.location.replace(safeNext);
      return null;
    };

    afhandelen().then((melding) => {
      if (actief && melding) setFout(melding);
    });

    return () => {
      actief = false;
    };
  }, [safeNext]);

  if (fout) {
    return (
      <>
        <h1 className="mt-5 text-xl font-bold text-ink">Die link werkt niet</h1>
        <div className="mt-4">
          <Notice tone="error">{fout}</Notice>
        </div>
        <p className="mt-4 text-sm text-ink-2">
          Vraag Arne of Guido om je opnieuw uit te nodigen, of om een nieuw
          wachtwoord voor je klaar te zetten.
        </p>
        <Link href="/login" className={`${buttonGhostClass} mt-5`}>
          Naar het inlogscherm
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mt-5 text-xl font-bold text-ink">Even aanmelden…</h1>
      <p className="mt-2 text-sm text-ink-2">
        Je wordt zo doorgestuurd naar de ledenzone.
      </p>
    </>
  );
}
