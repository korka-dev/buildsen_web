"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall } from "@/lib/client";
import { Modal } from "./bs/Modal";
import { Stars } from "./Stars";

// Avis du particulier sur le professionnel : possible une fois, dès que le professionnel a répondu
export function ReviewBox({ conversationId, review, canReview, name }: { conversationId: string; review: { rating: number; comment: string | null } | null; canReview: boolean; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (review)
    return (
      <div className="card flat stack" style={{ gap: 6 }}>
        <span className="small muted">Votre avis</span>
        <Stars value={review.rating} size={20} />
        {review.comment && <span className="small" style={{ whiteSpace: "pre-wrap" }}>{review.comment}</span>}
      </div>
    );
  if (!canReview) return null;
  async function send() {
    setBusy(true);
    setErr("");
    const r = await apiCall(`/api/conversations/${conversationId}/review`, { body: { rating, comment } });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    setOpen(false);
    router.refresh();
  }
  return (
    <>
      <div className="card flat stack" style={{ gap: 8 }}>
        <b>Vous avez travaillé avec {name} ?</b>
        <span className="small muted">Votre avis aide les autres particuliers à choisir.</span>
        <button type="button" className="btn o sm" onClick={() => setOpen(true)} style={{ alignSelf: "flex-start" }}>Laisser un avis</button>
      </div>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={`Votre avis sur ${name}`} intro="Une note et, si vous le souhaitez, quelques mots.">
        <div className="stack" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 6 }} role="radiogroup" aria-label="Note">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} étoile${i > 1 ? "s" : ""}`} onClick={() => setRating(i)}
                style={{ background: "none", border: 0, cursor: "pointer", fontSize: 34, lineHeight: 1, color: i <= rating ? "#f5a524" : "#cfcfcf", padding: 2 }}>★</button>
            ))}
          </div>
          <label className="stack" style={{ gap: 4 }}>
            <span className="small">Votre commentaire (facultatif)</span>
            <textarea className="inp" rows={4} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Qualité des plans, respect des délais, communication…" />
          </label>
          {err && <p className="err-t" role="alert">{err}</p>}
          <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn g" onClick={() => setOpen(false)} disabled={busy}>Annuler</button>
            <button type="button" className="btn p" onClick={send} disabled={busy || !rating}>{busy ? "Envoi…" : "Publier mon avis"}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
