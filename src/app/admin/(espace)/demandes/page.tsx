import Link from "next/link";
import { api } from "@/lib/api";
import { RequestsTable, type RequestRow } from "../AdminTables";

export const metadata = { title: "Demandes · Administration BUILDSEN" };

const TABS: [string, string][] = [["PUBLISHED", "En ligne"], ["REJECTED", "Retirées"], ["CLOSED", "Clôturées"]];

// Les demandes sont publiées directement : l'équipe surveille et retire celles qui ne respectent pas les règles
export default async function AdminRequests({ searchParams }: { searchParams: Promise<{ etat?: string; signalees?: string }> }) {
  const { etat = "PUBLISHED", signalees } = await searchParams;
  const { state, requests: list } = await api<{ state: string; requests: RequestRow[] }>(`/api/admin/requests?etat=${encodeURIComponent(etat)}${signalees ? "&signalees=true" : ""}`);
  return (
    <>
      <div className="ph"><div className="stack" style={{ gap: 6 }}><h1>Demandes des particuliers</h1><p className="muted" style={{ margin: 0 }}>Publiées directement. Retirez celles qui ne respectent pas les règles : le client est prévenu avec le motif.</p></div></div>
      <RequestsTable rows={list} empty="Aucune demande ici." filters={(
        <div className="row tabs" style={{ gap: 6, flexWrap: "wrap" }}>
          {TABS.map(([k, t]) => <Link key={k} href={`/admin/demandes?etat=${k}`} className={`btn sm ${k === state && !signalees ? "d" : "g"}`}>{t}</Link>)}
          <Link href="/admin/demandes?signalees=1" className={`btn sm ${signalees ? "d" : "g"}`}>Signalées</Link>
        </div>
      )} />
    </>
  );
}
