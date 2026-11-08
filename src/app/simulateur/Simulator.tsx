"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startRecording, type Recording } from "@/lib/recorder";
import { BsIcon } from "@/components/bs/icons";

type Button = { id: string; title: string };
type Msg = {
  id: string; direction: "IN" | "OUT"; kind: string; body: string; status: string; hasAudio: boolean;
  buttons: Button[]; template: string | null; error: string | null; at: string;
};
type Contact = { phone: string; name: string; role: string };

const fmt = (p: string) => (p.length === 9 ? `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7)}` : p);
const time = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" });
const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.readAsDataURL(blob);
  });

// Liens cliquables dans les messages (lien de paiement, adresse du site)
function linkify(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part,
  );
}

// Alerte « téléphone » à l'arrivée d'un message : son, vibration, titre de l'onglet, et notification système si le navigateur l'autorise
// (les notifications système exigent https ou localhost : sur une adresse du réseau local, seuls le son, la vibration et le titre fonctionnent).
let audioCtx: AudioContext | null = null;
function beep() {
  try {
    audioCtx ??= new AudioContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + 0.35);
  } catch { /* son indisponible */ }
}

async function post(path: string, body: unknown) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d as { error?: string }).error ?? `Erreur ${r.status}`);
  return d;
}

/** Un téléphone WhatsApp simulé : le même numéro peut être celui d'un client ou d'un professionnel. */
export function Simulator({ title, initialPhone, forced }: { title: string; initialPhone: string; forced?: { phone: string; n: number } }) {
  const [phone, setPhone] = useState(initialPhone);
  const [draft, setDraft] = useState(fmt(initialPhone));
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [state, setState] = useState("NEW");
  const [optedOut, setOptedOut] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [notifNote, setNotifNote] = useState("");
  const seen = useRef<Set<string> | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const pending = useRef<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const all = useRef<Msg[]>([]);
  const revealRef = useRef<() => void>(() => {});
  const alertsOn = useRef(false);
  const rec = useRef<Recording | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const feed = useRef<HTMLDivElement>(null);
  const inflight = useRef(false);

  revealRef.current = () => {
    timer.current = null;
    const id = pending.current.shift();
    setHidden([...pending.current]);
    const m = all.current.find((x) => x.id === id);
    if (m && alertsOn.current) {
      beep();
      navigator.vibrate?.([120, 60, 120]);
      if (document.visibilityState !== "visible") document.title = "(1) Nouveau message WhatsApp";
      if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
        new Notification("BUILDSEN", { body: m.kind === "audio" ? "Note vocale" : m.body.slice(0, 120) });
      }
    }
    if (pending.current.length) {
      const next = all.current.find((x) => x.id === pending.current[0]);
      timer.current = setTimeout(() => revealRef.current(), Math.min(500 + (next?.body.length ?? 40) * 12, 1800));
    }
  };

  const refresh = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    try {
      const r = await fetch(`/api/wa/sim/messages?phone=${phone}`);
      if (r.ok) {
        const d = await r.json();
        const list = d.messages as Msg[];
        all.current = list;
        if (seen.current === null) seen.current = new Set(list.map((m) => m.id));
        const fresh = list.filter((m) => m.direction === "OUT" && !seen.current!.has(m.id));
        fresh.forEach((m) => seen.current!.add(m.id));
        if (fresh.length) {
          // Les messages de l'assistant arrivent un par un, précédés de « en train d'écrire… », comme sur WhatsApp
          pending.current.push(...fresh.map((m) => m.id));
          setHidden([...pending.current]);
          if (!timer.current) timer.current = setTimeout(() => revealRef.current(), 600);
        }
        setMsgs(list);
        setState(d.state);
        setOptedOut(d.optedOut);
      }
    } finally {
      inflight.current = false;
    }
  }, [phone]);

  useEffect(() => {
    fetch("/api/wa/sim/contacts").then((r) => (r.ok ? r.json() : { contacts: [] })).then((d) => setContacts(d.contacts));
  }, []);
  useEffect(() => {
    void refresh();
    const t = setInterval(() => document.visibilityState === "visible" && void refresh(), 1500);
    return () => clearInterval(t);
  }, [refresh]);
  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight });
  }, [msgs.length]);
  useEffect(() => {
    const back = () => { if (document.visibilityState === "visible") document.title = "Simulateur WhatsApp · BUILDSEN"; };
    document.addEventListener("visibilitychange", back);
    return () => document.removeEventListener("visibilitychange", back);
  }, []);
  useEffect(() => () => { rec.current?.cancel(); audio.current?.pause(); }, []);

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      await post("/api/wa/sim/send", { phone, ...body });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setText("");
    await send({ kind: "text", text: t });
  }

  async function mic() {
    if (recording) {
      const r = rec.current;
      rec.current = null;
      setRecording(false);
      if (r) await send({ kind: "audio", audio: await toBase64(await r.stop()) });
      return;
    }
    try {
      rec.current = await startRecording({ maxSeconds: 30, onAutoStop: undefined });
      setRecording(true);
    } catch {
      setError("Autorisez le micro dans le navigateur pour envoyer une note vocale.");
    }
  }

  function play(m: Msg) {
    audio.current?.pause();
    if (playing === m.id) return setPlaying(null);
    const a = new Audio(`/api/wa/sim/media/${encodeURIComponent(m.id)}`);
    audio.current = a;
    setPlaying(m.id);
    a.onended = a.onerror = () => setPlaying(null);
    void a.play().catch(() => setPlaying(null));
  }

  async function toggleAlerts() {
    const on = !alerts;
    setAlerts(on);
    alertsOn.current = on;
    setNotifNote("");
    if (!on) return;
    beep(); // débloque le son (le navigateur l'exige après un toucher) et fait entendre le test
    navigator.vibrate?.(80);
    if (typeof Notification === "undefined" || !window.isSecureContext) {
      setNotifNote("Son, vibration et titre de l'onglet actifs. Les notifications système demandent une adresse https (voir WHATSAPP.md, « Tester sur le téléphone »).");
    } else if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  useEffect(() => {
    seen.current = null; // un autre numéro : sa conversation existante s'affiche d'un coup, seuls les nouveaux messages « arrivent »
    pending.current = [];
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHidden([]);
  }, [phone]);

  useEffect(() => {
    if (!forced) return;
    setMsgs([]);
    setPhone(forced.phone);
    setDraft(fmt(forced.phone));
  }, [forced]);

  async function reset() {
    if (!window.confirm(`Effacer la conversation du ${fmt(phone)} (et son compte s'il a été créé par l'assistant) ?`)) return;
    await post("/api/wa/sim/reset", { phone, deleteAccount: true });
    await refresh();
  }

  function pickNumber(value: string) {
    const digits = value.replace(/\D/g, "").replace(/^221/, "");
    if (digits.length === 9) {
      setPhone(digits);
      setDraft(fmt(digits));
      setMsgs([]);
    }
  }

  const who = contacts.find((c) => c.phone === phone);

  return (
    <section className="sm-phone" aria-label={`Téléphone ${title}`}>
      <div className="sm-bar">
        <div className="sm-id">
          <b>{title}</b>
          <span>{who ? `${who.name} · ${who.role === "PRO" ? "professionnel" : "particulier"}` : "Numéro sans compte"}</span>
        </div>
        <div className="sm-num">
          <input aria-label={`Numéro du téléphone ${title}`} value={draft} inputMode="tel" onChange={(e) => setDraft(e.target.value)} onBlur={() => pickNumber(draft)} onKeyDown={(e) => e.key === "Enter" && pickNumber(draft)} />
          <select aria-label="Choisir un compte existant" value="" onChange={(e) => e.target.value && pickNumber(e.target.value)}>
            <option value="">Comptes…</option>
            {contacts.map((c) => <option key={c.phone} value={c.phone}>{fmt(c.phone)} · {c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="sm-feed" ref={feed} aria-live="polite">
        {msgs.length === 0 && !hidden.length ? <p className="sm-empty">Aucun message. Écrivez « Bonjour » pour commencer.</p> : null}
        {msgs.filter((m) => !hidden.includes(m.id)).map((m) => (
          <div key={m.id} className={`sm-msg ${m.direction === "IN" ? "me" : "bot"}${m.status === "failed" ? " failed" : ""}`}>
            {m.template ? <span className="sm-tpl">Message modèle · {m.template}</span> : null}
            {m.kind === "audio" && m.direction === "OUT" ? (
              <button type="button" className={`sm-voice${playing === m.id ? " on" : ""}`} onClick={() => play(m)} disabled={!m.hasAudio}>
                <BsIcon name={playing === m.id ? "stop" : "volume"} size={16} /> Note vocale (wolof)
              </button>
            ) : m.kind === "audio" ? (
              <span className="sm-voice-in"><BsIcon name="mic" size={15} /> Note vocale envoyée</span>
            ) : (
              <p>{linkify(m.body)}</p>
            )}
            {m.buttons.length ? (
              <div className="sm-btns">
                {m.buttons.map((b) => (
                  <button key={b.id} type="button" disabled={busy} onClick={() => send({ kind: "button", buttonId: b.id, title: b.title })}>{b.title}</button>
                ))}
              </div>
            ) : null}
            {m.status === "failed" ? <small className="sm-err">Non remis : {m.error ?? "erreur"}</small> : null}
            <time>{time(m.at)}{m.direction === "IN" ? " ✓✓" : ""}</time>
          </div>
        ))}
        {busy || hidden.length ? <div className="sm-msg bot"><span className="bs-dots sm-dots"><i /><i /><i /></span></div> : null}
      </div>

      {error ? <p className="err-t sm-error" role="alert">{error}</p> : null}
      <form className="sm-composer" onSubmit={submit}>
        <button type="button" className={`sm-mic${recording ? " rec" : ""}`} onClick={mic} aria-label={recording ? "Envoyer la note vocale" : "Enregistrer une note vocale"} disabled={busy && !recording}>
          <BsIcon name={recording ? "stop" : "mic"} size={20} />
        </button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={recording ? "Enregistrement… touchez le carré pour envoyer" : "Écrire un message"} disabled={recording} aria-label="Message" />
        <button className="sm-send" disabled={!text.trim() || busy || recording} aria-label="Envoyer"><BsIcon name="arrow" size={18} /></button>
      </form>
      {notifNote ? <p className="sm-note">{notifNote}</p> : null}
      <div className="sm-foot">
        <span>Étape : <code>{state}</code>{optedOut ? " · alertes coupées (STOP)" : ""}</span>
        <div>
          {["Bonjour", "menu", "mes demandes", "abonnement"].map((w) => <button key={w} type="button" onClick={() => send({ kind: "text", text: w })} disabled={busy}>{w}</button>)}
          <button type="button" onClick={toggleAlerts} aria-pressed={alerts}>{alerts ? "🔔 Alertes actives" : "🔕 Activer les alertes"}</button>
          <button type="button" onClick={reset}>Recommencer</button>
        </div>
      </div>
    </section>
  );
}
