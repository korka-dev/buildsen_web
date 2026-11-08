"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApiForm } from "@/lib/client";

// Zone de saisie : envoie le message, vide le champ, et rafraîchit la conversation toutes les 15 secondes
export function MessageComposer({ conversationId, closed }: { conversationId: string; closed: boolean }) {
  const [s, onSubmit, pending] = useApiForm(`/api/conversations/${conversationId}/messages`, { reset: true });
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, 15000);
    return () => clearInterval(t);
  }, [router]);
  if (closed) return <div className="note">Cette demande est clôturée : la conversation est en lecture seule.</div>;
  return (
    <form ref={form} onSubmit={onSubmit} className="stack composer" style={{ gap: 8 }}>
      <label className="sr-only" htmlFor="msg-body">Votre message</label>
      <textarea id="msg-body" className="inp" name="body" required maxLength={2000} placeholder="Écrivez votre message…"
        onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) form.current?.requestSubmit(); }} />
      {s?.error && <p className="err-t" role="alert">{s.error}</p>}
      <button className="btn p" disabled={pending} style={{ alignSelf: "flex-start" }}>{pending ? "Envoi…" : "Envoyer"}</button>
    </form>
  );
}

// Signalement d'une conversation, ou d'une demande quand requestId est fourni
export function ReportForm({ conversationId, requestId }: { conversationId?: string; requestId?: string }) {
  const [s, onSubmit, pending] = useApiForm(requestId ? `/api/requests/${requestId}/report` : `/api/conversations/${conversationId}/report`);
  if (s?.ok) return <p className="small" style={{ color: "var(--g1)" }} role="status">{s.ok}</p>;
  return (
    <details className="report">
      <summary className="small">{requestId ? "Signaler cette demande" : "Signaler cette conversation"}</summary>
      <form onSubmit={onSubmit} className="stack" style={{ gap: 8, marginTop: 10 }}>
        <textarea className="inp" name="reason" required minLength={10} maxLength={1000} placeholder={requestId ? "Pourquoi cette demande ne respecte-t-elle pas les règles ? (fausse demande, coordonnées dans le texte, prestation hors BUILDSEN…)" : "Que s'est-il passé ? (demande de paiement total d'avance, propos déplacés…)"} />
        {s?.error && <p className="err-t" role="alert">{s.error}</p>}
        <button className="btn g sm" disabled={pending} style={{ alignSelf: "flex-start" }}>Envoyer le signalement</button>
      </form>
    </details>
  );
}
