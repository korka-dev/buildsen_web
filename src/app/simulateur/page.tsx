import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRaw } from "@/lib/api";
import { Playground } from "./Playground";
import "./simulateur.css";

export const metadata = { title: "Simulateur WhatsApp · BUILDSEN", robots: { index: false, follow: false } };

// Réservé au développement : le serveur répond 404 dès que le simulateur n'est pas actif (jamais en production)
export default async function SimulatorPage() {
  const { status, data } = await apiRaw<{ simulator: boolean; lanUrl: string }>("/api/wa/info");
  if (status !== 200 || !data.simulator) notFound();
  return (
    <main id="contenu" tabIndex={-1} className="sm">
      <header className="sm-top">
        <div>
          <h1>Simulateur WhatsApp</h1>
          <p>Deux téléphones pour tester l&apos;assistant de bout en bout, sans compte Meta. Rien n&apos;est envoyé à de vrais numéros.</p>
        </div>
        <Link className="btn g sm" href="/">Retour au site</Link>
      </header>
      <details className="sm-help">
        <summary>Tester sur mon téléphone (même réseau Wi-Fi)</summary>
        {data.lanUrl ? (
          <div className="sm-lan">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/wa/qr.svg?target=lan" alt="QR code du simulateur sur le réseau local" width={150} height={150} />
            <p>Scannez ce code avec l&apos;appareil photo du téléphone, ou ouvrez <b>{data.lanUrl}/simulateur</b>. Touchez « Activer les alertes » pour le son et la vibration à chaque message reçu.</p>
          </div>
        ) : (
          <p>Dans un terminal, depuis le dossier du projet, lancez <code>./scripts/telephone.sh</code> : il détecte l&apos;adresse de l&apos;ordinateur, l&apos;active et affiche le QR code à scanner. Le téléphone et l&apos;ordinateur doivent être sur le même Wi-Fi.</p>
        )}
      </details>
      <Playground />
      <details className="sm-help">
        <summary>Aide-mémoire</summary>
        <ol>
          <li><b>Écrivez ou touchez les boutons</b> sur les téléphones comme sur WhatsApp ; le micro envoie une note vocale (wolof ou français).</li>
          <li><b>Connexion au site par code</b> : « Se connecter », puis « Recevoir un code sur WhatsApp » avec le numéro d&apos;un téléphone ; le code arrive dans ce téléphone.</li>
          <li>Le champ du numéro et la liste « Comptes… » changent de compte ; « Recommencer » efface la conversation d&apos;un numéro.</li>
          <li>Les liens de paiement ouvrent une page de test (Wave / Orange Money simulés, aucun argent).</li>
        </ol>
      </details>
    </main>
  );
}
