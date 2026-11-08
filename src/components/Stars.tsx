// Étoiles (affichage) et note moyenne « ★ 4,5 · 3 avis »
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span aria-label={`${value} sur 5`} style={{ color: "#f5a524", letterSpacing: 1, fontSize: size, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }}>★</span>)}
    </span>
  );
}

export function Rating({ rating }: { rating?: { avg: number | null; count: number } }) {
  if (!rating || !rating.count || rating.avg == null) return <span className="small muted">Pas encore d&apos;avis</span>;
  return (
    <span className="row small" style={{ gap: 6, alignItems: "center" }}>
      <Stars value={rating.avg} size={14} /> <b>{String(rating.avg).replace(".", ",")}</b> <span className="muted">· {rating.count} avis</span>
    </span>
  );
}
