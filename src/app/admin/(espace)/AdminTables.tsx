"use client";

import { useEffect, useState } from "react";
import { apiCall } from "@/lib/client";
import { DOC_TYPES, DOSSIER_LABELS, MAX_PROS_PER_REQUEST, REQUEST_LABELS, SPECIALTIES, STATUTS, fcfa, formatPhone } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { Message, ProPrivate, ServiceRequest, User } from "@/lib/types";
import { RequestDetails } from "@/components/RequestDetails";
import { ChatThread } from "@/components/ChatThread";
import { ActionButton } from "@/components/ActionButton";
import { Modal } from "@/components/bs/Modal";
import { Toolbar, useSearch } from "@/components/Toolbar";
import { BsIcon } from "@/components/bs/icons";
import { DecisionForm, RemoveRequestForm } from "../forms";
import { DocumentDecision } from "./dossiers/[id]/DocumentDecision";

// Même rendu que Pill (components/ui.tsx), qui ne peut pas être importé ici : ce fichier s'exécute dans le navigateur
const Pill = ({ tone, children }: { tone: string; children: React.ReactNode }) => <span className={`pill ${tone}`}>{children}</span>;
const DOC_STATE: Record<string, [string, string]> = { RECEIVED: ["À examiner", "warn"], ACCEPTED: ["Accepté", "ok"], REFUSED: ["Refusé", "err"] };

/** Bouton « Visualiser » de la colonne Actions. */
function View({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="btn o sm" onClick={onClick} aria-label={`Visualiser ${label}`}>
      <BsIcon name="eye" size={16} /> Visualiser
    </button>
  );
}

// Toucher une ligne (surtout utile sur téléphone, où la colonne Actions est hors de l'écran) ouvre la même fenêtre que « Visualiser »
const rowOpen = (open: () => void) => ({
  className: "bs-tr-click",
  onClick: (e: React.MouseEvent) => { if (!(e.target as HTMLElement).closest("button, a, input, select, label")) open(); },
});

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="tbl">
      <table className="t">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}<th style={{ textAlign: "right" }}>Actions</th></tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Dossiers
// ---------------------------------------------------------------------------------------------------------------------------------

export type DossierRow = ProPrivate & { user: User; credentialsCount: number; portfolioCount: number; notSubmitted: boolean };

export function DossiersTable({ rows, filters, empty }: { rows: DossierRow[]; filters?: React.ReactNode; empty: string }) {
  const [id, setId] = useState<string | null>(null);
  const cur = rows.find((r) => r.id === id);
  const { q, setQ, shown } = useSearch(rows, (p) => [p.companyName, p.user.firstName, p.user.lastName, p.user.email, p.user.phone, p.statut && STATUTS[p.statut].name, p.commune].join(" "));
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Rechercher un professionnel…" filters={filters} />
      {shown.length === 0 ? <div className="card flat"><span className="muted">{q ? "Aucun résultat pour cette recherche." : empty}</span></div> : (
      <Table head={["Professionnel", "Statut", "Justificatifs", "Réalisations", "Date", "État"]}>
        {shown.map((p) => (
          <tr key={p.id} {...rowOpen(() => setId(p.id))}>
            <td><b>{p.companyName ?? `${p.user.firstName} ${p.user.lastName}`}</b>{p.companyName && <><br /><span className="small muted">{p.user.firstName} {p.user.lastName}</span></>}</td>
            <td>{p.statut ? STATUTS[p.statut].name : <span className="muted">Non choisi</span>}</td>
            <td className="num">{p.credentialsCount}</td>
            <td className="num">{p.portfolioCount}</td>
            <td className="small" style={{ whiteSpace: "nowrap" }}>{p.submittedAt ? `Soumis le ${dateFr(p.submittedAt)}` : `Inscrit le ${dateFr(p.createdAt)}`}</td>
            <td>{p.notSubmitted ? <Pill tone="warn">Complet, non soumis</Pill> : <Pill tone={DOSSIER_LABELS[p.state]?.[1] ?? ""}>{DOSSIER_LABELS[p.state]?.[0] ?? p.state}</Pill>}</td>
            <td style={{ textAlign: "right" }}><View onClick={() => setId(p.id)} label={p.companyName ?? `${p.user.firstName} ${p.user.lastName}`} /></td>
          </tr>
        ))}
      </Table>
      )}
      <Modal open={!!id} onClose={() => setId(null)} title={cur ? `Dossier · ${cur.companyName ?? `${cur.user.firstName} ${cur.user.lastName}`}` : "Dossier"} wide>
        {id ? <DossierPanel key={id} id={id} /> : null}
      </Modal>
    </>
  );
}

type DossierData = { pro: ProPrivate; user: User; canDecide: boolean; notSubmitted: boolean };

function DossierPanel({ id }: { id: string }) {
  const [d, setD] = useState<DossierData | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    apiCall(`/api/admin/dossiers/${encodeURIComponent(id)}`, { method: "GET" }).then((r) => (r.ok ? setD(r.data as unknown as DossierData) : setErr(r.error)));
  }, [id]);
  if (err && !d) return <p className="err-t" role="alert">{err}</p>;
  if (!d) return <p className="bs-empty">Chargement…</p>;
  const { pro: p, user, canDecide: pending, notSubmitted } = d;
  const credentials = p.credentials ?? [], portfolio = p.portfolio ?? [];
  const info: [string, string][] = [
    ["Statut déclaré", p.statut ? STATUTS[p.statut].name : "—"],
    ...(p.companyName ? ([["Entreprise", p.companyName], ["Gérant", `${user.firstName} ${user.lastName}`]] as [string, string][]) : []),
    [p.statut === "ENT" ? "Établissement du responsable technique" : "Établissement", p.school ?? "—"],
    [p.statut === "ENT" ? "Diplôme du responsable technique" : "Diplôme", p.diploma ?? "—"],
    [p.statut === "ENT" ? "Années d'activité" : "Expérience", p.experienceYears != null ? `${p.experienceYears} an(s)` : "—"],
    ["E-mail", user.email],
    ["Téléphone", formatPhone(user.phone) || "—"],
    ["Commune", p.commune ?? "—"],
    ["Spécialités", p.specialties.map((s) => SPECIALTIES[s]).join(", ") || "—"],
  ];
  const [label, tone] = DOSSIER_LABELS[p.state] ?? [p.state, ""];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row between"><span className="muted small">Inscrit le {dateFr(p.createdAt)}{p.submittedAt && ` · soumis le ${dateFr(p.submittedAt)}`}</span><Pill tone={tone}>{label}</Pill></div>
      <section className="stack" style={{ gap: 8 }}>
        <h4>Informations</h4>
        <div className="tbl"><table className="t"><tbody>{info.map(([k, v]) => <tr key={k}><td className="muted" style={{ width: 200 }}>{k}</td><td>{v}</td></tr>)}</tbody></table></div>
        {p.bio && <p className="small" style={{ color: "var(--slate)" }}>{p.bio}</p>}
      </section>
      <section className="stack" style={{ gap: 8 }}>
        <h4>Justificatifs</h4>
        <p className="small muted">Chaque ouverture est inscrite au journal d&apos;audit. Les liens expirent après 60 secondes.</p>
        <div className="list">
          {credentials.map((c) => (
            <div key={c.id} className="li">
              <div className="grow"><b>{DOC_TYPES[c.type] ?? c.type}</b><br /><span className="small muted">{c.fileName} · {(c.size / 1048576).toFixed(1)} Mo</span>{c.reason && <><br /><span className="small" style={{ color: "var(--err)" }}>{c.reason}</span></>}</div>
              <Pill tone={DOC_STATE[c.state][1]}>{DOC_STATE[c.state][0]}</Pill>
              <a className="btn g sm" href={`/api/fichiers/justificatif/${c.id}`} target="_blank" rel="noopener">Consulter</a>
              {pending && <DocumentDecision credentialId={c.id} />}
            </div>
          ))}
          {credentials.length === 0 && <div className="li"><span className="muted small">Aucun justificatif envoyé.</span></div>}
        </div>
      </section>
      {portfolio.length > 0 && (
        <section className="stack" style={{ gap: 8 }}>
          <h4>Portfolio</h4>
          <div className="thumbs">{portfolio.map((it) => (
            <figure key={it.id} className="thumb">
              {it.mime === "application/pdf"
                ? <a className="pdf" href={`/api/fichiers/portfolio/${it.id}`} target="_blank" rel="noopener">PDF</a>
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={`/api/fichiers/portfolio/${it.id}`} alt={it.caption} loading="lazy" />}
              <figcaption>{it.caption}</figcaption>
            </figure>
          ))}</div>
        </section>
      )}
      <section className="stack" style={{ gap: 8 }}>
        <h4>Décision</h4>
        {notSubmitted && <div className="note w small">Dossier complet, mais le professionnel n&apos;a pas cliqué sur « Soumettre ». Vous pouvez quand même décider.</div>}
        {pending ? <DecisionForm proId={p.id} /> : <p className="small muted">Décision possible quand le dossier est complet : statut, formation, pièce d&apos;identité et diplôme.{p.decisionReason && <><br />Dernier motif : {p.decisionReason}</>}</p>}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Demandes
// ---------------------------------------------------------------------------------------------------------------------------------

export type RequestRow = ServiceRequest & { client: { name: string; email: string; phone: string | null }; reports: { id: string; reason: string; createdAt: string; reporter: string }[] };

export function RequestsTable({ rows, filters, empty }: { rows: RequestRow[]; filters?: React.ReactNode; empty: string }) {
  const [id, setId] = useState<string | null>(null);
  const r = rows.find((x) => x.id === id);
  const { q: term, setQ, shown } = useSearch(rows, (x) => [x.ref, x.title, x.commune, x.description, x.client.name, x.client.email, x.client.phone].join(" "));
  return (
    <>
      <Toolbar q={term} setQ={setQ} placeholder="Rechercher une demande, un client, une commune…" filters={filters} />
      {shown.length === 0 ? <div className="card flat"><span className="muted">{term ? "Aucun résultat pour cette recherche." : empty}</span></div> : (
      <Table head={["Référence", "Demande", "Client", "Commune", "Budget", "Publiée le", "Pros", "État"]}>
        {shown.map((q) => (
          <tr key={q.id} {...rowOpen(() => setId(q.id))}>
            <td className="small num" style={{ whiteSpace: "nowrap" }}>{q.ref}</td>
            <td style={{ minWidth: 220 }}><b>{q.title}</b></td>
            <td style={{ whiteSpace: "nowrap" }}>{q.client.name}<br /><span className="small muted">{formatPhone(q.client.phone)}</span></td>
            <td>{q.commune}</td>
            <td className="num" style={{ whiteSpace: "nowrap" }}>{fcfa(q.budget)}</td>
            <td className="small" style={{ whiteSpace: "nowrap" }}>{dateFr(q.publishedAt ?? q.createdAt)}</td>
            <td className="num">{q.state === "PUBLISHED" ? `${q.conversations ?? 0}/${MAX_PROS_PER_REQUEST}` : "—"}</td>
            <td>
              <Pill tone={REQUEST_LABELS[q.state][1]}>{REQUEST_LABELS[q.state][0]}</Pill>
              {q.reports.length > 0 && <><br /><Pill tone="warn">{q.reports.length} signalement{q.reports.length > 1 ? "s" : ""}</Pill></>}
            </td>
            <td style={{ textAlign: "right" }}><View onClick={() => setId(q.id)} label={q.ref} /></td>
          </tr>
        ))}
      </Table>
      )}
      <Modal open={!!r} onClose={() => setId(null)} title={r ? `Demande ${r.ref}` : "Demande"} wide>
        {r && (
          <div className="stack" style={{ gap: 14 }}>
            <div className="row between" style={{ gap: 10 }}>
              <div className="stack" style={{ gap: 2, minWidth: 0 }}>
                <b>{r.title}</b>
                <span className="small muted">{r.client.name} · {r.client.email} · {formatPhone(r.client.phone)} · publiée le {dateFr(r.publishedAt ?? r.createdAt)}</span>
              </div>
              <Pill tone={REQUEST_LABELS[r.state][1]}>{REQUEST_LABELS[r.state][0]}</Pill>
            </div>
            {r.reports.map((rep) => <div key={rep.id} className="note w small">Signalée par {rep.reporter} le {dateFr(rep.createdAt)} : {rep.reason}</div>)}
            <RequestDetails r={r} />
            {r.state === "REJECTED" && r.rejectReason && <div className="note e small">Retirée : {r.rejectReason}</div>}
            {r.state === "PUBLISHED" && <RemoveRequestForm id={r.id} />}
          </div>
        )}
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------
// Signalements
// ---------------------------------------------------------------------------------------------------------------------------------

export type ReportRow = {
  id: string; state: "OPEN" | "CLOSED"; reason: string; createdAt: string;
  reporter: { name: string; role: string };
  reported: { id: string; name: string; status: string } | null;
  request: { ref: string; title: string; client: string } | null;
  conversation: { id: string; client: string; clientFirstName: string; pro: string; proId: string; title: string; messages: Message[] | null } | null;
};

export function ReportsTable({ rows, filters, empty }: { rows: ReportRow[]; filters?: React.ReactNode; empty: string }) {
  const [id, setId] = useState<string | null>(null);
  const r = rows.find((x) => x.id === id);
  const { q, setQ, shown } = useSearch(rows, (x) => [x.reporter.name, x.reason, x.request?.ref, x.request?.title, x.request?.client, x.conversation?.client, x.conversation?.pro, x.conversation?.title].join(" "));
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder="Rechercher un signalement, une personne, un motif…" filters={filters} />
      {shown.length === 0 ? <div className="card flat"><span className="muted">{q ? "Aucun résultat pour cette recherche." : empty}</span></div> : (
      <Table head={["Date", "Signalé par", "Concerne", "Motif", "État"]}>
        {shown.map((x) => (
          <tr key={x.id} {...rowOpen(() => setId(x.id))}>
            <td className="small" style={{ whiteSpace: "nowrap" }}>{dateFr(x.createdAt)}</td>
            <td>{x.reporter.name}<br /><span className="small muted">{x.reporter.role === "PRO" ? "Professionnel" : "Particulier"}</span></td>
            <td className="small">{x.request ? <>Demande {x.request.ref}<br /><span className="muted">{x.request.title}</span></> : x.conversation ? <>Conversation<br /><span className="muted">{x.conversation.client} ↔ {x.conversation.pro}</span></> : "—"}</td>
            <td style={{ maxWidth: 300 }} className="small">{x.reason.length > 90 ? `${x.reason.slice(0, 90)}…` : x.reason}</td>
            <td><Pill tone={x.state === "OPEN" ? "warn" : "ok"}>{x.state === "OPEN" ? "À traiter" : "Traité"}</Pill></td>
            <td style={{ textAlign: "right" }}><View onClick={() => setId(x.id)} label={`le signalement de ${x.reporter.name}`} /></td>
          </tr>
        ))}
      </Table>
      )}
      <Modal open={!!r} onClose={() => setId(null)} title="Signalement" wide>
        {r && <ReportPanel key={r.id} r={r} />}
      </Modal>
    </>
  );
}

function ReportPanel({ r }: { r: ReportRow }) {
  const c = r.conversation;
  const [messages, setMessages] = useState<Message[] | null>(c?.messages ?? null);
  const [err, setErr] = useState("");
  // La conversation n'est lue par l'équipe que dans ce cadre : la consultation est journalisée
  async function read() {
    const res = await apiCall(`/api/admin/reports?voir=${c!.id}${r.state === "CLOSED" ? "&traites=true" : ""}`, { method: "GET" });
    if (!res.ok) return setErr(res.error);
    const hit = (res.data.reports as ReportRow[]).find((x) => x.id === r.id);
    setMessages(hit?.conversation?.messages ?? []);
  }
  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="row between" style={{ gap: 10 }}>
        <b>Signalé par {r.reporter.name} ({r.reporter.role === "PRO" ? "professionnel" : "particulier"}) · {dateFr(r.createdAt)}</b>
        <Pill tone={r.state === "OPEN" ? "warn" : "ok"}>{r.state === "OPEN" ? "À traiter" : "Traité"}</Pill>
      </div>
      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.reason}</p>
      {r.request && <span className="small muted">Demande « {r.request.title} » ({r.request.ref}) de {r.request.client} · <a href="/admin/demandes?signalees=1">voir et retirer la demande</a></span>}
      {c && <span className="small muted">Conversation entre {c.client} et {c.pro} · {c.title}</span>}
      {c && (messages
        ? <ChatThread messages={messages} meId={c.proId} otherName={`${c.clientFirstName} (client)`} />
        : <button type="button" className="btn g sm" style={{ alignSelf: "flex-start" }} onClick={read}>Lire la conversation (consultation journalisée)</button>)}
      {err && <p className="err-t" role="alert">{err}</p>}
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        {r.state === "OPEN" && <ActionButton path={`/api/admin/reports/${r.id}/close`} className="btn p sm">Marquer comme traité</ActionButton>}
        {r.reported && (
          <ActionButton path={`/api/admin/users/${r.reported.id}/suspend`} className={`btn sm ${r.reported.status === "ACTIVE" ? "x" : "o"}`}
            confirm={r.reported.status === "ACTIVE" ? `Suspendre ${r.reported.name} ?` : undefined}>
            {r.reported.status === "ACTIVE" ? `Suspendre ${r.reported.name}` : `Réactiver ${r.reported.name}`}
          </ActionButton>
        )}
      </div>
    </div>
  );
}
