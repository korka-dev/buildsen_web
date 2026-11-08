import Link from "next/link";
import type { Me } from "@/lib/types";
import { Logo } from "./ui";
import { Icon } from "./Icons";
import { NotificationCenter } from "./NotificationCenter";
import { LogoutButton } from "./ActionButton";

// En-tête des utilisateurs connectés sur l'accueil commun et les fiches : accès à son espace en haut à gauche
export function MemberHeader({ me }: { me: Me }) {
  const client = me.user?.role === "CLIENT";
  return (
    <header className="hdr">
      <div className="hdr-in">
        <Link className="space-btn" href={client ? "/espace" : "/pro"}>
          <Icon name={client ? "demandes" : "pro"} />
          <span>{client ? "Mes demandes" : <><span className="hide-m">Mon espace pro</span><span className="only-m">Espace pro</span></>}</span>
        </Link>
        <Logo href="/accueil" />
        <div className="hdr-act">
          {me.notifs && <NotificationCenter n={me.notifs} />}
          <Link className={`btn ${client ? "p" : "g"} sm hide-m`} href={client ? "/espace/demandes/nouvelle" : "/pro/demandes"}>{client ? "Décrire mon projet" : "Voir les demandes"}</Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
