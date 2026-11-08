"use client";

import { useRef, useState } from "react";
import { useApiForm } from "@/lib/client";
import { PhotoField } from "@/components/PhotoField";
import { FormMsg as Msg } from "@/components/FormMsg";
import { BsIcon } from "@/components/bs/icons";
import { BUILDING_TYPES, CATEGORIES, COMMUNES, DEADLINES, LEVELS, MAX_PROS_PER_REQUEST, PHASES, TERRAIN_STATUS } from "@/lib/constants";

const EMPTY = { category: "", service: "", buildingType: "", description: "", commune: "", district: "", landStatus: "", phase: "", levels: "", rooms: "", surface: "", dims: "", deadline: "", budget: "" };
const fmt = (v: string) => { const d = v.replace(/\D/g, ""); return d ? new Intl.NumberFormat("fr-FR").format(Number(d)) + " FCFA" : ""; };

const STEPS = ["Prestation", "Bâtiment", "Projet", "Lieu", "Budget et délai", "Vérification"];
const BUDGETS = [300000, 600000, 1000000, 2000000];
type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// Formulaire de dépôt : une question à la fois, de grands choix à toucher, et rien n'est perdu en revenant en arrière.
// Toutes les parties restent dans le formulaire (masquées) pour être envoyées ensemble à la fin.
export function RequestForm({ initial, startStep = 0 }: { initial?: Partial<typeof EMPTY>; startStep?: number } = {}) {
  const [s, onSubmit, pending] = useApiForm("/api/client/requests");
  const [v, setV] = useState({ ...EMPTY, ...initial });
  const [step, setStep] = useState(startStep);
  const parts = useRef<(HTMLFieldSetElement | null)[]>([]);
  const top = useRef<HTMLDivElement>(null);
  const last = STEPS.length - 1;
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<Field>) => setV({ ...v, [k]: e.target.value });
  const sel = (k: keyof typeof EMPTY, opts: string[], required = true) => (
    <select className="inp" name={k} value={v[k]} onChange={set(k)} required={required}>
      <option value="">Choisir…</option>
      {opts.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
  // Grands choix à toucher (cases radio) : plus faciles à utiliser qu'une liste déroulante, au doigt comme au clavier
  const choices = (k: keyof typeof EMPTY, opts: string[], required = true) => (
    <div className="bs-wiz-opts bs-wiz-big" role="radiogroup">
      {opts.map((o, i) => (
        <label key={o} className={`opt${v[k] === o ? " on" : ""}`}>
          <span className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
            <input type="radio" name={k} value={o} checked={v[k] === o} onChange={() => setV({ ...v, [k]: o })} required={required && i === 0} />
            <b>{o}</b>
          </span>
        </label>
      ))}
    </div>
  );
  const cat = CATEGORIES[v.category];

  const go = (n: number) => {
    setStep(n);
    // Le titre de la nouvelle partie reçoit le focus : lecteurs d'écran et clavier suivent le parcours
    requestAnimationFrame(() => {
      top.current?.scrollIntoView({ block: "start" });
      parts.current[n]?.querySelector<HTMLElement>("legend")?.focus({ preventScroll: true });
    });
  };
  // Passage à la partie suivante seulement si les champs de la partie affichée sont valides
  const next = () => {
    const bad = [...(parts.current[step]?.querySelectorAll<Field>("input, select, textarea") ?? [])].find((el) => !el.checkValidity());
    if (bad) {
      bad.reportValidity();
      return;
    }
    go(step + 1);
  };
  const part = (i: number, title: string, children: React.ReactNode, help?: string) => (
    <fieldset ref={(el) => { parts.current[i] = el; }} hidden={step !== i} className="bs-wiz-part">
      <legend className="bs-wiz-t" tabIndex={-1}>{title}</legend>
      {help && <p className="muted" style={{ margin: 0 }}>{help}</p>}
      {children}
    </fieldset>
  );
  const recap: [string, string, number][] = [
    ["Prestation", [cat?.name, v.service].filter(Boolean).join(" · "), 0],
    ["Bâtiment", [v.buildingType, v.levels, v.rooms && `${v.rooms} pièces`, v.surface && `${v.surface} m²`].filter(Boolean).join(" · "), 1],
    ["Description", v.description.length > 140 ? v.description.slice(0, 140) + "…" : v.description, 2],
    ["Lieu", [v.commune, v.district, v.landStatus, v.phase].filter(Boolean).join(" · "), 3],
    ["Budget et délai", [fmt(v.budget), v.deadline].filter(Boolean).join(" · "), 4],
  ];

  return (
    <form
      className="bs-wizard"
      onSubmit={(e) => {
        // Touche Entrée avant la dernière partie : on avance au lieu d'envoyer
        if (step < last) {
          e.preventDefault();
          next();
          return;
        }
        onSubmit(e);
      }}
    >
      <div ref={top} className="bs-wiz-bar">
        <p className="bs-wiz-count" aria-live="polite"><b>Étape {step + 1} sur {STEPS.length}</b> · {STEPS[step]}</p>
        <div className="bs-wiz-track" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Avancement de la demande"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      </div>

      {part(0, "Quelle prestation recherchez-vous ?", <>
        <div className="bs-wiz-opts">
          {Object.entries(CATEGORIES).map(([k, c]) => (
            <label key={k} className={`opt${v.category === k ? " on" : ""}`}>
              <span className="row" style={{ gap: 8, flexWrap: "nowrap" }}><input type="radio" name="category" value={k} checked={v.category === k} onChange={() => setV({ ...v, category: k, service: "" })} required /><b>{c.name}</b></span>
              <span className="small muted">{c.short}</span>
              {c.regulated && <span className="small" style={{ color: "var(--g1)", fontWeight: 600 }}>Réservé aux ingénieurs et entreprises vérifiés</span>}
            </label>
          ))}
        </div>
        {cat && <label className="f">Une prestation plus précise ?<span className="h">Facultatif</span>{sel("service", cat.items, false)}</label>}
      </>, "Choisissez ce qui correspond le mieux. Vous pourrez préciser ensuite.")}

      {part(1, "Quel type de bâtiment ?", choices("buildingType", BUILDING_TYPES), "Touchez la réponse qui décrit le mieux votre projet.")}

      {part(2, "Décrivez votre projet", <>
        <label className="f">Votre besoin<span className="h">Les pièces souhaitées, vos contraintes, ce que vous attendez.</span>
          <textarea className="inp" name="description" value={v.description} onChange={set("description")} required minLength={20} maxLength={2000} placeholder="Ex. : villa R+1, 4 chambres dont une suite parentale, salon, cuisine fermée, terrasse à l'étage…" style={{ minHeight: 150 }} />
          <span className="h" style={{ textAlign: "right" }}>{v.description.length < 20 ? `Encore ${20 - v.description.length} caractère${20 - v.description.length > 1 ? "s" : ""} au minimum` : `${v.description.length} / 2 000`}</span>
        </label>
        <details className="bs-wiz-more">
          <summary>Ajouter des détails (facultatif)</summary>
          <div className="bs-wiz-g3">
            <label className="f">Niveaux{sel("levels", LEVELS, false)}</label>
            <label className="f">Nombre de pièces<input className="inp num" name="rooms" inputMode="numeric" value={v.rooms} onChange={set("rooms")} placeholder="6" /></label>
            <label className="f">Surface (m²)<input className="inp num" name="surface" inputMode="numeric" value={v.surface} onChange={set("surface")} placeholder="200" /></label>
          </div>
        </details>
        <PhotoField />
      </>)}

      {part(3, "Où se trouve le projet ?", <>
        <label className="f">Commune{sel("commune", COMMUNES)}</label>
        <details className="bs-wiz-more">
          <summary>Ajouter des détails sur le terrain (facultatif)</summary>
          <div className="bs-wiz-g2">
            <label className="f">Quartier<input className="inp" name="district" value={v.district} onChange={set("district")} maxLength={80} /></label>
            <label className="f">Statut du terrain{sel("landStatus", TERRAIN_STATUS, false)}</label>
            <label className="f">Où en est votre projet ?{sel("phase", PHASES, false)}</label>
            <label className="f">Dimensions et contraintes<input className="inp" name="dims" value={v.dims} onChange={set("dims")} maxLength={160} placeholder="Ex. : 10 m × 20 m, entrée côté nord" /></label>
          </div>
        </details>
      </>)}

      {part(4, "Votre budget et votre délai", <>
        <label className="f">Budget pour cette prestation (FCFA)<span className="h">Il aide les professionnels à savoir si votre demande leur correspond. Le prix final se fixe avec le professionnel choisi.</span>
          <input className="inp num" name="budget" inputMode="numeric" value={v.budget} onChange={set("budget")} required placeholder="Ex. : 600000" />
          {fmt(v.budget) && <span className="h" style={{ color: "var(--g1)", fontWeight: 600 }}>{fmt(v.budget)}</span>}
        </label>
        <div className="bs-wiz-chips" role="group" aria-label="Montants courants">
          {BUDGETS.map((b) => (
            <button key={b} type="button" className={v.budget === String(b) ? "on" : ""} onClick={() => setV({ ...v, budget: String(b) })}>{new Intl.NumberFormat("fr-FR").format(b)}</button>
          ))}
        </div>
        <div className="f"><span id="deadline-l" style={{ fontWeight: 600 }}>Dans quel délai souhaitez-vous le travail ?</span>{choices("deadline", DEADLINES)}</div>
      </>)}

      {part(5, "Vérifiez votre demande", <>
        <dl className="bs-recap">
          {recap.map(([k, val, i]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{val || "—"}</dd>
              <button type="button" onClick={() => go(i)}>Modifier</button>
            </div>
          ))}
        </dl>
        <label className="chk"><input type="checkbox" name="confirm" required /> <span>Je confirme que ces informations sont exactes. J&apos;accepte que jusqu&apos;à {MAX_PROS_PER_REQUEST} professionnels vérifiés m&apos;écrivent dans la messagerie BUILDSEN.</span></label>
        <p className="small muted" style={{ margin: 0 }}>Votre demande est publiée tout de suite. Notre équipe peut retirer une demande qui ne respecte pas les règles (fausse demande, coordonnées dans le texte…).</p>
        <Msg s={s} />
      </>)}

      <div className="bs-wiz-nav">
        {step > 0 ? (
          <button type="button" className="btn g" onClick={() => go(step - 1)}>
            <BsIcon name="chevronLeft" size={18} /> Précédent
          </button>
        ) : <span />}
        {step < last ? (
          <button type="button" className="btn p" onClick={next}>
            Suivant <BsIcon name="chevronRight" size={18} />
          </button>
        ) : (
          <button className="btn p" disabled={pending}>{pending ? "Publication…" : "Publier ma demande"}</button>
        )}
      </div>
    </form>
  );
}

export function ResendVerification() {
  const [s, onSubmit, pending] = useApiForm("/api/client/resend-verification");
  return (
    <form onSubmit={onSubmit} className="row" style={{ gap: 10 }}>
      <button className="btn o sm" disabled={pending}>Renvoyer le lien</button>
      <Msg s={s} />
    </form>
  );
}

export function PhoneForm({ phone, needsPassword = true }: { phone: string; needsPassword?: boolean }) {
  const [s, onSubmit, pending] = useApiForm("/api/client/phone", { method: "PUT" });
  return (
    <form onSubmit={onSubmit} className="stack" style={{ gap: 10, maxWidth: 420 }}>
      <label className="f">Téléphone<span className="h">Partagé uniquement avec les professionnels que vous choisissez</span><input className="inp" name="phone" inputMode="tel" defaultValue={phone} required /></label>
      {needsPassword && <label className="f">Votre mot de passe<span className="h">Demandé pour confirmer le changement de numéro.</span><input className="inp" name="password" type="password" autoComplete="current-password" required /></label>}
      <Msg s={s} />
      <button className="btn p sm" disabled={pending} style={{ alignSelf: "flex-start" }}>Enregistrer</button>
    </form>
  );
}
