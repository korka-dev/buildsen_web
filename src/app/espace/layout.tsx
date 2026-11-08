import { requireClient } from "@/lib/api";
import { initials, Logo } from "@/components/ui";
import { AppNav } from "@/components/bs/AppNav";
import { AccountMenu } from "@/components/bs/AccountMenu";

// Espace du particulier : menu à gauche (logo en haut, compte en bas), contenu sur toute la largeur.
// Sur téléphone : logo en haut et barre d'onglets en bas.
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, notifs } = await requireClient();
  const name = `${user.firstName} ${user.lastName}`;
  return (
    <div className="bs-app">
      <header className="bs-m-hdr"><Logo href="/espace" /></header>
      <div className="bs-app-body">
        <aside className="bs-side">
          <div className="bs-side-top"><Logo href="/espace" /></div>
          <AppNav
            label="Menu de l'espace particulier"
            items={[
              { href: "/espace", label: "Tableau de bord", short: "Accueil", icon: "home", exact: true },
              { href: "/espace/demandes", label: "Mes demandes", short: "Demandes", icon: "list" },
              { href: "/espace/validations", label: "Validations", short: "Validées", icon: "circleCheck", count: notifs?.unread ?? 0, alert: true },
              { href: "/espace/compte", label: "Mon compte", short: "Compte", icon: "user" },
            ]}
          />
          <div className="bs-side-bottom">
            <AccountMenu name={name} initials={initials(user.firstName, user.lastName)} role="Espace particulier" />
          </div>
        </aside>
        <main id="contenu" tabIndex={-1} className="bs-app-main">{children}</main>
      </div>
    </div>
  );
}
