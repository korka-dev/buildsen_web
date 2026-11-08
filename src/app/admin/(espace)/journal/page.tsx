/* eslint-disable react/jsx-key -- cellules de tableau : positionnelles, jamais réordonnées */
import { api } from "@/lib/api";
import { DataTable, type DataRow } from "../DataTable";

export const metadata = { title: "Journal d'audit · Administration BUILDSEN" };

type Log = { id: string; createdAt: string; actor: string | null; action: string; target: string | null };
const when = (d: string) => new Date(d).toLocaleString("fr-FR", { timeZone: "Africa/Dakar" });

export default async function Journal() {
  const { logs } = await api<{ logs: Log[] }>("/api/admin/journal");
  const rows: DataRow[] = logs.map((l) => ({
    key: l.id, title: "Entrée du journal", text: [l.actor, l.action, l.target, when(l.createdAt)].join(" "),
    cells: [<span className="small num" style={{ whiteSpace: "nowrap" }}>{when(l.createdAt)}</span>, l.actor ?? "—", l.action, <span className="small muted">{l.target ?? ""}</span>],
    view: (
      <div className="tbl"><table className="t"><tbody>
        <tr><td className="muted" style={{ width: 160 }}>Date</td><td>{when(l.createdAt)}</td></tr>
        <tr><td className="muted">Auteur</td><td>{l.actor ?? "—"}</td></tr>
        <tr><td className="muted">Action</td><td>{l.action}</td></tr>
        <tr><td className="muted">Cible</td><td>{l.target ?? "—"}</td></tr>
      </tbody></table></div>
    ),
  }));
  return (
    <div className="bs-page">
      <div className="bs-page-h"><div><h1>Journal d&apos;audit</h1><p>Lecture seule. Les 200 dernières actions.</p></div></div>
      <DataTable head={["Date", "Auteur", "Action", "Cible"]} rows={rows} searchPlaceholder="Rechercher une action, un auteur, une cible…" empty="Le journal est vide." />
    </div>
  );
}
