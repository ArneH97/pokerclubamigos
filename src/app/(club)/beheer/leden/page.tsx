import { setMemberActiveAction, setMemberRoleAction } from "../actions";
import { DeleteMemberButton, MemberForm, ResetPasswordButton } from "../forms";
import { Card, CardTitle, Empty, Notice, PageTitle } from "@/components/ui";
import { requireAdmin } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LedenPage() {
  const { member: me } = await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase.from("members").select("*").order("full_name");
  const members = (data ?? []) as Member[];

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
            startwachtwoord en stuur dat via WhatsApp door.
          </Notice>
        </div>
      </Card>

      <div className="mt-6">
        <Card>
          <CardTitle>Ledenlijst</CardTitle>
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
                        {m.email}
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
                      <ResetPasswordButton
                        id={m.id}
                        name={m.nickname?.trim() || m.full_name}
                      />
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
                      <td className="py-3 pr-3 text-ink-2">{m.email}</td>
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
                          <div className="space-y-2">
                            <ResetPasswordButton
                              id={m.id}
                              name={m.nickname?.trim() || m.full_name}
                            />
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
