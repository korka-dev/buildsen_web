"use client";

import { useEffect, useState } from "react";
import { fcfa } from "@/lib/constants";

type St = {
  state: "PENDING" | "PROVISIONAL" | "PAID" | "FAILED" | "EXPIRED"; planName: string; amount: number; months: number; provider: string;
  payUrl: string | null; until: string | null; claimed: boolean;
};

// Interroge le serveur jusqu'à la confirmation. Avec Wave : bouton de paiement, puis « J'ai payé » qui active la formule tout de suite.
export function Result({ token }: { token: string }) {
  const [st, setSt] = useState<St | null>(null);
  const [lost, setLost] = useState(!token);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);
  const [phone, setPhone] = useState("");
  const [txRef, setTxRef] = useState("");
  useEffect(() => {
    if (!token) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    async function poll() {
      tries += 1;
      const r = await fetch(`/api/payments/${encodeURIComponent(token)}`).catch(() => null);
      if (stop) return;
      if (r?.status === 404) return setLost(true);
      const d: St | null = r?.ok ? await r.json() : null;
      if (d) setSt(d);
      const waiting = !d || d.state === "PROVISIONAL" || (d.state === "PENDING" && ((d.provider !== "wave" && d.provider !== "om") || tick > 0 || d.claimed));
      if (waiting && tries < 60) timer = setTimeout(poll, 3000);
    }
    void poll();
    return () => { stop = true; clearTimeout(timer); };
  }, [token, tick]);

  async function claim() {
    setBusy(true);
    setErr("");
    const r = await fetch(`/api/payments/${encodeURIComponent(token)}/claim`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, reference: txRef }) }).catch(() => null);
    setBusy(false);
    if (!r?.ok) return setErr(r?.status === 401 ? "Connectez-vous pour continuer." : r?.status === 400 ? "Vérifiez le numéro Wave (9 chiffres) et l'identifiant de transaction (lettres et chiffres, ex. T_ABC123XYZ)." : "Impossible pour l'instant. Réessayez.");
    setTick((n) => n + 1);
  }

  const mname = st?.provider === "om" ? "Orange Money" : "Wave";
  const box = (children: React.ReactNode) => (
    <main id="contenu" tabIndex={-1} style={{ maxWidth: 440, margin: "0 auto", padding: "32px 16px" }}><div className="card stack" style={{ gap: 12 }}>{children}</div></main>
  );
  if (lost) return box(<><h1 style={{ fontSize: 22 }}>Paiement introuvable</h1><a className="btn p" href="/pro/abonnement">Mon abonnement</a></>);
  if (!st) return box(<><h1 style={{ fontSize: 22 }}>Chargement…</h1></>);
  if (st.state === "PENDING" && (st.provider === "wave" || st.provider === "om") && st.claimed)
    return box(<>
      <h1 style={{ fontSize: 22 }}>Vérification de votre paiement…</h1>
      <p>Nous attendons la réception de votre paiement {mname} de <b>{fcfa(st.amount)}</b>. Votre formule <b>{st.planName}</b> s&apos;active dès qu&apos;il est reçu, en général en quelques minutes. Vous pouvez fermer cette page : vous serez prévenu par e-mail et sur WhatsApp.</p>
      <a className="btn o" href="/pro/abonnement">Mon abonnement</a>
    </>);
  if (st.state === "PENDING" && (st.provider === "wave" || st.provider === "om"))
    return box(<>
      <h1 style={{ fontSize: 22 }}>Payer avec {mname}</h1>
      <p>Formule <b>{st.planName}</b> · {st.months} mois · <b>{fcfa(st.amount)}</b></p>
      <ol className="small" style={{ paddingLeft: 18, margin: 0 }}>
        <li>Touchez « Payer avec {mname} » {st.provider === "om" ? <>puis saisissez exactement <b>{fcfa(st.amount)}</b> (le montant n&apos;est pas rempli par Orange Money)</> : "(le montant est déjà rempli)"}. Payez depuis votre numéro {mname}.</li>
        <li>Indiquez ci-dessous le numéro {mname} utilisé, puis touchez « J&apos;ai payé ».</li>
      </ol>
      {st.payUrl && <a className="btn p" href={st.payUrl} target="_blank" rel="noopener noreferrer">Payer avec {mname}</a>}
      <label className="stack" style={{ gap: 4 }}>
        <span className="small">Numéro {mname} utilisé pour payer</span>
        <input className="inp" inputMode="tel" autoComplete="tel" placeholder="77 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="stack" style={{ gap: 4 }}>
        <span className="small">Identifiant de transaction (reçu {mname}, facultatif mais accélère la confirmation)</span>
        <input className="inp" autoComplete="off" placeholder="T_ABC123XYZ" value={txRef} onChange={(e) => setTxRef(e.target.value)} />
      </label>
      <button type="button" className="btn o" onClick={claim} disabled={busy}>{busy ? "Un instant…" : "J'ai payé"}</button>
      {err && <p className="err-t small" role="alert">{err}</p>}
      <p className="muted small">La formule s&apos;active uniquement quand le paiement est réellement reçu : cliquer sans avoir payé ne change rien.</p>
    </>);
  if (st.state === "PENDING")
    return box(<><h1 style={{ fontSize: 22 }}>Confirmation en cours…</h1><p className="muted">Nous attendons la confirmation de votre paiement. Cela prend quelques secondes.</p></>);
  if (st.state === "PROVISIONAL")
    return box(<>
      <h1 style={{ fontSize: 22 }}>Formule activée ✅</h1>
      <p>Votre formule <b>{st.planName}</b> est active. Nous confirmons votre paiement {mname} ({fcfa(st.amount)}) : vous n&apos;avez rien à faire.</p>
      <a className="btn p" href="/pro/abonnement">Voir mon abonnement</a>
    </>);
  if (st.state === "PAID")
    return box(<>
      <h1 style={{ fontSize: 22 }}>Paiement reçu ✅</h1>
      <p>Votre formule <b>{st.planName}</b> est active ({fcfa(st.amount)} · {st.months} mois). Vous pouvez retourner sur WhatsApp ou continuer sur le site.</p>
      <a className="btn p" href="/pro/abonnement">Voir mon abonnement</a>
    </>);
  return box(<>
    <h1 style={{ fontSize: 22 }}>{st.state === "EXPIRED" ? "Paiement non reçu" : "Paiement non abouti"}</h1>
    <p>{st.state === "EXPIRED" ? "Nous n'avons pas reçu votre paiement {mname} et l'activation provisoire est terminée. Si vous avez payé, écrivez-nous : nous réglons cela avec votre référence." : "Aucun montant n'a été pris en compte et votre formule n'a pas changé. Vous pouvez réessayer."}</p>
    <a className="btn p" href="/pro/abonnement">{st.state === "EXPIRED" ? "Mon abonnement" : "Réessayer"}</a>
  </>);
}
