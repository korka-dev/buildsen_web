import { redirect } from "next/navigation";
import { api, requirePro } from "@/lib/api";
import { PLANS, SHOW_PRICING } from "@/lib/constants";
import { PlanBadge } from "@/components/PlanBadge";
import { BsIcon } from "@/components/bs/icons";
import { RenewButton } from "./RenewButton";
import type { PlanStatus } from "./PlanPicker";

export const metadata = { title: "Abonnement · BUILDSEN" };

// Abonnement en cours, et un bouton pour le renouveler : rien d'autre
export default async function Abonnement() {
  const { pro } = await requirePro();
  if (!SHOW_PRICING) redirect("/pro");
  const status = await api<PlanStatus>("/api/pro/plan");
  const plan = pro.activePlan;
  const until = plan !== "FREE" && pro.planUntil ? new Date(pro.planUntil).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <div className="bs-page">
      <div className="bs-page-h"><div><h1>Abonnement</h1></div></div>
      <section className="bs-panel bs-plan-now">
        <span className="bs-ico"><BsIcon name="briefcase" /></span>
        <div className="grow">
          <div className="row" style={{ gap: 10 }}><b style={{ fontSize: 22 }}>Formule {PLANS[plan].name}</b><PlanBadge plan={plan} /></div>
          <p className="muted">{until ? `Active jusqu'au ${until}` : "Formule gratuite"}</p>
        </div>
        <RenewButton status={status} />
      </section>
    </div>
  );
}
