"use client";

import { useState } from "react";
import { Modal } from "@/components/bs/Modal";
import { BsIcon, type BsIconName } from "@/components/bs/icons";

export type Row = { key: string; icon: BsIconName; title: string; summary: string; done: boolean; intro?: string; content: React.ReactNode };

/** Les parties du compte (Informations, Justificatifs, Réalisations) : un clic ouvre une fenêtre avec le détail. */
export function CompteSections({ rows }: { rows: Row[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const cur = rows.find((r) => r.key === open);
  return (
    <>
      <ul className="bs-rows">
        {rows.map((r) => (
          <li key={r.key}>
            <button type="button" className="bs-row" onClick={() => setOpen(r.key)} aria-haspopup="dialog">
              <span className="bs-ico"><BsIcon name={r.icon} /></span>
              <span className="bs-row-tx"><b>{r.title}</b><small className={r.done ? "bs-ok" : "bs-todo"}>{r.summary}</small></span>
              <BsIcon name="chevronRight" size={20} />
            </button>
          </li>
        ))}
      </ul>
      <Modal open={!!cur} onClose={() => setOpen(null)} title={cur?.title ?? ""} intro={cur?.intro} wide>
        {cur?.content}
      </Modal>
    </>
  );
}
