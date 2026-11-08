# Mise en ligne de BUILDSEN : liste à suivre

> **Hébergement retenu : AWS EC2 avec Docker.** Suivre `DEPLOIEMENT-EC2.md` : Supabase et Neon ne sont plus nécessaires (fichiers sur disque, base PostgreSQL dans Docker). Ce document garde la liste des essais et le détail des paiements.

Tout le reste est développé et vérifié en local (`./scripts/verifier.sh` doit afficher « TOUT EST VERT »).
Il ne reste que les **comptes et clés** à brancher, puis la bascule. Ordre conseillé : chaque étape peut être testée avant la suivante.

## A. Comptes à obtenir (vous)
| Quoi | Pour quoi | Où |
|---|---|---|
| Meta Business + application WhatsApp, numéro dédié, nom « BuildSen » vérifié | Assistant WhatsApp réel | `WHATSAPP.md` sections 2 à 5 |
| 3 messages modèles approuvés par Meta | Alertes hors fenêtre de 24 h | `WHATSAPP.md` section 4 |
| Compte marchand PayDunya (Wave, Orange Money) | Paiement des formules | `WHATSAPP.md` section 11 |
| Clé Soynade neuve | Voix en wolof (la clé actuelle a été partagée : la remplacer) | console.soynade.ai |
| Hébergeur de conteneurs (Render, Railway, Fly…) + Vercel | Backend et site | `README.md` section 5 |

## B. Variables du backend (production)
```
ENVIRONMENT=production            # cookies sécurisés, simulateurs désactivés d'office
DATABASE_URL=<Neon>               # branche de test d'abord
APP_URL=https://www.buildsen.com
ALLOWED_ORIGINS=https://www.buildsen.com,https://buildsen.com
WHATSAPP_PROVIDER=meta            # + WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN, WHATSAPP_BOT_NUMBER
PLANS_ENABLED=true                # active les limites de contacts et le paiement
PAYMENT_PROVIDER=paydunya         # + PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN, PAYDUNYA_MODE=test puis live
SOYNADE_API_KEY=<nouvelle clé>
CRON_SECRET, INTERNAL_API_KEY, RESEND_API_KEY, SUPABASE_*    # déjà existants
```
Frontend : `BACKEND_URL=<adresse de l'API>` et, **au build**, `NEXT_PUBLIC_SHOW_PRICING=true` (doit correspondre à `PLANS_ENABLED`).
En production le simulateur WhatsApp et la page de paiement de test renvoient 404, même si on laisse `sim` par erreur.

### Garde-fous de démarrage
En production, l'API **refuse de démarrer** (message clair dans les journaux) si : `CRON_SECRET` ou `INTERNAL_API_KEY` font moins de 16 caractères, `ALLOWED_ORIGINS` ou `APP_URL`
ne sont pas en `https://`, ou `ADMIN_DEV_CODE` / `ADMIN_DEV_PASSWORD` sont définis. Ajouter `PROXY_HOPS` (1 par défaut ; 2 s'il y a un répartiteur de charge devant l'API) :
après le premier déploiement, vérifier dans le journal d'audit ou une limite de débit que l'adresse lue est bien celle du visiteur et non celle d'un relais.

### Clés à changer avant la mise en ligne
Les clés de production ont été visibles dans des échanges et sur le poste de développement : **changer** le mot de passe Neon, la clé secrète Supabase, la clé Resend, la clé Soynade,
`CRON_SECRET` et `INTERNAL_API_KEY` (valeurs longues et aléatoires, différentes de celles du développement).

## C. Base de données (une seule fois, sur une branche Neon d'abord)
```bash
DATABASE_URL="<Neon>" alembic stamp 0001      # la base existante est déjà au point 0001
DATABASE_URL="<Neon>" alembic upgrade head    # ajoute seulement les nouvelles tables : WaSession, WaMessage, WaCode, AppSetting, Payment
```
Les migrations 0002 et 0003 **ne modifient aucune table existante** : elles ne font qu'en ajouter. Sans ces deux commandes, l'assistant et le paiement ne peuvent pas fonctionner.

## D. Tâches planifiées (chez l'hébergeur)
- Toutes les 10 minutes : `GET /api/cron/alertes` (alertes différées des formules gratuites, et rappels de fin de formule 3 jours avant l'échéance, une seule fois par échéance).
- Chaque jour : `GET /api/cron/nettoyage` (journal WhatsApp de plus de 90 jours).
Les deux avec l'en-tête `Authorization: Bearer <CRON_SECRET>`.

## E. Branchements chez les fournisseurs
1. **Meta** : webhook `https://<api>/api/wa/webhook` + jeton de vérification ; abonner le champ « messages ».
2. **PayDunya** : adresse de notification `https://<api>/api/payments/webhook/paydunya`.
3. Les deux adresses doivent être publiques (https) : le site n'a pas besoin d'être en ligne pour les tester, un tunnel suffit.

## F. Essais dans l'ordre (sur l'environnement de test, avec de vrais comptes)
1. WhatsApp : écrire « Bonjour » au numéro, créer un compte, décrire un projet par écrit puis en vocal.
2. Un professionnel de test reçoit l'alerte, répond ; le client reçoit, partage son numéro.
3. Code de connexion reçu sur WhatsApp, puis connexion au site.
4. Formule Gratuite : 3 contacts, puis refus et lien de paiement ; paiement PayDunya **en mode test** ; la formule s'active.
5. Basculer `PAYDUNYA_MODE=live` avec les vraies clés, faire un vrai paiement de 1 mois, puis vérifier la page admin « Paiements ».
6. Interrupteur d'urgence de l'assistant : la page d'administration a été retirée ; il reste disponible par l'API (`POST /api/admin/whatsapp/enabled`, rôle Support ou Modérateur).

## G. Juridique et contenu avant l'ouverture
- Raison sociale et adresse dans la politique de confidentialité (« à compléter » aujourd'hui) ; CGU relues par un juriste (formules, remboursement, WhatsApp).
- Wolof de l'assistant relu par un locuteur natif.
- Prix et limites (3 / 15 / illimité) validés : `backend/app/rules.py` et `frontend/src/lib/constants.ts`.

## H. Bascule
Garder la version 1 en ligne jusqu'à la fin de la liste F. Puis déployer le frontend et l'API v2, vérifier `GET /api/health`, et surveiller `/admin/paiements` les premiers jours.
**Retour arrière** : remettre le frontend v1 ; les nouvelles tables sont ignorées par la v1. `PLANS_ENABLED=false` (puis redémarrage de l'API) supprime toute limite et tout paiement ; pour masquer aussi les formules sur le site, reconstruire avec `NEXT_PUBLIC_SHOW_PRICING=false`. Le coupe-circuit WhatsApp est dans l'administration.


## Paiement Wave (lien de paiement)

- `PAYMENT_PROVIDER=wave`, `WAVE_PAY_LINK=https://pay.wave.com/m/…/c/sn/`, `WAVE_WEBHOOK_SECRET=<long secret aléatoire>`, `WAVE_GRACE_HOURS=24`.
- Parcours : le professionnel confirme la formule, la durée et le montant, paie sur Wave (montant ajouté au lien), touche « J'ai payé » : la formule s'active **tout de suite** (une fois par période de 30 jours). Le paiement est ensuite confirmé **sans administrateur** quand l'avis de paiement arrive sur `POST /api/payments/webhook/wave` avec l'en-tête `X-Webhook-Secret` et le corps JSON `{"amount": 5000, "phone": "+221…", "reference": "…"}` (`phone` et `reference` facultatifs). Un seul paiement doit correspondre (montant, numéro) ; une même référence ne compte qu'une fois.
- Sans confirmation avant `WAVE_GRACE_HOURS`, la tâche planifiée `/api/cron/alertes` retire la formule provisoire ; si le paiement arrive ensuite (72 h), il l'active quand même. L'équipe ne traite que les exceptions (Administration → Paiements : Confirmer / Refuser) et fixe les tarifs (« Modifier les tarifs », rôle super-administrateur).
- **À vérifier avec un vrai paiement** : que Wave accepte `?amount=` sur ce lien, et comment recevoir l'avis de paiement (API Wave Checkout avec clé, ou redirection automatique des SMS de confirmation vers le webhook). Sans cet avis, l'équipe confirme à la main.
- Test local : `PAYMENT_PROVIDER=wave docker compose up -d`, puis simuler l'avis : `curl -X POST localhost:8000/api/payments/webhook/wave -H 'X-Webhook-Secret: secret-wave-local' -H 'Content-Type: application/json' -d '{"amount":5000}'`.

### Confirmation des paiements Wave sans avis automatique

- Le professionnel paie, indique son numéro Wave et, s'il le peut, l'**identifiant de transaction** de son reçu Wave, puis touche « J'ai payé » : rien n'est activé à ce moment.
- Chaque jour (ou plus), l'équipe ouvre Wave Business > Transactions > Télécharger, puis Administration > Paiements > **Importer l'export Wave** : tous les paiements en attente retrouvés (identifiant de transaction, ou montant + numéro Wave) sont confirmés d'un coup et les pros sont prévenus. Une transaction déjà utilisée n'est jamais comptée deux fois. Le format exact du CSV Wave est à vérifier avec un vrai export (colonnes « Montant » et « Identifiant de transaction » attendues).
- Fin d'abonnement : rappels par e-mail et WhatsApp (bouton « Renouveler ») à 7 jours, 3 jours et à l'échéance, puis **2 jours de grâce** avant le retour en formule Gratuite ; bannière dans l'espace pro. Les rappels partent depuis `/api/cron/alertes` (appel planifié avec `CRON_SECRET`).

### Orange Money (lien marchand)

- `PAYMENT_PROVIDER=links`, `OM_PAY_LINK=https://sugu.orange-sonatel.com/mp/…`, `OM_WEBHOOK_SECRET` (à défaut, le secret Wave). Avec les deux liens renseignés, le client choisit Wave ou Orange Money (site et WhatsApp).
- Le lien Orange Money **ne contient pas le montant** : le client le saisit, BUILDSEN le lui affiche. Même confirmation que Wave : avis `POST /api/payments/webhook/om`, ou import de l'export (choisir « Orange Money » dans la fenêtre d'import), ou clic de l'équipe. Format de l'export Orange Money à vérifier avec un vrai fichier.
- Le nom affiché au client sur la page Orange Money est celui du marchand (message reçu : « ASTOU »), pas « BUILDSEN » : à faire modifier côté Orange si possible, pour inspirer confiance.

## Nouveautés à prévoir avant la mise en ligne

- **Stockage** : créer le dossier privé `demandes` dans Supabase Storage (photos du terrain, 8 Mo, images uniquement), comme `justificatifs` et `portfolios`.
- **Migrations** : 0004 (avis), 0005 (photo des demandes), 0006 (statut Architecte). Elles s'appliquent au démarrage de l'API (`alembic upgrade head`) et n'effacent rien.
- **Tâche planifiée** : `/api/cron/alertes` toutes les 10 minutes avec `CRON_SECRET` (alertes différées des comptes gratuits, rappels aux pros Pro et Premium, rappels de fin d'abonnement).
- **Règles par formule** : gros budgets (`BIG_BUDGET` dans `rules.py`, 5 000 000 FCFA) réservés aux abonnés ; Premium « en vedette » ; remise annuelle `YEAR_DISCOUNT`.
- **Paiements** : `PAYMENT_PROVIDER=links` avec `WAVE_PAY_LINK`, `OM_PAY_LINK` et un `WAVE_WEBHOOK_SECRET` long et aléatoire.

## Organisation du code (paiements)

- `services/pay/service.py` : limites de contacts, prix, état de l'abonnement, création et règlement d'un paiement chez un fournisseur.
- `services/pay/manual.py` : paiements par lien marchand (« J'ai payé », avis reçu, décision de l'équipe, activation provisoire facultative).
- `services/pay/exports.py` : import de l'export de transactions Wave ou Orange Money.
- `services/pay/renewal.py` : rappels de fin d'abonnement. `services/pay/provider.py` : fournisseurs. `services/reviews.py` : avis.
