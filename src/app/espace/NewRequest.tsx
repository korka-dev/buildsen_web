"use client";

import { useState } from "react";
import { CLIENTS_OPEN } from "@/lib/constants";
import { Modal } from "@/components/bs/Modal";
import { BsIcon } from "@/components/bs/icons";
import { RequestForm, ResendVerification } from "./forms";

/**
 * Bouton « Nouvelle demande » : ouvre la saisie par étapes (une question à la fois).
 * L'assistant vocal (VoiceAssistant.tsx) est mis de côté pour l'instant : il n'est plus proposé ici.
 */
export function NewRequestButton({ email, verified, className = "btn p", label = "Nouvelle demande", short }: {
  email: string;
  verified: boolean;
  className?: string;
  label?: string;
  /** Libellé court affiché sur téléphone */
  short?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <BsIcon name="plus" size={18} />
        {short ? <><span className="bs-lg">{label}</span><span className="bs-sm">{short}</span></> : label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle demande" intro="Gratuit, environ 3 minutes. Une question à la fois." wide>
        {!CLIENTS_OPEN ? (
          <div className="note">Le dépôt de demandes ouvrira très bientôt.</div>
        ) : !verified ? (
          <div className="note w stack" style={{ gap: 10 }}>
            <span><b>Confirmez d&apos;abord votre adresse e-mail</b> avec le lien envoyé à <b>{email}</b> (pensez aux courriers indésirables).</span>
            <ResendVerification />
          </div>
        ) : (
          <RequestForm />
        )}
      </Modal>
    </>
  );
}
