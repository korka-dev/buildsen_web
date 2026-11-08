/* eslint-disable react/jsx-key -- cellules de tableau : positionnelles, jamais réordonnées */
import { api } from "@/lib/api";
import { Pill } from "@/components/ui";
import { Stars } from "@/components/Stars";
import { DataTable, type DataRow } from "../DataTable";
import { ReviewActions } from "./ReviewActions";

export const metadata = { title: "Avis · Administration BUILDSEN" };

type Row = { id: string; rating: number; comment: string | null; state: "VISIBLE" | "HIDDEN"; createdAt: string; client: string; pro: string };
const when = (d: string) => new Date(d).toLocaleDateString("fr-FR", { timeZone: "Africa/Dakar" });

// Avis des clients : l'équipe masque ceux qui sont contraires aux règles (injure, faux avis) et peut les remettre en ligne
export default async function Avis() {
  const { reviews } = await api<{ reviews: Row[] }>("/api/admin/reviews");
  const rows: DataRow[] = reviews.map((r) => ({
    key: r.id, group: r.state, group2: String(r.rating), title: `Avis · ${r.pro}`,
    text: [r.pro, r.client, r.comment ?? "", r.rating].join(" "),
    cells: [
      <span className="small num" style={{ whiteSpace: "nowrap" }}>{when(r.createdAt)}</span>,
      <b>{r.pro}</b>,
      r.client,
      <Stars value={r.rating} />,
      <span className="small">{r.comment ? (r.comment.length > 70 ? `${r.comment.slice(0, 70)}…` : r.comment) : "—"}</span>,
      <Pill tone={r.state === "VISIBLE" ? "ok" : "warn"}>{r.state === "VISIBLE" ? "En ligne" : "Masqué"}</Pill>,
    ],
    actions: <ReviewActions id={r.id} hidden={r.state === "HIDDEN"} />,
    view: (
      <div className="stack" style={{ gap: 8 }}>
        <div><b>{r.pro}</b> <span className="muted small">noté par {r.client} · {when(r.createdAt)}</span></div>
        <Stars value={r.rating} size={22} />
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.comment || "Aucun commentaire."}</p>
      </div>
    ),
  }));
  return (
    <div className="bs-page">
      <div className="bs-page-h"><div><h1>Avis</h1><p>{reviews.length} avis · {reviews.filter((r) => r.state === "HIDDEN").length} masqué{reviews.filter((r) => r.state === "HIDDEN").length > 1 ? "s" : ""}</p></div></div>
      <DataTable
        head={["Date", "Professionnel", "Client", "Note", "Commentaire", "État"]}
        rows={rows}
        filters={[{ id: "VISIBLE", label: "En ligne" }, { id: "HIDDEN", label: "Masqués" }]}
        filters2={[5, 4, 3, 2, 1].map((n) => ({ id: String(n), label: `${n} ★` }))}
        label2="Note"
        searchPlaceholder="Rechercher un professionnel, un client, un mot…"
        empty="Aucun avis pour l'instant."
      />
    </div>
  );
}
