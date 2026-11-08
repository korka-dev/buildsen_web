"use client";

import { useState } from "react";
import { apiCall } from "@/lib/client";
import { fcfa } from "@/lib/constants";

export type PlanStatus = {
  plan: "FREE" | "PRO" | "PREMIUM"; limit: number | null; used: number; reached: boolean; plansActive: boolean; paymentsOpen: boolean; sandbox: boolean; provider: string; yearDiscount: number; methods: { id: "wave" | "om"; name: string }[];
  until: string | null; pending: boolean; options: { plan: "PRO" | "PREMIUM"; name: string; price: number; contacts: number | null }[];
};
const ORDER = { FREE: 0, PRO: 1, PREMIUM: 2 };

// Contacts du mois et choix d'une formule : le paiement se fait chez le fournisseur (Wave, Orange Money), la formule s'active à sa confirmation.
export function PlanPicker({ status }: { status: PlanStatus }) {
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const pct = status.limit ? Math.min(100, Math.round((status.used / status.limit) * 100)) : 0;

  async function buy(plan: string) {
    setBusy(plan);
    setErr("");
    const r = await apiCall("/api/pro/checkout", { body: { plan, months } });
    if (!r.ok) {
      setBusy("");
      return setErr(r.error);
    }
    window.location.assign(String(r.data.url));
  }

  return (
    <div className="card stack" style={{ gap: 16 }}>
      <div className="stack" style={{ gap: 6 }}>
        <b>Contacts ce mois-ci</b>
        {status.limit === null ? (
          <span className="muted small">Illimités avec votre formule.</span>
        ) : (
          <>
            <div role="progressbar" aria-valuenow={status.used} aria-valuemax={status.limit} aria-label="Contacts utilisés" style={{ height: 10, borderRadius: 99, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: status.reached ? "var(--danger, #c0392b)" : "var(--g1)" }} />
            </div>
            <span className={status.reached ? "err-t" : "muted small"}>{status.used} sur {status.limit} utilisés{status.reached ? " : limite atteinte, passez à une formule supérieure pour continuer." : "."}</span>
          </>
        )}
      </div>
      {status.pending && <div className="note small">Un paiement est en attente. S&apos;il est réglé, votre formule s&apos;activera dans un instant : rechargez la page.</div>}
      {!status.paymentsOpen ? (
        <div className="note small">Le paiement en ligne ouvre bientôt. En attendant, contactez-nous pour changer de formule.</div>
      ) : (
        <>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }} role="group" aria-label="Durée">
            {[1, 3].map((m) => <button key={m} type="button" className={`btn ${months === m ? "p" : "g"} sm`} aria-pressed={months === m} onClick={() => setMonths(m)}>{m} mois</button>)}
          </div>
          <div className="g3">
            {status.options.map((o) => {
              const current = status.plan === o.plan;
              const lower = ORDER[o.plan] < ORDER[status.plan];
              return (
                <div key={o.plan} className="card stack" style={{ gap: 6 }}>
                  <b>{o.name}</b>
                  <span className="num" style={{ fontWeight: 800, fontSize: 20 }}>{fcfa(o.price * months)}</span>
                  <span className="muted small">{o.contacts ? `${o.contacts} contacts par mois` : "Contacts illimités"} · {months} mois</span>
                  <button type="button" className="btn p sm" disabled={!!busy || lower} onClick={() => buy(o.plan)}>
                    {busy === o.plan ? "Ouverture…" : current ? "Renouveler" : lower ? "Formule déjà supérieure" : `Passer à ${o.name}`}
                  </button>
                </div>
              );
            })}
          </div>
          {status.sandbox && <p className="muted small">Mode test : le paiement est simulé, aucun argent n&apos;est débité.</p>}
        </>
      )}
      {err && <p className="err-t" role="alert">{err}</p>}
    </div>
  );
}
