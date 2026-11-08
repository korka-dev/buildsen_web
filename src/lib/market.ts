// Petits utilitaires d'affichage (les noms affichés et titres des demandes sont calculés par l'API)

// Lien wa.me à partir d'un numéro sénégalais enregistré sans espaces
export const waLink = (phone: string | null | undefined) => {
  const d = (phone ?? "").replace(/\D/g, "");
  return d ? `https://wa.me/${d.length === 9 ? "221" + d : d}` : null;
};

// Date et heure à Dakar, par exemple « 19/10/2026 »
export const dateFr = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Dakar" }) : "");

// Temps écoulé depuis la publication d'une demande
export const ago = (iso: string | null | undefined) => {
  if (!iso) return "";
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600e3));
  return h < 1 ? "à l'instant" : h < 24 ? `il y a ${h} h` : h < 48 ? "hier" : `il y a ${Math.round(h / 24)} j`;
};
