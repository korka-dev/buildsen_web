"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/lib/client";
import { fcfa } from "@/lib/constants";
import { Modal } from "@/components/bs/Modal";
import type { PlanStatus } from "./PlanPicker";

type Step = "plan" | "confirm" | "claim" | "wait" | "paid";

// Logos officiels des moyens de paiement : fichiers /public/logos/wave.png (rond) et om.png (rectangulaire, texte compris)
function MethodLogo({ id }: { id: string }) {
  const om = id === "om";
  // eslint-disable-next-line @next/next/no-img-element -- petits logos statiques
  return <img src={`/logos/${om ? "om" : "wave"}.png`} alt="" width={om ? 72 : 40} height={40} style={{ borderRadius: om ? 6 : 10, flex: "none", objectFit: "contain" }} />;
}

// Abonnement en étapes : formule → moyen de paiement → confirmation → (après avoir ouvert le paiement) numéro et identifiant de transaction.
export function RenewButton({ status }: { status: PlanStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("plan");
  const [plan, setPlan] = useState<"PRO" | "PREMIUM">(status.plan === "PREMIUM" ? "PREMIUM" : "PRO");
  const [months, setMonths] = useState(1);
  const [method, setMethod] = useState<string>(status.methods[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ref, setRef] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [txRef, setTxRef] = useState("");
  const links = status.methods.length > 0;
  const opt = status.options.find((o) => o.plan === plan);
  const disc = months === 12 ? status.yearDiscount : 0;
  const full = (opt?.price ?? 0) * months;
  const total = Math.floor((full * (100 - disc)) / 100); // même calcul que le serveur
  const label = (m: number) => (m === 12 ? "1 an" : `${m} mois`);
  const mname = status.methods.find((m) => m.id === method)?.name ?? "";

  // Après « J'ai payé » : on attend la confirmation du paiement
  useEffect(() => {
    if (!open || step !== "wait" || !ref) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    async function poll() {
      tries += 1;
      const r = await fetch(`/api/payments/${encodeURIComponent(ref)}`).catch(() => null);
      if (stop) return;
      const d = r?.ok ? await r.json() : null;
      if (d?.state === "PAID") {
        setStep("paid");
        router.refresh();
        return;
      }
      if (tries < 100) timer = setTimeout(poll, 3000);
    }
    void poll();
    return () => { stop = true; clearTimeout(timer); };
  }, [open, step, ref, router]);

  if (!status.paymentsOpen) return <span className="muted small">Paiement bientôt disponible</span>;

  function start() {
    setStep("plan");
    setErr("");
    setRef("");
    setOpen(true);
  }
  function close() {
    if (busy) return;
    setOpen(false);
    if (step === "wait" || step === "paid") router.refresh();
  }

  async function pay() {
    setBusy(true);
    setErr("");
    // L'onglet est ouvert tout de suite (avant l'appel au serveur) pour ne pas être bloqué par le navigateur
    const tab = links ? window.open("", "_blank") : null;
    const r = await apiCall("/api/pro/checkout", { body: { plan, months, ...(links ? { method } : {}) } });
    setBusy(false);
    if (!r.ok) {
      tab?.close();
      return setErr(r.error);
    }
    if (!links) return window.location.assign(String(r.data.url));
    setRef(String(r.data.ref));
    setUrl(String(r.data.url));
    if (tab) {
      tab.opener = null; // l'onglet de paiement ne doit pas pouvoir piloter cette page
      tab.location.href = String(r.data.url);
    }
    setStep("claim");
  }

  async function claim() {
    setBusy(true);
    setErr("");
    const r = await fetch(`/api/payments/${encodeURIComponent(ref)}/claim`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, reference: txRef }),
    }).catch(() => null);
    setBusy(false);
    if (!r?.ok) return setErr(r?.status === 400 ? `Vérifiez le numéro (9 chiffres) et l'identifiant de transaction (lettres et chiffres, ex. T_ABC123XYZ).` : "Impossible pour l'instant. Réessayez.");
    setStep("wait");
  }

  const n = step === "confirm" ? 2 : 1;
  const titles: Record<Step, string> = {
    plan: "Choisissez votre formule", confirm: "Confirmez votre abonnement",
    claim: `Paiement ${mname}`, wait: "Vérification du paiement", paid: "Paiement reçu",
  };
  const choice = (on: boolean) => ({ textAlign: "left" as const, border: `2px solid ${on ? "var(--g1, #1f7a3d)" : "var(--line, #e3e3e3)"}`, background: on ? "var(--g-soft, #eef8f1)" : "#fff", borderRadius: 14, padding: 14, cursor: "pointer", font: "inherit", color: "inherit" });

  return (
    <>
      <button type="button" className="btn p" onClick={start}>{status.plan === "FREE" ? "Passer à Pro" : "Renouveler"}</button>
      <Modal open={open} onClose={close} title={titles[step]} intro={step === "plan" || step === "confirm" ? `Étape ${n} sur 2` : undefined}>
        <div className="stack" style={{ gap: 14 }}>
          {step === "plan" && (
            <>
              <div className="g2" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }} role="group" aria-label="Formule">
                {status.options.map((o) => (
                  <button key={o.plan} type="button" style={choice(plan === o.plan)} aria-pressed={plan === o.plan} onClick={() => setPlan(o.plan)}>
                    <b style={{ fontSize: 17 }}>{o.name}</b>
                    <div className="num" style={{ fontWeight: 800, fontSize: 20 }}>{fcfa(o.price)}<span className="muted small" style={{ fontWeight: 400 }}> / mois</span></div>
                    <div className="muted small">{o.contacts ? `${o.contacts} contacts par mois` : "Contacts illimités"}</div>
                  </button>
                ))}
              </div>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }} role="group" aria-label="Durée">
                {[1, 3, 12].map((m) => (
                  <button key={m} type="button" className={`btn ${months === m ? "p" : "g"} sm`} aria-pressed={months === m} onClick={() => setMonths(m)}>
                    {label(m)}{m === 12 ? ` · -${status.yearDiscount} %` : ""}
                  </button>
                ))}
              </div>
              {links && (
                <div className="stack" style={{ gap: 8 }}>
                  <b className="small">Payer avec</b>
                  <div className="stack" style={{ gap: 8 }} role="group" aria-label="Moyen de paiement">
                    {status.methods.map((m) => (
                      <button key={m.id} type="button" style={{ ...choice(method === m.id), display: "flex", alignItems: "center", gap: 14, padding: 10 }} aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>
                        <MethodLogo id={m.id} />
                        <b style={{ fontSize: 16 }}>{m.name}</b>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span>
                  <span className="muted small">Total </span><b className="num" style={{ fontSize: 22 }}>{fcfa(total)}</b>
                  {disc > 0 && <div className="small" style={{ color: "var(--g1, #1f7a3d)" }}>Vous économisez {fcfa(full - total)}</div>}
                </span>
                <button type="button" className="btn p" onClick={() => setStep("confirm")} disabled={!opt || (links && !method)}>Continuer</button>
              </div>
            </>
          )}

          {step === "confirm" && (
            <>
              <div className="bs-panel stack" style={{ padding: 14, gap: 8 }}>
                <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Formule</span><b>{opt?.name}</b></div>
                <div className="row" style={{ justifyContent: "space-between" }}><span className="muted">Durée</span><b>{label(months)}{disc > 0 ? ` (-${disc} %)` : ""}</b></div>
                {links && <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}><span className="muted">Paiement</span><span className="row" style={{ gap: 8, alignItems: "center" }}><MethodLogo id={method} /><b>{mname}</b></span></div>}
                <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}><span className="muted">Total</span><b className="num" style={{ fontSize: 26 }}>{fcfa(total)}</b></div>
              </div>
              {err && <p className="err-t" role="alert">{err}</p>}
              <div className="row" style={{ gap: 8, justifyContent: "space-between" }}>
                <button type="button" className="btn g" onClick={() => setStep("plan")} disabled={busy}>Retour</button>
                <button type="button" className="btn p" onClick={pay} disabled={busy || !opt}>{busy ? "Ouverture…" : links ? `Payer avec ${mname}` : "Confirmer et payer"}</button>
              </div>
              {status.sandbox && <p className="muted small">Mode test : le paiement est simulé, aucun argent n&apos;est débité.</p>}
            </>
          )}

          {step === "claim" && (
            <>
              <p style={{ margin: 0 }}>
                {mname} s&apos;est ouvert dans un nouvel onglet. {method === "om" ? <>Saisissez exactement <b>{fcfa(total)}</b> (Orange Money ne remplit pas le montant).</> : <>Le montant (<b>{fcfa(total)}</b>) est déjà rempli.</>} Une fois le paiement fait, revenez ici :
              </p>
              <a className="btn o sm" href={url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: "flex-start" }}>Rouvrir {mname}</a>
              <label className="stack" style={{ gap: 4 }}>
                <span className="small">Numéro {mname} utilisé pour payer</span>
                <input className="inp" inputMode="tel" autoComplete="tel" placeholder="77 123 45 67" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              <label className="stack" style={{ gap: 4 }}>
                <span className="small">Identifiant de la transaction (sur votre reçu, facultatif mais accélère la confirmation)</span>
                <input className="inp" autoComplete="off" placeholder="T_ABC123XYZ" value={txRef} onChange={(e) => setTxRef(e.target.value)} />
              </label>
              {err && <p className="err-t" role="alert">{err}</p>}
              <button type="button" className="btn p" onClick={claim} disabled={busy || !phone.trim()}>{busy ? "Un instant…" : "J'ai payé"}</button>
              <p className="muted small" style={{ margin: 0 }}>Votre formule s&apos;active quand le paiement est réellement reçu : cliquer sans avoir payé ne change rien.</p>
            </>
          )}

          {step === "wait" && (
            <>
              <p style={{ margin: 0 }}>Nous attendons la réception de votre paiement de <b>{fcfa(total)}</b>. Votre formule <b>{opt?.name}</b> s&apos;active dès qu&apos;il est reçu, en général en quelques minutes. Vous pouvez fermer cette fenêtre : vous serez prévenu par e-mail et sur WhatsApp.</p>
              <button type="button" className="btn o" onClick={close}>Fermer</button>
            </>
          )}

          {step === "paid" && (
            <>
              <p style={{ margin: 0 }}>Votre formule <b>{opt?.name}</b> est active. Merci !</p>
              <button type="button" className="btn p" onClick={close}>Terminer</button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
