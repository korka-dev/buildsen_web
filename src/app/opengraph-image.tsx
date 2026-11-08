import { ogCard, OG_SIZE } from "@/lib/ogCard";

// Aperçu par défaut d'un lien vers buildsen.com
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "BUILDSEN : professionnels du bâtiment vérifiés à Dakar";

export default function Image() {
  return ogCard({
    tag: "Professionnels vérifiés · Dakar",
    title: "Construire avec confiance.",
    lines: ["Plans, devis, métrés et études : des ingénieurs et techniciens vérifiés vous répondent."],
  });
}
