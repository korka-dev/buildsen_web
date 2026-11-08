import Link from "next/link";
import { api } from "@/lib/api";
import { ReportsTable, type ReportRow } from "../AdminTables";

export const metadata = { title: "Signalements · Administration BUILDSEN" };

// Signalements : la conversation n'est lue par l'équipe que dans ce cadre (consultation journalisée)
export default async function Reports({ searchParams }: { searchParams: Promise<{ voir?: string; traites?: string }> }) {
  const { voir, traites } = await searchParams;
  const q = new URLSearchParams({ ...(traites ? { traites: "true" } : {}), ...(voir ? { voir } : {}) });
  const { reports: list } = await api<{ reports: ReportRow[] }>(`/api/admin/reports?${q}`);
  return (
    <>
      <div className="ph"><div className="stack" style={{ gap: 6 }}><h1>Signalements</h1><p className="muted" style={{ margin: 0 }}>Conversations et demandes signalées. BUILDSEN ne tranche pas les désaccords sur une prestation : l&apos;équipe traite les abus (fraude, faux profil, harcèlement).</p></div></div>
      <ReportsTable rows={list} empty={`Aucun signalement ${traites ? "traité" : "à traiter"}.`} filters={(
        <div className="row tabs" style={{ gap: 6, flexWrap: "wrap" }}>
          <Link href="/admin/signalements" className={`btn sm ${!traites ? "d" : "g"}`}>À traiter</Link>
          <Link href="/admin/signalements?traites=1" className={`btn sm ${traites ? "d" : "g"}`}>Traités</Link>
        </div>
      )} />
    </>
  );
}
