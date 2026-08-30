import { setMemberActiveAction, setMemberRoleAction } from "../actions";
import {
  AccessLinkButton,
  AddEmailButton,
  BulkLinksForm,
  BulkPasswordsForm,
  BulkResendForm,
  DeleteMemberButton,
  MemberForm,
  ResendInviteButton,
  ResetPasswordButton,
} from "../forms";
import {
  StatusChip,
  bepaalStatus,
  type LidStatus,
} from "@/components/member-status";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { shortDate } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

type AuthStatus = {
  member_id: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  created_at: string | null;
};

export default async function LedenPage() {
  const { member: me } = await requireAdmin();
  const supabase = await createClient();

  const [{ data }, { data: authData }] = await Promise.all([
    supabase.from("members").select("*").order("full_name"),
    supabase.rpc("member_auth_status"),
  ]);

  const members = (data ?? []) as Member[];
  const aanmeldingen = new Map(
    ((authData ?? []) as AuthStatus[]).map((r) => [r.member_id, r]),
  );

  const statusVan = (m: Member): LidStatus =>
    bepaalStatus({
      heeftNickname: Boolean(m.nickname?.trim()),
      laatsteAanmelding: aanmeldingen.get(m.id)?.last_sign_in_at ?? null,
      mailOntbreekt: m.email_pending,
    });

  const telling = members.reduce(
    (acc, m) => {
      acc[statusVan(m)] += 1;
      return acc;
    },
    { actief: 0, aangemeld: 0, uitgenodigd: 0, geen_mail: 0 } as Record<
      LidStatus,
      number
    >,
  );

  return (
    <>
      <PageTitle sub="Nodig uit per e-mail, of geef een startwachtwoord mee dat je zelf doorstuurt.">
        Leden
      </PageTitle>

      <Card>
        <CardTitle hint={`${members.length} in de club`}>Lid toevoegen</CardTitle>
        <MemberForm />
        <div className="mt-4">
          <Notice>
            Bij de eerste aanmelding kiest het lid zelf zijn spelernaam en een
            eigen wachtwoord. Komt de uitnodiging niet aan, kies dan voor een
            startwachtwoord en stuur dat via WhatsApp door. Heb je enkel een
            naam? Kies <strong>nog geen mailadres</strong> — hij staat dan al in
            de lijst en telt mee voor de pot, en je vult het adres later aan met
            de knop <strong>mailadres toevoegen</strong>.
          </Notice>
        </div>
      </Card>

      <div className="mt-6">
        <Card>
          <CardTitle hint="Voor wie er nog niet in geraakt">
            Iedereen binnen krijgen
          </CardTitle>

          <div className="rounded-2xl border border-s1/30 bg-s1/6 p-4">
            <p className="text-sm font-semibold text-ink">
              1. Stuur de link zelf door
            </p>
            <p className="mb-4 mt-1 text-sm text-ink-2">
              Maakt een verse aanmeldlink per persoon, zonder mail. Plak ze in
              WhatsApp — dan kan er onderweg niets misgaan.
            </p>
            <BulkLinksForm />
          </div>

          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="text-sm font-semibold text-ink">
              2. Of laat de mail het doen
            </p>
            <p className="mb-4 mt-1 text-sm text-ink-2">
              Iedereen krijgt een verse link per e-mail. Dit mag je zo vaak
              herhalen als nodig, maar hangt af van de mailinstellingen.
            </p>
            <BulkResendForm />
          </div>

          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="text-sm font-semibold text-ink">
              3. Of geef een startwachtwoord mee
            </p>
            <p className="mb-4 mt-1 text-sm text-ink-2">
              Geen link, gewoon een wachtwoord dat je doorstuurt. Verloopt
              nooit.
            </p>
            <BulkPasswordsForm />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardTitle
            hint={`${telling.actief} actief · ${telling.aangemeld} half · ${telling.uitgenodigd} wacht nog${
              telling.geen_mail ? ` · ${telling.geen_mail} zonder mail` : ""
            }`}
          >
            Ledenlijst
          </CardTitle>
          {members.length === 0 ? (
            <Empty>Nog geen leden.</Empty>
          ) : (
            <ul className="space-y-3 lg:hidden">
              {members.map((m) => (
                <li key={m.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {m.nickname?.trim() || m.full_name}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {m.nickname?.trim() ? `${m.full_name} · ` : ""}
                        {m.email_pending ? "nog geen mailadres" : m.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        m.role === "admin"
                          ? "bg-brand/12 text-ink"
                          : "bg-surface-2 text-ink-2"
                      }`}
                    >
                      {m.role === "admin" ? "beheerder" : "lid"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusChip status={statusVan(m)} />
                    {aanmeldingen.get(m.id)?.last_sign_in_at ? (
                      <span className="text-[11px] text-ink-muted">
                        laatst binnen{" "}
                        {shortDate(
                          aanmeldingen.get(m.id)!.last_sign_in_at!.slice(0, 10),
                        )}
                      </span>
                    ) : null}
                  </div>

                  {m.id === me.id ? (
                    <p className="mt-3 text-xs text-ink-muted">Dat ben jij.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <form action={setMemberRoleAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={m.role === "admin" ? "member" : "admin"}
                        />
                        <button className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-2">
                          {m.role === "admin" ? "maak lid" : "maak beheerder"}
                        </button>
                      </form>
                      <form action={setMemberActiveAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={m.is_active ? "false" : "true"}
                        />
                        <button className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-2">
                          {m.is_active ? "op non-actief" : "opnieuw actief"}
                        </button>
                      </form>
                      <AddEmailButton
                        id={m.id}
                        name={m.nickname?.trim() || m.full_name}
                        current={m.email}
                        pending={m.email_pending}
                      />
                      {m.email_pending ? null : (
                        <>
                          <AccessLinkButton email={m.email} />
                          <ResendInviteButton email={m.email} />
                          <ResetPasswordButton
                            id={m.id}
                            name={m.nickname?.trim() || m.full_name}
                          />
                        </>
                      )}
                      <DeleteMemberButton id={m.id} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {members.length === 0 ? (
            <Empty>Nog geen leden.</Empty>
          ) : (
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-muted">
                    <th scope="col" className="py-2 pr-3 font-medium">Spelernaam</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Naam</th>
                    <th scope="col" className="py-2 pr-3 font-medium">E-mail</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Rol</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Status</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Actief</th>
                    <th scope="col" className="py-2 font-medium">Toegang</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-line/70 align-top last:border-0">
                      <td className="py-3 pr-3">
                        {m.nickname?.trim() ? (
                          <span className="font-semibold text-ink">{m.nickname}</span>
                        ) : (
                          <span className="text-xs text-ink-muted">
                            nog niet gekozen
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-ink-2">{m.full_name}</td>
                      <td className="py-3 pr-3 text-ink-2">
                        {m.email_pending ? (
                          <span className="text-xs text-ink-muted">
                            nog geen mailadres
                          </span>
                        ) : (
                          m.email
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {m.id === me.id ? (
                          <span className="text-xs text-ink-2">beheerder (jij)</span>
                        ) : (
                          <form action={setMemberRoleAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input
                              type="hidden"
                              name="role"
                              value={m.role === "admin" ? "member" : "admin"}
                            />
                            <button className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                              {m.role === "admin" ? "beheerder" : "lid"} · wissel
                            </button>
                          </form>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusChip status={statusVan(m)} />
                        {aanmeldingen.get(m.id)?.last_sign_in_at ? (
                          <span className="mt-1 block text-[11px] text-ink-muted">
                            laatst binnen{" "}
                            {shortDate(
                              aanmeldingen.get(m.id)!.last_sign_in_at!.slice(0, 10),
                            )}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">
                        {m.id === me.id ? (
                          <span className="text-xs text-ink-2">actief</span>
                        ) : (
                          <form action={setMemberActiveAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <input
                              type="hidden"
                              name="is_active"
                              value={m.is_active ? "false" : "true"}
                            />
                            <button className="whitespace-nowrap rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2 hover:bg-surface-2">
                              {m.is_active ? "actief · zet uit" : "inactief · zet aan"}
                            </button>
                          </form>
                        )}
                      </td>
                      <td className="py-3">
                        {m.id === me.id ? (
                          <span className="text-xs text-ink-muted">—</span>
                        ) : (
                          <div className="flex flex-wrap items-start gap-x-2 gap-y-1.5">
                            <AddEmailButton
                              id={m.id}
                              name={m.nickname?.trim() || m.full_name}
                              current={m.email}
                              pending={m.email_pending}
                            />
                            {m.email_pending ? null : (
                              <>
                                <AccessLinkButton email={m.email} />
                                <ResendInviteButton email={m.email} />
                                <ResetPasswordButton
                                  id={m.id}
                                  name={m.nickname?.trim() || m.full_name}
                                />
                              </>
                            )}
                            <DeleteMemberButton id={m.id} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
