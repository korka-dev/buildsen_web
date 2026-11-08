import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { AdminRole, Me, User } from "./types";

// Appels de l'API depuis le serveur Next.js (pages et mises en page), avec le cookie de session du visiteur.
// L'adresse du backend n'est jamais exposée au navigateur : celui-ci passe par le relais /api (voir next.config.ts).
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export class ApiFailure extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

async function forward(): Promise<Record<string, string>> {
  const [jar, h] = await Promise.all([cookies(), headers()]);
  const out: Record<string, string> = { cookie: jar.toString() };
  const ip = h.get("x-forwarded-for");
  if (ip) out["x-forwarded-for"] = ip;
  return out;
}

// Réponse brute : à utiliser quand la page traite elle-même un refus (ex. profil non vérifié)
export async function apiRaw<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<{ status: number; data: T & { error?: string; code?: string } }> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...(await forward()),
      ...(init.body !== undefined ? { "content-type": "application/json", "x-internal-key": process.env.INTERNAL_API_KEY ?? "" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// Réponse attendue : 401 renvoie vers la connexion, 404 affiche la page « introuvable »
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { status, data } = await apiRaw<T>(path, init);
  if (status === 401) redirect(path.startsWith("/api/admin") ? "/admin/connexion" : "/connexion");
  if (status === 403 && path.startsWith("/api/admin")) redirect("/admin");
  if (status === 404) notFound();
  if (status >= 400) throw new ApiFailure(status, data.error ?? `Erreur ${status}`, data.code);
  return data;
}

// Utilisateur connecté et notifications : un seul appel par affichage de page, partagé par la mise en page et la page
export const getMe = cache(async (): Promise<Me> => {
  const { status, data } = await apiRaw<Me>("/api/me?notifs=true");
  return status === 200 ? data : { user: null };
});

// Particulier ou professionnel connecté (accueil commun et fiches)
export async function requireMember() {
  const me = await getMe();
  if (me.user?.role === "ADMIN") redirect("/admin");
  if (!me.user || (me.user.role !== "CLIENT" && me.user.role !== "PRO")) redirect("/connexion");
  return me as Me & { user: User };
}

export async function requireClient() {
  const me = await getMe();
  if (me.user?.role !== "CLIENT") redirect("/connexion");
  return me as Me & { user: User };
}

export async function requirePro() {
  const me = await getMe();
  if (me.user?.role !== "PRO" || !me.pro) redirect("/connexion");
  return me as Me & { user: User; pro: NonNullable<Me["pro"]> };
}

export type AdminMe = { admin: User & { adminRole: AdminRole }; roleLabel: string; counts: { dossiers: number; requests: number; reports: number }; clientsOpen: boolean };

export const requireAdmin = cache(async (): Promise<AdminMe> => api<AdminMe>("/api/admin/me"));
