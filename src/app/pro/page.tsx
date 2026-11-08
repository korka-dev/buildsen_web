import Link from "next/link";
import { api, apiRaw, requirePro } from "@/lib/api";
import type { ConversationSummary, ServiceRequest } from "@/lib/types";
import { CLIENTS_OPEN, MAX_PROS_PER_REQUEST, OPENING, PLANS, SHOW_PRICING } from "@/lib/constants";
import { BsIcon, type BsIconName } from "@/components/bs/icons";

export const metadata = { title: "Tableau de bord · BUILDSEN" };

const LAST_NOTIFS = 3;
type Req = ServiceRequest & { myConversationId: string | null };

// Tableau de bord du professionnel : même principe que celui du particulier (bienvenue, chiffres clés, 3 dernières notifications)
export default async function ProHome() {
  const { user, pro, next, notifs } = await requirePro();
  const live = pro.state === "VERIFIED" && CLIENTS_OPEN;
  const [reqData, convs] = live
    ? await Promise.all([
        apiRaw<{ requests: Req[]; stats?: { commune: string | null; monthZone: number } }>("/api/pro/requests").then((r) => (r.status === 200 ? r.data : null)),
        api<{ conversations: ConversationSummary[] }>("/api/pro/conversations").then((r) => r.conversations),
      ])
    : [null, [] as ConversationSummary[]];
  const reqs = reqData?.requests ?? [];
  const stats = reqData?.stats;
  const open = reqs.filter((r) => !r.myConversationId && (r.conversations ?? 0) < MAX_PROS_PER_REQUEST).length;
  const kpis: [BsIconName, string | number, string, string][] = [
    ["list", open, open > 1 ? "Demandes à répondre" : "Demande à répondre", "/pro/demandes"],
    ["user", convs.length, convs.length > 1 ? "Clients contactés" : "Client contacté", "/pro/demandes?vue=ecrites"],
    ...(stats ? [["mapPin", stats.monthZone, `demande${stats.monthZone > 1 ? "s" : ""} ce mois ${stats.commune ? `à ${stats.commune}` : "dans votre zone"}`, "/pro/demandes?vue=toutes"] as [BsIconName, string | number, string, string]] : []),
    SHOW_PRICING
      ? ["briefcase", PLANS[pro.activePlan].name, "Mon abonnement", "/pro/abonnement"]
      : ["filePen", pro.portfolio?.length ?? 0, "Réalisations", "/pro/compte"],
  ];
  const items = [...(notifs?.items ?? [])].sort((a, b) => b.ts - a.ts).slice(0, LAST_NOTIFS);

  return (
    <div className="bs-page bs-dash">
      <h1 className="bs-hello">
        Bonjour {user.firstName}{" "}
        <span className="bs-nowrap">
          {user.lastName}
          <span className="bs-wave" aria-hidden="true"><BsIcon name="hand" size={30} /></span>
        </span>
      </h1>

      {next && (
        <div className={`note row between${next.cta ? " w" : ""}`} style={{ gap: 14 }}>
          <span><b>{next.title}</b><br />{next.text}</span>
          {next.cta && <Link className="btn p" href="/pro/compte">{next.cta}</Link>}
        </div>
      )}
      {pro.state === "VERIFIED" && !CLIENTS_OPEN && <div className="note ok">Votre profil est vérifié. Les demandes vous seront proposées dès l&apos;ouverture de la plateforme, prévue en {OPENING}.</div>}
      {pro.state === "REFUSED" && <div className="note e">Votre dossier a été refusé{pro.decisionReason ? ` : ${pro.decisionReason}` : "."} Contactez l&apos;équipe BUILDSEN.</div>}

      <div className="bs-stats-row">
        {kpis.map(([icon, value, label, href]) => (
          <Link key={label} href={href} className="bs-stat">
            <span className="bs-ico"><BsIcon name={icon} /></span>
            <span>
              <b>{value}</b>
              <small>{label}</small>
            </span>
          </Link>
        ))}
      </div>

      <section className="bs-panel">
        <div className="bs-panel-h">
          <h2><BsIcon name="bell" size={20} /> Dernières notifications</h2>
        </div>
        {items.length ? (
          <ul className="bs-notifs">
            {items.map((i) => (
              <li key={i.id}>
                <Link href={i.href}>
                  <span className="bs-notif-av" aria-hidden="true">{i.icon ? <BsIcon name="filePen" size={18} /> : i.badge}</span>
                  <span className="bs-notif-tx">
                    <b>{i.title}</b>
                    <small>{i.sub}</small>
                  </span>
                  <span className="bs-notif-lk">{i.action}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="bs-empty">Pas de notification.</p>
        )}
      </section>
    </div>
  );
}
