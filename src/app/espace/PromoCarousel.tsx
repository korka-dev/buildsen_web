"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Ad } from "@/lib/types";
import { NewRequestButton } from "./NewRequest";

const AUTO_MS = 5500;

type Cta = "new" | { label: string; href: string };
type Slide =
  | { kind: "image"; id: string; img: string; pos: string; kicker: string; title: string; text: string; cta: Cta }
  | { kind: "ad"; id: string; ad: Ad };

// Diapositives sur les plans (photos), puis les annonces partenaires actives.
// Photos promo-* : Unsplash (licence Unsplash, usage commercial libre, attribution non obligatoire), images.unsplash.com :
// plan-2d photo-1542621334-a254cf47733d, plan-3d photo-1786550860329-f813516e9705, facades photo-1721244653580-79577d2822a2,
// dao photo-1781888688940-5730c3fd5baf, maquette photo-1782879549420-7cd9dc53d334
const SLIDES: Slide[] = [
  { kind: "image", id: "plan-2d", img: "/images/promo-plan-2d.webp", pos: "center", kicker: "Plans 2D", title: "Votre maison dessinée par un pro", text: "Plans cotés de votre villa, de la plus simple au R+2, par des professionnels vérifiés.", cta: "new" },
  { kind: "image", id: "plan-3d", img: "/images/promo-plan-3d.webp", pos: "center 30%", kicker: "Plans 3D et aménagement", title: "Visualisez chaque pièce avant de construire", text: "Plans 3D et aménagement intérieur : chambres, salon, cuisine, garage.", cta: "new" },
  { kind: "image", id: "architecte", img: "/images/hero-plan-architecte-1600.webp", pos: "center", kicker: "Conception", title: "Un plan pensé pour votre terrain", text: "Décrivez votre terrain et vos besoins : les pros vous proposent un plan sur mesure.", cta: "new" },
  { kind: "image", id: "facades", img: "/images/promo-facades.webp", pos: "center", kicker: "Façades et coupes", title: "Façades, coupes et plans d'étage", text: "Tous les plans utiles pour votre dossier et votre chantier.", cta: "new" },
  { kind: "image", id: "dao", img: "/images/promo-dao.webp", pos: "center 45%", kicker: "DAO", title: "Vos plans papier mis au propre", text: "Reproduction numérique et mise en page sur AutoCAD.", cta: "new" },
  { kind: "image", id: "maquette", img: "/images/promo-maquette.webp", pos: "center", kicker: "Modification", title: "Modifiez ou réaménagez vos plans", text: "Agrandissement, nouvelle pièce, étage en plus : un pro adapte vos plans existants.", cta: "new" },
  { kind: "image", id: "villa", img: "/images/villa.webp", pos: "center 35%", kicker: "Rendu final", title: "Du plan à la villa de vos rêves", text: "Jusqu'à 5 professionnels vérifiés vous écrivent, gratuitement.", cta: "new" },
];

function SlideCta({ cta, email, verified }: { cta: Cta; email: string; verified: boolean }) {
  return cta === "new" ? (
    <NewRequestButton email={email} verified={verified} className="btn bs-btn-white bs-slide-btn" label="Nouvelle demande" />
  ) : (
    <Link className="btn bs-btn-white bs-slide-btn" href={cta.href}>{cta.label}</Link>
  );
}

/** Carrousel (téléphone) sur les plans : avance automatique, défilement au doigt. */
export function PromoCarousel({ ads, email, verified }: { ads: Ad[]; email: string; verified: boolean }) {
  const slides: Slide[] = [...SLIDES, ...ads.map((ad) => ({ kind: "ad" as const, id: ad.id, ad }))];
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Diapositive visible, d'après la position de défilement
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = useCallback((i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }, []);

  // Avance automatique, en pause pendant un contact, et si l'utilisateur limite les animations
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go((index + 1) % slides.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [index, paused, slides.length, go]);

  return (
    <section className="bs-promo" aria-roledescription="carrousel" aria-label="Nos prestations de plans">
      <div
        ref={track}
        className="bs-promo-track"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {slides.map((s, i) => (
          <article
            key={s.id}
            className={`bs-slide bs-slide-${s.kind}${i === index ? " on" : ""}`}
            aria-roledescription="diapositive"
            aria-label={`${i + 1} sur ${slides.length}`}
            style={s.kind === "image" ? { backgroundImage: `url(${s.img})`, backgroundPosition: s.pos } : undefined}
          >
            <div className="bs-slide-in">
              {s.kind === "ad" ? (
                <>
                  <span className="bs-slide-k">Partenaire</span>
                  <h3>{s.ad.title}</h3>
                  <p>{s.ad.text}</p>
                  {s.ad.href ? (
                    <a className="btn bs-btn-white bs-slide-btn" href={s.ad.href} target="_blank" rel="noopener sponsored">
                      {s.ad.linkLabel || "Découvrir"}
                    </a>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="bs-slide-k">{s.kicker}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <SlideCta cta={s.cta} email={email} verified={verified} />
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
