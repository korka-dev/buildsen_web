"use client";

import { useState } from "react";

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Recherche instantanée dans les lignes déjà chargées : tous les mots saisis doivent se retrouver dans la ligne. */
export function useSearch<T>(rows: T[], text: (row: T) => string) {
  const [q, setQ] = useState("");
  const words = plain(q).split(/\s+/).filter(Boolean);
  const shown = words.length ? rows.filter((r) => { const h = plain(text(r)); return words.every((w) => h.includes(w)); }) : rows;
  return { q, setQ, shown };
}

/** Barre au-dessus d'un tableau ou d'une liste : recherche à gauche, filtres à droite. */
export function Toolbar({ q, setQ, placeholder, filters }: { q: string; setQ: (v: string) => void; placeholder: string; filters?: React.ReactNode }) {
  return (
    <div className="bs-toolbar">
      <label className="bs-search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      </label>
      {filters ? <div className="bs-toolbar-f">{filters}</div> : null}
    </div>
  );
}
