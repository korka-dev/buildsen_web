"use client";

import { useApiForm } from "@/lib/client";
import { ActionButton } from "@/components/ActionButton";

// Acceptation ou refus motivé d'un justificatif
export function DocumentDecision({ credentialId }: { credentialId: string }) {
  const [s, onSubmit, pending] = useApiForm(`/api/admin/credentials/${credentialId}/decide`, { extra: { accept: false } });
  return (
    <div className="row" style={{ gap: 6, width: "100%" }}>
      <ActionButton path={`/api/admin/credentials/${credentialId}/decide`} body={{ accept: true }} className="btn o sm">Accepter</ActionButton>
      <form onSubmit={onSubmit} className="row" style={{ gap: 6, flex: 1 }}>
        <input className="inp" name="reason" placeholder="Motif du refus (obligatoire)" minLength={5} required style={{ minHeight: 34, padding: "6px 8px", flex: 1, minWidth: 160 }} />
        <button className="btn x sm" disabled={pending}>Refuser</button>
      </form>
      {s?.error && <span className="err-t" role="alert">{s.error}</span>}
    </div>
  );
}
