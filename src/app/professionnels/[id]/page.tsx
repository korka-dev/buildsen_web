import type { Metadata } from "next";
import Link from "next/link";
import { api, getMe } from "@/lib/api";
import { SPECIALTIES, STATUTS } from "@/lib/constants";
import type { ProCard, PublicReview } from "@/lib/types";
import { Rating, Stars } from "@/components/Stars";
import { Footer, Pill, PublicHeader } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { MemberHeader } from "@/components/MemberHeader";

type Res = { pro: ProCard; full: boolean; reviews: PublicReview[] };

// Titre et description du lien partagé (l'image vient de opengraph-image.tsx)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { pro: p } = await api<Res>(`/api/public/pros/${encodeURIComponent(id)}`);
  const title = `${p.name} · ${p.statut === "ENT" ? "Entreprise vérifiée" : "Profil vérifié"} sur BUILDSEN`;
  const description = `${p.statut ? STATUTS[p.statut].name : "Professionnel du bâtiment"} à ${p.commune ?? "Dakar"}, vérifié par l'équipe BUILDSEN. Décrivez votre projet gratuitement.`;
  return { title, description, openGraph: { type: "profile", siteName: "BUILDSEN", locale: "fr_SN", title, description } };
}

// Fiche d'un professionnel ou d'une entreprise vérifiés : complète pour les utilisateurs connectés,
// aperçu pour les visiteurs, invités à créer un compte gratuit
export default async function ProProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [me, { pro: p, full, reviews }] = await Promise.all([getMe(), api<Res>(`/api/public/pros/${encodeURIComponent(id)}`)]);
  const ent = p.statut === "ENT";
  const member = full && (me.user?.role === "CLIENT" || me.user?.role === "PRO");
  if (!member) {
    const coverImg = p.portfolio.find((i) => i.mime.startsWith("image/"));
    return (
      <>
        <PublicHeader />
        <main id="contenu" tabIndex={-1} className="home-m">
          <div className="wrap stack" style={{ gap: 22, maxWidth: 760 }}>
            <Link className="small" href="/">← Accueil</Link>
            <div className="card stack" style={{ gap: 16, padding: 0, overflow: "hidden" }}>
              {coverImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/fichiers/portfolio/${coverImg.id}`} alt="" className="pf-cover" />
              )}
              <div className="stack" style={{ gap: 10, padding: "4px 24px 24px" }}>
                <div className="row" style={{ gap: 14, flexWrap: "nowrap" }}>
                  <span className={ent ? "hm-sq" : "avatar"}>{p.badge}</span>
                  <div className="stack" style={{ gap: 4, minWidth: 0 }}>
                    <h1 style={{ fontSize: 24, margin: 0 }}>{p.name}</h1>
                    <div className="row" style={{ gap: 8 }}><Pill tone="ok">{ent ? "Entreprise vérifiée" : "Profil vérifié"}</Pill>{p.statut && <span className="small muted">{STATUTS[p.statut].name}{p.commune ? ` · ${p.commune}` : ""}</span>}</div>
                  </div>
                </div>
                <div className="note">
                  <b>Créez votre compte gratuit pour voir le profil complet</b> : présentation, prestations, {p.portfolioCount ? `${p.portfolioCount} réalisation${p.portfolioCount > 1 ? "s" : ""}` : "réalisations"}.
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <Link className="btn p" href="/inscription">Créer mon compte gratuit</Link>
                  <Link className="btn g" href="/connexion">J&apos;ai déjà un compte</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <MemberHeader me={me} />
      <main id="contenu" tabIndex={-1} className="home-m">
        <div className="wrap stack" style={{ gap: 22 }}>
          <Link className="small" href="/accueil">← Accueil</Link>
          <div className={`card row pf-head${p.featured || p.spotlight ? " pf-vd" : ""}`} style={{ gap: 18, alignItems: "flex-start" }}>
            <span className={ent ? "hm-sq lg" : "avatar lg"}>{p.badge}</span>
            <div className="stack" style={{ gap: 8, minWidth: 0, flex: 1 }}>
              <h1 style={{ fontSize: 28, margin: 0 }}>{p.name}</h1>
              <Rating rating={p.rating} />
              <div className="row" style={{ gap: 8 }}>
                <Pill tone="ok">{ent ? "Entreprise vérifiée" : "Profil vérifié"}</Pill>
                {p.statut && <span className="small muted">{STATUTS[p.statut].name}</span>}
                {(p.featured || p.spotlight) && <span className="hm-vd static"><Icon name="etoile" size={12} />En vedette</span>}
              </div>
              <span className="small muted">
                {ent && `Gérant : ${p.firstName} ${p.lastName} · `}
                {p.commune ?? "Dakar"}
                {p.experienceYears != null && ` · ${p.experienceYears} an${p.experienceYears > 1 ? "s" : ""} ${ent ? "d'activité" : "d'expérience"}`}
              </span>
              {p.bio && <p style={{ margin: 0, color: "var(--slate)", whiteSpace: "pre-wrap", maxWidth: "70ch" }}>{p.bio}</p>}
            </div>
          </div>
          <div className="g3">
            <div className="card stack" style={{ gap: 8 }}><b>Prestations</b>{p.specialties.length ? <div className="row" style={{ gap: 6 }}>{p.specialties.map((s) => <Pill key={s}>{SPECIALTIES[s] ?? s}</Pill>)}</div> : <span className="small muted">Non précisées</span>}</div>
            <div className="card stack" style={{ gap: 8 }}><b>Logiciels</b><span className="small muted">{p.software || "Non précisés"}</span></div>
            <div className="card stack" style={{ gap: 8 }}><b>Vérification</b><span className="small muted">{ent ? "NINEA, RCCM et diplôme d'ingénieur du responsable technique examinés par l'équipe BUILDSEN." : "Pièce d'identité et diplôme examinés par l'équipe BUILDSEN."}</span></div>
          </div>
          <section className="stack" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>Réalisations</h2>
            {p.portfolio.length ? (
              <div className="pf-grid">
                {p.portfolio.map((it) => (
                  <a key={it.id} className="pf-it" href={`/api/fichiers/portfolio/${it.id}`} target="_blank" rel="noopener">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {it.mime.startsWith("image/") ? <img src={`/api/fichiers/portfolio/${it.id}`} alt={it.caption} loading="lazy" /> : <span className="pf-doc">PDF</span>}
                    <span className="pf-cap">{it.caption}</span>
                  </a>
                ))}
              </div>
            ) : <div className="card flat"><span className="muted small">Pas encore de réalisation publiée.</span></div>}
          </section>
          <section className="stack" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>Avis des clients</h2>
            {reviews.length ? (
              <div className="stack" style={{ gap: 10 }}>
                {reviews.map((r) => (
                  <div key={r.id} className="card flat stack" style={{ gap: 4 }}>
                    <div className="row" style={{ gap: 8, alignItems: "center" }}><Stars value={r.rating} /><b className="small">{r.author}</b><span className="small muted">{new Date(r.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span></div>
                    {r.comment && <span style={{ whiteSpace: "pre-wrap" }}>{r.comment}</span>}
                  </div>
                ))}
              </div>
            ) : <div className="card flat"><span className="muted small">Pas encore d&apos;avis.</span></div>}
          </section>
          <div className="note">
            {me.user?.role === "CLIENT"
              ? <>Pour être contacté par ce professionnel, <Link href="/espace/demandes/nouvelle">décrivez votre projet</Link> : les professionnels vérifiés de votre zone vous écrivent. Le prix, le contrat et le paiement se décident directement entre vous.</>
              : "Les coordonnées des professionnels ne sont jamais publiques."}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
