import Link from "next/link";
import { requireClient } from "@/lib/api";
import { CLIENTS_OPEN } from "@/lib/constants";
import { RequestForm, ResendVerification } from "../../forms";

export const metadata = { title: "Décrire mon projet · BUILDSEN" };

export default async function NewRequest() {
  const { user } = await requireClient();
  return (
    <>
      <div className="bs-page-h"><div><h1>Nouvelle demande</h1><p>Gratuit, environ 3 minutes.</p></div></div>
      <div className="bs-panel" style={{ maxWidth: 860 }}>
        {!CLIENTS_OPEN ? (
          <div className="note">Le dépôt de demandes ouvrira très bientôt.</div>
        ) : !user.emailVerifiedAt ? (
          <div className="note w stack" style={{ gap: 10 }}>
            <span><b>Confirmez d&apos;abord votre adresse e-mail</b> avec le lien envoyé à <b>{user.email}</b>.</span>
            <ResendVerification />
            <Link className="small" href="/espace/demandes">Retour à mes demandes</Link>
          </div>
        ) : (
          <RequestForm />
        )}
      </div>
    </>
  );
}
