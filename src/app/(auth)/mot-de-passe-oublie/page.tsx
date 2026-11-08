import Link from "next/link";
import { PublicHeader } from "@/components/ui";
import { ForgotForm } from "../forms";

export const metadata = { title: "Mot de passe oublié · BUILDSEN" };

export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1} className="narrow">
        <div className="card stack" style={{ gap: 18, padding: 30 }}>
          <h1>Mot de passe oublié</h1>
          <p className="muted">Indiquez votre adresse e-mail. Nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
          <ForgotForm />
          <Link className="small" href="/connexion">Retour à la connexion</Link>
        </div>
      </main>
    </>
  );
}
