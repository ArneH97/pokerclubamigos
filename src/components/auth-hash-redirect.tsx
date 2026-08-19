"use client";

import { useEffect } from "react";

/**
 * Supabase' standaardsjabloon stuurt mails naar de hoofdpagina en hangt de
 * sessie achter een hekje: /#access_token=… of /#error=…
 * Een server ziet dat stuk niet, dus zetten we de bezoeker hier door naar
 * /auth/hash, waar de browser het afhandelt.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const velden = new URLSearchParams(hash.replace(/^#/, ""));
    const heeftSessie = velden.has("access_token") || velden.has("refresh_token");
    const heeftFout = velden.has("error") || velden.has("error_code");
    if (!heeftSessie && !heeftFout) return;

    window.location.replace(`/auth/hash${hash}`);
  }, []);

  return null;
}
