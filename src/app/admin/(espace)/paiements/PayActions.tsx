"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall } from "@/lib/client";
import { fcfa } from "@/lib/constants";
import { Modal } from "@/components/bs/Modal";

// Exceptions seulement : un paiement Wave qui n'a pas pu être confirmé tout seul. L'équipe confirme ou refuse.
export function PayActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  async function decide(what: "confirm" | "reject") {
    if (what === "reject" && !window.confirm("Refuser ce paiement ? La formule activée provisoirement sera retirée.")) return;
    setBusy(what);
    setErr("");
    const r = await apiCall(`/api/admin/payments/${id}/${what}`);
    setBusy("");
    if (!r.ok) return setErr(r.error);
    router.refresh();
  }
  return (
    <span className="row" style={{ gap: 6 }}>
      <button type="button" className="btn p sm" disabled={!!busy} onClick={() => decide("confirm")}>{busy === "confirm" ? "…" : "Confirmer"}</button>
      <button type="button" className="btn g sm" disabled={!!busy} onClick={() => decide("reject")}>{busy === "reject" ? "…" : "Refuser"}</button>
      {err && <span className="err-t small" role="alert">{err}</span>}
    </span>
  );
}

// Import de l'export « Transactions » de Wave Business : confirme d'un coup tous les paiements en attente qui y figurent.
export function ImportButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [provider, setProvider] = useState("wave");
  const [out, setOut] = useState<{ confirmed: { who: string; amount: number }[]; unmatched: number; ignored: number } | null>(null);
  async function onFile(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    setErr("");
    setOut(null);
    if (f.size > 2_000_000) {
      setBusy(false);
      return setErr("Fichier trop volumineux (2 Mo maximum).");
    }
    const r = await apiCall("/api/admin/payments-import", { body: { csv: await f.text(), provider } });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setOut(r.data as typeof out);
    router.refresh();
  }
  return (
    <>
      <button type="button" className="btn o" onClick={() => { setOpen(true); setOut(null); setErr(""); }}>Importer un export</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Importer un export de transactions" intro="Wave Business ou Orange Money : téléchargez la liste des transactions. Les paiements en attente retrouvés dans le fichier sont confirmés d'un coup.">
        <div className="stack" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 8 }} role="group" aria-label="Moyen de paiement du fichier">
            {[["wave", "Wave"], ["om", "Orange Money"]].map(([id, name]) => <button key={id} type="button" className={`btn ${provider === id ? "p" : "g"} sm`} aria-pressed={provider === id} onClick={() => setProvider(id)}>{name}</button>)}
          </div>
          <input type="file" accept=".csv,text/csv,text/plain" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} aria-label="Fichier CSV de Wave" />
          {busy && <p className="muted">Analyse en cours…</p>}
          {err && <p className="err-t" role="alert">{err}</p>}
          {out && (
            <div className="note">
              <b>{out.confirmed.length} paiement{out.confirmed.length > 1 ? "s" : ""} confirmé{out.confirmed.length > 1 ? "s" : ""}</b>
              {out.confirmed.length > 0 && <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{out.confirmed.map((c, i) => <li key={i}>{c.who} · {fcfa(c.amount)}</li>)}</ul>}
              <p className="small muted" style={{ margin: "6px 0 0" }}>{out.unmatched} ligne{out.unmatched > 1 ? "s" : ""} sans paiement correspondant · {out.ignored} ignorée{out.ignored > 1 ? "s" : ""} (sorties, lignes vides).</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

// Les prix mensuels des formules : modifiables ici, ils s'appliquent aux prochains paiements (site et WhatsApp).
export function PricingButton({ prices }: { prices: Record<string, number> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ PRO: String(prices.PRO), PREMIUM: String(prices.PREMIUM) });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sure, setSure] = useState(false);
  async function save() {
    setBusy(true);
    setErr("");
    const r = await apiCall("/api/admin/pricing", { body: { prices: { PRO: Number(v.PRO), PREMIUM: Number(v.PREMIUM) } } });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setOpen(false);
    setSure(false);
    router.refresh();
  }
  const changed = Number(v.PRO) !== prices.PRO || Number(v.PREMIUM) !== prices.PREMIUM;
  return (
    <>
      <button type="button" className="btn o" onClick={() => setOpen(true)}>Modifier les tarifs</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Tarifs mensuels" intro="S'applique aux prochains paiements. Les paiements déjà créés gardent leur montant.">
        <div className="stack" style={{ gap: 12 }}>
          {(["PRO", "PREMIUM"] as const).map((k) => (
            <label key={k} className="stack" style={{ gap: 4 }}>
              <span>{k === "PRO" ? "Pro" : "Premium"} (FCFA par mois)</span>
              <input className="inp" inputMode="numeric" value={v[k]} onChange={(e) => { setSure(false); setV({ ...v, [k]: e.target.value.replace(/\D/g, "") }); }} />
            </label>
          ))}
          {sure && changed && <div className="note small">Nouveaux tarifs : Pro {fcfa(Number(v.PRO))} · Premium {fcfa(Number(v.PREMIUM))}. Confirmez pour les appliquer.</div>}
          {err && <p className="err-t" role="alert">{err}</p>}
          <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn g" onClick={() => setOpen(false)}>Annuler</button>
            {sure ? (
              <button type="button" className="btn p" onClick={save} disabled={busy || !changed}>{busy ? "Enregistrement…" : "Confirmer"}</button>
            ) : (
              <button type="button" className="btn p" onClick={() => setSure(true)} disabled={!changed}>Enregistrer</button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
