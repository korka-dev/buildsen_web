import Link from "next/link";
import { api } from "@/lib/api";
import { DOC_TYPES, SPECIALTIES, STATUTS, formatPhone } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { ProPrivate, User } from "@/lib/types";
import { DossierPill, Pill } from "@/components/ui";
import { DecisionForm } from "../../../forms";
import { DocumentDecision } from "./DocumentDecision";

export const metadata = { title: "Dossier · Administration BUILDSEN" };

const DOC_STATE: Record<string, [string, string]> = { RECEIVED: ["À examiner", "warn"], ACCEPTED: ["Accepté", "ok"], REFUSED: ["Refusé", "err"] };

export default async function Dossier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pro: p, user, canDecide: pending, notSubmitted } = await api<{ pro: ProPrivate; user: User; canDecide: boolean; notSubmitted: boolean }>(`/api/admin/dossiers/${encodeURIComponent(id)}`);
  const credentials = p.credentials ?? [], portfolio = p.portfolio ?? [];
  const rows: [string, string][] = [
    ["Statut déclaré", p.statut ? STATUTS[p.statut].name : "—"],
    ...(p.companyName ? [["Entreprise", p.companyName] as [string, string], ["Gérant", `${user.firstName} ${user.lastName}`] as [string, string]] : []),
    [p.statut === "ENT" ? "Établissement du responsable technique" : "Établissement", p.school ?? "—"],
    [p.statut === "ENT" ? "Diplôme du responsable technique" : "Diplôme", p.diploma ?? "—"],
    [p.statut === "ENT" ? "Années d'activité" : "Expérience", p.experienceYears != null ? `${p.experienceYears} an(s)` : "—"],
    ["E-mail", user.email],
    ["Téléphone", formatPhone(user.phone) || "—"],
    ["Commune", p.commune ?? "—"],
    ["Spécialités", p.specialties.map((s) => SPECIALTIES[s]).join(", ") || "—"],
  ];
  return (
    <>
      <Link className="small" href="/admin/dossiers">← Tous les dossiers</Link>
      <div className="ph" style={{ marginTop: 12 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1>{p.companyName ?? `${user.firstName} ${user.lastName}`}</h1>
          <span className="muted small">Inscrit le {dateFr(p.createdAt)}{p.submittedAt && ` · soumis le ${dateFr(p.submittedAt)}`}</span>
        </div>
        <DossierPill state={p.state} />
      </div>
      <div className="g-side">
        <div className="stack" style={{ gap: 18, minWidth: 0 }}>
          <div className="card stack">
            <h2>Informations</h2>
            <div className="tbl"><table className="t"><tbody>{rows.map(([k, v]) => <tr key={k}><td className="muted" style={{ width: 160 }}>{k}</td><td>{v}</td></tr>)}</tbody></table></div>
            {p.bio && <p className="small" style={{ color: "var(--slate)" }}>{p.bio}</p>}
          </div>
          <div className="card stack">
            <h2>Justificatifs</h2>
            <p className="small muted">Chaque ouverture est inscrite au journal d&apos;audit. Les liens expirent après 60 secondes.</p>
            <div className="list">{credentials.map((c) => (
              <div key={c.id} className="li">
                <div className="grow"><b>{DOC_TYPES[c.type] ?? c.type}</b><br /><span className="small muted">{c.fileName} · {(c.size / 1048576).toFixed(1)} Mo</span>{c.reason && <><br /><span className="small" style={{ color: "var(--err)" }}>{c.reason}</span></>}</div>
                <Pill tone={DOC_STATE[c.state][1]}>{DOC_STATE[c.state][0]}</Pill>
                <a className="btn g sm" href={`/api/fichiers/justificatif/${c.id}`} target="_blank" rel="noopener">Consulter</a>
                {pending && <DocumentDecision credentialId={c.id} />}
              </div>
            ))}{credentials.length === 0 && <div className="li"><span className="muted small">Aucun justificatif envoyé.</span></div>}</div>
          </div>
          <div className="card stack">
            <h2>Portfolio</h2>
            <div className="thumbs">{portfolio.map((it) => (
              <figure key={it.id} className="thumb">
                {it.mime === "application/pdf"
                  ? <a className="pdf" href={`/api/fichiers/portfolio/${it.id}`} target="_blank" rel="noopener">PDF</a>
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={`/api/fichiers/portfolio/${it.id}`} alt={it.caption} loading="lazy" />}
                <figcaption>{it.caption}</figcaption>
              </figure>
            ))}</div>
            {portfolio.length === 0 && <span className="muted small">Aucune réalisation.</span>}
          </div>
        </div>
        <div className="card stack">
          <h2>Contrôles</h2>
          {["Identité cohérente avec la pièce fournie", "Diplôme authentifié auprès de l'établissement", "Expérience déclarée cohérente", "Portfolio conforme aux compétences déclarées"].map((x) => (
            <label key={x} className="chk"><input type="checkbox" /> {x}</label>
          ))}
          <div className="hr" />
          <h2>Décision</h2>
          {notSubmitted && <div className="note w small">Dossier complet, mais le professionnel n&apos;a pas cliqué sur « Soumettre ». Vous pouvez quand même décider.</div>}
          {pending ? <DecisionForm proId={p.id} /> : <p className="small muted">Décision possible quand le dossier est complet : statut, formation, pièce d&apos;identité et diplôme.{p.decisionReason && <><br />Dernier motif : {p.decisionReason}</>}</p>}
        </div>
      </div>
    </>
  );
}
