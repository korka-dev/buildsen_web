"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiCall } from "@/lib/client";
import { MAX_PROS_PER_REQUEST, fcfa } from "@/lib/constants";
import { ago, dateFr } from "@/lib/market";
import type { ServiceRequest } from "@/lib/types";
import { Places, RequestDetails } from "@/components/RequestDetails";
import { ReportForm } from "@/components/MessageComposer";
import { Modal } from "@/components/bs/Modal";
import { Toolbar, useSearch } from "@/components/Toolbar";
import { BsIcon } from "@/components/bs/icons";
import { StartConversation } from "../forms";

export type Row = ServiceRequest & { categoryName: string; myConversationId: string | null };

// Même rendu que Pill (components/ui.tsx), qui ne peut pas être importé ici : ce fichier s'exécute dans le navigateur
const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => <span className={`pill ${tone}`}>{children}</span>;

/** Liste des demandes ; un clic ouvre le détail et le message au client dans une fenêtre, comme chez le particulier. */
export function ProRequestList({ rows, openId, filters, empty }: { rows: Row[]; openId?: string; filters?: React.ReactNode; empty?: React.ReactNode }) {
  const [id, setId] = useState<string | null>(openId ?? null);
  const { q, setQ, shown: searched } = useSearch(rows, (r) => [r.ref, r.title, r.commune, r.description, r.categoryName].join(" "));
  // Filtres par type de prestation et par commune
  const [cat, setCat] = useState("");
  const [com, setCom] = useState("");
  const cats = [...new Set(rows.map((r) => r.categoryName))].sort();
  const coms = [...new Set(rows.map((r) => r.commune))].sort();
  const shown = searched.filter((r) => (!cat || r.categoryName === cat) && (!com || r.commune === com));
  const router = useRouter();
  const path = usePathname();
  const close = () => {
    setId(null);
    // Adresse directe (/pro/demandes/ID) : retour à la liste à la fermeture
    if (path !== "/pro/demandes") router.replace("/pro/demandes", { scroll: false });
  };
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Rechercher une demande, une commune…" filters={(
        <div className="row" style={{ gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {cats.length > 1 && <select className="inp" style={{ width: "auto" }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrer par prestation"><option value="">Toutes les prestations</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>}
          {coms.length > 1 && <select className="inp" style={{ width: "auto" }} value={com} onChange={(e) => setCom(e.target.value)} aria-label="Filtrer par commune"><option value="">Toutes les communes</option>{coms.map((c) => <option key={c}>{c}</option>)}</select>}
          {filters}
        </div>
      )} />
      {shown.length === 0 ? (q || cat || com ? <div className="card flat"><span className="muted">Aucun résultat pour cette recherche.</span></div> : empty) : (
      <ul className="bs-req-list">
        {shown.map((r) => {
          const n = r.conversations ?? 0, full = n >= MAX_PROS_PER_REQUEST;
          return (
            <li key={r.id}>
              <button type="button" className="bs-req" onClick={() => setId(r.id)}>
                <div className="bs-req-main">
                  <div className="bs-req-top">
                    {r.myConversationId ? <Pill tone="ok">Vous avez écrit</Pill> : full ? <Pill tone="warn">Complète</Pill> : <Pill tone="ink">À répondre</Pill>}
                    <span className="bs-req-ref">{r.ref}</span>
                  </div>
                  <b>{r.title}</b>
                  <span className="bs-req-meta">
                    <span><BsIcon name="mapPin" size={15} /> {r.commune}</span>
                    <span><BsIcon name="calendar" size={15} /> {r.deadline}</span>
                    <span>{ago(r.publishedAt)}</span>
                  </span>
                </div>
                <div className="bs-req-side">
                  <b className="num">{fcfa(r.budget)}</b>
                  {!r.myConversationId && !full && (
                    <span className="bs-req-pros"><Places taken={n} max={MAX_PROS_PER_REQUEST} />{MAX_PROS_PER_REQUEST - n} place{MAX_PROS_PER_REQUEST - n > 1 ? "s" : ""}</span>
                  )}
                  <BsIcon name="chevronRight" size={20} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      )}
      <Modal open={!!id} onClose={close} title="Détail de la demande" wide>
        {id ? <RequestPanel key={id} id={id} /> : null}
      </Modal>
    </>
  );
}

type Res = { request: ServiceRequest; myConversationId: string | null; full: boolean };

function RequestPanel({ id }: { id: string }) {
  const [data, setData] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    apiCall(`/api/pro/requests/${encodeURIComponent(id)}`, { method: "GET" }).then((r) => (r.ok ? setData(r.data as unknown as Res) : setErr(r.error)));
  }, [id]);
  if (err && !data) return <p className="err-t" role="alert">{err}</p>;
  if (!data) return <p className="bs-empty">Chargement…</p>;
  const { request: r, myConversationId: mine, full } = data;
  const n = r.conversations ?? 0;
  return (
    <div className="bs-req-modal">
      {!mine && r.state === "PUBLISHED" && !full && (
        <button type="button" className="btn p only-m" style={{ alignSelf: "stretch" }} onClick={() => document.getElementById("ecrire-client")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          Écrire au client
        </button>
      )}
      <div className="bs-req-head-in">
        <h3>{r.title}</h3>
        <div className="bs-req-meta">
          <span><BsIcon name="mapPin" size={15} /> {r.commune}{r.district ? `, ${r.district}` : ""}</span>
          {r.publishedAt && <span><BsIcon name="calendar" size={15} /> Publiée le {dateFr(r.publishedAt)}</span>}
          <span className="bs-req-pros"><Places taken={n} max={MAX_PROS_PER_REQUEST} />{n}/{MAX_PROS_PER_REQUEST} professionnels</span>
        </div>
      </div>

      <section className="bs-req-sec">
        <RequestDetails r={r} />
      </section>
      <section id="ecrire-client" className="bs-req-sec" style={{ scrollMarginTop: 12 }}>
        <div className="bs-panel-h"><h4><BsIcon name="messages" size={18} /> Écrire au client</h4></div>
        {mine ? (
          <div className="stack" style={{ gap: 10 }}>
            <p className="small muted" style={{ margin: 0 }}>Vous avez déjà une conversation avec ce client.</p>
            <Link className="btn p" href={`/pro/messages/${mine}`} style={{ alignSelf: "flex-start" }}>Ouvrir la conversation</Link>
          </div>
        ) : r.state !== "PUBLISHED" ? (
          <div className="note">Cette demande n&apos;est plus ouverte.</div>
        ) : full ? (
          <div className="note w">Demande complète : {MAX_PROS_PER_REQUEST} professionnels ont déjà écrit au client.</div>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            <p className="small muted" style={{ margin: 0 }}>Le client lira votre message dans la messagerie BUILDSEN. S&apos;il souhaite continuer avec vous, il partagera son WhatsApp.</p>
            <StartConversation requestId={r.id} />
          </div>
        )}
      </section>

      {r.state === "PUBLISHED" && <ReportForm requestId={r.id} />}
    </div>
  );
}
