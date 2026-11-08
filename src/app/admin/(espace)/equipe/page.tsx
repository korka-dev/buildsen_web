/* eslint-disable react/jsx-key -- cellules de tableau : positionnelles, jamais réordonnées */
import { api } from "@/lib/api";
import { SHOW_PRICING } from "@/lib/constants";
import type { User } from "@/lib/types";
import { Pill } from "@/components/ui";
import { InviteForm } from "../../forms";
import { DataTable, type DataRow } from "../DataTable";

export const metadata = { title: "Équipe · Administration BUILDSEN" };

export default async function Team() {
  const { admins } = await api<{ admins: (User & { roleLabel: string; active: boolean })[] }>("/api/admin/team");
  const rows: DataRow[] = admins.map((u) => ({
    key: u.id, group: u.active ? "ACTIVE" : "PENDING", title: `${u.firstName} ${u.lastName}`,
    text: [u.firstName, u.lastName, u.email, u.roleLabel].join(" "),
    cells: [<b>{u.firstName} {u.lastName}</b>, <span className="small">{u.email}</span>, <Pill>{u.roleLabel}</Pill>, <Pill tone={u.active ? "ok" : "warn"}>{u.active ? "Activé" : "Invitation en attente"}</Pill>],
    view: (
      <div className="tbl"><table className="t"><tbody>
        <tr><td className="muted" style={{ width: 160 }}>Nom</td><td>{u.firstName} {u.lastName}</td></tr>
        <tr><td className="muted">E-mail</td><td>{u.email}</td></tr>
        <tr><td className="muted">Rôle</td><td>{u.roleLabel}</td></tr>
        <tr><td className="muted">Accès</td><td>{u.active ? "Activé (mot de passe et double authentification en place)" : "Invitation en attente : le lien d'activation n'a pas encore été utilisé"}</td></tr>
      </tbody></table></div>
    ),
  }));
  return (
    <div className="bs-page">
      <div className="bs-page-h"><div><h1>Équipe d&apos;administration</h1><p>{admins.length} administrateur(s)</p></div></div>
      <DataTable
        head={["Nom", "E-mail", "Rôle", "Accès"]}
        rows={rows}
        filters={[{ id: "ACTIVE", label: "Activés" }, { id: "PENDING", label: "Invitations" }]}
        searchPlaceholder="Rechercher un administrateur…"
        empty="Aucun administrateur."
        action={{
          label: "Inviter", title: "Inviter un administrateur",
          content: (
            <div className="stack" style={{ gap: 14 }}>
              <ul className="ticks small">
                <li><b>Vérificateur</b> : examine les dossiers des professionnels, suspend des comptes</li>
                <li><b>Support</b> : gère les utilisateurs{SHOW_PRICING && " et les formules"}</li>
                <li><b>Modérateur</b> : surveille les demandes et traite les signalements</li>
                <li><b>Super-admin</b> : accès complet, dont l&apos;équipe</li>
              </ul>
              <InviteForm />
            </div>
          ),
        }}
      />
    </div>
  );
}
