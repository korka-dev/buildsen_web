"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

// Appels de l'API depuis le navigateur, par le relais /api du site (même origine : cookies de session et protection CSRF).

export type ApiState = { error?: string; ok?: string; link?: string } | undefined;
type Result = { ok: true; data: Record<string, unknown> } | { ok: false; error: string; status: number };

export async function apiCall(path: string, { method = "POST", body }: { method?: string; body?: unknown } = {}): Promise<Result> {
  try {
    const res = await fetch(path, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, error: (data as { error?: string }).error ?? "Une erreur est survenue. Réessayez." };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "Connexion impossible. Vérifiez votre réseau et réessayez." };
  }
}

// Formulaire → objet JSON. Un champ présent plusieurs fois (cases à cocher multiples) devient une liste.
export function formJson(fd: FormData) {
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string") continue;
    const prev = out[k];
    out[k] = prev === undefined ? v : Array.isArray(prev) ? [...prev, v] : [prev, v];
  }
  return out;
}

/**
 * Envoi d'un formulaire à l'API, sans le vider en cas d'erreur.
 * Réponse { redirect } : navigation (rechargement complet si `hard`, utile à la connexion et à la déconnexion).
 * Réponse { ok } : message de confirmation et actualisation des données de la page.
 */
export function useApiForm(path: string, opts: { method?: string; hard?: boolean; reset?: boolean; extra?: Record<string, unknown> } = {}) {
  const router = useRouter();
  const [state, setState] = useState<ApiState>();
  const [pending, setPending] = useState(false);
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const fd = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    setPending(true);
    setState(undefined);
    const r = await apiCall(path, { method: opts.method ?? "POST", body: { ...formJson(fd), ...opts.extra } });
    setPending(false);
    if (!r.ok) {
      setState({ error: r.error });
      return;
    }
    const redirect = r.data.redirect as string | undefined;
    if (redirect) {
      if (opts.hard) window.location.assign(redirect);
      else router.push(redirect);
      return;
    }
    setState({ ok: typeof r.data.ok === "string" ? r.data.ok : undefined, link: r.data.link as string | undefined });
    if (opts.reset) form.reset();
    router.refresh();
  }
  return [state, onSubmit, pending] as const;
}
