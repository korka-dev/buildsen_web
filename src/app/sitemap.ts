import type { MetadataRoute } from "next";
import { BACKEND_URL } from "@/lib/api";

const BASE = "https://www.buildsen.com";
export const revalidate = 3600;

// Plan du site pour les moteurs de recherche : pages publiques et profils vérifiés visibles
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${BACKEND_URL}/api/public/sitemap`, { next: { revalidate: 3600 } }).catch(() => null);
  const pros: { id: string; updatedAt: string }[] = res?.ok ? (await res.json()).pros : [];
  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/inscription`, priority: 0.8 },
    { url: `${BASE}/connexion`, priority: 0.5 },
    { url: `${BASE}/cgu`, priority: 0.2 },
    { url: `${BASE}/confidentialite`, priority: 0.2 },
    ...pros.map((p) => ({ url: `${BASE}/professionnels/${p.id}`, lastModified: p.updatedAt, priority: 0.7 })),
  ];
}
