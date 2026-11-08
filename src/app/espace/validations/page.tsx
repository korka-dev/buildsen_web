import Link from "next/link";
import { api } from "@/lib/api";
import { STATUTS } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { ConversationSummary } from "@/lib/types";
import { BsIcon } from "@/components/bs/icons";

export const metadata = { title: "Demandes validées · BUILDSEN" };

// Demandes qu'au moins un professionnel du BTP a validées (il a écrit au client), regroupées par demande
export default async function Validations() {
  const { conversations } = await api<{ conversations: ConversationSummary[] }>("/api/client/conversations");
  const byRequest = new Map<string, { req: ConversationSummary["request"]; convs: ConversationSummary[] }>();
  for (const c of conversations) {
    const g = byRequest.get(c.request.ref) ?? { req: c.request, convs: [] };
    g.convs.push(c);
    byRequest.set(c.request.ref, g);
  }
  const groups = [...byRequest.values()];
  const fresh = conversations.filter((c) => c.unread).length;
  return (
    <div className="bs-page">
      <div className="bs-page-h">
        <div>
          <h1>Demandes validées</h1>
          <p>
            {groups.length
              ? `${groups.length} demande${groups.length > 1 ? "s" : ""} validée${groups.length > 1 ? "s" : ""} par des professionnels du BTP${fresh ? ` · ${fresh} nouveau${fresh > 1 ? "x" : ""}` : ""}`
              : "Les demandes que des professionnels du BTP ont examinées et validées apparaissent ici."}
          </p>
        </div>
      </div>
      {groups.length ? (
        <div className="bs-validated-grid">
          {groups.map(({ req, convs }) => (
            <section key={req.ref} className="bs-validated" aria-label={`Validation de la demande ${req.ref}`}>
              <div className="bs-validated-h">
                <span className="bs-validated-ico" aria-hidden="true"><BsIcon name="circleCheck" size={26} /></span>
                <div>
                  <b>{convs.length > 1 ? `Validée par ${convs.length} professionnels du BTP` : "Validée par un professionnel du BTP"}</b>
                  <small>{req.title} · {req.commune} · {req.ref}</small>
                </div>
                {convs.some((c) => c.unread) && <span className="bs-new-tag">Nouveau</span>}
              </div>
              <ul className="bs-validated-l">
                {convs.map((c) => (
                  <li key={c.id}>
                    <Link href={`/espace/messages/${c.id}`}>
                      <span className="bs-avatar" aria-hidden="true">{c.other.badge}</span>
                      <span>
                        <b>{c.other.name}</b>
                        <small>{c.other.statut ? STATUTS[c.other.statut].name : "Professionnel"} · profil vérifié · {dateFr(c.lastMessageAt)}</small>
                      </span>
                      {c.unread ? <span className="bs-new-tag">Nouveau message</span> : <BsIcon name="chevronRight" size={18} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="bs-panel bs-empty-box">
          <span className="bs-ico"><BsIcon name="circleCheck" /></span>
          <h2>Aucune validation pour l&apos;instant</h2>
          <p>Dès qu&apos;un professionnel du BTP valide votre demande, une alerte rouge apparaît à côté de cette rubrique du menu.</p>
          <Link className="btn p" href="/espace/demandes">Voir mes demandes</Link>
        </div>
      )}
    </div>
  );
}
