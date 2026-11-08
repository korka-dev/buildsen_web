import { PLANS, SHOW_PRICING, LAUNCH_OFFER, MAX_PROS_PER_REQUEST, fcfa, type PlanKey } from "@/lib/constants";
import { PlanBadge } from "./PlanBadge";

// Formules d'abonnement des professionnels (le particulier est toujours gratuit). Masqué tant que SHOW_PRICING vaut false.
export function CreditsExplainer({ compact = false }: { compact?: boolean }) {
  if (!SHOW_PRICING)
    return compact ? (
      <div className="note small">
        <b>Comment ça marche :</b> les particuliers publient leurs projets (les demandes). Vous consultez celles qui vous intéressent et écrivez au client dans la messagerie BUILDSEN, puis vous continuez sur WhatsApp. 5 professionnels au maximum par demande. Inscription gratuite.
      </div>
    ) : null;
  if (compact)
    return (
      <div className="note small">
        <b>Comment ça marche :</b> les particuliers publient gratuitement leurs projets et vous écrivez au client dans la messagerie BUILDSEN, puis vous continuez sur WhatsApp ({MAX_PROS_PER_REQUEST} professionnels maximum par demande). Chaque conversation ouverte compte pour 1 contact.
        Formule gratuite (3 contacts par mois), Pro à {fcfa(PLANS.PRO.price)} par mois ou Premium à {fcfa(PLANS.PREMIUM.price)} par mois.
        Les {LAUNCH_OFFER.firstPros} premiers professionnels vérifiés ont {LAUNCH_OFFER.months} mois de formule Pro offerts.
      </div>
    );
  return (
    <div className="card stack" style={{ gap: 14 }}>
      <h2 style={{ fontSize: 22 }}>Nos formules</h2>
      <p className="muted small">
        Pour les particuliers, BUILDSEN est gratuit. Pour vous, l&apos;inscription et la vérification du profil sont gratuites ;
        vous choisissez ensuite votre formule. Chaque demande est limitée à {MAX_PROS_PER_REQUEST} professionnels.
      </p>
      <div className="g3">
        {(Object.keys(PLANS) as PlanKey[]).map((k) => (
          <div key={k} className={`card stack plan-card plan-${k.toLowerCase()}`} style={{ gap: 8 }}>
            <div className="row between" style={{ gap: 6 }}><b style={{ fontSize: 18 }}>{PLANS[k].name}</b><PlanBadge plan={k} /></div>
            <span className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>{PLANS[k].price ? `${fcfa(PLANS[k].price)} / mois` : "Gratuit"}</span>
            <ul className="ticks small">{PLANS[k].perks.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="note ok small">Offre de lancement : les {LAUNCH_OFFER.firstPros} premiers professionnels vérifiés ont <b>{LAUNCH_OFFER.months} mois de formule Pro offerts</b>. Le badge « Profil vérifié » est gratuit et attribué après examen de vos justificatifs.</div>
      <p className="small muted">Paiement par Wave ou Orange Money. Aucune commission sur vos missions : le prix que vous convenez avec le client vous revient entièrement.</p>
    </div>
  );
}
