"use client";

import { useEffect, useRef } from "react";
import { BsIcon } from "./icons";

/** Fenêtre modale native (<dialog>) : croix, touche Échap et clic en dehors pour fermer. */
export function Modal({
  open,
  onClose,
  title,
  intro,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  intro?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`bs-modal${wide ? " bs-wide" : ""}`}
      aria-labelledby="bs-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="bs-modal-h">
        <div>
          <h2 id="bs-modal-title">{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </div>
        <button type="button" className="bs-close" onClick={onClose} aria-label="Fermer">
          <BsIcon name="close" size={20} />
        </button>
      </div>
      <div className="bs-modal-b">{open ? children : null}</div>
    </dialog>
  );
}
