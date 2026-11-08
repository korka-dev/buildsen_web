"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Notifs } from "@/lib/types";

const KEY = "bs-notifs-vues";

// Icônes dessinées des prestations (aucun émoji)
const PATHS: Record<string, string> = {
  plans: "M4 4h16v16H4zM4 12h8V4M12 16v4M16 12h4M16 12v4",
  metres: "M3 9h18v6H3zM7 9v3M11 9v4M15 9v3M19 9v4",
  dao: "M12 3v3M12 6l-6 15M12 6l6 15M8 15h8",
  etudes: "M3 5h18M3 19h18M12 5v14M7 5l5 6 5-6M7 19l5-6 5 6",
};
const Ico = ({ d, s = 18 }: { d: string; s?: number }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const AUTO_CLOSE_MS = 6000;

// Cloche de notifications (ordinateur) et pop-up détaillé qui s'ouvre seul pour toute nouveauté, puis se ferme après 6 secondes.
// Sur téléphone, la cloche est masquée et le pop-up s'affiche sous le menu.
export function NotificationCenter({ n }: { n: Notifs }) {
  const [open, setOpen] = useState(false);
  const [auto, setAuto] = useState(false);
  const [hover, setHover] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const ids = n.items.map((i) => i.id).join("|");

  // Ouverture automatique uniquement si un élément n'a encore jamais été montré sur cet appareil
  useEffect(() => {
    if (!n.items.length) return;
    let seen: string[] = [];
    try { seen = JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { /* stockage indisponible */ }
    if (n.items.some((i) => !seen.includes(i.id))) {
      setOpen(true);
      setAuto(true);
      try { localStorage.setItem(KEY, JSON.stringify([...n.items.map((i) => i.id), ...seen].slice(0, 80))); } catch { /* stockage indisponible */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  // Fermeture automatique (en pause pendant le survol)
  useEffect(() => {
    if (!open || !auto || hover) return;
    const t = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [open, auto, hover]);

  // Fermeture au clic en dehors et avec la touche Échap
  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", click); document.removeEventListener("keydown", key); };
  }, [open]);

  const count = n.items.length;
  return (
    <div className="notif" ref={box}>
      <button type="button" className={`bell hide-m${count ? " has" : ""}`} aria-label={count ? `Notifications : ${n.title}` : "Notifications"} aria-expanded={open}
        onClick={() => { setAuto(false); setOpen(!open); }}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0112 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9M10 20a2 2 0 004 0" /></svg>
        {count > 0 && <i>{count}</i>}
      </button>
      {open && (
        <div className="notif-pop" role="dialog" aria-label="Notifications" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <span className="notif-caret" aria-hidden="true" />
          <div className="notif-h">
            <span>{count ? `● ${n.title}` : "Aucune nouveauté"}</span>
            <button type="button" className="notif-x" aria-label="Fermer" onClick={() => setOpen(false)}><Ico d="M6 6l12 12M18 6L6 18" s={16} /></button>
          </div>
          {n.items.map((i) => (
            <Link key={i.id} href={i.href} className="notif-row" onClick={() => setOpen(false)}>
              <span className={`notif-av${i.icon ? " ic" : ""}`} aria-hidden="true">{i.icon ? <Ico d={PATHS[i.badge] ?? PATHS.plans} /> : i.badge}</span>
              <span className="notif-tx"><b>{i.title}</b><span>{i.sub}</span></span>
              <span className="notif-lk">{i.action}</span>
            </Link>
          ))}
          {count > 0 && (
            <div className="notif-ft">
              <Link href={n.footer[1]} onClick={() => setOpen(false)}>{n.footer[0]}</Link>
              {auto && <span className="muted">se ferme seul</span>}
            </div>
          )}
          {auto && <span className={`notif-prog${hover ? " paused" : ""}`} style={{ animationDuration: `${AUTO_CLOSE_MS}ms` }} />}
        </div>
      )}
    </div>
  );
}
