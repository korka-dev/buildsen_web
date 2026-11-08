import { SHOW_PRICING } from "@/lib/constants";
import { requireAdmin } from "@/lib/api";
import { Logo, initials } from "@/components/ui";
import { AppNav, type AppNavItem } from "@/components/bs/AppNav";
import { AccountMenu } from "@/components/bs/AccountMenu";

// Administration : même cadre que les espaces particulier et professionnel (menu à icônes, compte en bas, onglets sur téléphone).
// Modules visibles selon le rôle ; chaque appel de l'API revérifie le rôle côté serveur.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, roleLabel, counts, clientsOpen } = await requireAdmin();
  const can = (...r: string[]) => admin.adminRole === "SUPER" || r.includes(admin.adminRole);
  const items: AppNavItem[] = [{ href: "/admin", label: "Vue d'ensemble", short: "Accueil", icon: "home", exact: true }];
  if (can("VERIF")) items.push({ href: "/admin/dossiers", label: "Dossiers", short: "Dossiers", icon: "shield", count: counts.dossiers, alert: true });
  if (can("MODER") && (clientsOpen || counts.requests)) items.push({ href: "/admin/demandes", label: "Demandes", icon: "list", count: counts.requests, alert: true });
  if (can("MODER", "SUPPORT") && (clientsOpen || counts.reports)) items.push({ href: "/admin/signalements", label: "Signalements", short: "Alertes", icon: "flag", count: counts.reports, alert: true });
  if (can("MODER", "SUPPORT")) items.push({ href: "/admin/avis", label: "Avis", icon: "messages", tab: false });
  if (can("VERIF", "SUPPORT")) items.push({ href: "/admin/utilisateurs", label: "Utilisateurs", short: "Comptes", icon: "user" });
  // Les modules suivants restent dans le menu latéral (la barre du téléphone garde cinq onglets)
  if (SHOW_PRICING && can("SUPPORT")) items.push({ href: "/admin/paiements", label: "Paiements", icon: "briefcase", tab: false });
  if (can()) items.push({ href: "/admin/equipe", label: "Équipe", icon: "columns", tab: false });
  items.push({ href: "/admin/journal", label: "Journal d'audit", icon: "filePen", tab: false });
  const name = `${admin.firstName} ${admin.lastName}`;
  return (
    <div className="bs-app">
      <header className="bs-m-hdr"><Logo href="/admin" /></header>
      <div className="bs-app-body">
        <aside className="bs-side">
          <div className="bs-side-top"><Logo href="/admin" /></div>
          <AppNav label="Modules d'administration" items={items} />
          <div className="bs-side-bottom">
            <AccountMenu name={name} initials={initials(admin.firstName, admin.lastName)} role={roleLabel} logoutPath="/api/admin/logout" />
          </div>
        </aside>
        <main id="contenu" tabIndex={-1} className="bs-app-main">{children}</main>
      </div>
    </div>
  );
}
