"use client";

import Link from "next/link";
import { useState } from "react";
import { useApiForm } from "@/lib/client";
import { FormMsg as Msg } from "@/components/FormMsg";

export function SignupForm() {
  const [s, onSubmit, pending] = useApiForm("/api/auth/signup-pro", { hard: true });
  const [kind, setKind] = useState<"IND" | "ENT">("IND");
  const ent = kind === "ENT";
  return (
    <form onSubmit={onSubmit} className="stack">
      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0, gap: 8 }}>
        <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Je m&apos;inscris</legend>
        <div className="g2" style={{ gap: 10 }}>
          <label className={`opt${!ent ? " on" : ""}`}>
            <span className="row" style={{ gap: 8 }}><input type="radio" name="kind" value="IND" checked={!ent} onChange={() => setKind("IND")} /><b>En indépendant</b></span>
            <span className="small muted">Ingénieur ou technicien supérieur</span>
          </label>
          <label className={`opt${ent ? " on" : ""}`}>
            <span className="row" style={{ gap: 8 }}><input type="radio" name="kind" value="ENT" checked={ent} onChange={() => setKind("ENT")} /><b>Pour une entreprise</b></span>
            <span className="small muted">Société du secteur, avec NINEA et RCCM</span>
          </label>
        </div>
      </fieldset>
      {ent && <label className="f">Nom de l&apos;entreprise<span className="h">Tel qu&apos;il figure sur le RCCM</span><input className="inp" name="companyName" required minLength={2} maxLength={120} autoComplete="organization" /></label>}
      <div className="g2" style={{ gap: 12 }}>
        <label className="f">{ent ? "Prénom du gérant" : "Prénom"}<input className="inp" name="firstName" required autoComplete="given-name" /></label>
        <label className="f">{ent ? "Nom du gérant" : "Nom"}<input className="inp" name="lastName" required autoComplete="family-name" /></label>
      </div>
      <label className="f">Adresse e-mail<input className="inp" name="email" type="email" required autoComplete="email" /></label>
      <label className="f">Téléphone<span className="h">Jamais public : vous choisissez à quels clients le communiquer</span>
        <input className="inp" name="phone" inputMode="tel" required placeholder="77 123 45 67" autoComplete="tel" /></label>
      <label className="f">Mot de passe<span className="h">8 caractères minimum</span>
        <input className="inp" name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label className="chk"><input type="checkbox" name="cgu" /> <span>J&apos;accepte les <Link href="/cgu" target="_blank" rel="noopener noreferrer">conditions générales</Link> et la <Link href="/confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</Link>.</span></label>
      <Msg s={s} />
      <button className="btn p" disabled={pending}>{pending ? "Création…" : "Créer mon compte pro"}</button>
    </form>
  );
}

export function ClientSignupForm() {
  const [s, onSubmit, pending] = useApiForm("/api/auth/signup-client", { hard: true });
  return (
    <form onSubmit={onSubmit} className="stack">
      <div className="g2" style={{ gap: 12 }}>
        <label className="f">Prénom<input className="inp" name="firstName" required autoComplete="given-name" /></label>
        <label className="f">Nom<input className="inp" name="lastName" required autoComplete="family-name" /></label>
      </div>
      <label className="f">Adresse e-mail<span className="h">Un lien de confirmation vous sera envoyé</span><input className="inp" name="email" type="email" required autoComplete="email" /></label>
      <label className="f">Téléphone<span className="h">Jamais public : vous choisissez avec quels professionnels le partager</span>
        <input className="inp" name="phone" inputMode="tel" required placeholder="77 123 45 67" autoComplete="tel" /></label>
      <label className="f">Mot de passe<span className="h">8 caractères minimum</span>
        <input className="inp" name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label className="chk"><input type="checkbox" name="cgu" /> <span>J&apos;accepte les <Link href="/cgu" target="_blank" rel="noopener noreferrer">conditions générales</Link> et la <Link href="/confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</Link>.</span></label>
      <Msg s={s} />
      <button className="btn p" disabled={pending}>{pending ? "Création…" : "Créer mon compte"}</button>
    </form>
  );
}

export function LoginForm() {
  const [s, onSubmit, pending] = useApiForm("/api/auth/login", { hard: true });
  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="f">Numéro de téléphone<input className="inp" name="phone" type="tel" inputMode="tel" required autoComplete="username" placeholder="77 123 45 67" /></label>
      <label className="f">Mot de passe<input className="inp" name="password" type="password" required autoComplete="current-password" /></label>
      <Link className="small" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
      <Msg s={s} />
      <button className="btn p" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}

export function ForgotForm() {
  const [s, onSubmit, pending] = useApiForm("/api/auth/forgot");
  return (
    <form onSubmit={onSubmit} className="stack">
      <label className="f">Adresse e-mail<input className="inp" name="email" type="email" required autoComplete="email" /></label>
      <Msg s={s} />
      <button className="btn p" disabled={pending}>Recevoir un lien</button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [s, onSubmit, pending] = useApiForm("/api/auth/reset", { hard: true });
  return (
    <form onSubmit={onSubmit} className="stack">
      <input type="hidden" name="token" value={token} />
      <label className="f">Nouveau mot de passe<span className="h">8 caractères minimum</span>
        <input className="inp" name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
      <Msg s={s} />
      <button className="btn p" disabled={pending}>Enregistrer</button>
    </form>
  );
}
