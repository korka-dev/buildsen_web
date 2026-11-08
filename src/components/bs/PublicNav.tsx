"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthTrigger } from "./AuthModal";
import { BsIcon } from "./icons";

// Rubriques = sections de l'accueil (une seule page, défilement fluide)
const NAV = [
  { id: "accueil", label: "Accueil" },
  { id: "comment-ca-marche", label: "Comment ça marche" },
  { id: "prestations", label: "Prestations" },
  { id: "a-propos", label: "À propos" },
];

/** Centre et droite du header : rubriques (menu sur mobile) et bouton « Se connecter ». */
export function PublicNav({ space }: { space: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("accueil");

  useEffect(() => setOpen(false), [pathname]);

  // Sur l'accueil : surligne la rubrique de la section affichée
  useEffect(() => {
    if (pathname !== "/") return;
    const update = () => {
      const limit = window.innerHeight * 0.4;
      let current = NAV[0]!.id;
      for (const { id } of NAV) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= limit) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  return (
    <>
      <nav id="bs-menu" aria-label="Menu principal" className={`bs-nav${open ? " open" : ""}`}>
        <ul>
          {NAV.map((item) => (
            <li key={item.id}>
              <Link
                href={`/#${item.id}`}
                aria-current={pathname === "/" && active === item.id ? "true" : undefined}
                onClick={() => {
                  setOpen(false);
                  setActive(item.id);
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="bs-hdr-act">
        {space ? (
          <Link className="btn p" href={space}>Mon espace</Link>
        ) : (
          <AuthTrigger className="btn p">
            <span className="bs-btn-ico"><BsIcon name="logIn" size={18} /></span>
            Se connecter
          </AuthTrigger>
        )}
        <button
          type="button"
          className="bs-burger"
          aria-expanded={open}
          aria-controls="bs-menu"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <BsIcon name={open ? "close" : "menu"} />
        </button>
      </div>
    </>
  );
}
