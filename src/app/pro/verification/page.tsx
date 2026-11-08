import Link from "next/link";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { DOC_TYPES, REVIEW_DELAY, requiredDocs } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { ProPrivate } from "@/lib/types";
import { BsIcon } from "@/components/bs/icons";

export const metadata = { title: "Vérification du compte · BUILDSEN" };

// Vérification du compte : remplace « Demandes » tant que le profil n'est pas vérifié, avec une alerte sur l'évolution du dossier
export default async function Verification() {
  const { pro: p } = await api<{ pro: ProPrivate }>("/api/pro/profile");
  if (p.state === "VERIFIED") redirect("/pro/demandes");
  const credentials = p.credentials ?? [];
  const infoSaved = !!p.statut && !!p.school && !!p.diploma;
  const missingDocs = requiredDocs(p.statut).filter((d) => !credentials.some((c) => c.type === d && c.state !== "REFUSED")).map((d) => DOC_TYPES[d].toLowerCase());
  const missing = [...(infoSaved ? [] : ["vos informations"]), ...missingDocs];
  const sent = p.state === "PENDING";
  const steps: [string, boolean][] = [
    ["Informations", infoSaved],
    ["Justificatifs", missingDocs.length === 0],
    ["Dossier envoyé", sent],
    ["Vérification par l'équipe", false],
  ];
  // Alerte : rouge quand une action est attendue, orange pendant l'examen
  const alert: { tone: "red" | "orange"; title: string; text: string; cta?: string } =
    p.state === "MORE"
      ? { tone: "red", title: "Complément demandé", text: p.decisionReason || "L'équipe a besoin d'un complément pour valider votre profil.", cta: "Envoyer le complément" }
      : p.state === "REFUSED"
        ? { tone: "red", title: "Dossier refusé", text: `${p.decisionReason ? p.decisionReason + " " : ""}Contactez l'équipe BUILDSEN pour plus d'informations.` }
        : p.state === "PENDING"
          ? { tone: "orange", title: "Dossier en cours d'examen", text: `Transmis le ${dateFr(p.submittedAt)}. Réponse sous ${REVIEW_DELAY}. Vous serez prévenu ici et par e-mail.` }
          : { tone: "red", title: "Dossier à compléter", text: missing.length ? `Il manque : ${missing.join(", ")}.` : "Votre dossier est prêt : envoyez-le pour vérification.", cta: "Compléter mon dossier" };
  const i = steps.findIndex(([, ok]) => !ok);
  return (
    <div className="bs-page">
      <div className="bs-page-h"><div><h1>Vérification du compte</h1><p>Les demandes des particuliers s&apos;ouvrent à vous une fois votre profil vérifié.</p></div></div>
      <section className={`bs-verif bs-verif-${alert.tone}`} role="alert">
        <span className="bs-verif-ico" aria-hidden="true"><BsIcon name={alert.tone === "red" ? "bellRing" : "shield"} size={26} /></span>
        <div className="bs-verif-tx"><b>{alert.title}</b><span>{alert.text}</span></div>
        {alert.cta && <Link className="btn bs-verif-btn" href="/pro/compte">{alert.cta}</Link>}
      </section>
      <section className="bs-panel">
        <h2 className="bs-panel-t">Évolution de votre dossier</h2>
        <ol className="bs-track">
          {steps.map(([label, ok], k) => (
            <li key={label} className={ok ? "ok" : k === i ? "now" : ""}>
              <span aria-hidden="true">{ok ? "✓" : k + 1}</span>
              <b>{label}</b>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
