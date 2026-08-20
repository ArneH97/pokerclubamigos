import { createClient } from "@supabase/supabase-js";

/**
 * Client voor mails die naar iemand anders vertrekken.
 *
 * Belangrijk: dit MOET de implicit-flow zijn. De ssr-client gebruikt PKCE, en
 * dan komt er een token van de vorm `pkce_…` in de mail. Zo'n token hoort bij
 * de browser die de mail aanvroeg — bij de beheerder dus — en kan door de
 * ontvanger nooit ingewisseld worden. Resultaat: "Email link is invalid or
 * has expired", ook bij een gloednieuwe link.
 *
 * Met de implicit-flow zit er een gewone token in de mail, die iedereen kan
 * gebruiken via verifyOtp.
 */
export function createMailClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
