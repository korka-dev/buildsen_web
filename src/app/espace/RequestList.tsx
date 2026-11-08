"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiCall } from "@/lib/client";
import { CATEGORIES, MAX_PROS_PER_REQUEST, REQUEST_LABELS, STATUTS, fcfa } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { ConversationSummary, ServiceRequest } from "@/lib/types";
import { Places, RequestDetails } from "@/components/RequestDetails";
import { Modal } from "@/components/bs/Modal";
import { BsIcon } from "@/components/bs/icons";
import { ConvList } from "./ConvList";

// Même rendu que Pill (components/ui.tsx), qui ne peut pas être importé ici : ce fichier s'exécute dans le navigateur
const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => <span className={`pill ${tone}`}>{children}</span>;

type Detail = { request: ServiceRequest; conversations: ConversationSummary[] };

/** Liste des demandes ; un clic ouvre le détail dans un modal. */
export function RequestList({ requests, openRef, published }: { requests: ServiceRequest[]; openRef?: string; published?: boolean }) {
  const [ref, setRef] = useState<string | null>(openRef ?? null);
  const router = useRouter();
  const path = usePathname();
  const close = () => {
    setRef(null);
    // Adresse partagée (/espace/demandes/REF) : retour à la liste à la fermeture
    if (path !== "/espace/demandes") router.replace("/espace/demandes", { scroll: false });
  };
  return (
    <>
      <ul className="bs-req-list">
        {requests.map((r) => {
          const [label, tone] = REQUEST_LABELS[r.state];
          return (
            <li key={r.id}>
              <button type="button" className="bs-req" onClick={() => setRef(r.ref)}>
                <div className="bs-req-main">
                  <div className="bs-req-top">
                    <Pill tone={tone}>{label}</Pill>
                    <span className="bs-req-ref">{r.ref}</span>
                  </div>
                  <b>{r.title}</b>
                  <span className="bs-req-meta">
                    <span><BsIcon name="filePen" size={15} /> {CATEGORIES[r.category]?.name ?? r.category}</span>
                    <span><BsIcon name="mapPin" size={15} /> {r.commune}</span>
                    <span><BsIcon name="calendar" size={15} /> {dateFr(r.createdAt)}</span>
                  </span>
                </div>
                <div className="bs-req-side">
                  <b className="num">{fcfa(r.budget)}</b>
                  {r.state === "PUBLISHED" ? (
                    <span className="bs-req-pros"><Places taken={r.conversations ?? 0} max={MAX_PROS_PER_REQUEST} />{r.conversations ?? 0}/{MAX_PROS_PER_REQUEST} pros</span>
                  ) : null}
                  <BsIcon name="chevronRight" size={20} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <Modal open={!!ref} onClose={close} title="Détail de la demande" wide>
        {ref ? <RequestPanel key={ref} reqRef={ref} published={published && ref === openRef} /> : null}
      </Modal>
    </>
  );
}

function RequestPanel({ reqRef, published }: { reqRef: string; published?: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [err, setErr] = useState("");
  const [closing, setClosing] = useState(false);

  const load = useCallback(async () => {
    const r = await apiCall(`/api/client/requests/${encodeURIComponent(reqRef)}`, { method: "GET" });
    if (r.ok) setData(r.data as unknown as Detail);
    else setErr(r.error);
  }, [reqRef]);
  useEffect(() => {
    load();
  }, [load]);

  async function closeRequest() {
    if (!window.confirm("Clôturer cette demande ? Plus aucun professionnel ne pourra vous écrire à son sujet.")) return;
    setClosing(true);
    const r = await apiCall(`/api/client/requests/${encodeURIComponent(reqRef)}/close`);
    setClosing(false);
    if (!r.ok) return setErr(r.error);
    await load();
    router.refresh();
  }

  if (err && !data) return <p className="err-t" role="alert">{err}</p>;
  if (!data) return <p className="bs-empty">Chargement…</p>;
  const { request: r, conversations } = data;
  const [label, tone] = REQUEST_LABELS[r.state];
  const canClose = r.state === "PUBLISHED" || r.state === "PENDING";
  const showPros = r.state !== "PENDING" && r.state !== "REJECTED";

  return (
    <div className="bs-req-modal">
      <div className="bs-req-head-in">
        <div className="bs-req-top">
          <Pill tone={tone}>{label}</Pill>
          <span className="bs-req-ref">{r.ref}</span>
        </div>
        <h3>{r.title}</h3>
        <div className="bs-req-meta">
          <span><BsIcon name="filePen" size={15} /> {CATEGORIES[r.category]?.name ?? r.category}</span>
          <span><BsIcon name="mapPin" size={15} /> {r.commune}{r.district ? `, ${r.district}` : ""}</span>
          <span><BsIcon name="calendar" size={15} /> Déposée le {dateFr(r.createdAt)}</span>
        </div>
        <div className="bs-req-head-f">
          <span className="bs-budget"><small>Budget</small><b className="num">{fcfa(r.budget)}</b></span>
          {canClose && (
            <button type="button" className="btn g sm" onClick={closeRequest} disabled={closing}>
              {closing ? "Clôture…" : "Clôturer la demande"}
            </button>
          )}
        </div>
      </div>

      {err ? <p className="err-t" role="alert">{err}</p> : null}
      {published && <div className="note ok"><b>Demande publiée !</b> Les professionnels vérifiés de votre zone sont prévenus. Vous recevrez un e-mail à chaque message d&apos;un professionnel.</div>}
      {r.state === "PENDING" && !published && <div className="note">Votre demande est en attente de publication.</div>}
      {r.state === "REJECTED" && <div className="note e"><b>Demande retirée par notre équipe.</b> {r.rejectReason}</div>}
      {r.state === "CLOSED" && <div className="note">Demande clôturée : plus aucun professionnel ne peut vous écrire à son sujet.</div>}

      {r.state === "PUBLISHED" && (
        conversations.length ? (
          <section className="bs-validated" aria-label="Validation par les professionnels">
            <div className="bs-validated-h">
              <span className="bs-validated-ico" aria-hidden="true"><BsIcon name="circleCheck" size={26} /></span>
              <div>
                <b>{conversations.length > 1 ? `Validée par ${conversations.length} professionnels du BTP` : "Validée par un professionnel du BTP"}</b>
                <small>{conversations.length > 1 ? "Ils ont examiné votre demande et vous proposent leurs services." : "Il a examiné votre demande et vous propose ses services."}</small>
              </div>
              {conversations.some((c) => c.unread) && <span className="bs-new-tag">Nouveau</span>}
            </div>
            <ul className="bs-validated-l">
              {conversations.map((c) => (
                <li key={c.id}>
                  <a href={`/espace/messages/${c.id}`}>
                    <span className="bs-avatar" aria-hidden="true">{c.other.badge}</span>
                    <span><b>{c.other.name}</b><small>{c.other.statut ? STATUTS[c.other.statut].name : "Professionnel"} · profil vérifié</small></span>
                    {c.unread ? <span className="bs-new-tag">Nouveau message</span> : <BsIcon name="chevronRight" size={18} />}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="bs-validated bs-validated-wait" aria-label="Validation par les professionnels">
            <div className="bs-validated-h">
              <span className="bs-validated-ico" aria-hidden="true"><BsIcon name="bell" size={26} /></span>
              <div>
                <b>En attente de validation</b>
                <small>Les professionnels du BTP examinent votre demande. Vous serez prévenu ici, en rouge, dès que l&apos;un d&apos;eux la valide.</small>
              </div>
            </div>
          </section>
        )
      )}

      {showPros && (
        <section className="bs-req-sec">
          <div className="bs-panel-h">
            <h4><BsIcon name="messages" size={18} /> Professionnels qui vous ont écrit</h4>
            <span className="bs-req-pros"><Places taken={conversations.length} max={MAX_PROS_PER_REQUEST} />{conversations.length}/{MAX_PROS_PER_REQUEST}</span>
          </div>
          {conversations.length ? (
            <ConvList convs={conversations} />
          ) : (
            <p className="bs-empty">Aucun professionnel ne vous a encore écrit. Vous recevrez un e-mail dès le premier message.</p>
          )}
        </section>
      )}

      <section className="bs-req-sec bs-details">
        <h4><BsIcon name="list" size={18} /> Détails</h4>
        <RequestDetails r={r} hideBudget />
      </section>
    </div>
  );
}
