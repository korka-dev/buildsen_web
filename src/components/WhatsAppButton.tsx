"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/constants";

// Bouton flottant « Besoin d'aide ? » : ouvre une discussion WhatsApp avec l'équipe, message prérempli selon la page
export function WhatsAppButton() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const text = path.startsWith("/pro")
    ? "Bonjour BUILDSEN, j'ai besoin d'aide pour mon dossier professionnel."
    : "Bonjour BUILDSEN, j'ai besoin d'aide pour m'inscrire.";
  return (
    <a className="help-fab" href={whatsappLink(text)} target="_blank" rel="noopener" aria-label="Besoin d'aide ? Contactez l'équipe BUILDSEN">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M9.4 9.3a2.7 2.7 0 015.2 1c0 1.8-2.6 2.3-2.6 3.9" />
        <circle cx="12" cy="17.2" r="0.6" fill="currentColor" />
      </svg>
      <span className="hl">Besoin d&apos;aide ?</span>
      <span className="hs">Aide</span>
    </a>
  );
}
