import Link from "next/link";
import { api, requireClient } from "@/lib/api";
import type { HomeData, ServiceRequest } from "@/lib/types";
import { BsIcon, type BsIconName } from "@/components/bs/icons";
import { ResendVerification } from "./forms";
import { PromoCarousel } from "./PromoCarousel";
import { WhatsAppCard } from "@/components/bs/WhatsAppButton";

export const metadata = { title: "Tableau de bord · BUILDSEN" };

const LAST_NOTIFS = 3;

// Tableau de bord du particulier : bienvenue, chiffres clés, 3 dernières notifications
export default async function ClientDashboard() {
  const [{ user, notifs }, { requests }, home] = await Promise.all([
    requireClient(),
    api<{ requests: ServiceRequest[] }>("/api/client/requests"),
    api<HomeData>("/api/public/home"),
  ]);
  const open = requests.filter((r) => r.state === "PUBLISHED" || r.state === "PENDING").length;
  const pros = requests.reduce((n, r) => n + (r.conversations ?? 0), 0);
  const kpis: [BsIconName, number, string][] = [
    ["list", open, open > 1 ? "Demandes en cours" : "Demande en cours"],
    ["user", pros, pros > 1 ? "Professionnels vous ont écrit" : "Professionnel vous a écrit"],
    ["filePen", requests.length, requests.length > 1 ? "Demandes au total" : "Demande au total"],
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

      {!user.emailVerifiedAt && (
        <div className="note w stack" style={{ gap: 10 }}>
          <span><b>Confirmez votre adresse e-mail</b> pour publier une demande. Nous avons envoyé un lien à <b>{user.email}</b> (pensez à vérifier les courriers indésirables).</span>
          <ResendVerification />
        </div>
      )}

      <div className="bs-stats-row">
        {kpis.map(([icon, value, label]) => (
          <Link key={label} href="/espace/demandes" className="bs-stat">
            <span className="bs-ico"><BsIcon name={icon} /></span>
            <span>
              <b>{value}</b>
              <small>{label}</small>
            </span>
          </Link>
        ))}
      </div>

      <WhatsAppCard />

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

      {/* Espace d'annonces, sur téléphone uniquement */}
      <PromoCarousel ads={home.ads ?? []} email={user.email} verified={!!user.emailVerifiedAt} />
    </div>
  );
}
