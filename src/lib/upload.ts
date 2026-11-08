"use client";

// Justificatifs et réalisations : formats et taille acceptés par l'API (rules.UPLOADS)
export const DOC_MIMES = ["application/pdf", "image/jpeg", "image/png"];
export const DOC_ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const MAX_UPLOAD_MB = 10;

/** Contrôle avant envoi : message d'erreur, ou null si le fichier est accepté. */
export function fileProblem(file: File, mimes = DOC_MIMES): string | null {
  if (!mimes.includes(file.type)) return "Format non accepté : PDF, JPG ou PNG.";
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `Fichier trop lourd (${MAX_UPLOAD_MB} Mo maximum).`;
  return null;
}

/**
 * Envoi en deux temps : lien signé demandé au serveur, fichier envoyé directement à Supabase, puis confirmation.
 * Lève une erreur avec un message lisible en cas d'échec.
 */
export const PHOTO_MIMES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";

/** Photo du terrain ou croquis : image de 8 Mo au plus. */
export function photoProblem(file: File): string | null {
  if (!PHOTO_MIMES.includes(file.type)) return "Format non accepté : JPG, PNG ou WebP.";
  if (file.size > 8 * 1024 * 1024) return "Photo trop lourde (8 Mo maximum).";
  return null;
}

export async function uploadFile(file: File, opts: { kind: "credential" | "portfolio" | "request"; type?: string; caption?: string }): Promise<string> {
  const { kind, type, caption } = opts;
  const sign = await fetch("/api/uploads/sign", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, type, mime: file.type, size: file.size }),
  });
  const s = await sign.json();
  if (!sign.ok) throw new Error(s.error);
  const put = await fetch(s.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!put.ok) throw new Error("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
  const conf = await fetch("/api/uploads/confirm", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, type, path: s.path, name: file.name, caption: caption || undefined }),
  });
  const c = await conf.json();
  if (!conf.ok) throw new Error(c.error);
  return String(c.path ?? "");
}
