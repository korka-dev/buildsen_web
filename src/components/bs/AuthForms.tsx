"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { apiCall, formJson, useApiForm } from "@/lib/client";
import { DOC_TYPES, STATUTS } from "@/lib/constants";
import { DOC_ACCEPT, fileProblem, uploadFile } from "@/lib/upload";
import { FormMsg } from "@/components/FormMsg";
import { BsIcon, type BsIconName } from "./icons";
import { useWaInfo } from "./useWaInfo";

export type AuthMode = "login" | "signup" | "forgot";
export type Profil = "particulier" | "pro";

// 8 caractères minimum (même contrôle côté API pour les particuliers et les pros)
const MIN_PASSWORD = 8;

/** Titre et sous-titre de chaque vue (modal et pages /connexion, /inscription). */
export const AUTH_TITLES: Record<AuthMode, [string, string]> = {
  login: ["Connexion", "Entrez votre numéro de téléphone et votre mot de passe."],
  signup: ["Créer un compte", "Gratuit, en moins d'une minute."],
  forgot: ["Mot de passe oublié", "Indiquez votre adresse e-mail. Nous vous enverrons un lien pour choisir un nouveau mot de passe."],
};

/**
 * Connexion et création de compte (particulier ou professionnel), dans le même affichage,
 * avec un lien de bascule en bas. Envoi aux routes existantes de l'API v2.
 */
export function AuthForms({
  mode,
  onModeChange,
  profil,
  onProfilChange,
}: {
  mode: AuthMode;
  onModeChange: (m: AuthMode) => void;
  profil: Profil;
  onProfilChange: (p: Profil) => void;
}) {
  return (
    <div className="bs-auth">
      {mode === "login" ? (
        <LoginView onForgot={() => onModeChange("forgot")} />
      ) : mode === "forgot" ? (
        <ForgotView />
      ) : (
        <SignupView profil={profil} onProfilChange={onProfilChange} />
      )}
      <p className="bs-switch">
        {mode === "login" ? "Pas encore de compte ? " : mode === "signup" ? "Déjà un compte ? " : null}
        <button type="button" onClick={() => onModeChange(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Créer un compte" : mode === "signup" ? "Se connecter" : "Retour à la connexion"}
        </button>
      </p>
    </div>
  );
}

function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="bs-field">
      <span className="bs-lbl">
        {label}
        {optional ? <small> (facultatif)</small> : null}
      </span>
      {children}
      {hint ? <span className="bs-hint">{hint}</span> : null}
    </label>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="bs-pwd">
      <input {...props} className="bs-input" type={visible ? "text" : "password"} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        <BsIcon name={visible ? "eyeOff" : "eye"} size={20} />
      </button>
    </span>
  );
}

function LoginView({ onForgot }: { onForgot: () => void }) {
  const [s, onSubmit, pending] = useApiForm("/api/auth/login", { hard: true });
  const wa = useWaInfo();
  const [viaCode, setViaCode] = useState(false);
  if (viaCode) return <CodeLogin onBack={() => setViaCode(false)} />;
  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <Field label="Numéro de téléphone">
        <input className="bs-input" name="phone" type="tel" inputMode="tel" required autoComplete="username" placeholder="Entrez votre numéro (ex. 77 123 45 67)" />
      </Field>
      <Field label="Mot de passe">
        <PasswordInput name="password" required autoComplete="current-password" placeholder="Entrez votre mot de passe" />
      </Field>
      <button type="button" className="bs-forgot" onClick={onForgot}>Mot de passe oublié ?</button>
      <FormMsg s={s} />
      <button className="btn p bs-submit" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      {wa?.enabled ? (
        <button type="button" className="bs-wa-alt" onClick={() => setViaCode(true)}>
          <BsIcon name="chat" size={18} /> Recevoir un code sur WhatsApp
        </button>
      ) : null}
    </form>
  );
}

/** Connexion sans mot de passe : un code à 6 chiffres arrive sur le WhatsApp du compte. */
function CodeLogin({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ error?: string; ok?: string }>({});
  const [busy, setBusy] = useState(false);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg({});
    const r = await apiCall("/api/auth/code/request", { body: { phone } });
    setBusy(false);
    if (!r.ok) return setMsg({ error: r.error });
    setMsg({ ok: String(r.data.ok ?? "") });
    setStep("code");
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg({});
    const r = await apiCall("/api/auth/code/login", { body: { phone, code } });
    if (!r.ok) {
      setBusy(false);
      return setMsg({ error: r.error });
    }
    window.location.assign(String(r.data.redirect ?? "/accueil"));
  }

  return step === "phone" ? (
    <form onSubmit={requestCode}>
      <Field label="Numéro de téléphone" hint="Nous envoyons un code à 6 chiffres sur le WhatsApp de ce numéro.">
        <input className="bs-input" type="tel" inputMode="tel" required autoComplete="username" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Entrez votre numéro (ex. 77 123 45 67)" />
      </Field>
      {msg.error ? <p className="err-t" role="alert">{msg.error}</p> : null}
      <button className="btn p bs-submit" disabled={busy}>{busy ? "Envoi…" : "Recevoir le code"}</button>
      <button type="button" className="bs-wa-alt" onClick={onBack}>Utiliser mon mot de passe</button>
    </form>
  ) : (
    <form onSubmit={login}>
      {msg.ok ? <div className="note ok" role="status">{msg.ok}</div> : null}
      <Field label="Code reçu sur WhatsApp">
        <input className="bs-input bs-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
      </Field>
      {msg.error ? <p className="err-t" role="alert">{msg.error}</p> : null}
      <button className="btn p bs-submit" disabled={busy || code.length !== 6}>{busy ? "Connexion…" : "Se connecter"}</button>
      <button type="button" className="bs-wa-alt" onClick={() => { setStep("phone"); setCode(""); setMsg({}); }}>Renvoyer un code</button>
    </form>
  );
}

/** Mot de passe oublié : envoie un lien de réinitialisation (route existante de v2). */
function ForgotView() {
  const [s, onSubmit, pending] = useApiForm("/api/auth/forgot");
  return (
    <form onSubmit={onSubmit}>
      <Field label="Adresse e-mail">
        <input className="bs-input" name="email" type="email" required autoComplete="email" placeholder="Entrez votre adresse e-mail" autoFocus />
      </Field>
      <FormMsg s={s} />
      <button className="btn p bs-submit" disabled={pending}>{pending ? "Envoi…" : "Recevoir un lien"}</button>
    </form>
  );
}

/** Nom, e-mail, téléphone, mot de passe et confirmation (communs aux deux profils). */
function IdentityFields({ ent = false }: { ent?: boolean }) {
  return (
    <div className="bs-grid2">
      <Field label={ent ? "Prénom du gérant" : "Prénom"}>
        <input className="bs-input" name="firstName" required autoComplete="given-name" placeholder="Entrez votre prénom" />
      </Field>
      <Field label={ent ? "Nom du gérant" : "Nom"}>
        <input className="bs-input" name="lastName" required autoComplete="family-name" placeholder="Entrez votre nom" />
      </Field>
      <Field label="Adresse e-mail">
        <input className="bs-input" name="email" type="email" required autoComplete="email" placeholder="Entrez votre adresse e-mail" />
      </Field>
      <Field label="Téléphone">
        <input className="bs-input" name="phone" inputMode="tel" required autoComplete="tel" placeholder="Entrez votre numéro (ex. 77 123 45 67)" />
      </Field>
      <Field label="Mot de passe">
        <PasswordInput name="password" required minLength={MIN_PASSWORD} autoComplete="new-password" placeholder="Entrez votre mot de passe" />
      </Field>
      <Field label="Confirmer le mot de passe">
        {/* Sans attribut name : sert uniquement à la vérification, n'est pas envoyé */}
        <PasswordInput data-confirm="true" required autoComplete="new-password" placeholder="Confirmez votre mot de passe" />
      </Field>
    </div>
  );
}

function Terms() {
  return (
    <label className="chk">
      <input type="checkbox" name="cgu" />
      <span>
        J&apos;accepte les <Link href="/cgu" target="_blank" rel="noopener noreferrer">conditions générales</Link> et la{" "}
        <Link href="/confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</Link>.
      </span>
    </label>
  );
}

/** Vérifie la confirmation du mot de passe avant l'envoi à l'API. */
function withConfirm(submit: (e: FormEvent<HTMLFormElement>) => void, setError: (m: string | null) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const pwd = (form.elements.namedItem("password") as HTMLInputElement | null)?.value ?? "";
    const confirm = (form.querySelector('[data-confirm="true"]') as HTMLInputElement | null)?.value ?? "";
    if (pwd !== confirm) {
      e.preventDefault();
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError(null);
    submit(e);
  };
}

type Kind = "IND" | "ENT";

const KINDS: { value: Kind; icon: BsIconName; label: string; hint: string }[] = [
  { value: "IND", icon: "user", label: "En indépendant", hint: "Ingénieur ou technicien, à votre compte" },
  { value: "ENT", icon: "building", label: "Pour une entreprise", hint: "Société du BTP avec NINEA et RCCM" },
];

function SignupView({ profil, onProfilChange }: { profil: Profil; onProfilChange: (p: Profil) => void }) {
  const uid = useId();
  // Statut du pro, choisi dans un second modal ; null tant qu'il n'a pas été choisi
  const [kind, setKind] = useState<Kind | null>(null);
  const [choosing, setChoosing] = useState(profil === "pro");

  const pick = (p: Profil) => {
    if (p === "pro") setChoosing(true);
    else onProfilChange("particulier");
  };

  return (
    <>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="bs-lbl" style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Vous êtes…</legend>
        <div className="bs-roles">
          {(
            [
              { value: "particulier", icon: "user", label: "Un particulier", hint: "J'ai un projet de construction" },
              { value: "pro", icon: "briefcase", label: "Un professionnel", hint: "Ingénieur, technicien ou entreprise" },
            ] as const
          ).map((r) => (
            <label key={r.value} className="bs-role">
              <input
                type="radio"
                name={`${uid}-profil`}
                value={r.value}
                checked={profil === r.value && (r.value === "particulier" || kind !== null)}
                onChange={() => pick(r.value)}
                onClick={() => r.value === "pro" && profil === "pro" && setChoosing(true)}
              />
              <BsIcon name={r.icon} size={24} />
              <b>{r.label}</b>
              <small>{r.hint}</small>
            </label>
          ))}
        </div>
      </fieldset>
      {profil === "pro" && kind ? (
        <ProSignup kind={kind} onChangeKind={() => setChoosing(true)} />
      ) : (
        <ClientSignup />
      )}
      <KindDialog
        open={choosing}
        current={kind}
        onChoose={(k) => {
          setKind(k);
          onProfilChange("pro");
          setChoosing(false);
        }}
        onCancel={() => {
          setChoosing(false);
          // Fermé sans choisir : on reste sur le formulaire particulier
          if (!kind) onProfilChange("particulier");
        }}
      />
    </>
  );
}

/** Second modal, par-dessus le premier : « En indépendant » ou « Pour une entreprise ». */
function KindDialog({
  open,
  current,
  onChoose,
  onCancel,
}: {
  open: boolean;
  current: Kind | null;
  onChoose: (k: Kind) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="bs-modal bs-kind-dlg"
      aria-labelledby="bs-kind-title"
      // Échap : on prévient le parent au lieu de laisser le navigateur fermer seul
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }}
      onClose={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === ref.current) onCancel();
      }}
    >
      <div className="bs-modal-h">
        <div>
          <h2 id="bs-kind-title">Vous exercez…</h2>
          <p>Les informations demandées dépendent de votre choix.</p>
        </div>
        <button type="button" className="bs-close" onClick={onCancel} aria-label="Fermer">
          <BsIcon name="close" size={20} />
        </button>
      </div>
      <div className="bs-modal-b">
        <div className="bs-roles">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              className={`bs-role${current === k.value ? " bs-on" : ""}`}
              onClick={() => onChoose(k.value)}
            >
              <BsIcon name={k.icon} size={24} />
              <b>{k.label}</b>
              <small>{k.hint}</small>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}

function ClientSignup() {
  const [s, onSubmit, pending] = useApiForm("/api/auth/signup-client", { hard: true });
  const [error, setError] = useState<string | null>(null);
  return (
    <form onSubmit={withConfirm(onSubmit, setError)}>
      <IdentityFields />
      <Terms />
      {error ? <p className="err-t" role="alert">{error}</p> : <FormMsg s={s} />}
      <button className="btn p bs-submit" disabled={pending}>{pending ? "Création…" : "Créer mon compte"}</button>
    </form>
  );
}

// Justificatifs demandés à l'inscription, selon le statut (mêmes listes que l'API, rules.STATUTS)
function docsForKind(kind: Kind): { type: string; required: boolean }[] {
  const statut = kind === "ENT" ? STATUTS.ENT : STATUTS.TECH;
  return [
    ...statut.docs.map((type) => ({ type, required: true })),
    ...statut.optional.map((type) => ({ type, required: false })),
  ];
}

/** Choix des fichiers (envoyés après la création du compte). */
function DocsPicker({
  docs,
  files,
  onChange,
}: {
  docs: { type: string; required: boolean }[];
  files: Record<string, File | undefined>;
  onChange: (type: string, file: File | undefined) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  return (
    <ul className="bs-docs">
      {docs.map(({ type, required }) => {
        const file = files[type];
        const inputId = `bs-doc-${type}`;
        return (
          <li key={type} className={`bs-doc${file ? " bs-doc-ok" : ""}`}>
            <span className="bs-doc-ico"><BsIcon name={file ? "circleCheck" : "filePen"} size={20} /></span>
            <span className="bs-doc-txt">
              <b>
                {DOC_TYPES[type]}
                {required ? null : <small> (facultatif)</small>}
              </b>
              <small>{file ? file.name : "PDF, JPG ou PNG · 10 Mo max."}</small>
              {errors[type] ? <span className="err-t" role="alert">{errors[type]}</span> : null}
            </span>
            {file ? (
              <button type="button" className="bs-doc-btn bs-doc-del" onClick={() => onChange(type, undefined)} aria-label={`Retirer ${DOC_TYPES[type]}`}>
                <BsIcon name="close" size={18} />
              </button>
            ) : null}
            <label className="bs-doc-btn" htmlFor={inputId}>{file ? "Changer" : "Ajouter"}</label>
            <input
              id={inputId}
              type="file"
              accept={DOC_ACCEPT}
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const problem = fileProblem(f);
                setErrors((x) => ({ ...x, [type]: problem }));
                if (!problem) onChange(type, f);
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}

function ProSignup({ kind, onChangeKind }: { kind: Kind; onChangeKind: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const ent = kind === "ENT";
  const docs = docsForKind(kind);

  // 1. création du compte (ouvre la session)  2. envoi de chaque justificatif  3. page de vérification
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step) return;
    const missing = docs.filter((d) => d.required && !files[d.type]).map((d) => DOC_TYPES[d.type]!.toLowerCase());
    if (missing.length) {
      setError(`Ajoutez vos justificatifs : ${missing.join(", ")}.`);
      return;
    }
    setError(null);
    setStep("Création du compte…");
    const r = await apiCall("/api/auth/signup-pro", { body: formJson(new FormData(e.currentTarget)) });
    if (!r.ok) {
      setStep(null);
      setError(r.error);
      return;
    }
    const toSend = docs.filter((d) => files[d.type]);
    let failed = 0;
    for (const [i, d] of toSend.entries()) {
      setStep(`Envoi des justificatifs (${i + 1}/${toSend.length})…`);
      try {
        await uploadFile(files[d.type]!, { kind: "credential", type: d.type });
      } catch {
        failed += 1;
      }
    }
    // Un document non reçu pourra être renvoyé depuis la page de vérification
    const redirect = (r.data.redirect as string | undefined) ?? "/pro/verification";
    window.location.assign(failed ? `${redirect}?envoi=incomplet` : redirect);
  }

  return (
    <form onSubmit={withConfirm(submit, setError)}>
      <input type="hidden" name="kind" value={kind} />
      <div className="bs-kind">
        <span>
          <BsIcon name={ent ? "building" : "user"} size={18} />
          <b>{ent ? "Pour une entreprise" : "En indépendant"}</b>
        </span>
        <button type="button" onClick={onChangeKind}>Modifier</button>
      </div>
      {ent ? (
        <>
          <p className="bs-section-t">Votre entreprise</p>
          <Field label="Nom de l'entreprise">
            <input className="bs-input" name="companyName" required minLength={2} maxLength={120} autoComplete="organization" placeholder="Entrez le nom de votre entreprise" />
          </Field>
          <p className="bs-section-t">Le gérant</p>
        </>
      ) : (
        <p className="bs-section-t">Vos informations</p>
      )}
      <IdentityFields ent={ent} />
      <div>
        <p className="bs-section-t">{ent ? "Justificatifs de l'entreprise" : "Vos justificatifs"}</p>
        <p className="bs-section-h">
          {ent
            ? "Ils permettent à notre équipe de vérifier l'entreprise avant de rendre son profil visible."
            : "Ils permettent à notre équipe de vérifier votre profil avant de le rendre visible. Une photo nette prise au téléphone suffit."}
        </p>
      </div>
      <DocsPicker docs={docs} files={files} onChange={(type, f) => setFiles((x) => ({ ...x, [type]: f }))} />
      <Terms />
      {error ? <p className="err-t" role="alert">{error}</p> : null}
      <button className="btn p bs-submit" disabled={!!step}>
        {step ?? (ent ? "Créer le compte de l'entreprise" : "Créer mon compte pro")}
      </button>
    </form>
  );
}
