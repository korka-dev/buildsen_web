"use client";

import Link from "next/link";
import { AuthTrigger } from "./AuthModal";
import { BsIcon } from "./icons";
import { WhatsAppButton } from "./WhatsAppButton";

/**
 * Grande photo d'accueil et titre animé (rejoué à chaque arrivée sur la page).
 * Photo : architecte dessinant un plan, par Daniel McCullough sur Unsplash (licence gratuite).
 */
export function Hero({
  maxPros,
  role,
}: {
  maxPros: number;
  role: "CLIENT" | "PRO" | null;
}) {
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });
  const words = "Votre projet de construction".split(" ");
  const stats: [string, string][] = [
    ["Gratuit", "pour les particuliers"],
    [`${maxPros} pros`, "maximum par demande"],
    ["Vérifiés", "par notre équipe"],
  ];

  const primary =
    role === "CLIENT" ? (
      <Link className="btn bs-btn-hero" href="/espace/demandes/nouvelle">
        Décrire mon projet <BsIcon name="arrow" size={20} />
      </Link>
    ) : role === "PRO" ? (
      <Link className="btn bs-btn-hero" href="/accueil">
        Voir les demandes <BsIcon name="arrow" size={20} />
      </Link>
    ) : (
      <AuthTrigger mode="login" className="btn bs-btn-hero">
        Décrire mon projet <BsIcon name="arrow" size={20} />
      </AuthTrigger>
    );
  const secondary = role ? (
    <Link className="btn bs-btn-ghost" href="/accueil">Mon espace</Link>
  ) : (
    <AuthTrigger mode="login" className="btn bs-btn-ghost">
      Voir les demandes
    </AuthTrigger>
  );

  return (
    <section id="accueil" className="bs-hero">
      <picture>
        <source
          media="(min-width: 640px)"
          srcSet="/images/hero-plan-architecte-1600.webp 1600w, /images/hero-plan-architecte-2400.webp 2400w"
          sizes="100vw"
          type="image/webp"
        />
        <img
          className="bs-hero-img"
          src="/images/hero-plan-architecte-mobile.webp"
          alt="Architecte dessinant un plan de construction au crayon et à la règle"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="bs-hero-in">
        <div className="bs-hero-box">
          <h1>
            <span className="bs-l">
              {words.map((w, i) => (
                <span key={`${w}-${i}`} className="bs-word" style={delay(150 + i * 110)}>
                  {w}&nbsp;
                </span>
              ))}
            </span>
            <span className="bs-hl bs-word" style={delay(300 + words.length * 110)}>
              <span>commence ici.</span>
            </span>
          </h1>
          <p className="bs-lead bs-fade" style={delay(900)}>
            <span className="bs-short">Publiez gratuitement votre besoin : jusqu&apos;à {maxPros} pros vérifiés vous écrivent.</span>
            <span className="bs-long">
              Plans, devis et métrés, études : publiez gratuitement votre besoin, échangez avec jusqu&apos;à {maxPros}{" "}
              ingénieurs, techniciens ou entreprises vérifiés, puis continuez sur WhatsApp.
            </span>
          </p>
          <div className="bs-cta bs-fade" style={delay(1100)}>
            {primary}
            {secondary}
            <WhatsAppButton />
          </div>
          <dl className="bs-stats bs-fade" style={delay(1300)}>
            {stats.map(([v, l]) => (
              <div key={l}>
                <dt style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{l}</dt>
                <dd style={{ margin: 0 }}>
                  <b>{v}</b>
                  <span>{l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
