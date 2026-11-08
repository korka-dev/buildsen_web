"use client";

import { useApiForm, type ApiState as AdminState } from "@/lib/client";
import { ADMIN_ROLES } from "@/lib/constants";

function Msg({ s }: { s: AdminState }) {
  if (s?.error) return <p className="err-t" role="alert">{s.error}</p>;
  if (s?.ok) return <div className="note ok" role="status">{s.ok}{s.link && <code className="secret" style={{ marginTop: 8 }}>{s.link}</code>}</div>;
  return null;
}

export function AdminLoginForm() {
  const [s, onSubmit, pending] = useApiForm("/api/admin/login", { hard: true });
  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="f">E-mail<input className="inp" name="email" type="email" required autoComplete="username" /></label>
      <label className="f">Mot de passe<input className="inp" name="password" type="password" required autoComplete="current-password" /></label>
      <label className="f">Code de double authentification<span className="h">6 chiffres affichés par votre application d&apos;authentification</span>
        <input className="inp num" name="code" inputMode="numeric" maxLength={7} required autoComplete="one-time-code" /></label>
      <Msg s={s} />
      <button className="btn d" disabled={pending}>Se connecter</button>
    </form>
  );
}

export function ActivateForm({ token }: { token: string }) {
  const [s, onSubmit, pending] = useApiForm("/api/admin/activate", { hard: true });
  return (
    <form onSubmit={onSubmit} className="stack">
      <input type="hidden" name="token" value={token} />
      <label className="f">Choisissez votre mot de passe<span className="h">12 caractères minimum. Personne d&apos;autre ne le connaîtra.</span>
        <input className="inp" name="password" type="password" required minLength={12} autoComplete="new-password" /></label>
      <label className="f">Confirmez le mot de passe<input className="inp" name="password2" type="password" required minLength={12} autoComplete="new-password" /></label>
      <label className="f">Code affiché par l&apos;application<input className="inp num" name="code" inputMode="numeric" maxLength={7} required autoComplete="one-time-code" /></label>
      <Msg s={s} />
      <button className="btn d" disabled={pending}>Activer mon accès</button>
    </form>
  );
}

export function DecisionForm({ proId }: { proId: string }) {
  const [s, onSubmit, pending] = useApiForm(`/api/admin/dossiers/${proId}/decide`);
  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="f">Motif<span className="h">Obligatoire pour un complément ou un refus. Transmis au professionnel.</span>
        <textarea className="inp" name="reason" maxLength={600} style={{ minHeight: 90 }} /></label>
      <Msg s={s} />
      <button className="btn p" name="decision" value="VERIFIED" disabled={pending}>Accepter le dossier</button>
      <button className="btn o" name="decision" value="MORE" disabled={pending}>Demander un complément</button>
      <button className="btn x" name="decision" value="REFUSED" disabled={pending}>Refuser</button>
    </form>
  );
}

export function PlanForm({ userId, current }: { userId: string; current: string }) {
  const [s, onSubmit, pending] = useApiForm(`/api/admin/users/${userId}/plan`);
  return (
    <form onSubmit={onSubmit} className="row" style={{ gap: 6 }}>
      <select className="inp" name="plan" defaultValue={current} style={{ width: 120, minHeight: 34, padding: "6px 8px" }} aria-label="Formule">
        <option value="FREE">Gratuit</option><option value="PRO">Pro</option><option value="PREMIUM">Premium</option>
      </select>
      <input className="inp num" name="months" inputMode="numeric" defaultValue="1" style={{ width: 60, minHeight: 34, padding: "6px 8px" }} aria-label="Nombre de mois" />
      <span className="small muted">mois</span>
      <button className="btn o sm" disabled={pending}>Appliquer</button>
      {(s?.error || s?.ok) && <span className={s.error ? "err-t" : "small"} style={{ width: "100%" }}>{s.error || s.ok}</span>}
    </form>
  );
}

export function InviteForm() {
  const [s, onSubmit, pending] = useApiForm("/api/admin/team/invite", { reset: true });
  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="g2" style={{ gap: 12 }}>
        <label className="f">Prénom<input className="inp" name="firstName" required /></label>
        <label className="f">Nom<input className="inp" name="lastName" required /></label>
      </div>
      <div className="g2" style={{ gap: 12 }}>
        <label className="f">E-mail<input className="inp" name="email" type="email" required /></label>
        <label className="f">Rôle<select className="inp" name="role" defaultValue="VERIF">{Object.entries(ADMIN_ROLES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
      </div>
      <Msg s={s} />
      <button className="btn p" style={{ alignSelf: "flex-start" }} disabled={pending}>Créer l&apos;invitation</button>
    </form>
  );
}

// Retrait d'une demande publiée : le motif est transmis au client
export function RemoveRequestForm({ id }: { id: string }) {
  const [s, onSubmit, pending] = useApiForm(`/api/admin/requests/${id}/remove`);
  if (s?.ok) return <Msg s={s} />;
  return (
    <details>
      <summary className="btn x sm" style={{ listStyle: "none" }}>Retirer la demande…</summary>
      <form onSubmit={onSubmit} className="stack" style={{ gap: 8, marginTop: 10 }}>
        <textarea className="inp" name="reason" required minLength={5} maxLength={600} placeholder="Motif transmis au client (ex. : coordonnées dans la description, demande hors de nos prestations, fausse demande…)" />
        <Msg s={s} />
        <button className="btn x sm" disabled={pending} style={{ alignSelf: "flex-start" }}>Confirmer le retrait</button>
      </form>
    </details>
  );
}

// Nouvelle annonce partenaire (texte et lien ; toujours affichée avec la mention « Partenaire »)
export function AdForm() {
  const [s, onSubmit, pending] = useApiForm("/api/admin/ads", { reset: true });
  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 10 }}>
      <div className="g2" style={{ gap: 10 }}>
        <label className="f">Titre<input className="inp" name="title" required maxLength={70} placeholder="Ex. : Ciment et fer à béton livrés à Dakar" /></label>
        <label className="f">Texte du bouton<span className="h">Facultatif</span><input className="inp" name="linkLabel" maxLength={30} placeholder="En savoir plus" /></label>
      </div>
      <label className="f">Texte<input className="inp" name="text" required maxLength={180} placeholder="Une ou deux phrases sur l'offre du partenaire." /></label>
      <label className="f">Lien<span className="h">Facultatif, doit commencer par https://</span><input className="inp" name="href" maxLength={300} placeholder="https://" /></label>
      <Msg s={s} />
      <button className="btn p sm" disabled={pending} style={{ alignSelf: "flex-start" }}>Publier l&apos;annonce</button>
    </form>
  );
}

// Suppression définitive d'un compte, avec confirmation saisie
export function DeleteUserForm({ userId, name }: { userId: string; name: string }) {
  const [s, onSubmit, pending] = useApiForm(`/api/admin/users/${userId}/delete`);
  if (s?.ok) return <Msg s={s} />;
  return (
    <details>
      <summary className="btn x sm" style={{ listStyle: "none" }}>Supprimer…</summary>
      <form onSubmit={onSubmit} className="stack" style={{ gap: 8, marginTop: 10, maxWidth: 360 }}>
        <span className="small">Supprimer définitivement le compte de <b>{name}</b>, ses fichiers, ses demandes et ses conversations ? Cette action est irréversible.</span>
        <input className="inp" name="confirm" placeholder="Saisissez SUPPRIMER" autoComplete="off" required />
        <Msg s={s} />
        <button className="btn x sm" disabled={pending} style={{ alignSelf: "flex-start" }}>Supprimer définitivement</button>
      </form>
    </details>
  );
}
