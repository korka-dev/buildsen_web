import Link from "next/link";
import { redirect } from "next/navigation";
import { apiRaw } from "@/lib/api";
import { CLIENTS_OPEN, MAX_PROS_PER_REQUEST } from "@/lib/constants";
import { BsIcon } from "@/components/bs/icons";
import { ProRequestList, type Row } from "./ProRequestList";

// Page « Demandes » ; openId ouvre directement le détail d'une demande dans la fenêtre
export async function ProRequestsView({ openId, vue, tout }: { openId?: string; vue?: string; tout?: string }) {
  if (!CLIENTS_OPEN)
    return <div className="bs-page"><div className="bs-page-h"><div><h1>Demandes</h1></div></div><div className="note">Les demandes des particuliers seront affichées ici dès l&apos;ouverture.</div></div>;
  const { status, data } = await apiRaw<{ filtered: boolean; hasSpecialties: boolean; requests: Row[]; stats?: { commune: string | null; monthZone: number; full: number; bigLocked: number } }>(`/api/pro/requests${tout ? "?tout=true" : ""}`);
  if (status === 401) redirect("/connexion");
  if (status === 403) redirect("/pro/verification");
  const { filtered: mine, hasSpecialties, requests: all, stats } = data;
  // Trois vues : à répondre (places libres), déjà contactées, toutes
  const isOpen = (r: Row) => !r.myConversationId && (r.conversations ?? 0) < MAX_PROS_PER_REQUEST;
  const views = { ouvertes: all.filter(isOpen), ecrites: all.filter((r) => r.myConversationId), toutes: all } as const;
  const view = vue === "ecrites" || vue === "toutes" ? vue : "ouvertes";
  const list = views[view];
  const keep = tout ? "&tout=1" : "";
  return (
    <div className="bs-page">
      <div className="bs-page-h">
        <div>
          <h1>Demandes</h1>
          <p>{all.length ? `${views.ouvertes.length} à répondre · ${all.length} au total` : "Aucune demande pour l'instant"}</p>
        </div>
      </div>
      {!!stats?.bigLocked && (
        <div className="note row between" style={{ gap: 12 }}>
          <span><b>{stats.bigLocked} demande{stats.bigLocked > 1 ? "s" : ""} à gros budget {stats.bigLocked > 1 ? "sont réservées" : "est réservée"} aux abonnés.</b> Passez à Pro pour {stats.bigLocked > 1 ? "les" : "la"} voir et contacter le client.</span>
          <Link className="btn p sm" href="/pro/abonnement">Voir les formules</Link>
        </div>
      )}
      <ProRequestList
        rows={openId && !list.some((r) => r.id === openId) ? all : list}
        openId={openId}
        filters={(
          <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {hasSpecialties && (
            <div className="row" style={{ gap: 6 }}>
              <Link className={`btn sm ${mine ? "p" : "g"}`} href={`/pro/demandes?vue=${view}`}>Mes spécialités</Link>
              <Link className={`btn sm ${!mine ? "p" : "g"}`} href={`/pro/demandes?vue=${view}&tout=1`}>Toutes les spécialités</Link>
            </div>
          )}
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }} role="tablist" aria-label="Filtrer les demandes">
            {([["ouvertes", "À répondre"], ["ecrites", "Déjà contactées"], ["toutes", "Toutes"]] as const).map(([k, label]) => (
              <Link key={k} role="tab" aria-selected={view === k} className={`btn sm ${view === k ? "p" : "g"}`} href={`/pro/demandes?vue=${k}${keep}`}>
                {label} <span className="num" style={{ opacity: 0.75 }}>{views[k].length}</span>
              </Link>
            ))}
          </div>
          </div>
        )}
        empty={(
          <div className="bs-panel bs-empty-box">
            <span className="bs-ico"><BsIcon name="list" /></span>
            <h2>{view === "ecrites" ? "Aucun client contacté" : view === "ouvertes" && all.length ? "Rien à répondre pour le moment" : "Aucune demande pour le moment"}</h2>
            <p>{view === "ecrites" ? "Ouvrez une demande et présentez-vous au client." : "Vous êtes prévenu dès qu'une nouvelle demande arrive."}</p>
            {all.length > 0 && view !== "toutes" && <Link className="btn p" href="/pro/demandes?vue=toutes">Voir toutes les demandes</Link>}
          </div>
        )}
      />
    </div>
  );
}
