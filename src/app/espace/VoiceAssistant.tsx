"use client";

import { useEffect, useRef, useState } from "react";
import { BUILDING_TYPES, CATEGORIES, COMMUNES, DEADLINES } from "@/lib/constants";
import { startRecording, type Recording } from "@/lib/recorder";
import { BsIcon } from "@/components/bs/icons";

// Assistant vocal en wolof, réduit à l'essentiel : un seul bouton micro. On peut répondre en wolof ou en français.
// L'assistant pose la question à voix haute, on touche le micro et on répond ; la réponse est gardée en arrière-plan
// et la question suivante arrive. À la fin, un récapitulatif lu à voix haute et affiché à l'écran ;
// on dit « waaw » (ou on touche Confirmer) et le formulaire s'ouvre, rempli, pour publier.

export type VoiceValues = { category: string; buildingType: string; description: string; commune: string; budget: string; deadline: string };
type Field = keyof VoiceValues;
type Phase = "speaking" | "ready" | "recording" | "thinking";

const FIELDS: Field[] = ["category", "buildingType", "description", "commune", "budget", "deadline"];
const TITLES: Record<Field, string> = { category: "Prestation", buildingType: "Bâtiment", description: "Projet", commune: "Commune", budget: "Budget", deadline: "Délai" };
const EMPTY: VoiceValues = { category: "", buildingType: "", description: "", commune: "", budget: "", deadline: "" };
const FAILS_BEFORE_CHOICES = 2;
const key = (k: string) => `/api/client/voice/audio/${k}`;
const fcfa = (v: string) => (v ? new Intl.NumberFormat("fr-FR").format(Number(v)) + " FCFA" : "");
const shown = (f: Field, v: string) => (f === "category" ? CATEGORIES[v]?.name ?? "" : f === "budget" ? fcfa(v) : v);

async function errorOf(r: Response) {
  const d = await r.json().catch(() => ({}));
  return (d as { error?: string }).error ?? "L'assistant vocal n'a pas répondu. Réessayez.";
}

export function VoiceAssistant({ onDone, onManual }: { onDone: (v: VoiceValues) => void; onManual: () => void }) {
  const [phase, setPhase] = useState<Phase>("speaking");
  const [step, setStepState] = useState(0); // 0..5 : questions ; 6 : récapitulatif
  const [fails, setFails] = useState(0);
  const [error, setError] = useState("");
  const [level, setLevel] = useState(0);
  const [recapAudio, setRecapAudio] = useState<string | null>(null);
  const [, setTick] = useState(0); // rafraîchit l'affichage du récapitulatif
  const stepRef = useRef(0);
  const redo = useRef(false); // « Modifier » depuis le récapitulatif : une seule question, puis retour au récapitulatif
  const values = useRef<VoiceValues>({ ...EMPTY });
  const audio = useRef<HTMLAudioElement | null>(null);
  const rec = useRef<Recording | null>(null);
  const alive = useRef(true);

  const setStep = (i: number) => {
    stepRef.current = i;
    setStepState(i);
  };
  const recap = step >= FIELDS.length;

  useEffect(() => {
    if (phase !== "recording") return;
    const t = setInterval(() => setLevel(rec.current?.level() ?? 0), 90);
    return () => clearInterval(t);
  }, [phase]);

  // Démarrage : bonjour, puis la première question
  useEffect(() => {
    alive.current = true;
    speak([key("intro"), key("category")]);
    return () => {
      alive.current = false;
      audio.current?.pause();
      rec.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** L'assistant parle (une ou plusieurs phrases à la suite), puis c'est à nous. */
  function speak(srcs: string[]) {
    const [src, ...rest] = srcs;
    if (!src || !alive.current) {
      setPhase("ready");
      return;
    }
    audio.current?.pause();
    const a = new Audio(src);
    audio.current = a;
    setPhase("speaking");
    const end = () => {
      if (audio.current === a) speak(rest);
    };
    a.onended = end;
    a.onerror = end;
    a.play().catch(end);
  }

  function replayQuestion() {
    if (phase === "recording" || phase === "thinking") return;
    speak([recap ? recapAudio ?? "" : key(FIELDS[step]!)].filter(Boolean));
  }

  async function micTap() {
    setError("");
    if (phase === "recording") {
      const r = rec.current;
      rec.current = null;
      if (r) await answer(await r.stop());
      return;
    }
    if (phase === "thinking") return;
    audio.current?.pause(); // toucher le micro coupe la parole à l'assistant
    audio.current = null;
    try {
      rec.current = await startRecording({
        onAutoStop: (wav, spoke) => {
          rec.current = null;
          if (!spoke) return speak([key("silence")]);
          void answer(wav);
        },
      });
      setPhase("recording");
    } catch {
      setError("Autorisez le micro pour parler à l'assistant.");
      setPhase("ready");
    }
  }

  async function answer(wav: Blob) {
    setPhase("thinking");
    const i = stepRef.current;
    const field: Field | "confirm" = i >= FIELDS.length ? "confirm" : FIELDS[i]!;
    try {
      const r = await fetch(`/api/client/voice/understand?field=${field}`, { method: "POST", headers: { "Content-Type": "audio/wav" }, body: wav });
      if (!r.ok) throw new Error(await errorOf(r));
      const h: { value: unknown } = await r.json();
      if (!alive.current) return;
      if (field === "confirm") {
        // « waaw » : le formulaire s'ouvre rempli ; « déedéet » : on reste sur le récapitulatif pour modifier
        if (h.value === true) return finish();
        if (h.value === false) return setPhase("ready");
        return speak([key("yesno")]);
      }
      if (h.value == null) {
        setFails((n) => n + 1);
        return speak([key("retry")]);
      }
      store(field, String(h.value));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue.");
      setPhase("ready");
    }
  }

  /** Réponse gardée en arrière-plan, puis question suivante (ou récapitulatif). */
  function store(field: Field, value: string) {
    values.current = { ...values.current, [field]: value };
    setFails(0);
    const nextStep = redo.current ? FIELDS.length : stepRef.current + 1;
    redo.current = false;
    setStep(nextStep);
    if (nextStep < FIELDS.length) speak([key(FIELDS[nextStep]!)]);
    else void readRecap();
  }

  async function readRecap() {
    setTick((t) => t + 1);
    setPhase("thinking");
    const r = await fetch("/api/client/voice/recap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values.current) });
    if (!alive.current) return;
    if (!r.ok) {
      setError(await errorOf(r));
      setPhase("ready");
      return;
    }
    const d: { audio: string } = await r.json();
    const src = `data:audio/mpeg;base64,${d.audio}`;
    setRecapAudio(src);
    speak([src]);
  }

  function modify(i: number) {
    audio.current?.pause();
    redo.current = true;
    setStep(i);
    speak([key(FIELDS[i]!)]);
  }

  function finish() {
    audio.current?.pause();
    rec.current?.cancel();
    onDone(values.current);
  }

  const status =
    phase === "speaking" ? "L'assistant parle…" : phase === "recording" ? "Je vous écoute…" : phase === "thinking" ? "Un instant…" : recap ? "Dites « waaw » ou « oui » pour confirmer" : "À vous : en wolof ou en français";

  return (
    <div className="bs-va">
      <div className="bs-voice-steps" aria-label={recap ? "Récapitulatif" : `Question ${step + 1} sur ${FIELDS.length}`}>
        {FIELDS.map((f, i) => <i key={f} className={i < step ? "done" : i === step ? "on" : ""} />)}
      </div>

      {recap ? (
        <dl className="bs-recap bs-va-recap">
          {FIELDS.map((f, i) => (
            <div key={f}>
              <dt>{TITLES[f]}</dt>
              <dd>{shown(f, values.current[f]) || "—"}</dd>
              <button type="button" onClick={() => modify(i)}>Modifier</button>
            </div>
          ))}
        </dl>
      ) : null}

      <div className={`bs-va-stage ${phase}`}>
        <button
          type="button"
          className={`bs-mic bs-va-mic${phase === "recording" ? " rec" : ""}`}
          onClick={micTap}
          disabled={phase === "thinking"}
          aria-label={phase === "recording" ? "Terminer ma réponse" : "Répondre"}
          style={phase === "recording" ? { boxShadow: `0 0 0 ${8 + level * 26}px rgba(220,38,38,.15)` } : undefined}
        >
          <BsIcon name={phase === "recording" ? "stop" : "mic"} size={38} />
        </button>
        <span className="bs-va-status" aria-live="polite">{status}</span>
        <button type="button" className="bs-va-replay" onClick={replayQuestion} disabled={phase === "recording" || phase === "thinking"}>
          <BsIcon name="volume" size={16} /> Réécouter
        </button>
      </div>

      {error ? <p className="err-t" role="alert">{error}</p> : null}
      {!recap && fails >= FAILS_BEFORE_CHOICES && phase !== "recording" ? <Choices field={FIELDS[step]!} onPick={(v) => store(FIELDS[step]!, v)} /> : null}

      <div className="bs-va-foot">
        <button type="button" className="bs-link" onClick={() => { audio.current?.pause(); rec.current?.cancel(); onManual(); }}>Écrire plutôt</button>
        {recap ? <button type="button" className="btn p" onClick={finish}>Confirmer <BsIcon name="chevronRight" size={18} /></button> : null}
      </div>
    </div>
  );
}

/** Réponses à toucher, proposées seulement si la voix n'a pas été comprise deux fois. */
function Choices({ field, onPick }: { field: Field; onPick: (v: string) => void }) {
  const [text, setText] = useState("");
  const opts: [string, string][] =
    field === "category" ? Object.entries(CATEGORIES).map(([k, c]) => [k, c.name])
      : field === "buildingType" ? BUILDING_TYPES.map((b) => [b, b])
        : field === "deadline" ? DEADLINES.map((d) => [d, d])
          : field === "commune" ? COMMUNES.map((c) => [c, c])
            : [];
  if (opts.length) {
    return (
      <div className="bs-voice-opts">
        {opts.map(([v, l]) => <button key={v} type="button" onClick={() => onPick(v)}>{l}</button>)}
      </div>
    );
  }
  const ok = field === "description" ? text.trim().length >= 20 : Number(text) >= 10000;
  return (
    <div className="bs-voice-typed">
      {field === "description" ? (
        <textarea className="inp" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Villa R+1, 4 chambres, salon…" />
      ) : (
        <input className="inp num" inputMode="numeric" value={text} onChange={(e) => setText(e.target.value.replace(/\D/g, ""))} placeholder="600000" />
      )}
      <button type="button" className="btn p sm" disabled={!ok} onClick={() => onPick(text.trim())}>OK</button>
    </div>
  );
}
