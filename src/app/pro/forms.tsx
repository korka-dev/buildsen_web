"use client";

import { useState } from "react";
import { useApiForm, type ApiState } from "@/lib/client";
import { COMMUNES, SPECIALTIES, STATUTS, formatPhone } from "@/lib/constants";
function Msg({ s }: { s: ApiState }) {
  if (s?.error) return <div className="note e" role="alert"><b>Pas encore enregistré :</b> {s.error}</div>;
  if (s?.ok) return <div className="note ok" role="status">{s.ok}</div>;
  return null;
}

export function DossierInfoForm({ v, locked }: {
  v: { statut: string | null; companyName: string | null; school: string | null; diploma: string | null; experienceYears: number | null };
  locked: boolean;
}) {
  const [s, onSubmit, pending] = useApiForm("/api/pro/dossier", { method: "PUT" });
  const [statut, setStatut] = useState(v.statut ?? "");
  const ent = statut === "ENT";
  return (
    <form onSubmit={onSubmit} className="stack">
      <fieldset disabled={locked} className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <b>Votre statut</b>
        <div className="g3" style={{ gap: 12 }}>
          {Object.entries(STATUTS).map(([k, st]) => (
            <label key={k} className="opt">
              <span className="row" style={{ gap: 8 }}><input type="radio" name="statut" value={k} checked={statut === k} onChange={() => setStatut(k)} /><b>{st.name}</b></span>
              <span className="small muted">{st.scope}</span>
            </label>
          ))}
        </div>
        {ent && <label className="f">Nom de l&apos;entreprise<span className="h">Tel qu&apos;il figure sur le RCCM</span><input className="inp" name="companyName" defaultValue={v.companyName ?? ""} maxLength={120} /></label>}
        {ent && <p className="small muted">Les informations ci-dessous concernent le responsable technique de l&apos;entreprise, ingénieur en génie civil.</p>}
        <div className="g2" style={{ gap: 12 }}>
          <label className="f">{ent ? "Établissement de formation du responsable technique" : "Établissement de formation"}<input className="inp" name="school" defaultValue={v.school ?? ""} placeholder="Ex. : ESP, EPT, lycée technique…" /></label>
          <label className="f">{ent ? "Années d'activité de l'entreprise" : "Années d'expérience"}<input className="inp" name="experienceYears" inputMode="numeric" defaultValue={v.experienceYears ?? ""} placeholder="Ex. : 5" /></label>
        </div>
        <label className="f">{ent ? "Diplôme d'ingénieur du responsable technique" : "Diplôme ou titre professionnel"}<span className="h">Intitulé et année</span><input className="inp" name="diploma" defaultValue={v.diploma ?? ""} /></label>
        <Msg s={s} />
        {!locked && <button className="btn p" style={{ alignSelf: "flex-start" }} disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer mes informations"}</button>}
      </fieldset>
    </form>
  );
}

export function SubmitDossier({ ready }: { ready: boolean }) {
  const [s, onSubmit, pending] = useApiForm("/api/pro/dossier/submit");
  return (
    <form onSubmit={onSubmit} className="stack">
      <Msg s={s} />
      <button className="btn p" style={{ alignSelf: "flex-start" }} disabled={pending || !ready}>Soumettre mon dossier pour vérification</button>
    </form>
  );
}

export function ProfileForm({ v, isIng }: {
  v: { bio: string | null; software: string | null; commune: string | null; whatsapp: string | null; specialties: string[]; visible: boolean };
  isIng: boolean;
}) {
  const [s, onSubmit, pending] = useApiForm("/api/pro/profile", { method: "PUT" });
  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="f">Présentation<span className="h">Ce que vous faites, pour qui, votre façon de travailler. 800 caractères maximum.</span>
        <textarea className="inp" name="bio" maxLength={800} defaultValue={v.bio ?? ""} /></label>
      <div className="g2" style={{ gap: 12 }}>
        <label className="f">Logiciels maîtrisés<input className="inp" name="software" defaultValue={v.software ?? ""} placeholder="AutoCAD, Revit, Robot…" /></label>
        <label className="f">Commune d&apos;exercice<select className="inp" name="commune" defaultValue={v.commune ?? ""}><option value="">Choisir…</option>{COMMUNES.map((c) => <option key={c}>{c}</option>)}</select></label>
      </div>
      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 8 }}>
        <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Spécialités</legend>
        <div className="g2" style={{ gap: 8 }}>
          {Object.entries(SPECIALTIES).map(([k, t]) => (
            <label key={k} className="chk"><input type="checkbox" name="specialties" value={k} defaultChecked={v.specialties.includes(k)} disabled={k === "etudes" && !isIng} />
              {t}{k === "etudes" && !isIng && <span className="small muted"> · réservé aux ingénieurs et aux entreprises</span>}</label>
          ))}
        </div>
      </fieldset>
      <label className="f">Numéro WhatsApp<span className="h">Facultatif, si différent de votre téléphone. Jamais public : utilisé quand vous continuez une conversation sur WhatsApp.</span>
        <input className="inp" name="whatsapp" inputMode="tel" defaultValue={formatPhone(v.whatsapp)} placeholder="77 123 45 67" /></label>
      <label className="chk"><input type="checkbox" name="visible" defaultChecked={v.visible} /> Afficher mon profil sur BUILDSEN, y compris pour les visiteurs (après vérification)</label>
      <Msg s={s} />
      <button className="btn p" style={{ alignSelf: "flex-start" }} disabled={pending}>Enregistrer</button>
    </form>
  );
}

// Premier message au client : ouvre la conversation (le texte reste en place si une correction est demandée)
export function StartConversation({ requestId }: { requestId: string }) {
  const [s, onSubmit, pending] = useApiForm(`/api/pro/requests/${requestId}/start`);
  const [body, setBody] = useState("");
  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 10 }}>
      <label className="f">Votre premier message<span className="h">Présentez-vous, ce que vous proposez, votre délai et un prix indicatif si possible.</span>
        <textarea className="inp" name="body" value={body} onChange={(e) => setBody(e.target.value)} required minLength={20} maxLength={2000} style={{ minHeight: 140 }}
          placeholder="Bonjour, je suis ingénieur en génie civil. Je peux réaliser…" /></label>
      <Msg s={s} />
      <button className="btn p" disabled={pending} style={{ alignSelf: "flex-start" }}>{pending ? "Envoi…" : "Envoyer et ouvrir la conversation"}</button>
    </form>
  );
}
