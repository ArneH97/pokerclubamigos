import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Landingspunt voor uitnodigings- en herstelmails.
 *
 * Twee vormen komen hier binnen:
 *  · ?token_hash=…&type=…  — het aanbevolen sjabloon, wisselen we hier om
 *    voor een sessie
 *  · #access_token=…       — het standaardsjabloon van Supabase zet de sessie
 *    in het anker van de URL. Dat kan een server niet lezen, dus sturen we
 *    door naar /auth/hash, waar de browser het afhandelt. Het anker blijft bij
 *    een omleiding gewoon staan.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const foutOmschrijving =
    searchParams.get("error_description") ?? searchParams.get("error");

  const next = searchParams.get("next") ?? "/prikbord";
  const safeNext = next.startsWith("/") ? next : "/prikbord";

  if (foutOmschrijving) {
    return NextResponse.redirect(
      `${origin}/login?fout=link&melding=${encodeURIComponent(foutOmschrijving)}`,
    );
  }

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    return NextResponse.redirect(
      `${origin}/login?fout=link&melding=${encodeURIComponent(error.message)}`,
    );
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
    return NextResponse.redirect(
      `${origin}/login?fout=link&melding=${encodeURIComponent(error.message)}`,
    );
  }

  // Niets in de query: dan zit het waarschijnlijk in het anker.
  return NextResponse.redirect(
    `${origin}/auth/hash?next=${encodeURIComponent(safeNext)}`,
  );
}
