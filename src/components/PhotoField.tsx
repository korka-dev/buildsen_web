"use client";

import { useRef, useState } from "react";
import { photoProblem, uploadFile, PHOTO_ACCEPT } from "@/lib/upload";

// Photo du terrain ou croquis (facultatif) : envoyée tout de suite, son chemin part avec la demande (champ caché « photo »)
export function PhotoField() {
  const input = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState("");
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(file: File) {
    setErr("");
    const problem = photoProblem(file);
    if (problem) return setErr(problem);
    setBusy(true);
    try {
      const p = await uploadFile(file, { kind: "request" });
      setPath(p);
      setName(file.name);
      setPreview(URL.createObjectURL(file));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Envoi impossible. Réessayez.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  function clear() {
    setPath("");
    setName("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
  }

  return (
    <div className="f">
      <span style={{ fontWeight: 600 }}>Photo du terrain ou croquis (facultatif)</span>
      <span className="h">Aide les professionnels à comprendre votre projet. JPG, PNG ou WebP, 8 Mo au plus.</span>
      <input type="hidden" name="photo" value={path} />
      {path ? (
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Aperçu de la photo" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 10 }} />
          <div className="stack" style={{ gap: 4 }}>
            <span className="small">{name}</span>
            <button type="button" className="btn g sm" onClick={clear}>Retirer</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn o sm" disabled={busy} onClick={() => input.current?.click()} style={{ alignSelf: "flex-start" }}>{busy ? "Envoi…" : "Ajouter une photo"}</button>
      )}
      <input ref={input} type="file" accept={PHOTO_ACCEPT} hidden onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
      {err && <p className="err-t" role="alert">{err}</p>}
    </div>
  );
}
