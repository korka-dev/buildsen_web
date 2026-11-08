import Link from "next/link";
import { api } from "@/lib/api";

export const metadata = { title: "Vue d'ensemble · Administration BUILDSEN" };

type Overview = { pros: number; verified: number; pending: number; more: number; clients: number; flagged: number; published: number; conversations: number; reports: number; clientsOpen: boolean };

export default async function Overview() {
  const o = await api<Overview>("/api/admin/overview");
  const k: [string, number][] = [["Professionnels inscrits", o.pros], ["Profils vérifiés", o.verified], ["Dossiers à examiner", o.pending], ["Compléments en attente", o.more], ["Particuliers inscrits", o.clients],
    ...(o.clientsOpen ? [["Demandes en ligne", o.published], ["Demandes signalées", o.flagged], ["Conversations ouvertes", o.conversations], ["Signalements à traiter", o.reports]] as [string, number][] : [])];
  return (
    <>
      <div className="ph"><div><h1>Vue d&apos;ensemble</h1><p className="muted">{o.clientsOpen ? "Plateforme ouverte aux particuliers." : "Phase pilote : inscription des professionnels."}</p></div></div>
      <div className="kpis">{k.map(([l, v]) => <div key={l} className="kpi"><div className="l">{l}</div><div className="v num">{v}</div></div>)}</div>
      {(o.pending > 0 || o.flagged > 0 || o.reports > 0) && (
        <div className="list" style={{ marginTop: 22 }}>
          {o.flagged > 0 && <Link className="li" href="/admin/demandes?signalees=1"><div className="grow"><b>{o.flagged} demande{o.flagged > 1 ? "s" : ""} signalée{o.flagged > 1 ? "s" : ""}</b></div><span className="btn o sm">Ouvrir</span></Link>}
          {o.reports > 0 && <Link className="li" href="/admin/signalements"><div className="grow"><b>{o.reports} signalement{o.reports > 1 ? "s" : ""} à traiter</b></div><span className="btn o sm">Ouvrir</span></Link>}
          {o.pending > 0 && <Link className="li" href="/admin/dossiers"><div className="grow"><b>{o.pending} dossier{o.pending > 1 ? "s" : ""} à examiner</b></div><span className="btn o sm">Ouvrir</span></Link>}
        </div>
      )}
    </>
  );
}
