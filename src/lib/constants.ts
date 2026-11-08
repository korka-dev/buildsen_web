// Règles métier de l'étape 1 (voir docs/DECISIONS-LANCEMENT.md)

export const STATUTS = {
  // Architecte : l'inscription à l'Ordre des architectes est contrôlée par l'équipe (attestation demandée)
  ARCH: {
    name: "Architecte",
    nameF: "Architecte",
    scope: "Plans architecturaux, permis de construire et tout type de demande, hors études de structure",
    docs: ["ID", "DIPLOME", "ORDRE"],
    optional: ["EXPERIENCE"],
  },
  ING: {
    name: "Ingénieur en génie civil",
    nameF: "Ingénieure en génie civil",
    scope: "Tout type de demande, y compris les études de structure",
    docs: ["ID", "DIPLOME"],
    optional: ["EXPERIENCE"],
  },
  TECH: {
    name: "Technicien supérieur ou dessinateur-projeteur",
    nameF: "Technicienne supérieure ou dessinatrice-projeteuse",
    scope: "Plans, métrés et DAO de projets de moins de 5 étages",
    docs: ["ID", "DIPLOME"],
    optional: ["EXPERIENCE"],
  },
  // Entreprise du secteur : les études de structure restent sous la responsabilité d'un ingénieur diplômé
  ENT: {
    name: "Entreprise",
    nameF: "Entreprise",
    scope: "Tout type de demande, y compris les études de structure, sous la responsabilité d'un ingénieur",
    docs: ["NINEA", "RCCM", "ID_GERANT", "DIPLOME_RT"],
    optional: [],
  },
} as const;

export type StatutKey = keyof typeof STATUTS;

// Justificatifs acceptés pour un statut : obligatoires puis facultatifs
export const allDocs = (s: StatutKey): string[] => [...STATUTS[s].docs, ...STATUTS[s].optional];
// Statut pas encore choisi : pièce d'identité et diplôme, comme pour un professionnel individuel
export const docsFor = (s: string | null | undefined): string[] => allDocs(s && s in STATUTS ? (s as StatutKey) : "TECH");
export const requiredDocs = (s: string | null | undefined): readonly string[] => STATUTS[s && s in STATUTS ? (s as StatutKey) : "TECH"].docs;

export const DOC_TYPES: Record<string, string> = {
  ID: "Pièce d'identité",
  DIPLOME: "Diplôme ou titre professionnel",
  EXPERIENCE: "Attestation d'expérience",
  NINEA: "NINEA",
  RCCM: "Registre du commerce (RCCM)",
  ID_GERANT: "Pièce d'identité du gérant",
  DIPLOME_RT: "Diplôme d'ingénieur du responsable technique",
  ORDRE: "Attestation d'inscription à l'Ordre des architectes",
};

// Statuts autorisés à proposer des études de structure
export const canDoStudies = (s: string | null | undefined) => s === "ING" || s === "ENT";

export const SPECIALTIES: Record<string, string> = {
  plans: "Plans et conception",
  metres: "Devis et métrés",
  dao: "DAO et dessin technique",
  etudes: "Études techniques",
};

export const COMMUNES = [
  "Dakar-Plateau", "Médina", "Fann-Point E-Amitié", "Mermoz-Sacré-Cœur", "Ouakam", "Ngor", "Yoff",
  "Parcelles Assainies", "Grand Yoff", "HLM", "Pikine", "Guédiawaye", "Keur Massar", "Rufisque",
  "Diamniadio", "Autre commune",
];

// Contact de l'équipe : le bouton ouvre directement une discussion WhatsApp avec un message prérempli
export const SUPPORT_WHATSAPP = "221761593003";
export const SUPPORT_WHATSAPP_DISPLAY = "76 159 30 03";
export const whatsappLink = (text = "Bonjour BUILDSEN, j'ai une question sur mon inscription.") =>
  `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`;

// Ouverture prévue de la plateforme aux particuliers
export const OPENING = "décembre 2026";

// Ouverture aux particuliers : ouverte le 18/10/2026. Mettre false referme l'inscription et le dépôt de demandes des particuliers.
export const CLIENTS_OPEN = true;

// Demandes des particuliers
export const CATEGORIES: Record<string, { name: string; short: string; items: string[]; regulated?: boolean }> = {
  plans: { name: "Plans et conception", short: "Plans architecturaux, permis de construire, modification, 2D, 3D, aménagement intérieur.", items: ["Plan architectural", "Dossier de permis de construire", "Conception de plans de maisons", "Modification de plans existants", "Réaménagement de plans", "Mise au propre de plans papier ou numériques", "Plans 2D", "Modélisation 3D", "Plans d'aménagement intérieur"] },
  metres: { name: "Devis et métrés", short: "Métrés, quantitatifs, DQE, bordereaux de prix et estimation du coût.", items: ["Métré des ouvrages", "Quantitatifs de matériaux", "Devis quantitatifs et estimatifs (DQE)", "Bordereaux de prix", "Estimation du coût de construction", "Décomposition des coûts par lot"] },
  dao: { name: "DAO et dessin technique", short: "Dessin AutoCAD, reproduction numérique et mise en page de plans.", items: ["Dessin sur AutoCAD", "Reproduction numérique de plans", "Mise en page de documents techniques", "Préparation de plans numériques"] },
  etudes: { name: "Études techniques", short: "Structure, béton armé, notes de calcul, coffrage et ferraillage.", items: ["Études de structure", "Plans de béton armé", "Notes de calcul", "Plans de coffrage", "Plans de ferraillage"], regulated: true },
};
export const BUILDING_TYPES = ["Maison individuelle (plain-pied)", "Maison individuelle (R+1 ou plus)", "Immeuble d'habitation", "Local commercial ou bureaux", "Extension ou surélévation", "Aménagement intérieur", "Autre"];
export const PHASES = ["Pas encore de terrain", "Terrain acheté, travaux non commencés", "Travaux déjà commencés", "Bâtiment existant à modifier"];
export const LEVELS = ["Plain-pied", "R+1", "R+2", "R+3", "R+4 ou plus"];
export const DEADLINES = ["Dès que possible", "Sous 2 semaines", "Sous 1 mois", "Sous 2 mois", "Pas de contrainte"];
export const MIN_BUDGET = 10000;
export const REQUEST_LABELS: Record<string, [string, string]> = {
  PENDING: ["En attente", "warn"],
  PUBLISHED: ["Publiée", "ok"],
  REJECTED: ["Retirée", "err"],
  CLOSED: ["Clôturée", ""],
};

// Un professionnel vérifié voit une demande si son statut le permet :
// études de structure réservées aux ingénieurs et entreprises, projets de 5 niveaux ou plus exclus pour les techniciens
export const proCanSee = (statut: string | null | undefined, r: { category: string; levels: string | null }) =>
  !!statut && (r.category !== "etudes" || canDoStudies(statut)) && !(statut === "TECH" && r.levels === "R+4 ou plus");

// Boîte de l'équipe pour les notifications d'activité (inscriptions, dossiers, demandes, signalements).
// Cloudflare la renvoie vers la boîte personnelle de la fondatrice.
export const TEAM_INBOX = "contact@buildsen.com";

// Délai d'examen annoncé aux professionnels
export const REVIEW_DELAY = "5 jours ouvrés";

// Modèle de rémunération (abonnements, d'après le cahier des charges d'Amadou Korka Diallo) : le particulier est gratuit,
// le professionnel choisit sa formule. Masqué sur le site et dans les e-mails tant que SHOW_PRICING vaut false.
export const SHOW_PRICING = process.env.NEXT_PUBLIC_SHOW_PRICING === "true";

// Formules actives (avantages réels Pro / Premium, dont le délai de 48 h des alertes en formule gratuite).
// Tant que le paiement n'est pas en place, elles sont inactives : tous les professionnels vérifiés sont traités de la même façon.
export const PLANS_ACTIVE = SHOW_PRICING;

export type PlanKey = "FREE" | "PRO" | "PREMIUM";
export const PLANS: Record<PlanKey, { name: string; price: number; contacts: number | null; delayHours: number; perks: string[] }> = {
  FREE: { name: "Gratuit", price: 0, contacts: 3, delayHours: 48, perks: ["3 contacts par mois", "Nouvelles demandes signalées après 48 h"] },
  PRO: { name: "Pro", price: 5000, contacts: 15, delayHours: 0, perks: ["15 contacts par mois", "Nouvelles demandes signalées tout de suite, par e-mail et WhatsApp"] },
  PREMIUM: { name: "Premium", price: 15000, contacts: null, delayHours: 0, perks: ["Contacts illimités", "Nouvelles demandes signalées tout de suite, par e-mail et WhatsApp"] },
};

// Chaque demande ne peut être prise en charge que par 5 professionnels au maximum
export const MAX_PROS_PER_REQUEST = 5;

// Offre de lancement : les 50 premiers professionnels vérifiés ont 3 mois de formule Pro offerts
export const LAUNCH_OFFER = { firstPros: 50, months: 3, plan: "PRO" as PlanKey };

// Statut du terrain demandé dans le formulaire de demande des particuliers
export const TERRAIN_STATUS = ["Titre foncier", "Bail", "Délibération", "Je ne sais pas"];

// Ancien modèle (crédits par réponse), conservé pour mémoire : non utilisé
export const CREDITS = { welcome: 5, perReply: 1, validityMonths: 12, price: 500 };
export const PACKS: [number, number][] = [[10, 4750], [25, 11000], [50, 20000]];

export const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " FCFA";

// Portfolio facultatif pour soumettre le dossier (recommandé pour être choisi par les clients)
export const MIN_PORTFOLIO = 0;

export const UPLOADS = {
  credential: {
    bucket: "justificatifs",
    maxBytes: 10 * 1024 * 1024,
    mimes: ["application/pdf", "image/jpeg", "image/png"],
  },
  portfolio: {
    bucket: "portfolios",
    maxBytes: 10 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  },
} as const;

export const ADMIN_ROLES: Record<string, string> = {
  SUPER: "Super-admin",
  VERIF: "Vérificateur",
  SUPPORT: "Support",
  MODER: "Modérateur",
};

export const DOSSIER_LABELS: Record<string, [string, string]> = {
  DRAFT: ["Dossier à compléter", ""],
  PENDING: ["En attente de vérification", "warn"],
  MORE: ["Complément demandé", "warn"],
  VERIFIED: ["Profil vérifié", "ok"],
  REFUSED: ["Dossier refusé", "err"],
};

// Dossier complet : statut, formation et diplôme renseignés, justificatifs obligatoires envoyés et non refusés
export const dossierComplete = (p: { statut: string | null; school: string | null; diploma: string | null; credentials: { type: string; state: string }[] }) =>
  !!p.statut && p.statut in STATUTS && !!p.school && !!p.diploma &&
  STATUTS[p.statut as StatutKey].docs.every((d) => p.credentials.some((c) => c.type === d && c.state !== "REFUSED"));

// Prochaine étape du dossier d'un professionnel non vérifié, affichée sur son accueil et son espace pro
export function dossierNext(p: Parameters<typeof dossierComplete>[0] & { state: string; decisionReason?: string | null }): { title: string; text: string; cta?: string } | null {
  if (p.state === "VERIFIED" || p.state === "REFUSED") return null;
  if (p.state === "PENDING") return { title: "Votre dossier est en cours d'examen", text: `L'équipe BUILDSEN l'examine sous ${REVIEW_DELAY}. Votre profil sera visible par les clients dès qu'il sera vérifié : vous serez prévenu par e-mail.` };
  const more = p.state === "MORE" && p.decisionReason ? ` Complément demandé : ${p.decisionReason}` : "";
  if (!p.statut || !p.school || !p.diploma)
    return { title: "Étape 1 sur 3 : vos informations", text: "Votre profil n'est pas encore visible. Choisissez votre statut, puis indiquez votre formation et votre diplôme." + more, cta: "Compléter mon dossier" };
  const missing = STATUTS[p.statut as StatutKey].docs.filter((d) => !p.credentials.some((c) => c.type === d && c.state !== "REFUSED"));
  if (missing.length)
    return { title: "Étape 2 sur 3 : vos justificatifs", text: `Votre profil n'est pas encore visible. Il manque : ${missing.map((d) => DOC_TYPES[d].toLowerCase()).join(", ")}. Une photo nette prise au téléphone suffit.` + more, cta: "Envoyer mes documents" };
  return { title: "Étape 3 sur 3 : soumettez votre dossier", text: "Tout est prêt : il ne reste qu'à cliquer sur « Soumettre mon dossier pour vérification »." + more, cta: "Soumettre mon dossier" };
}

// L'équipe peut décider sur un dossier soumis, ou sur un dossier complet que le professionnel a oublié de soumettre
export const canDecide = (p: Parameters<typeof dossierComplete>[0] & { state: string }) =>
  p.state === "PENDING" || ((p.state === "DRAFT" || p.state === "MORE") && dossierComplete(p));

// Affiche un numéro sénégalais au format « 77 123 45 67 » (avec « +221 » s'il a été saisi)
export function formatPhone(raw: string | null | undefined) {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  const local = d.length === 12 && d.startsWith("221") ? d.slice(3) : d;
  if (local.length !== 9) return raw;
  const f = `${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  return local === d ? f : `+221 ${f}`;
}
