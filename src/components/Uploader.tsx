"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/upload";

// Bouton d'envoi d'un fichier (justificatif ou réalisation), puis actualisation de la page
export function Uploader({ kind, type, label, accept, withCaption = false }: {
  kind: "credential" | "portfolio";
  type?: string;
  label: string;
  accept: string;
  withCaption?: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [caption, setCaption] = useState("");

  async function send(file: File) {
    setErr("");
    if (withCaption && !caption.trim()) { setErr("Ajoutez d'abord une légende (ex. : Villa R+1, plans de façade)."); return; }
    setBusy(true);
    try {
      await uploadFile(file, { kind, type, caption: caption.trim() });
      setCaption("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        {withCaption && (
          <input className="inp" style={{ flex: 1, minWidth: 200 }} value={caption} maxLength={120}
            onChange={(e) => setCaption(e.target.value)} placeholder="Légende, ex. : Villa R+1, plans de façade" aria-label="Légende de la réalisation" />
        )}
        <button type="button" className="btn o sm" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? "Envoi…" : label}
        </button>
        <input ref={input} type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && send(e.target.files[0])} />
      </div>
      {err && <p className="err-t" role="alert">{err}</p>}
    </div>
  );
}
