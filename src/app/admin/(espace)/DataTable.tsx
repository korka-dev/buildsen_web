"use client";

import { useState } from "react";
import { Modal } from "@/components/bs/Modal";
import { BsIcon } from "@/components/bs/icons";
import { Toolbar, useSearch } from "@/components/Toolbar";

export type DataRow = {
  key: string;
  /** Une cellule par colonne (hors Actions) */
  cells: React.ReactNode[];
  /** Texte interrogé par la recherche */
  text: string;
  /** Groupe pour les filtres */
  group?: string;
  /** Second groupe (par exemple la formule) : se combine avec le premier */
  group2?: string;
  /** Contenu de la fenêtre ouverte par « Visualiser » (absent : pas de bouton) */
  view?: React.ReactNode;
  title?: string;
  /** Autres actions, affichées à côté de « Visualiser » */
  actions?: React.ReactNode;
};

/**
 * Tableau d'administration au gabarit commun : recherche à gauche, filtres à droite, colonne Actions avec « Visualiser » qui ouvre une fenêtre.
 * `action` ajoute un bouton principal (ex. « Inviter ») qui ouvre aussi une fenêtre.
 */
export function DataTable({ head, rows, filters, filters2, label2, searchPlaceholder, empty, action }: {
  head: string[];
  rows: DataRow[];
  filters?: { id: string; label: string }[];
  /** Second jeu de filtres (ex. la formule), combiné avec le premier */
  filters2?: { id: string; label: string }[];
  label2?: string;
  searchPlaceholder: string;
  empty: string;
  action?: { label: string; title: string; content: React.ReactNode };
}) {
  const [group, setGroup] = useState("all");
  const [group2, setGroup2] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const inGroup = rows.filter((r) => (group === "all" || r.group === group) && (group2 === "all" || r.group2 === group2));
  const { q, setQ, shown } = useSearch(inGroup, (r) => r.text);
  const cur = rows.find((r) => r.key === open);
  const hasActions = rows.some((r) => r.view || r.actions);
  const bar = (
    <div className="row" style={{ gap: 8, flexWrap: "nowrap", justifyContent: "flex-end", alignItems: "center" }}>
      {filters && (
        <div className="row tabs" style={{ gap: 6, flexWrap: "nowrap" }} role="group" aria-label="Filtrer">
          {[{ id: "all", label: "Tous" }, ...filters].map((f) => (
            <button key={f.id} type="button" className={`btn sm ${group === f.id ? "d" : "g"}`} aria-pressed={group === f.id} onClick={() => setGroup(f.id)}>
              {f.label} <span className="num" style={{ opacity: 0.75 }}>{f.id === "all" ? rows.length : rows.filter((r) => r.group === f.id).length}</span>
            </button>
          ))}
        </div>
      )}
      {filters2 && (
        <label className="bs-select-f">
          {label2 && <span className="small muted">{label2}</span>}
          <select value={group2} onChange={(e) => setGroup2(e.target.value)} aria-label={label2 ?? "Filtrer"}>
            <option value="all">Toutes ({rows.length})</option>
            {filters2.map((f) => <option key={f.id} value={f.id}>{f.label} ({rows.filter((r) => r.group2 === f.id).length})</option>)}
          </select>
        </label>
      )}
      {action && <button type="button" className="btn p sm" onClick={() => setAdding(true)}><BsIcon name="plus" size={16} /> {action.label}</button>}
    </div>
  );
  return (
    <>
      <Toolbar q={q} setQ={setQ} placeholder={searchPlaceholder} filters={bar} />
      {shown.length === 0 ? (
        <div className="card flat"><span className="muted">{q || group !== "all" || group2 !== "all" ? "Aucun résultat pour cette recherche." : empty}</span></div>
      ) : (
        <div className="tbl">
          <table className="t">
            <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}{hasActions && <th style={{ textAlign: "right" }}>Actions</th>}</tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.key} className={r.view ? "bs-tr-click" : undefined} onClick={r.view ? (e) => { if (!(e.target as HTMLElement).closest("button, a, input, select, label")) setOpen(r.key); } : undefined}>
                  {r.cells.map((c, i) => <td key={i}>{c}</td>)}
                  {hasActions && (
                    <td style={{ textAlign: "right" }}>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {r.view && <button type="button" className="btn o sm" onClick={() => setOpen(r.key)}><BsIcon name="eye" size={16} /> Visualiser</button>}
                        {r.actions}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!cur} onClose={() => setOpen(null)} title={cur?.title ?? "Détail"} wide>{cur?.view}</Modal>
      {action && <Modal open={adding} onClose={() => setAdding(false)} title={action.title} wide>{action.content}</Modal>}
    </>
  );
}
