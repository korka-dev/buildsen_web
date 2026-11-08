"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Carrousel de l'accueil : quatre diapositives animées. Version « pilote » pour les professionnels, version « ouverte » pour les particuliers.
// Défilement automatique toutes les 6 s (en pause seulement pendant le survol à la souris),
// points de navigation, flèches et balayage au doigt. Les animations rejouent à chaque affichage (clé = index).

const DEMANDS = [
  ["OS", "Plans villa R+1, 4 chambres", "Keur Massar · 600 000 FCFA", 2],
  ["MN", "DQE immeuble R+3", "Ouakam · 1 500 000 FCFA", 3],
  ["ID", "Ferraillage d'une dalle", "Thiès · 250 000 FCFA", 1],
  ["SG", "Surélévation R+2", "HLM · 900 000 FCFA", 0],
] as const;

// Version ouverte : la première diapositive s'adresse aux particuliers
const WROTE = [
  ["MD", "Moussa D. vous a écrit", "Ingénieur en génie civil · Profil vérifié"],
  ["SE", "Sahel Études vous a écrit", "Entreprise · Entreprise vérifiée"],
  ["FB", "Fatou B. vous a écrit", "Technicienne supérieure · Profil vérifié"],
] as const;

function SlideOpen() {
  return (
    <div className="cs cs-open">
      <div className="cs-text">
        <span className="cs-eyebrow">C&apos;est ouvert à Dakar</span>
        <h2>Déposez votre projet, des professionnels vérifiés vous écrivent</h2>
        <p>Plans, devis et métrés, dessin technique, études de structure. Gratuit pour les particuliers.</p>
        <Link className="btn cs-btn-w" href="/inscription?profil=particulier">Décrire mon projet</Link>
      </div>
      <div className="cs-cards" aria-hidden="true">
        {WROTE.map(([i, t, s], k) => (
          <div key={t} className="cs-card" style={{ animationDelay: `${0.4 + k * 0.55}s` }}>
            <span className="cs-av">{i}</span>
            <span className="cs-ct"><b>{t}</b><small>{s}</small></span>
            <span className="cs-new">Nouveau</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideLaunch() {
  return (
    <div className="cs cs-launch">
      <div className="cs-cal" aria-hidden="true">
        <div className="cs-cal-top"><i /><i /></div>
        <div className="cs-months">
          <span className="m1">Octobre</span>
          <span className="m2">Novembre</span>
          <span className="m3">Décembre</span>
        </div>
        <div className="cs-year">2026</div>
      </div>
      <div className="cs-text">
        <span className="cs-eyebrow">Lancement</span>
        <h2>Décembre 2026 : BUILDSEN ouvre aux particuliers de Dakar</h2>
        <p>Inscrivez-vous dès maintenant : votre profil sera vérifié et prêt le jour J.</p>
      </div>
    </div>
  );
}

function SlideProjects() {
  return (
    <div className="cs cs-projects">
      <div className="cs-bg" style={{ backgroundImage: "url(/images/villa.webp)" }} />
      <div className="cs-shade" />
      <div className="cs-text">
        <span className="cs-eyebrow">Exemples de demandes</span>
        <h2>Des projets avec un budget, dans votre zone</h2>
        <p>Chaque demande indique son budget et n&apos;accepte que 5 professionnels : soyez parmi les premiers.</p>
      </div>
      <div className="cs-cards" aria-hidden="true">
        {DEMANDS.map(([i, t, s, q], k) => (
          <div key={t} className="cs-card" style={{ animationDelay: `${0.35 + k * 0.45}s` }}>
            <span className="cs-av">{i}</span>
            <span className="cs-ct"><b>{t}</b><small>{s}</small></span>
            <span className="cs-places" title={`${q}/5`}>{[0, 1, 2, 3, 4].map((n) => <i key={n} className={n < q ? "on" : ""} />)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideChat() {
  return (
    <div className="cs cs-chatslide">
      <div className="cs-text">
        <span className="cs-eyebrow">Messagerie BUILDSEN</span>
        <h2>Écrivez au client, puis continuez sur WhatsApp</h2>
        <p>Présentez votre offre dans la messagerie. Quand le client est convaincu, il partage son WhatsApp avec vous.</p>
      </div>
      <div className="cs-phone" aria-hidden="true">
        <div className="cs-phone-h"><span className="cs-av sm">AD</span><span><b>Awa D.</b><small>Plans villa R+1 · Keur Massar</small></span></div>
        <div className="cs-bubble me" style={{ animationDelay: ".4s" }}>Bonjour Awa, je peux réaliser les plans de votre villa avec une vue 3D, livrés en 18 jours.</div>
        <div className="cs-typing" style={{ animationDelay: "1.3s" }}><i /><i /><i /></div>
        <div className="cs-bubble" style={{ animationDelay: "2.1s" }}>Parfait, votre profil me plaît. On continue sur WhatsApp ?</div>
        <div className="cs-wa" style={{ animationDelay: "3s" }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-4-1.1z" /></svg> Awa a partagé son WhatsApp</div>
      </div>
    </div>
  );
}

function SlideJoin() {
  return (
    <div className="cs cs-join">
      <div className="cs-bg" style={{ backgroundImage: "url(/images/ingenieur.webp)" }} />
      <div className="cs-shade" />
      <div className="cs-text">
        <span className="cs-eyebrow">Ingénieurs et techniciens</span>
        <h2>Soyez parmi les premiers professionnels vérifiés</h2>
        <p>Inscription gratuite. Les profils vérifiés seront les premiers visibles à l&apos;ouverture.</p>
        <Link className="btn p" href="/inscription">Créer mon compte pro</Link>
      </div>
      <div className="cs-stamp" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-0.12em", marginRight: "0.3em" }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>PROFIL VÉRIFIÉ</div>
    </div>
  );
}

const SLIDES_PILOT = [
  { label: "Lancement en décembre 2026", el: SlideLaunch },
  { label: "Exemples de demandes", el: SlideProjects },
  { label: "Messagerie puis WhatsApp", el: SlideChat },
  { label: "Inscrivez-vous", el: SlideJoin },
];

const SLIDES_OPEN = [{ label: "Déposez votre projet", el: SlideOpen }, ...SLIDES_PILOT.slice(1)];

export function Carousel({ open = false }: { open?: boolean }) {
  const SLIDES = open ? SLIDES_OPEN : SLIDES_PILOT;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const go = useCallback((n: number) => setI((n + SLIDES.length) % SLIDES.length), [SLIDES.length]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(i + 1), 6000);
    return () => clearTimeout(t);
  }, [i, paused, go]);

  const Current = SLIDES[i].el;
  return (
    <section
      className="carousel"
      aria-roledescription="carrousel"
      aria-label="Présentation de BUILDSEN"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="carousel-stage" aria-live={paused ? "polite" : "off"} aria-label={`Diapositive ${i + 1} sur ${SLIDES.length} : ${SLIDES[i].label}`}>
        <Current key={i} />
        {!paused && <span key={`bar-${i}`} className="carousel-bar" aria-hidden="true" />}
      </div>
      <button type="button" className="carousel-arrow prev" onClick={() => go(i - 1)} aria-label="Diapositive précédente">‹</button>
      <button type="button" className="carousel-arrow next" onClick={() => go(i + 1)} aria-label="Diapositive suivante">›</button>
      <div className="carousel-dots" role="tablist" aria-label="Choisir une diapositive">
        {SLIDES.map((s, k) => (
          <button key={s.label} type="button" role="tab" aria-selected={k === i} aria-label={s.label} className={k === i ? "on" : ""} onClick={() => go(k)} />
        ))}
      </div>
    </section>
  );
}
