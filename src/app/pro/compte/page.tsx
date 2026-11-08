import Link from "next/link";
import { api } from "@/lib/api";
import { DOC_TYPES, canDoStudies, docsFor, formatPhone, requiredDocs, STATUTS } from "@/lib/constants";
import { dateFr } from "@/lib/market";
import type { ProPrivate, User } from "@/lib/types";
import { ActionButton } from "@/components/ActionButton";
import { Pill, companyInitials, initials } from "@/components/ui";
import { Uploader } from "@/components/Uploader";
import { LogoutAction } from "@/components/bs/AccountMenu";
import { BsIcon } from "@/components/bs/icons";
import { DossierInfoForm, ProfileForm, SubmitDossier } from "../forms";
import { CompteSections } from "./Sections";

export const metadata = { title: "Mon compte · BUILDSEN" };

const DOC_STATE: Record<string, [string, string]> = { RECEIVED: ["Reçu", "warn"], ACCEPTED: ["Accepté", "ok"], REFUSED: ["Refusé : à remplacer", "err"] };

// Compte du professionnel : même page que celle du particulier, avec trois parties (Informations, Justificatifs, Réalisations)
export default async function Compte() {
  const { user, pro: p } = await api<{ user: User; pro: ProPrivate }>("/api/pro/profile");
  const credentials = p.credentials ?? [];
  const portfolio = [...(p.portfolio ?? [])].reverse();
  const editable = p.state === "DRAFT" || p.state === "MORE";
  const docs = docsFor(p.statut);
  const required = requiredDocs(p.statut);
  const sent = required.filter((d) => credentials.some((c) => c.type === d && c.state !== "REFUSED")).length;
  const infoSaved = !!p.statut && !!p.school && !!p.diploma;
  const name = p.companyName ?? `${user.firstName} ${user.lastName}`;
  const badge = p.companyName ? companyInitials(p.companyName) : initials(user.firstName, user.lastName);
  const role = p.statut ? STATUTS[p.statut].name : "Professionnel";

  const rows = [
    {
      key: "infos", icon: "user" as const, title: "Informations", done: infoSaved && !!p.bio,
      summary: infoSaved ? (p.bio ? "Complètes" : "Présentation à ajouter") : "À compléter",
      intro: "Votre statut, votre formation et votre présentation.",
      content: (
        <div className="stack" style={{ gap: 22 }}>
          <div className="stack"><h3 className="bs-panel-t">Mon dossier</h3><DossierInfoForm v={p} locked={!editable} /></div>
          <div className="stack"><h3 className="bs-panel-t">Mon profil public</h3><ProfileForm v={p} isIng={canDoStudies(p.statut)} /></div>
        </div>
      ),
    },
    {
      key: "docs", icon: "filePen" as const, title: "Justificatifs", done: sent === required.length,
      summary: `${sent} sur ${required.length} envoyé${sent > 1 ? "s" : ""}`,
      intro: "Vos justificatifs ne sont jamais publics : seuls les vérificateurs habilités y accèdent.",
      content: (
        <div className="stack" style={{ gap: 16 }}>
        <div className="list">
          {docs.map((d) => {
            const c = credentials.find((x) => x.type === d);
            return (
              <div key={d} className="li">
                <div className="grow">
                  <b>{DOC_TYPES[d]}</b>{!required.includes(d) && <span className="small muted"> · facultatif</span>}<br />
                  {c ? <a className="small" href={`/api/fichiers/justificatif/${c.id}`} target="_blank" rel="noopener">{c.fileName}</a> : <span className="small muted">PDF, JPG ou PNG · 10 Mo</span>}
                  {c?.reason && <><br /><span className="small" style={{ color: "var(--err)" }}>Motif : {c.reason}</span></>}
                </div>
                {c ? <Pill tone={DOC_STATE[c.state][1]}>{DOC_STATE[c.state][0]}</Pill> : required.includes(d) ? <Pill tone="err">Manquant</Pill> : null}
                {editable && <Uploader kind="credential" type={d} label={c ? "Remplacer" : "Envoyer"} accept=".pdf,.jpg,.jpeg,.png" />}
                {editable && c && <ActionButton path={`/api/pro/credentials/${c.id}`} method="DELETE" className="link small">Retirer</ActionButton>}
              </div>
            );
          })}
        </div>
        {editable && (
          <div className="stack" style={{ gap: 8 }}>
            <p className="small muted" style={{ margin: 0 }}>Quand tout est prêt, envoyez votre dossier : vous pouvez l&apos;envoyer même incomplet, l&apos;équipe vous dira si un complément est utile.</p>
            <SubmitDossier ready />
          </div>
        )}
        </div>
      ),
    },
    {
      key: "work", icon: "building" as const, title: "Réalisations", done: portfolio.length > 0,
      summary: portfolio.length ? `${portfolio.length} réalisation${portfolio.length > 1 ? "s" : ""}` : "Facultatif, mais recommandé",
      intro: "Plans, façades, modélisations 3D… uniquement des travaux dont vous êtes l'auteur. 12 au maximum.",
      content: (
        <div className="stack">
          {portfolio.length > 0 && (
            <div className="thumbs">
              {portfolio.map((it) => (
                <figure key={it.id} className="thumb">
                  {it.mime === "application/pdf"
                    ? <a className="pdf" href={`/api/fichiers/portfolio/${it.id}`} target="_blank" rel="noopener">PDF</a>
                    // eslint-disable-next-line @next/next/no-img-element
                    : <img src={`/api/fichiers/portfolio/${it.id}`} alt={it.caption} loading="lazy" />}
                  <figcaption><span>{it.caption}</span><ActionButton path={`/api/pro/portfolio/${it.id}`} method="DELETE" className="link small" confirm="Retirer cette réalisation ?">Retirer</ActionButton></figcaption>
                </figure>
              ))}
            </div>
          )}
          {portfolio.length < 12 && <Uploader kind="portfolio" label="Ajouter une réalisation" accept=".jpg,.jpeg,.png,.webp,.pdf" withCaption />}
        </div>
      ),
    },
  ];

  return (
    <div className="bs-page bs-centered">
      <h1 className="bs-center-t">Mon compte</h1>
      <section className="bs-profile">
        <span className="bs-avatar bs-avatar-lg" aria-hidden="true">{badge}</span>
        <div>
          <h2>{name}</h2>
          <p>{role} · inscrit le {dateFr(user.createdAt)}</p>
        </div>
      </section>

      <section className="bs-panel">
        <dl className="bs-info">
          <div>
            <dt><BsIcon name="phone" size={18} /> Téléphone</dt>
            <dd>{formatPhone(user.phone)}<small>Sert à vous connecter. Jamais public : vous choisissez avec qui le partager.</small></dd>
          </div>
          <div>
            <dt><BsIcon name="mail" size={18} /> E-mail</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="bs-panel">
        <CompteSections rows={rows} />
      </section>

      <section className="bs-panel">
        <h2 className="bs-panel-t"><BsIcon name="lockKey" size={18} /> Mot de passe</h2>
        <p className="small muted" style={{ margin: 0 }}>Nous vous envoyons un lien par e-mail pour choisir un nouveau mot de passe.</p>
        <Link className="btn g sm" href="/mot-de-passe-oublie" style={{ alignSelf: "flex-start" }}>Changer mon mot de passe</Link>
      </section>

      <div className="bs-logout-m"><LogoutAction name={name} initials={badge} role="Espace professionnel" /></div>
    </div>
  );
}
