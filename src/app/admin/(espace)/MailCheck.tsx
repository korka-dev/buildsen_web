"use client";

import { useState } from "react";
import { apiCall } from "@/lib/client";

type Status = { configured: boolean; problem: string | null; from: string; last: { ok: boolean | null; error: string | null; at: string | null } };

// État de l'envoi d'e-mails (clé Resend) et bouton de test : envoie un message à l'administrateur connecté et explique l'échec.
export function MailCheck({ status }: { status: Status }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function test() {
    setBusy(true);
    setMsg(null);
    const r = await apiCall("/api/admin/mail/test");
    setBusy(false);
    if (!r.ok) return setMsg({ ok: false, text: r.error });
    const d = r.data as { ok: boolean; to: string; error: string | null };
    setMsg(d.ok ? { ok: true, text: `E-mail de test envoyé à ${d.to}. Vérifiez votre boîte (et les courriers indésirables).` } : { ok: false, text: d.error ?? "Envoi impossible." });
  }
  const bad = !status.configured || status.last.ok === false;
  return (
    <section className="card" style={{ marginTop: 22 }} aria-labelledby="mail-h">
      <h2 id="mail-h" style={{ marginTop: 0 }}>E-mails</h2>
      <p className={bad ? "err-t" : "muted"} role="status">
        {!status.configured
          ? `Aucun e-mail ne peut partir : ${status.problem}`
          : status.last.ok === false
            ? `Le dernier envoi a échoué : ${status.last.error}`
            : `Clé configurée. Expéditeur : ${status.from}.`}
      </p>
      <button type="button" className="btn o sm" disabled={busy} onClick={test}>{busy ? "Envoi…" : "Envoyer un e-mail de test"}</button>
      {msg && <p className={msg.ok ? "note ok" : "err-t"} role="alert" style={{ marginTop: 10 }}>{msg.text}</p>}
    </section>
  );
}
