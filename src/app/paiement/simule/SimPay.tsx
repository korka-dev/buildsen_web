"use client";

import { useState } from "react";
import { apiCall } from "@/lib/client";
import { fcfa } from "@/lib/constants";

export function SimPay({ token, plan, amount, months, state }: { token: string; plan: string; amount: number; months: number; state: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function go(result: "paid" | "failed") {
    setBusy(true);
    const r = await apiCall(`/api/payments/sim/${encodeURIComponent(token)}/${result}`);
    if (!r.ok) {
      setBusy(false);
      return setErr(r.error);
    }
    window.location.assign(`/paiement/retour?ref=${encodeURIComponent(token)}`);
  }
  return (
    <main id="contenu" tabIndex={-1} style={{ maxWidth: 440, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="note small"><b>Mode test.</b> Cette page remplace Wave et Orange Money. Aucun argent n&apos;est débité.</div>
      <div className="card stack" style={{ gap: 10 }}>
        <h1 style={{ fontSize: 22 }}>Paiement BUILDSEN</h1>
        <span>Formule <b>{plan}</b> · {months} mois</span>
        <span className="num" style={{ fontWeight: 800, fontSize: 28 }}>{fcfa(amount)}</span>
        {state !== "PENDING" ? (
          <p className="muted">Ce paiement est déjà traité. <a href={`/paiement/retour?ref=${encodeURIComponent(token)}`}>Voir le résultat</a></p>
        ) : (
          <>
            <button className="btn p" disabled={busy} onClick={() => go("paid")}>Payer avec Wave (test)</button>
            <button className="btn p" disabled={busy} onClick={() => go("paid")}>Payer avec Orange Money (test)</button>
            <button className="btn g" disabled={busy} onClick={() => go("failed")}>Simuler un échec</button>
          </>
        )}
        {err && <p className="err-t" role="alert">{err}</p>}
      </div>
    </main>
  );
}
