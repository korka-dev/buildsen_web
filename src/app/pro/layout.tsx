import { requirePro } from "@/lib/api";
import { CLIENTS_OPEN, SHOW_PRICING } from "@/lib/constants";
import { Logo, companyInitials, initials } from "@/components/ui";
import { AppNav, type AppNavItem } from "@/components/bs/AppNav";
import { AccountMenu } from "@/components/bs/AccountMenu";

// Espace professionnel : même cadre que l'espace particulier. Menu à icônes à gauche (alertes rouges pour ce qui attend une réponse),
// compte en bas ; sur téléphone, logo en haut et barre d'onglets en bas.
export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const { user, pro, notifs } = await requirePro();
  const badge = pro.companyName ? companyInitials(pro.companyName) : initials(user.firstName, user.lastName);
  const name = pro.companyName ?? `${user.firstName} ${user.lastName}`;
  // Ce qui attend une réponse : nouvelles demandes et messages de clients non lus
  const verified = pro.state === "VERIFIED";
  // Action attendue de la part du professionnel : dossier à compléter, complément demandé, dossier refusé
  const dossierAlert = pro.state === "DRAFT" || pro.state === "MORE" || pro.state === "REFUSED" ? 1 : 0;
  const waiting = (notifs?.newRequests ?? 0) + (notifs?.unread ?? 0);
  // Fin d'abonnement : bannière à 7 jours de l'échéance, puis pendant les 2 jours de grâce
  const days = pro.activePlan !== "FREE" && pro.planUntil ? Math.ceil((new Date(pro.planUntil).getTime() - Date.now()) / 86_400_000) : null;
  const banner = !SHOW_PRICING || days === null || days > 7 ? null
    : days > 0 ? `Votre formule se termine dans ${days} jour${days > 1 ? "s" : ""}. Renouvelez pour garder vos contacts.`
    : "Votre formule est terminée : renouvelez dans les 2 jours pour ne pas repasser en formule Gratuite.";
  const items: AppNavItem[] = [
    { href: "/pro", label: "Tableau de bord", short: "Accueil", icon: "home", exact: true },
    // Tant que le profil n'est pas vérifié, « Demandes » est remplacé par « Vérification » (alerte sur l'évolution du dossier)
    ...(!verified
      ? ([{ href: "/pro/verification", label: "Vérification", short: "Vérification", icon: "shield", count: dossierAlert, alert: true }] as AppNavItem[])
      : CLIENTS_OPEN ? ([{ href: "/pro/demandes", label: "Demandes", icon: "list", count: waiting, alert: true }] as AppNavItem[]) : []),
    { href: "/pro/compte", label: "Mon compte", short: "Compte", icon: "user" },
    ...(SHOW_PRICING ? ([{ href: "/pro/abonnement", label: "Abonnement", short: "Formule", icon: "briefcase", count: banner ? 1 : 0, alert: true }] as AppNavItem[]) : []),
  ];
  return (
    <div className="bs-app">
      <header className="bs-m-hdr"><Logo href="/pro" /></header>
      <div className="bs-app-body">
        <aside className="bs-side">
          <div className="bs-side-top"><Logo href="/pro" /></div>
          <AppNav label="Menu de l'espace professionnel" items={items} />
          <div className="bs-side-bottom">
            <AccountMenu name={name} initials={badge} role="Espace professionnel" />
          </div>
        </aside>
        <main id="contenu" tabIndex={-1} className="bs-app-main">
          {banner && <a href="/pro/abonnement" className="note" style={{ display: "block", margin: "12px 16px 0", fontWeight: 600 }}>{banner}</a>}
          {children}
        </main>
      </div>
    </div>
  );
}
