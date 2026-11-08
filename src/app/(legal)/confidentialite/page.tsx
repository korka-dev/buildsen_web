export const metadata = { title: "Politique de confidentialité · BUILDSEN" };

const S: [string, string][] = [
  ["Responsable du traitement", "À compléter après l'immatriculation de l'entreprise (raison sociale, adresse à Dakar)."],
  ["Données collectées", "Identité, adresse e-mail, téléphone ; pour les professionnels : informations professionnelles (formation, diplôme, expérience, entreprise), justificatifs, réalisations du portfolio ; pour les particuliers : demandes déposées (projet, localisation, budget) ; messages échangés dans la messagerie."],
  ["Finalités", "Création et gestion du compte, vérification des qualifications, publication et modération des demandes, mise en relation entre particuliers et professionnels, notifications par e-mail, sécurité de la plateforme et traitement des signalements."],
  ["Partage des coordonnées", "Les coordonnées ne sont jamais publiques. Les professionnels vérifiés, 5 au maximum par demande, écrivent au particulier dans la messagerie BUILDSEN. Le particulier choisit avec qui partager son numéro WhatsApp. Les messages sont conservés pour la sécurité des échanges et ne sont consultés par l'équipe qu'en cas de signalement."],
  ["WhatsApp et notes vocales", "Si vous utilisez l'assistant WhatsApp, votre numéro et le contenu de vos messages sont traités par BUILDSEN et par WhatsApp (Meta), qui transporte les messages. Les notes vocales sont envoyées à un service de reconnaissance vocale (Soynade AI) uniquement pour être comprises, puis ne sont pas conservées par BUILDSEN. Le journal des messages WhatsApp est supprimé automatiquement après 90 jours. Vous pouvez écrire « stop » pour ne plus recevoir d'alertes, et demander la suppression de votre compte à tout moment."],
  ["Paiements", "Les paiements des formules sont effectués chez un prestataire de paiement (Wave, Orange Money). BUILDSEN ne reçoit ni ne conserve vos codes secrets ni vos données bancaires : seulement le montant, la formule et l'état du paiement."],
  ["Protection des justificatifs", "Les pièces d'identité, diplômes et attestations sont stockés en accès privé. Leur consultation est réservée aux vérificateurs habilités et chaque consultation est enregistrée."],
  ["Hébergement", "Application hébergée par Vercel ; base de données Neon et fichiers Supabase, hébergés dans l'Union européenne (Francfort)."],
  ["Durées de conservation", "À définir par catégorie de données, avec suppression ou anonymisation à l'échéance."],
  ["Vos droits", "Accès, rectification, opposition et suppression, conformément à la loi sénégalaise sur la protection des données personnelles et sous le contrôle de la Commission de protection des données personnelles (CDP)."],
];

export default function Page() {
  return (
    <>
      <h1 style={{ fontSize: 34 }}>Politique de confidentialité</h1>
      {S.map(([h, p]) => <div key={h}><h2>{h}</h2><p>{p}</p></div>)}
    </>
  );
}
