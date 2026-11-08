/* eslint-disable react/jsx-key -- cellules de tableau : positionnelles, jamais réordonnées */
import { api } from "@/lib/api";
import { PLANS, formatPhone } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { ProPrivate, User } from "@/lib/types";
import { DossierPill, Pill } from "@/components/ui";
import { PlanBadge } from "@/components/PlanBadge";
import { ActionButton } from "@/components/ActionButton";
import { DeleteUserForm, PlanForm } from "../../forms";
import { DataTable, type DataRow } from "../DataTable";

export const metadata = { title: "Utilisateurs · Administration BUILDSEN" };

type Res = { canPlan: boolean; canDelete: boolean; users: (User & { pro: ProPrivate | null })[] };

export default async function Users() {
  const { canPlan, canDelete, users } = await api<Res>("/api/admin/users");
  const rows: DataRow[] = users.map((u) => {
    const name = `${u.firstName} ${u.lastName}`;
    const plan = u.pro?.activePlan ?? null;
    // Formule Pro offerte par l'offre de lancement : rien n'a été payé
    const offered = !!u.pro?.launchOffer && plan === "PRO";
    const until = dateFr(u.pro?.planUntil);
    const planText = plan ? (offered ? "Pro offert (lancement)" : PLANS[plan].name) : "—";
    const suspended = u.status !== "ACTIVE";
    return {
      key: u.id,
      group: suspended ? "SUSPENDED" : u.role,
      group2: plan ? (offered ? "OFFERED" : plan) : "NONE",
      text: [name, u.email, u.phone, u.role === "PRO" ? "professionnel" : "particulier", planText].join(" "),
      title: name,
      cells: [
        <><b>{name}</b><br /><span className="small muted">{u.role === "PRO" ? "Professionnel" : "Particulier"}</span></>,
        <span className="small">{u.email}</span>,
        <span className="small" style={{ whiteSpace: "nowrap" }}>{formatPhone(u.phone)}</span>,
        <span className="small" style={{ whiteSpace: "nowrap" }}>{dateFr(u.createdAt)}</span>,
        plan ? (offered ? <span className="pill ok">Pro offert</span> : plan === "FREE" ? <span className="small muted">Gratuit</span> : <PlanBadge plan={plan} />) : <span className="muted">—</span>,
        u.pro ? <DossierPill state={u.pro.state} /> : <span className="muted">—</span>,
        <Pill tone={suspended ? "err" : "ok"}>{suspended ? "Suspendu" : "Actif"}</Pill>,
      ],
      view: (
        <div className="stack" style={{ gap: 16 }}>
          <div className="row between" style={{ gap: 10 }}>
            <span className="muted small">{u.role === "PRO" ? "Professionnel" : "Particulier"} · inscrit le {dateFr(u.createdAt)}</span>
            <Pill tone={suspended ? "err" : "ok"}>{suspended ? "Suspendu" : "Actif"}</Pill>
          </div>
          <div className="tbl"><table className="t"><tbody>
            <tr><td className="muted" style={{ width: 180 }}>E-mail</td><td>{u.email}</td></tr>
            <tr><td className="muted">Téléphone</td><td>{formatPhone(u.phone) || "—"}</td></tr>
            {u.pro && <tr><td className="muted">Dossier</td><td><DossierPill state={u.pro.state} /></td></tr>}
            {plan && <tr><td className="muted">Formule</td><td>{offered ? `Pro offert · lancement${until ? `, jusqu'au ${until}` : ""}` : `${PLANS[plan].name}${plan !== "FREE" && until ? ` jusqu'au ${until}` : ""}`}</td></tr>}
          </tbody></table></div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <ActionButton path={`/api/admin/users/${u.id}/suspend`} className={`btn sm ${suspended ? "o" : "x"}`}
              confirm={suspended ? undefined : `Suspendre le compte de ${name} ? Ses sessions sont fermées.`}>
              {suspended ? "Réactiver le compte" : "Suspendre le compte"}
            </ActionButton>
            {canPlan && u.pro && plan && <PlanForm userId={u.id} current={plan} />}
            {canDelete && <DeleteUserForm userId={u.id} name={name} />}
          </div>
        </div>
      ),
    };
  });
  return (
    <div className="bs-page">
      <div className="bs-page-h"><div><h1>Utilisateurs</h1><p>{users.length} compte(s)</p></div></div>
      <DataTable
        head={["Nom", "E-mail", "Téléphone", "Inscrit le", "Formule", "Dossier", "État"]}
        rows={rows}
        filters={[{ id: "CLIENT", label: "Particuliers" }, { id: "PRO", label: "Professionnels" }, { id: "SUSPENDED", label: "Suspendus" }]}
        filters2={[{ id: "FREE", label: "Gratuit" }, { id: "PRO", label: "Pro" }, { id: "OFFERED", label: "Pro offert" }, { id: "PREMIUM", label: "Premium" }]}
        label2="Formule"
        searchPlaceholder="Rechercher un nom, un e-mail, un numéro…"
        empty="Aucun utilisateur pour l'instant."
      />
    </div>
  );
}
