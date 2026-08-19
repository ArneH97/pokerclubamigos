"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Notice, buttonGhostClass } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

/** Waar iemand hoort te landen, afhankelijk van het soort mail. */
function bestemming(type: string | null) {
  if (type === "invite" || type === "signup") return "/welkom";
  if (type === "recovery") return "/wachtwoord";
  return "/prikbord";
}

function leesbaar(code: string | null, omschrijving: string | null) {
  if (code === "otp_expired") {
    return "Deze link is verlopen of werd al gebruikt. Elke uitnodiging werkt maar één keer.";
  }
  if (omschrijving) return omschrijving.replace(/\+/g, " ");
  return "Deze link werkt niet meer.";
}

/**
 * Vangt het geval waarin Supabase de sessie of een fout in het anker van de
 * URL zet (#access_token=… of #error=…). Een server ziet dat stuk nooit.
 */
export function HashHandler() {
  const params = useSearchParams();
  const [fout, setFout] = useState<string | null>(null);

  const nextParam = params.get("next");

  useEffect(() => {
    let actief = true;

    const afhandelen = async (): Promise<string | null> => {
      const velden = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      if (velden.has("error") || velden.has("error_code")) {
        return leesbaar(
          velden.get("error_code"),
          velden.get("error_description"),
        );
      }

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

      const doel =
        nextParam && nextParam.startsWith("/")
          ? nextParam
          : bestemming(velden.get("type"));

      window.location.replace(doel);
      return null;
    };

    afhandelen().then((melding) => {
      if (actief && melding) setFout(melding);
    });

    return () => {
      actief = false;
    };
  }, [nextParam]);

  if (fout) {
    return (
      <>
        <h1 className="mt-5 text-xl font-bold text-ink">Die link werkt niet</h1>
        <div className="mt-4">
          <Notice tone="error">{fout}</Notice>
        </div>
        <p className="mt-4 text-sm text-ink-2">
          Vraag Arne of Guido om je opnieuw uit te nodigen, of om een
          startwachtwoord voor je klaar te zetten.
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
