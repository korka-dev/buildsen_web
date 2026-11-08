import type { ServiceRequest } from "@/lib/types";
import { CATEGORIES, fcfa } from "@/lib/constants";

// Fiche détaillée d'une demande (client, professionnel et administration)
export function RequestDetails({ r, hideBudget = false }: { r: ServiceRequest; hideBudget?: boolean }) {
  const rows: [string, string | null][] = [
    ["Prestation", CATEGORIES[r.category]?.name === r.service ? r.service : `${CATEGORIES[r.category]?.name ?? r.category} · ${r.service}`],
    ["Type de bâtiment", r.buildingType + (r.levels ? ` · ${r.levels}` : "")],
    ["Nombre de pièces", r.rooms ? String(r.rooms) : null],
    ["Localisation", r.commune + (r.district ? `, ${r.district}` : "")],
    ["Statut du terrain", r.landStatus],
    ["Surface", r.surface ? `${r.surface} m²` : null],
    ["Terrain et contraintes", r.dims],
    ["Avancement du projet", r.phase],
    ["Délai souhaité", r.deadline],
  ];
  return (
    <div className="card stack" style={{ gap: 16 }}>
      {!hideBudget && <div className="row between" style={{ gap: 12, alignItems: "flex-start" }}>
        <div className="stack" style={{ gap: 2 }}>
          <span className="small muted">Budget du client</span>
          <span className="budget num">{fcfa(r.budget)}</span>
        </div>
        <span className="small muted num">{r.ref}</span>
      </div>}
      <div className="stack" style={{ gap: 6 }}>
        <b>Besoin</b>
        <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--slate)" }}>{r.description}</p>
      </div>
      <dl className="kv">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="kv-r"><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      {r.hasPhoto && (
        <div className="stack" style={{ gap: 6 }}>
          <b>Photo du terrain ou croquis</b>
          <a href={`/api/fichiers/demande/${r.id}`} target="_blank" rel="noopener">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/fichiers/demande/${r.id}`} alt="Photo du terrain ou croquis joint à la demande" loading="lazy" style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 12, border: "1px solid var(--line)" }} />
          </a>
        </div>
      )}
    </div>
  );
}

// Places prises sur une demande (5 au maximum)
export function Places({ taken, max }: { taken: number; max: number }) {
  return (
    <span className="places" title={`${taken} sur ${max}`} aria-label={`${taken} professionnel${taken > 1 ? "s" : ""} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => <i key={i} className={i < taken ? "on" : ""} />)}
    </span>
  );
}
