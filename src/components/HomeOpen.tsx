import Link from "next/link";
import { getMe } from "@/lib/api";
import { CATEGORIES, MAX_PROS_PER_REQUEST } from "@/lib/constants";
import { Footer, PublicHeader } from "./ui";
import { AuthTrigger } from "./bs/AuthModal";
import { Hero } from "./bs/Hero";
import { BsIcon, type BsIconName } from "./bs/icons";
import { Reveal } from "./bs/Reveal";

const SERVICE_ICONS: Record<string, BsIconName> = {
  plans: "ruler",
  metres: "calculator",
  dao: "pencil",
  etudes: "columns",
};

function SectionTitle({ kicker, title, text }: { kicker?: string; title: string; text?: string }) {
  return (
    <Reveal className="bs-title">
      {kicker ? <p className="bs-kicker">{kicker}</p> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </Reveal>
  );
}

// Accueil une fois la plateforme ouverte aux particuliers (design BUILDSEN)
export async function HomeOpen() {
  const s = await getMe();
  const role = s.user?.role === "CLIENT" || s.user?.role === "PRO" ? s.user.role : null;
  const steps: [BsIconName, string, string, string][] = [
    ["filePen", "Décrivez votre projet", "Prestation, terrain, nombre de pièces, budget et délai. Votre demande est publiée tout de suite.", "Prestation, terrain, budget et délai."],
    ["messages", `Jusqu'à ${MAX_PROS_PER_REQUEST} pros vous écrivent`, "Les professionnels vérifiés de votre zone vous écrivent dans la messagerie BUILDSEN. Vous comparez leurs profils et leurs réalisations.", "Dans la messagerie BUILDSEN."],
    ["chat", "Continuez sur WhatsApp", "Quand vous êtes prêt, partagez votre WhatsApp avec le professionnel choisi. Vous fixez ensemble le prix, le délai et le paiement.", "Avec le professionnel choisi."],
  ];
  const trust: [BsIconName, string, string][] = [
    ["shield", "Des professionnels vérifiés", "Pièce d'identité, diplôme ou RCCM : chaque dossier est examiné par notre équipe."],
    ["lock", "Votre numéro protégé", "Partagé seulement avec les professionnels que vous choisissez."],
    ["flag", "Un signalement en un clic", "Notre équipe peut suspendre un compte au comportement suspect."],
  ];

  return (
    <>
      <PublicHeader />
      <Hero maxPros={MAX_PROS_PER_REQUEST} role={role} />

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="bs-sec bs-white">
        <div className="bs-in">
          <SectionTitle kicker="Simple et rapide" title="Comment ça marche ?" />
          <ol className="bs-steps bs-3">
            {steps.map(([icon, title, long, short], i) => (
              <Reveal as="li" key={title} delay={i * 100}>
                <div className="bs-step">
                  <span className="bs-num">{i + 1}</span>
                  <span className="bs-ico"><BsIcon name={icon} /></span>
                  <div>
                    <h3>{title}</h3>
                    <p>
                      <span className="bs-short">{short}</span>
                      <span className="bs-long">{long}</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Prestations */}
      <section id="prestations" className="bs-sec bs-tint">
        <div className="bs-in">
          <SectionTitle kicker="Nos prestations" title="Tout ce qui se prépare avant de construire" text="Plans, devis et métrés, dessin technique et études de structure." />
          <ul className="bs-services" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {Object.entries(CATEGORIES).map(([k, c], i) => (
              <Reveal as="li" key={k} delay={(i % 2) * 100}>
                <div className="bs-service">
                  <span className="bs-ico"><BsIcon name={SERVICE_ICONS[k] ?? "ruler"} /></span>
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.short}</p>
                    {c.regulated ? <p className="bs-reg">Réservé aux ingénieurs et entreprises vérifiés</p> : null}
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
          <p className="bs-services-note">
            BUILDSEN ne propose pas l&apos;exécution des travaux, le suivi de chantier ni la signature de permis de construire.
          </p>
        </div>
      </section>

      {/* À propos : ce que BUILDSEN vérifie (section verte) */}
      <section id="a-propos" className="bs-sec bs-green">
        <div className="bs-in bs-about">
          <Reveal>
            <h2>Construire avec confiance</h2>
            <p className="bs-about-text">
              BUILDSEN met en relation les particuliers de Dakar avec des ingénieurs en génie civil, des techniciens supérieurs et
              des entreprises du BTP vérifiés.
            </p>
            <p className="bs-warn">Le prix, le contrat et le paiement se décident entre vous. <b>Ne versez jamais tout d&apos;avance.</b></p>
          </Reveal>
          <ul className="bs-trust">
            {trust.map(([icon, title, desc], i) => (
              <Reveal as="li" key={title} delay={i * 120}>
                <span className="bs-ico"><BsIcon name={icon} /></span>
                <div>
                  <b>{title}</b>
                  <span className="bs-d">{desc}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Appel final */}
      <section className="bs-sec bs-tint">
        <Reveal className="bs-final">
          <h2>Prêt à lancer votre projet ?</h2>
          <p>Publiez votre demande gratuitement, les professionnels viennent à vous.</p>
          {role === "CLIENT" ? (
            <Link className="btn p" href="/espace/demandes/nouvelle">Décrire mon projet <BsIcon name="arrow" size={20} /></Link>
          ) : role ? (
            <Link className="btn p" href="/accueil">Mon espace <BsIcon name="arrow" size={20} /></Link>
          ) : (
            <AuthTrigger mode="signup" profil="particulier" className="btn p">
              Décrire mon projet <BsIcon name="arrow" size={20} />
            </AuthTrigger>
          )}
        </Reveal>
      </section>
      <Footer />
    </>
  );
}
