import Link from "next/link";
import { requireClient } from "@/lib/api";
import { dateFr } from "@/lib/market";
import { formatPhone } from "@/lib/constants";
import { initials } from "@/components/ui";
import { LogoutAction } from "@/components/bs/AccountMenu";
import { BsIcon } from "@/components/bs/icons";
import { PhoneForm, ResendVerification } from "../forms";

export const metadata = { title: "Mon compte · BUILDSEN" };

// Profil du particulier
export default async function Account() {
  const { user } = await requireClient();
  const verified = !!user.emailVerifiedAt;
  return (
    <div className="bs-page bs-centered">
      <h1 className="bs-center-t">Mon compte</h1>
      <section className="bs-profile">
        <span className="bs-avatar bs-avatar-lg" aria-hidden="true">{initials(user.firstName, user.lastName)}</span>
        <div>
          <h2>{user.firstName} {user.lastName}</h2>
          <p>Particulier · inscrit le {dateFr(user.createdAt)}</p>
        </div>
      </section>

      <section className="bs-panel">
        <dl className="bs-info">
          <div>
            <dt><BsIcon name="phone" size={18} /> Téléphone</dt>
            <dd>{formatPhone(user.phone)}<small>Sert à vous connecter. Jamais public : vous choisissez avec qui le partager.</small></dd>
          </div>
          <div>
            <dt><BsIcon name="mail" size={18} /> E-mail</dt>
            <dd>
              {user.email}
              <small className={verified ? "bs-ok" : "bs-todo"}>{verified ? "Adresse confirmée" : "Adresse à confirmer"}</small>
            </dd>
          </div>
        </dl>
        {!verified && <ResendVerification />}
      </section>

      <section className="bs-panel">
        <h2 className="bs-panel-t"><BsIcon name="phone" size={18} /> Changer de numéro</h2>
        <PhoneForm phone={formatPhone(user.phone)} needsPassword={!user.email.endsWith("@wa.buildsen.invalid")} />
      </section>

      <section className="bs-panel">
        <h2 className="bs-panel-t"><BsIcon name="lockKey" size={18} /> Mot de passe</h2>
        <p className="small muted" style={{ margin: 0 }}>Nous vous envoyons un lien par e-mail pour choisir un nouveau mot de passe.</p>
        <Link className="btn g sm" href="/mot-de-passe-oublie" style={{ alignSelf: "flex-start" }}>Changer mon mot de passe</Link>
      </section>

      <div className="bs-logout-m"><LogoutAction name={`${user.firstName} ${user.lastName}`} initials={initials(user.firstName, user.lastName)} role="Espace particulier" /></div>
    </div>
  );
}
