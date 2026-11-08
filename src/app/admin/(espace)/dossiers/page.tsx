import Link from "next/link";
import { api } from "@/lib/api";
import { DOSSIER_LABELS } from "@/lib/constants";
import { DossiersTable, type DossierRow } from "../AdminTables";

export const metadata = { title: "Dossiers · Administration BUILDSEN" };

export default async function Dossiers({ searchParams }: { searchParams: Promise<{ etat?: string }> }) {
  const { etat = "PENDING" } = await searchParams;
  const { state, dossiers: list } = await api<{ state: string; dossiers: DossierRow[] }>(`/api/admin/dossiers?etat=${encodeURIComponent(etat)}`);
  return (
    <>
      <div className="ph">
        <h1>Dossiers des professionnels</h1>
      </div>
      <DossiersTable rows={list} empty="Aucun dossier dans cet état." filters={(
        <div className="row tabs" style={{ gap: 6, flexWrap: "wrap" }}>
          {Object.entries(DOSSIER_LABELS).map(([k, [t]]) => (
            <Link key={k} href={`/admin/dossiers?etat=${k}`} className={`btn sm ${k === state ? "d" : "g"}`}>{t}</Link>
          ))}
        </div>
      )} />
    </>
  );
}
