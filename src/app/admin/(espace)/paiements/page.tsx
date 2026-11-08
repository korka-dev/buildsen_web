/* eslint-disable react/jsx-key -- cellules de tableau : positionnelles, jamais réordonnées */
import { api } from "@/lib/api";
import { PLANS, fcfa, type PlanKey } from "@/lib/constants";
import { Pill } from "@/components/ui";
import { ImportButton, PayActions, PricingButton } from "./PayActions";
import { DataTable, type DataRow } from "../DataTable";

export const metadata = { title: "Paiements · Administration BUILDSEN" };

type Row = { id: string; who: string; plan: PlanKey; months: number; amount: number; provider: string; claimed: boolean; payerPhone: string | null; state: string; source: string; createdAt: string; paidAt: string | null };
const STATE: Record<string, [string, string]> = { PENDING: ["En attente", "warn"], PROVISIONAL: ["Activé, à confirmer", "warn"], PAID: ["Payé", "ok"], FAILED: ["Échoué", "err"], EXPIRED: ["Expiré", ""] };
const when = (d: string | null) => (d ? new Date(d).toLocaleString("fr-FR", { timeZone: "Africa/Dakar" }) : "—");

export default async function Paiements() {
  const { payments } = await api<{ payments: Row[] }>("/api/admin/payments");
  const { prices } = await api<{ prices: Record<string, number> }>("/api/admin/pricing");
  const paid = payments.filter((p) => p.state === "PAID");
  const toConfirm = payments.filter((p) => (p.provider === "wave" || p.provider === "om") && p.state === "PROVISIONAL").length;
  const rows: DataRow[] = payments.map((p) => {
    const [label, tone] = STATE[p.state] ?? [p.state, ""];
    const origin = `${p.source === "wa" ? "WhatsApp" : "Site"} · ${p.provider === "sim" ? "simulé" : p.provider === "om" ? "Orange Money" : p.provider === "wave" ? "Wave" : p.provider}`;
    return {
      key: p.id, group: p.state, group2: p.plan, title: `Paiement · ${p.who}`,
      text: [p.who, PLANS[p.plan].name, p.amount, label, origin].join(" "),
      cells: [
        <span className="small num" style={{ whiteSpace: "nowrap" }}>{when(p.createdAt)}</span>,
        <b>{p.who}</b>,
        `${PLANS[p.plan].name} · ${p.months} mois`,
        <span className="num" style={{ whiteSpace: "nowrap" }}>{fcfa(p.amount)}</span>,
        <span className="small muted">{origin}</span>,
        <Pill tone={tone}>{label}</Pill>,
      ],
      actions: (p.provider === "wave" || p.provider === "om") && ["PENDING", "PROVISIONAL", "EXPIRED"].includes(p.state) ? <PayActions id={p.id} /> : undefined,
      view: (
        <div className="tbl"><table className="t"><tbody>
          <tr><td className="muted" style={{ width: 180 }}>Professionnel</td><td>{p.who}</td></tr>
          <tr><td className="muted">Formule</td><td>{PLANS[p.plan].name} · {p.months} mois</td></tr>
          <tr><td className="muted">Montant</td><td>{fcfa(p.amount)}</td></tr>
          <tr><td className="muted">État</td><td><Pill tone={tone}>{label}</Pill></td></tr>
          <tr><td className="muted">Origine</td><td>{origin}</td></tr>
          {(p.provider === "wave" || p.provider === "om") && <tr><td className="muted">{p.provider === "om" ? "Orange Money" : "Wave"}</td><td>{p.claimed ? "Le professionnel dit avoir payé" : "Pas encore signalé"}{p.payerPhone ? ` · numéro ${p.payerPhone}` : ""}</td></tr>}
          <tr><td className="muted">Demandé le</td><td>{when(p.createdAt)}</td></tr>
          <tr><td className="muted">Payé le</td><td>{when(p.paidAt)}</td></tr>
          <tr><td className="muted">Référence</td><td className="small num">{p.id}</td></tr>
        </tbody></table></div>
      ),
    };
  });
  return (
    <div className="bs-page">
      <div className="bs-page-h">
        <div>
          <h1>Paiements</h1>
          <p>{toConfirm ? `${toConfirm} à confirmer · ` : ""}{paid.length} payé{paid.length > 1 ? "s" : ""} · {fcfa(paid.reduce((n, p) => n + p.amount, 0))} encaissés{payments.some((p) => p.provider === "sim") ? " · paiements simulés (développement)" : ""}</p>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}><ImportButton /><PricingButton prices={prices} /></div>
      </div>
      <DataTable
        head={["Date", "Professionnel", "Formule", "Montant", "Origine", "État"]}
        rows={rows}
        filters={[{ id: "PAID", label: "Payés" }, { id: "PENDING", label: "En attente" }, { id: "PROVISIONAL", label: "À confirmer" }, { id: "FAILED", label: "Échoués" }]}
        filters2={[{ id: "PRO", label: "Pro" }, { id: "PREMIUM", label: "Premium" }]}
        label2="Formule"
        searchPlaceholder="Rechercher un professionnel, une formule…"
        empty="Aucun paiement pour l'instant."
      />
    </div>
  );
}
