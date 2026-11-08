import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import Link from "next/link";
import { Footer, PublicHeader } from "@/components/ui";
import { CreditsExplainer } from "@/components/Credits";
import { Carousel } from "@/components/Carousel";
import { CLIENTS_OPEN, MAX_PROS_PER_REQUEST, OPENING, REVIEW_DELAY, STATUTS, whatsappLink } from "@/lib/constants";
import { HomeOpen } from "@/components/HomeOpen";

// Accueil de la phase pilote : recrutement des professionnels avant l'ouverture aux particuliers
// Une fois connecté, particuliers et professionnels arrivent sur l'accueil commun
export default async function Home() {
  const s = await getMe();
  if (s.user?.role === "PRO") redirect("/pro");
  if (s.user?.role === "CLIENT") redirect("/espace");
  if (CLIENTS_OPEN) return <HomeOpen />;
  const stats = [
    ["Gratuit", "inscription et vérification"],
    [REVIEW_DELAY, "pour examiner votre dossier"],
    [`${MAX_PROS_PER_REQUEST} pros maximum`, "par demande de client"],
    [OPENING.replace(/^./, (c) => c.toUpperCase()), "ouverture aux particuliers"],
  ];
  const steps = [
    ["Créez votre compte", "Gratuit, en quelques minutes."],
    ["Faites vérifier vos justificatifs", `Pièce d'identité et diplôme ; attestation d'expérience et portfolio facultatifs. Examen sous ${REVIEW_DELAY}.`],
    ["Complétez votre profil", "Présentation, spécialités, logiciels et réalisations : c'est ce que verront les clients."],
    ["Écrivez aux clients", `Dès ${OPENING}, consultez les demandes de vos spécialités, écrivez au client dans la messagerie, puis continuez sur WhatsApp.`],
  ];
  const faq = [
    ["L'inscription est-elle payante ?", "Non. L'inscription et la vérification de votre profil sont gratuites. Les conditions applicables après l'ouverture vous seront présentées avant leur entrée en vigueur."],
    ["Quels documents dois-je fournir ?", "Une pièce d'identité et votre diplôme ou titre professionnel. L'attestation d'expérience et le portfolio sont facultatifs mais renforcent votre profil. Vos justificatifs ne sont jamais publics."],
    ["Comment vais-je trouver des clients ?", `Les particuliers publient leurs demandes avec un budget. Vous consultez celles de vos spécialités et écrivez au client dans la messagerie BUILDSEN. ${MAX_PROS_PER_REQUEST} professionnels au maximum peuvent écrire sur une même demande.`],
    ["Le client peut-il me joindre sur WhatsApp ?", "Oui. Quand il souhaite continuer avec vous, le client partage son numéro WhatsApp depuis la messagerie, et vous poursuivez l'échange directement."],
    ["Qui fixe le prix de la mission ?", "Vous, avec le client. Le prix, le délai, le contrat et le paiement se décident directement entre vous."],
  ];
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1}>
      <Carousel />
      <div className="top-band">
        <div className="cta-band">
          <div className="stack" style={{ gap: 8, maxWidth: "56ch" }}>
            <h2>Soyez prêt pour le lancement</h2>
            <p>Les profils vérifiés avant {OPENING} seront les premiers visibles par les particuliers de Dakar.</p>
          </div>
          <Link className="btn" href="/inscription">Créer mon compte pro</Link>
        </div>
      </div>
      <section className="sec">
        <div className="wrap stack" style={{ gap: 20 }}>
          <span className="eyebrow">Phase pilote · Dakar</span>
          <h1 className="home-h1">
            Des clients pour vos <span style={{ color: "var(--g1)" }}>plans, métrés et études.</span>
          </h1>
          <p className="lead">
            BUILDSEN met en relation les particuliers avec des ingénieurs en génie civil, des techniciens supérieurs et des entreprises vérifiés.
            Nous inscrivons nos premiers professionnels avant l&apos;ouverture aux particuliers, prévue en {OPENING}.
          </p>
          <div className="row">
            <Link className="btn p" href="/inscription">Créer mon compte pro</Link>
            <Link className="btn o" href="/connexion">Se connecter</Link>
          </div>
          <div className="home-stats">
            {stats.map(([v, l]) => (
              <div key={l}><b>{v}</b><span>{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap stack" style={{ gap: 26 }}>
          <div className="stack" style={{ gap: 8 }}>
            <span className="eyebrow">Comment ça marche</span>
            <h2 className="home-h2">De l&apos;inscription à votre premier client</h2>
          </div>
          <ol className="timeline">
            {steps.map(([t, d], i) => (
              <li key={t}>
                <span className="tl-n">{i + 1}</span>
                <b>{t}</b>
                <span className="muted small">{d}</span>
              </li>
            ))}
          </ol>
          <div className="apercu-card">
            <div className="stack" style={{ gap: 6, maxWidth: "60ch" }}>
              <span className="eyebrow" style={{ color: "#BFE6D1" }}>Aperçu</span>
              <b style={{ fontSize: 20 }}>À quoi ressemblera BUILDSEN en décembre ?</b>
              <span className="small" style={{ color: "#E7F1EB" }}>Parcourez le futur site : demandes de particuliers, messagerie, profils vérifiés. Les données sont des exemples.</span>
            </div>
            <a className="btn" href="/apercu/index.html" style={{ background: "#fff", color: "var(--g1)" }}>Voir l&apos;aperçu</a>
          </div>
          <CreditsExplainer />
        </div>
      </section>

      <section className="sec">
        <div className="wrap stack" style={{ gap: 24 }}>
          <div className="stack" style={{ gap: 8 }}>
            <span className="eyebrow">Qui peut s&apos;inscrire</span>
            <h2 className="home-h2">Trois statuts, vérifiés par notre équipe</h2>
          </div>
          <div className="g3">
            {Object.values(STATUTS).map((s) => (
              <div key={s.name} className="card stack statut-card">
                <h3>{s.name}</h3>
                <span className="small" style={{ color: "var(--g1)", fontWeight: 600 }}>{s.scope}</span>
              </div>
            ))}
          </div>
          <div className="card flat stack" style={{ gap: 6 }}>
            <b>Vous êtes étudiant en génie civil ?</b>
            <span className="small muted">Les inscriptions des étudiants ouvriront dans un second temps. <a href={whatsappLink("Bonjour BUILDSEN, je suis étudiant en génie civil et je souhaite être prévenu de l'ouverture.")} target="_blank" rel="noopener">Écrivez-nous sur WhatsApp</a> pour être prévenu.</span>
          </div>
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap stack" style={{ gap: 22, maxWidth: 860 }}>
          <div className="stack" style={{ gap: 8 }}>
            <span className="eyebrow">Questions fréquentes</span>
            <h2 className="home-h2">Vous vous posez des questions ?</h2>
          </div>
          <div className="faq">
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p className="muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="note">
            BUILDSEN est une plateforme de mise en relation : le prix, le contrat et le paiement de chaque mission se règlent directement entre vous et le client.
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
