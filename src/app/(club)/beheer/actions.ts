"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { getSiteUrl } from "@/lib/site";
import { tempPassword } from "@/lib/password";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMailClient } from "@/lib/supabase/otp";
import { createClient } from "@/lib/supabase/server";

export type AdminFormState = { error?: string; success?: string } | null;

function refresh() {
  revalidatePath("/beheer");
  revalidatePath("/beheer/leden");
  revalidatePath("/beheer/activiteiten");
  revalidatePath("/beheer/seizoen");
  revalidatePath("/beheer/voorstellen");
  revalidatePath("/dashboard");
  revalidatePath("/prikbord");
  revalidatePath("/voorstellen");
}

function amount(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").replace(",", ".").trim();
  if (raw === "") return NaN;
  return Number(raw);
}

// ---------------------------------------------------------------------------
//  Leden
// ---------------------------------------------------------------------------

/**
 * Voegt een lid toe. Twee manieren:
 *  · uitnodigen per e-mail — Supabase stuurt de mail (via Resend als SMTP) met
 *    een link waarmee het lid zelf een wachtwoord kiest
 *  · zelf een startwachtwoord doorsturen — handig als de mail niet aankomt
 */
export async function createMemberAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const role =
    String(formData.get("role") ?? "member") === "admin" ? "admin" : "member";
  const perMail = String(formData.get("method") ?? "mail") === "mail";

  if (!email.includes("@")) return { error: "Vul een geldig e-mailadres in." };
  if (!fullName) return { error: "Vul de naam van het lid in." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY ontbreekt bij de omgevingsvariabelen. Zonder die sleutel kan er geen account aangemaakt worden.",
    };
  }

  const { data: existingId, error: lookupError } = await admin.rpc(
    "find_user_id_by_email",
    { p_email: email },
  );
  if (lookupError) return { error: `Opzoeken mislukte: ${lookupError.message}` };

  let userId = existingId as string | null;
  let bericht = `${fullName} had al een account en is nu (opnieuw) lid.`;
  const password = tempPassword();

  if (!userId) {
    if (perMail) {
      const siteUrl = await getSiteUrl();
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/auth/confirm?next=/welkom`,
      });
      if (error || !data?.user) {
        return {
          error: `Uitnodigen mislukte: ${error?.message ?? "onbekende fout"}. Staat de SMTP van Resend goed in Supabase? Anders kan je hieronder kiezen voor een startwachtwoord.`,
        };
      }
      userId = data.user.id;
      bericht = `${fullName} is uitgenodigd. Er staat een mail klaar op ${email}.`;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error || !data?.user) {
        return {
          error: `Account aanmaken mislukte: ${error?.message ?? "onbekende fout"}`,
        };
      }
      userId = data.user.id;
      bericht = `${fullName} staat erbij. Startwachtwoord: ${password} — stuur dat door.`;
    }
  }

  const { error: upsertError } = await admin.from("members").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      nickname: nickname || null,
      role,
      is_active: true,
    },
    { onConflict: "id" },
  );

  if (upsertError) return { error: `Toevoegen mislukte: ${upsertError.message}` };

  refresh();
  return { success: bericht };
}

export async function resetMemberPasswordAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "dit lid");
  if (!id) return { error: "Onbekend lid." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt." };
  }

  const password = tempPassword();
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) return { error: `Lukte niet: ${error.message}` };

  refresh();
  return {
    success: `Nieuw wachtwoord voor ${name}: ${password} — stuur het door.`,
  };
}

export async function setMemberRoleAction(formData: FormData) {
  const { member } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role =
    String(formData.get("role") ?? "member") === "admin" ? "admin" : "member";
  if (id === member.id) return;

  const supabase = await createClient();
  await supabase.from("members").update({ role }).eq("id", id);
  refresh();
}

export async function setMemberActiveAction(formData: FormData) {
  const { member } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (id === member.id) return;

  const supabase = await createClient();
  await supabase.from("members").update({ is_active: isActive }).eq("id", id);
  refresh();
}

/** Definitief verwijderen kan enkel zolang er geen ingaves aan hangen. */
export async function deleteMemberAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { member } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Onbekend lid." };
  if (id === member.id) return { error: "Je kan jezelf niet verwijderen." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("results")
    .select("id", { count: "exact", head: true })
    .eq("member_id", id);

  if ((count ?? 0) > 0) {
    return {
      error:
        "Dit lid heeft al resultaten ingegeven. Verwijderen zou die uit de geschiedenis en uit de pot halen — zet het lid liever op non-actief.",
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt." };
  }

  await admin.from("members").delete().eq("id", id);
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    return {
      error: `Lid is uit de club gehaald, maar het account verwijderen lukte niet: ${error.message}`,
    };
  }

  refresh();
  return { success: "Lid en account verwijderd." };
}

// ---------------------------------------------------------------------------
//  Seizoen en pot
// ---------------------------------------------------------------------------

export async function saveSeasonAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const target = amount(formData.get("target_amount"));
  const startsOn = String(formData.get("starts_on") ?? "");
  const endsOn = String(formData.get("ends_on") ?? "");

  if (!name) return { error: "Geef het seizoen een naam." };
  if (!Number.isFinite(target) || target < 0)
    return { error: "Vul een geldig streefbedrag in." };
  if (!startsOn || !endsOn) return { error: "Vul begin- en einddatum in." };
  if (endsOn < startsOn) return { error: "De einddatum ligt voor de begindatum." };

  const supabase = await createClient();
  const payload = {
    name,
    target_amount: target,
    starts_on: startsOn,
    ends_on: endsOn,
  };

  if (id) {
    const { error } = await supabase.from("seasons").update(payload).eq("id", id);
    if (error) return { error: error.message };
    refresh();
    return { success: "Seizoen bijgewerkt." };
  }

  const { error: deactivateError } = await supabase
    .from("seasons")
    .update({ is_active: false })
    .eq("is_active", true);
  if (deactivateError) return { error: deactivateError.message };

  const { error } = await supabase
    .from("seasons")
    .insert({ ...payload, is_active: true });
  if (error) return { error: error.message };

  refresh();
  return { success: "Nieuw seizoen aangemaakt en geactiveerd." };
}

/**
 * Zet het aandeel van één Amigo op een bedrag — zo neemt Guido de Excel over.
 * Onder de motorkap wordt het verschil als correctie weggeschreven, zodat je
 * altijd kan terugvinden wat er gewijzigd is.
 */
export async function setMemberShareAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { member } = await requireAdmin();

  const memberId = String(formData.get("member_id") ?? "");
  const nieuw = amount(formData.get("amount"));
  const huidig = amount(formData.get("current"));
  const kind =
    String(formData.get("kind") ?? "correctie") === "startsaldo"
      ? "startsaldo"
      : "correctie";
  const reason =
    String(formData.get("reason") ?? "").trim() ||
    (kind === "startsaldo" ? "Overgenomen uit de Excel" : "Handmatig gezet");

  if (!memberId) return { error: "Kies eerst een Amigo." };
  if (!Number.isFinite(nieuw) || nieuw < 0)
    return { error: "Vul een bedrag van 0 of meer in." };

  const verschil =
    Math.round((nieuw - (Number.isFinite(huidig) ? huidig : 0)) * 100) / 100;
  if (verschil === 0) return { error: "Dat bedrag staat er al." };

  const supabase = await createClient();
  const { error } = await supabase.from("member_adjustments").insert({
    member_id: memberId,
    amount: verschil,
    kind,
    reason,
    created_by: member.id,
  });
  if (error) return { error: error.message };

  refresh();
  return { success: "Aandeel bijgewerkt." };
}

export async function deleteMemberAdjustmentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("member_adjustments").delete().eq("id", id);
  refresh();
}

// ---------------------------------------------------------------------------
//  Activiteiten
// ---------------------------------------------------------------------------

/**
 * Legt een activiteit vast. De kost gaat uit de pot, maar het geld van wie er
 * niet bij was blijft onaangeroerd. Onder de aanwezigen wordt naar verhouding
 * aangesproken — hoe dat precies verdeeld zit, maakt niet uit: het is één pot.
 */
export async function createActivityAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { member } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const happenedOn = String(formData.get("happened_on") ?? "");
  const cost = amount(formData.get("total_cost"));
  const note = String(formData.get("note") ?? "").trim();
  const aanwezig = formData
    .getAll("participants")
    .map((v) => String(v))
    .filter(Boolean);

  if (!name) return { error: "Geef de activiteit een naam." };
  if (!happenedOn) return { error: "Kies de datum." };
  if (!Number.isFinite(cost) || cost <= 0)
    return { error: "Vul de totale kost in." };
  if (aanwezig.length === 0)
    return { error: "Duid aan wie erbij was — anders weten we niet wiens geld beschermd blijft." };

  const supabase = await createClient();

  const { data: ledgerData, error: ledgerError } = await supabase
    .from("member_ledger")
    .select("member_id, aandeel")
    .in("member_id", aanwezig);
  if (ledgerError) return { error: ledgerError.message };

  const aandelen = (ledgerData ?? []).map((r) => ({
    member_id: String((r as { member_id: string }).member_id),
    aandeel: Math.max(Number((r as { aandeel: number }).aandeel) || 0, 0),
  }));

  const beschikbaar =
    Math.round(aandelen.reduce((a, r) => a + r.aandeel, 0) * 100) / 100;

  if (beschikbaar <= 0) {
    return {
      error:
        "Bij de aanwezigen staat er niets in de pot, dus er valt niets uit te halen.",
    };
  }

  const uitDePot = Math.min(cost, beschikbaar);
  const factor = uitDePot / beschikbaar;

  const rows = aandelen.map((r) => ({
    activity_id: "",
    member_id: r.member_id,
    amount: Math.floor(r.aandeel * factor * 100) / 100,
  }));

  // Afrondingsrestje bij de grootste bijleggen zodat de som exact klopt.
  const som = Math.round(rows.reduce((a, r) => a + r.amount, 0) * 100) / 100;
  const rest = Math.round((uitDePot - som) * 100) / 100;
  if (rest !== 0 && rows.length > 0) {
    let grootste = 0;
    aandelen.forEach((r, i) => {
      if (r.aandeel > aandelen[grootste].aandeel) grootste = i;
    });
    rows[grootste].amount = Math.round((rows[grootste].amount + rest) * 100) / 100;
  }

  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      name,
      happened_on: happenedOn,
      total_cost: cost,
      note: note || null,
      created_by: member.id,
    })
    .select("id")
    .single();

  if (error || !activity) return { error: error?.message ?? "Aanmaken mislukte." };

  const { error: chargeError } = await supabase
    .from("activity_charges")
    .insert(rows.map((r) => ({ ...r, activity_id: activity.id })));
  if (chargeError) return { error: chargeError.message };

  const tekort = Math.round((cost - uitDePot) * 100) / 100;

  refresh();
  return {
    success:
      tekort > 0
        ? `${name} vastgelegd. Er ging ${uitDePot.toFixed(2)} euro uit de pot; ${tekort.toFixed(
            2,
          )} euro moest er van buiten de pot bij komen.`
        : `${name} vastgelegd. ${uitDePot.toFixed(2)} euro uit de pot, het geld van wie er niet bij was blijft staan.`,
  };
}

export async function updateChargeAction(formData: FormData) {
  await requireAdmin();
  const activityId = String(formData.get("activity_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  const bedrag = amount(formData.get("amount"));
  if (!activityId || !memberId || !Number.isFinite(bedrag) || bedrag < 0) return;

  const supabase = await createClient();
  await supabase
    .from("activity_charges")
    .update({ amount: bedrag })
    .eq("activity_id", activityId)
    .eq("member_id", memberId);
  refresh();
}

export async function removeChargeAction(formData: FormData) {
  await requireAdmin();
  const activityId = String(formData.get("activity_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  if (!activityId || !memberId) return;

  const supabase = await createClient();
  await supabase
    .from("activity_charges")
    .delete()
    .eq("activity_id", activityId)
    .eq("member_id", memberId);
  refresh();
}

export async function deleteActivityAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", id);
  refresh();
}

// ---------------------------------------------------------------------------
//  Resultaten
// ---------------------------------------------------------------------------

/** Cash toevoegen namens een lid — ook met terugwerkende kracht. */
export async function adminAddResultAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const memberId = String(formData.get("member_id") ?? "");
  const seasonId = String(formData.get("season_id") ?? "");
  const buyin = amount(formData.get("buyin"));
  const cashout = amount(formData.get("cashout"));
  const playedOn = String(formData.get("played_on") ?? "");
  const venue = String(formData.get("venue") ?? "").trim() || "Aalst";
  const tournament = String(formData.get("tournament") ?? "").trim();
  const positionRaw = String(formData.get("finish_position") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const isPaid = String(formData.get("is_paid") ?? "") === "on";

  if (!memberId) return { error: "Kies eerst een lid." };
  if (!seasonId) return { error: "Geen seizoen gekozen." };
  if (!Number.isFinite(buyin) || buyin < 0) return { error: "Vul een geldige buy-in in." };
  if (!Number.isFinite(cashout) || cashout < 0)
    return { error: "Vul een geldige cash-out in." };
  if (!playedOn) return { error: "Kies de datum." };

  const supabase = await createClient();
  const { error } = await supabase.from("results").insert({
    member_id: memberId,
    season_id: seasonId,
    played_on: playedOn,
    venue,
    tournament: tournament || null,
    finish_position: positionRaw ? Number(positionRaw) : null,
    buyin,
    cashout,
    is_paid: isPaid,
    note: note || null,
  });

  if (error) return { error: `Opslaan lukte niet: ${error.message}` };

  refresh();
  return { success: "Cash toegevoegd." };
}

export async function togglePaidAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isPaid = String(formData.get("is_paid") ?? "") === "true";

  const supabase = await createClient();
  await supabase.from("results").update({ is_paid: isPaid }).eq("id", id);
  refresh();
}

export async function markMemberPaidAction(formData: FormData) {
  await requireAdmin();
  const memberId = String(formData.get("member_id") ?? "");
  const seasonId = String(formData.get("season_id") ?? "");
  if (!memberId || !seasonId) return;

  const supabase = await createClient();
  await supabase
    .from("results")
    .update({ is_paid: true })
    .eq("member_id", memberId)
    .eq("season_id", seasonId)
    .eq("is_paid", false);
  refresh();
}

export async function adminDeleteResultAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("results").delete().eq("id", id);
  refresh();
}

// ---------------------------------------------------------------------------
//  Voorstellen
// ---------------------------------------------------------------------------

export async function createProposalAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { member } = await requireAdmin();

  const seasonId = String(formData.get("season_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const costRaw = String(formData.get("estimated_cost") ?? "").trim();
  const cost = costRaw ? amount(costRaw) : null;

  if (!seasonId) return { error: "Geen seizoen gekozen." };
  if (!title) return { error: "Geef het voorstel een titel." };
  if (cost != null && (!Number.isFinite(cost) || cost < 0))
    return { error: "Vul een geldige richtprijs in, of laat het veld leeg." };

  const supabase = await createClient();
  const { error } = await supabase.from("proposals").insert({
    season_id: seasonId,
    title,
    description: description || null,
    estimated_cost: cost,
    created_by: member.id,
  });
  if (error) return { error: error.message };

  refresh();
  return { success: "Voorstel staat klaar. De groep kan stemmen." };
}

export async function setProposalStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "open");
  if (!id || !["open", "gekozen", "gesloten"].includes(status)) return;

  const supabase = await createClient();
  await supabase.from("proposals").update({ status }).eq("id", id);
  refresh();
}

export async function deleteProposalAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("proposals").delete().eq("id", id);
  refresh();
}

// ---------------------------------------------------------------------------
//  Startwachtwoorden in bulk
// ---------------------------------------------------------------------------

export type BulkRegel = { naam: string; email: string; wachtwoord: string };
export type BulkState = { error?: string; regels?: BulkRegel[] } | null;

/**
 * Zet in één keer een startwachtwoord klaar voor iedereen die nog niet
 * binnen is geraakt — handig wanneer uitnodigingsmails onderweg sneuvelen.
 * "Nog niet binnen" = nog geen spelernaam gekozen.
 */
export async function bulkStartPasswordsAction(
  _prev: BulkState,
  formData: FormData,
): Promise<BulkState> {
  await requireAdmin();
  const bereik = String(formData.get("bereik") ?? "nieuw");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY ontbreekt bij de omgevingsvariabelen. Zonder die sleutel lukt dit niet.",
    };
  }

  const supabase = await createClient();
  let query = supabase
    .from("members")
    .select("id, email, full_name, nickname, role")
    .eq("is_active", true)
    .order("full_name");

  if (bereik === "nieuw") {
    query = query.or("nickname.is.null,nickname.eq.");
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  const leden = (data ?? []) as {
    id: string;
    email: string;
    full_name: string;
    nickname: string | null;
  }[];

  if (leden.length === 0) {
    return {
      error:
        "Er is niemand die nog een startwachtwoord nodig heeft. Iedereen heeft al een spelernaam gekozen.",
    };
  }

  const regels: BulkRegel[] = [];

  for (const lid of leden) {
    const wachtwoord = tempPassword();
    const { error: pwError } = await admin.auth.admin.updateUserById(lid.id, {
      password: wachtwoord,
      email_confirm: true,
    });
    if (pwError) continue;
    regels.push({
      naam: lid.nickname?.trim() || lid.full_name,
      email: lid.email,
      wachtwoord,
    });
  }

  if (regels.length === 0) {
    return { error: "Er kon voor niemand een wachtwoord ingesteld worden." };
  }

  refresh();
  return { regels };
}

// ---------------------------------------------------------------------------
//  Mail opnieuw versturen
// ---------------------------------------------------------------------------

/**
 * Stuurt een nieuwe aanmeldmail. We gebruiken bewust de herstelmail en niet
 * de uitnodiging: een uitnodiging kan maar één keer verstuurd worden, een
 * herstelmail zo vaak als nodig — ook voor iemand die nog nooit een
 * wachtwoord instelde.
 */
export async function resendInviteAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Geen e-mailadres bekend voor dit lid." };

  const mail = createMailClient();
  const siteUrl = await getSiteUrl();

  const { error } = await mail.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/uitnodiging?next=/wachtwoord`,
  });

  if (error) return { error: `Versturen lukte niet: ${error.message}` };
  return { success: `Mail onderweg naar ${email}.` };
}

/** Dezelfde mail, maar in één keer naar iedereen die nog niet binnen is. */
export async function bulkResendAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const bereik = String(formData.get("bereik") ?? "nieuw");

  const supabase = await createClient();
  const mail = createMailClient();
  const siteUrl = await getSiteUrl();

  let query = supabase
    .from("members")
    .select("email, full_name, nickname")
    .eq("is_active", true)
    .order("full_name");

  if (bereik === "nieuw") query = query.or("nickname.is.null,nickname.eq.");

  const { data, error } = await query;
  if (error) return { error: error.message };

  const leden = (data ?? []) as { email: string }[];
  if (leden.length === 0) {
    return { error: "Er is niemand die nog een mail nodig heeft." };
  }

  let gelukt = 0;
  const mislukt: string[] = [];

  for (const lid of leden) {
    const { error: mailError } = await mail.auth.resetPasswordForEmail(
      lid.email,
      { redirectTo: `${siteUrl}/uitnodiging?next=/wachtwoord` },
    );
    if (mailError) mislukt.push(lid.email);
    else gelukt++;
  }

  refresh();

  if (gelukt === 0) {
    return {
      error: `Geen enkele mail vertrok. Controleer de SMTP-instellingen in Supabase. (${mislukt[0] ?? ""})`,
    };
  }

  return {
    success:
      mislukt.length === 0
        ? `${gelukt} mail${gelukt === 1 ? "" : "s"} verstuurd.`
        : `${gelukt} verstuurd, ${mislukt.length} mislukt: ${mislukt.join(", ")}. Vaak is dat de uurlimiet van Supabase — probeer die straks opnieuw.`,
  };
}

// ---------------------------------------------------------------------------
//  Toegangslinks maken (zonder mail)
// ---------------------------------------------------------------------------

export type LinkState = {
  error?: string;
  links?: { naam: string; email: string; url: string }[];
} | null;

/**
 * Maakt een verse aanmeldlink zonder mail te versturen. Handig als de mail
 * blijft haperen: je stuurt de link gewoon via WhatsApp door.
 */
export async function makeAccessLinksAction(
  _prev: LinkState,
  formData: FormData,
): Promise<LinkState> {
  await requireAdmin();

  const bereik = String(formData.get("bereik") ?? "nieuw");
  const enkelEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt bij de omgevingsvariabelen." };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  let leden: { email: string; full_name: string; nickname: string | null }[];

  if (enkelEmail) {
    const { data, error } = await supabase
      .from("members")
      .select("email, full_name, nickname")
      .eq("email", enkelEmail)
      .limit(1);
    if (error) return { error: error.message };
    leden = data ?? [];
  } else {
    let query = supabase
      .from("members")
      .select("email, full_name, nickname")
      .eq("is_active", true)
      .order("full_name");
    if (bereik === "nieuw") query = query.or("nickname.is.null,nickname.eq.");

    const { data, error } = await query;
    if (error) return { error: error.message };
    leden = data ?? [];
  }

  if (leden.length === 0) {
    return { error: "Er is niemand die een link nodig heeft." };
  }

  const links: { naam: string; email: string; url: string }[] = [];
  const mislukt: string[] = [];

  for (const lid of leden) {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: lid.email,
      options: { redirectTo: `${siteUrl}/uitnodiging?next=/wachtwoord` },
    });

    const token = data?.properties?.hashed_token;
    if (error || !token) {
      mislukt.push(lid.email);
      continue;
    }

    links.push({
      naam: lid.nickname?.trim() || lid.full_name,
      email: lid.email,
      url: `${siteUrl}/uitnodiging?token_hash=${token}&type=recovery&next=/wachtwoord`,
    });
  }

  if (links.length === 0) {
    return {
      error: `Links maken lukte niet${mislukt.length ? ` voor ${mislukt.join(", ")}` : ""}.`,
    };
  }

  return { links };
}
