import { STATUTS } from "@/lib/constants";
import { BACKEND_URL } from "@/lib/api";
import { ogCard, OG_SIZE } from "@/lib/ogCard";
import type { ProCard } from "@/lib/types";

// Aperçu du lien d'un profil partagé : nom, statut vérifié et photo d'une réalisation
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Profil vérifié sur BUILDSEN";

const DEFAULT = { tag: "Professionnels vérifiés · Dakar", title: "Construire avec confiance.", lines: ["Plans, devis, métrés et études : des ingénieurs et techniciens vérifiés vous répondent."] };

// Photo de réalisation convertie en JPEG (le moteur d'aperçu ne lit pas le WebP) ; sans photo, l'image BUILDSEN par défaut
async function photoOf(itemId: string) {
  try {
    const r = await fetch(`${BACKEND_URL}/api/fichiers/portfolio/${itemId}`);
    if (!r.ok) return undefined;
    const sharp = (await import("sharp")).default;
    const jpg = await sharp(Buffer.from(await r.arrayBuffer())).rotate().resize(540, 630, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${jpg.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Appel sans cookie : seules les informations publiques du profil sont utilisées
  const res = await fetch(`${BACKEND_URL}/api/public/pros/${encodeURIComponent(id)}`, { cache: "no-store" }).catch(() => null);
  if (!res?.ok) return ogCard(DEFAULT);
  const { pro: p } = (await res.json()) as { pro: ProCard };
  const cover = p.portfolio.find((i) => i.mime.startsWith("image/"));
  const n = p.portfolioCount;
  return ogCard({
    tag: p.statut === "ENT" ? "Entreprise vérifiée" : "Profil vérifié",
    initials: p.badge,
    title: p.name,
    lines: [p.statut ? STATUTS[p.statut].name : "Professionnel du bâtiment", `${p.commune ?? "Dakar"} · ${n ? `${n} réalisation${n > 1 ? "s" : ""}` : "vérifié par BUILDSEN"}`],
    photo: cover ? await photoOf(cover.id) : undefined,
  });
}
