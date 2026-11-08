"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { BsIcon } from "./icons";
import { useWaInfo } from "./useWaInfo";

/**
 * Bouton « Écrire sur WhatsApp » : ouvre l'assistant BUILDSEN.
 * Sur téléphone, il ouvre WhatsApp directement ; sur ordinateur, il affiche un QR code à scanner avec le téléphone.
 * Il ne s'affiche que si l'assistant est activé.
 */
export function WhatsAppButton({ className = "btn bs-wa-btn", label = "Écrire sur WhatsApp" }: { className?: string; label?: string }) {
  const info = useWaInfo();
  const [open, setOpen] = useState(false);
  if (!info?.enabled || !info.link) return null;
  const link = info.link;

  function click() {
    const phone = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (phone) window.open(link, "_blank", "noopener");
    else setOpen(true);
  }

  return (
    <>
      <button type="button" className={className} onClick={click}>
        <BsIcon name="chat" size={18} /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Continuer sur WhatsApp" intro="Scannez ce code avec l'appareil photo de votre téléphone.">
        <div className="bs-wa-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/wa/qr.svg" alt="QR code pour ouvrir l'assistant BUILDSEN sur WhatsApp" width={220} height={220} />
          <p>Décrivez votre projet à voix haute ou par écrit, en wolof ou en français. Les professionnels vous répondent dans la même conversation.</p>
          <a className="btn p" href={link} target="_blank" rel="noopener">
            {info.simulator ? "Ouvrir le simulateur WhatsApp" : "Ouvrir WhatsApp sur cet ordinateur"}
          </a>
        </div>
      </Modal>
    </>
  );
}

/** Encadré « Continuer sur WhatsApp » (tableau de bord du particulier). Invisible si l'assistant est désactivé. */
export function WhatsAppCard() {
  const info = useWaInfo();
  if (!info?.enabled || !info.link) return null;
  return (
    <section className="bs-wa-card" aria-label="Assistant WhatsApp">
      <div>
        <b>Plus simple sur WhatsApp</b>
        <span>Décrivez un projet par note vocale et recevez les réponses des professionnels dans la même conversation.</span>
      </div>
      <WhatsAppButton />
    </section>
  );
}
