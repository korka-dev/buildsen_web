import type { PlanKey } from "@/lib/constants";

// Signature visuelle des formules, à la manière de LinkedIn Premium : badge vert « PRO », badge doré « PREMIUM ».
// La formule gratuite n'affiche rien. Le badge « Profil vérifié » reste indépendant de la formule.
export function PlanBadge({ plan }: { plan: PlanKey }) {
  if (plan === "FREE") return null;
  return (
    <span className={`plan-badge ${plan === "PREMIUM" ? "premium" : "pro"}`}>
      {plan === "PREMIUM" && (
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M3 18h18l-1.6-10-4.9 4.2L12 5.5 9.5 12.2 4.6 8z" fill="currentColor" /></svg>
      )}
      {plan === "PREMIUM" ? "PREMIUM" : "PRO"}
    </span>
  );
}

// Avatar entouré d'un anneau vert (Pro) ou doré (Premium)
export function PlanAvatar({ plan, initials, size = 40 }: { plan: PlanKey; initials: string; size?: number }) {
  return (
    <span className={`avatar plan-ring-${plan.toLowerCase()}`} style={{ width: size, height: size }}>{initials}</span>
  );
}
