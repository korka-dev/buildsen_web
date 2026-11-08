"use client";

import { useEffect, useState } from "react";
import { Simulator } from "./Simulator";

type Scenario = { id: string; title: string; text: string; icon: string };
type Forced = { phone: string; n: number };

const SCENARIOS: Scenario[] = [
  { id: "nouveau-client", icon: "👋", title: "Un nouveau client arrive", text: "Compte créé par l'assistant, 6 questions (écrit ou voix), publication, alerte au professionnel." },
  { id: "limite", icon: "🚧", title: "Un professionnel gratuit atteint sa limite", text: "3 contacts déjà utilisés, une 4e demande l'attend : refus, choix d'une formule, lien de paiement test." },
  { id: "alertes-48h", icon: "⏱️", title: "Avancer de 48 heures", text: "Les professionnels en formule Gratuite reçoivent enfin les alertes retardées." },
  { id: "expirer", icon: "📆", title: "Faire expirer la formule Pro", text: "Fatou Sarr repasse en Gratuit : limites et alertes retardées s'appliquent." },
  { id: "demo-admin", icon: "🗂️", title: "Remplir l'administration", text: "Ajoute des dossiers à tous les stades, des demandes, signalements, paiements et annonces pour parcourir l'espace admin." },
  { id: "depart", icon: "♻️", title: "Tout remettre à zéro", text: "Efface demandes, conversations, paiements et messages ; formules d'origine." },
];
const ACCOUNTS = [
  { phone: "771000001", label: "Awa Diop · particulier" },
  { phone: "771000003", label: "Fatou Sarr · professionnelle (Pro)" },
  { phone: "771000004", label: "Fall BTP · entreprise (Gratuit)" },
];

async function post(path: string, body: unknown) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d as { error?: string }).error ?? `Erreur ${r.status}`);
  return d as Record<string, string | null>;
}

// Parcours guidés : un clic prépare la situation, puis on joue soi-même sur les deux téléphones et sur le site.
export function Playground() {
  const [client, setClient] = useState<Forced | undefined>();
  const [pro, setPro] = useState<Forced | undefined>();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [site, setSite] = useState("");
  const [serial, setSerial] = useState(0);

  useEffect(() => {
    setNote("Choisissez un parcours ci-dessus, ou écrivez « Bonjour » sur le téléphone de gauche pour commencer librement.");
  }, []);

  async function play(id: string) {
    setBusy(id);
    setError("");
    try {
      const d = await post("/api/wa/sim/scenario", { name: id });
      const n = serial + 1;
      setSerial(n);
      if (d.client) setClient({ phone: d.client, n });
      if (d.pro) setPro({ phone: d.pro, n });
      setNote(String(d.next ?? ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy("");
    }
  }

  async function open(phone: string) {
    setError("");
    try {
      const d = await post("/api/wa/sim/login", { phone });
      setSite(`Connecté en tant que ${d.name}. Le site s'ouvre dans un nouvel onglet.`);
      window.open(String(d.redirect), "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <>
      <section className="sm-play" aria-label="Parcours à essayer">
        <h2>Parcours à essayer</h2>
        <div className="sm-cards">
          {SCENARIOS.map((s) => (
            <button key={s.id} type="button" className="sm-card" disabled={!!busy} onClick={() => play(s.id)}>
              <span aria-hidden>{s.icon}</span>
              <b>{busy === s.id ? "Préparation…" : s.title}</b>
              <small>{s.text}</small>
            </button>
          ))}
        </div>
        <div className="sm-site">
          <b>Voir le site comme…</b>
          {ACCOUNTS.map((a) => <button key={a.phone} type="button" onClick={() => open(a.phone)}>{a.label}</button>)}
          {site ? <small>{site}</small> : <small>Connexion en un clic, sans mot de passe (comptes de test seulement).</small>}
        </div>
        {note ? <div className="sm-next" role="status"><b>À vous de jouer.</b> {note}</div> : null}
        {error ? <p className="err-t" role="alert">{error}</p> : null}
      </section>
      <div className="sm-phones">
        <Simulator title="Client" initialPhone="771000099" forced={client} />
        <Simulator title="Professionnel" initialPhone="771000003" forced={pro} />
      </div>
    </>
  );
}
