import { CLIENTS_OPEN, LAUNCH_OFFER, MAX_PROS_PER_REQUEST, OPENING, PLANS, SHOW_PRICING, fcfa } from "@/lib/constants";

export const metadata = { title: "Conditions générales · BUILDSEN" };

const S: [string, string][] = [
  ["Objet", "BUILDSEN est une plateforme de mise en relation entre des particuliers et des professionnels pour des prestations de conception et d'études en bâtiment. BUILDSEN n'exécute pas les prestations, n'en fixe pas le prix et n'est pas partie au contrat conclu entre le client et le professionnel."],
  ...(CLIENTS_OPEN ? [] : [["Phase pilote", `Pendant la phase pilote, seuls les professionnels peuvent s'inscrire, transmettre leurs justificatifs et compléter leur profil. L'ouverture aux particuliers est prévue en ${OPENING} ; la date exacte sera communiquée par e-mail.`] as [string, string]]),
  ...(!CLIENTS_OPEN ? [] : [
    ["Comptes des particuliers", "L'inscription est gratuite pour les particuliers. L'adresse e-mail doit être confirmée avant le dépôt d'une demande. Le particulier s'engage à fournir des informations exactes et à ne déposer que des demandes réelles."],
    ["Demandes", `Chaque demande indique la prestation recherchée, le projet, le statut du terrain, la localisation, un budget et un délai. Le budget est obligatoire et indicatif : le prix final est convenu avec le professionnel. Chaque demande est publiée dès son dépôt. L'équipe BUILDSEN peut retirer une demande qui ne respecte pas les présentes conditions, notamment sur signalement, en indiquant le motif au client. Le particulier peut clôturer sa demande à tout moment.`],
  ] as [string, string][]),
  ["Professionnels admis", "Ingénieurs en génie civil, techniciens supérieurs et entreprises du secteur. Une entreprise justifie de son NINEA et de son RCCM, et désigne un responsable technique ingénieur en génie civil. Les études de structure sont réservées aux ingénieurs en génie civil et aux entreprises vérifiés. L'ouverture aux étudiants en génie civil est prévue dans un second temps."],
  ["Mise en contact", `${CLIENTS_OPEN ? "Seul un professionnel vérifié" : "Après l'ouverture aux particuliers, le professionnel vérifié"} consulte les demandes et écrit au client dans la messagerie BUILDSEN. Une demande ne peut être prise en charge que par ${MAX_PROS_PER_REQUEST} professionnels au maximum. L'ouverture d'une conversation avec un client compte comme un contact, même si le client ne répond pas. Le client peut ensuite partager son numéro WhatsApp pour poursuivre l'échange. BUILDSEN n'intervient pas dans le contenu des échanges, sauf en cas de signalement.`],
  ["Vérification", "Le badge « vérifié » signifie que les justificatifs fournis ont été examinés à une date donnée ; il ne constitue pas une garantie sur le travail du professionnel. Le professionnel atteste l'exactitude des informations et l'authenticité des documents transmis. Toute fraude entraîne la fermeture du compte."],
  ["Relation entre le client et le professionnel", "Le travail attendu, le prix, le délai, le paiement et la propriété des fichiers sont convenus directement entre le client et le professionnel, sous leur seule responsabilité. BUILDSEN ne garantit ni la qualité, ni la conformité, ni la bonne fin des prestations, et ne répond pas des litiges entre utilisateurs."],
  ...(SHOW_PRICING ? [] : [["Gratuité", CLIENTS_OPEN
    ? "BUILDSEN est gratuit pour les particuliers. Pour les professionnels, l'inscription, la vérification du profil et l'échange avec les clients sont gratuits pendant la période de lancement. Toute évolution des conditions sera communiquée aux professionnels avant son entrée en vigueur."
    : "L'inscription et la vérification du profil sont gratuites pendant la phase pilote. Les conditions applicables après l'ouverture aux particuliers seront communiquées aux professionnels avant leur entrée en vigueur."] as [string, string]]),
  ...(!SHOW_PRICING ? [] : [["Formules des professionnels", `Le particulier utilise BUILDSEN gratuitement. Le professionnel choisit sa formule : Gratuit (3 contacts par mois, nouvelles demandes signalées après 48 heures), Pro (${fcfa(PLANS.PRO.price)} par mois, 15 contacts, alertes immédiates) ou Premium (${fcfa(PLANS.PREMIUM.price)} par mois, contacts illimités). Chaque demande est limitée à ${MAX_PROS_PER_REQUEST} professionnels. Les ${LAUNCH_OFFER.firstPros} premiers professionnels vérifiés bénéficient de ${LAUNCH_OFFER.months} mois de formule Pro offerts. Paiement par Wave ou Orange Money, pour la durée choisie (1, 3 ou 12 mois ; 10 % de remise sur l'abonnement annuel), sans reconduction automatique : la formule prend fin à l'échéance et le professionnel repasse en formule Gratuite. Le badge « vérifié » est gratuit et ne dépend pas de la formule.`] as [string, string]]),
  ["Assistant WhatsApp", "BUILDSEN propose un assistant sur WhatsApp : on peut y créer un compte, décrire un projet (par écrit ou par note vocale, en français ou en wolof), recevoir les alertes et échanger avec l'autre partie. Les mêmes règles s'appliquent que sur le site. Écrire « stop » à l'assistant suspend les alertes, « start » les reprend. Les notes vocales sont transcrites par un service de reconnaissance vocale pour comprendre les réponses ; l'assistant peut se tromper : le récapitulatif est toujours relu avant la publication d'une demande. Un compte créé sur WhatsApp peut se connecter au site avec un code à usage unique reçu sur WhatsApp."],
  ["Contenus publiés", "Le professionnel ne publie dans son portfolio que des travaux dont il est l'auteur ou qu'il a le droit de montrer. Chaque utilisateur est responsable des contenus qu'il publie et des messages qu'il envoie."],
  ["Signalements", "Tout utilisateur peut signaler une conversation, et tout professionnel une demande. Dans le cas d'une conversation signalée, et dans ce cadre uniquement, l'équipe BUILDSEN peut consulter la conversation concernée ; chaque consultation est enregistrée. BUILDSEN traite les abus (fraude, faux profil, harcèlement) mais ne tranche pas les désaccords sur une prestation."],
  ["Modération et sanctions", "BUILDSEN peut refuser ou retirer un contenu, avertir, suspendre ou fermer un compte en cas de fraude, d'abus ou de non-respect des présentes conditions."],
  ["Droit applicable", "Droit sénégalais."],
];

export default function Page() {
  return (
    <>
      <h1 style={{ fontSize: 34 }}>Conditions générales d&apos;utilisation</h1>
      {S.map(([h, p]) => <div key={h}><h2>{h}</h2><p>{p}</p></div>)}
    </>
  );
}
