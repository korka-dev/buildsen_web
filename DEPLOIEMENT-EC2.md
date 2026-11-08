# Mise en production sur AWS EC2 (Docker)

Une seule machine EC2 fait tourner : **Caddy** (HTTPS automatique), le **site** Next.js, l'**API** FastAPI, **PostgreSQL**, les **tâches planifiées** et le **stockage des fichiers sur disque**. Aucun service externe n'est nécessaire, sauf l'envoi d'e-mails (Resend).
Seuls les ports 80 et 443 sont ouverts ; l'API, la base et les fichiers ne sont jamais exposés directement.

Cette pile a été testée en local (HTTPS, relais de l'API, création de l'administrateur, envoi et lecture signée d'un fichier de 10 Mo, tâches planifiées, webhook Wave, secrets refusés, outils de test désactivés).

## 1. Serveur

- Instance **Ubuntu 24.04**, `t3.small` minimum (2 Go de RAM), disque 30 Go ou plus.
- **Groupe de sécurité** : entrée TCP 80 et 443 depuis partout, 22 (SSH) depuis votre adresse seulement. Rien d'autre.
- **IP élastique** attachée à l'instance, puis un enregistrement DNS `A` : `votre-domaine` et `www.votre-domaine` vers cette IP.
- Installer Docker : `curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker ubuntu` (se reconnecter ensuite).

## 2. Code et réglages

Le site et la configuration Docker sont dans ce dépôt ; l'API est dans un second dépôt, à cloner dans le dossier `backend` :

```bash
git clone git@github.com:korka-dev/buildsen_web.git buildsen && cd buildsen
git clone git@github.com:korka-dev/buildsen_api.git backend
cp .env.prod.example .env.prod && chmod 600 .env.prod
nano .env.prod
```

Pour des dépôts privés, créer sur le serveur une clé en lecture seule (`ssh-keygen -t ed25519`) et l'ajouter comme « Deploy key » (sans écriture) dans chacun des deux dépôts.

À remplir dans `.env.prod` (générer chaque secret avec `openssl rand -hex 24`) :

| Variable | Valeur |
|---|---|
| `DOMAIN`, `APP_URL`, `ALLOWED_ORIGINS` | votre domaine (`https://` pour les deux dernières, sans `/` final) |
| `POSTGRES_PASSWORD`, `CRON_SECRET`, `INTERNAL_API_KEY` | secrets neufs, 16 caractères minimum, **différents** de ceux du local |
| `RESEND_API_KEY`, `EMAIL_FROM` | clé Resend et domaine d'envoi vérifié chez Resend |
| `PAYMENT_PROVIDER=links`, `WAVE_PAY_LINK`, `OM_PAY_LINK` | vos liens marchands |
| `WAVE_WEBHOOK_SECRET`, `OM_WEBHOOK_SECRET` | secrets neufs |
| `WAVE_GRACE_HOURS` | **0** (jamais plus) |
| `WHATSAPP_PROVIDER` | `off` tant que Meta n'est pas configuré (le simulateur est interdit en production) |

**Garde-fous** : l'API refuse de démarrer si un secret est trop court, si un domaine n'est pas en `https://`, si `ADMIN_DEV_*` est défini, si `RESEND_API_KEY` manque, si les formules sont actives sans moyen de paiement, ou si `WAVE_GRACE_HOURS` est supérieur à 0. Le message d'erreur dit lequel : `docker compose -f docker-compose.prod.yml logs backend`.

## 3. Démarrage

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

Les tables sont créées automatiquement (migrations) au premier démarrage. Le certificat HTTPS est obtenu tout seul par Caddy au premier accès (le DNS doit déjà pointer vers le serveur ; ports 80 et 443 ouverts). Vérifier : `https://votre-domaine/api/health` répond `{"ok":true}`.

## 4. Premier administrateur

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec backend python -m app.createadmin vous@exemple.sn Prénom Nom
```

Ouvrir le lien affiché (valable 72 h) : choisir le mot de passe et enregistrer la double authentification. Les autres administrateurs s'invitent ensuite depuis l'administration (« Équipe »).

## 5. Ce qui est déjà réglé par la configuration

- **Fichiers** (justificatifs, portfolios, photos de demande) : volume Docker `uploads`, dossier privé, lecture uniquement par liens signés de 10 minutes maximum, 10 Mo maximum par fichier (limite aussi imposée par Caddy). Aucun bucket à créer.
- **Tâches planifiées** : le service `cron` appelle toutes les 10 minutes les alertes aux professionnels, les rappels de fin de formule (7 jours, 3 jours, fin) et l'expiration des formules provisoires ; une fois par jour, le nettoyage du journal WhatsApp. Rien à configurer chez AWS.
- **Adresse des visiteurs** (limitation des tentatives) : `PROXY_HOPS=2` (Caddy puis le site). Vérifié : l'adresse réelle est lue, une fausse adresse envoyée par un visiteur est ignorée.
- **Redémarrage** : tous les services redémarrent seuls avec la machine (`restart: unless-stopped`).

## 6. Sauvegardes

```bash
./scripts/sauvegarde.sh                      # base (pg_dump) + fichiers, 14 sauvegardes gardées dans ~/sauvegardes-buildsen
crontab -e                                   # puis ajouter, pour une sauvegarde chaque nuit à 3 h :
0 3 * * * /home/ubuntu/buildsen_v2/scripts/sauvegarde.sh
```

Copier régulièrement le dossier des sauvegardes hors du serveur (par exemple `aws s3 sync ~/sauvegardes-buildsen s3://votre-bucket-prive/`). Un instantané EBS du disque, chaque semaine, est un complément simple.

Restauration de la base : `docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db pg_restore -U buildsen -d buildsen --clean < base-AAAAMMJJ-HHMM.dump`

## 7. Mise à jour

```bash
git pull && git -C backend pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Les migrations s'appliquent au redémarrage de l'API. Faire une sauvegarde avant.

## 8. À faire hors serveur (vous)

1. **Logos** : déjà en place (`frontend/public/logos/wave.png` et `om.png`). Pour les changer, remplacer ces fichiers puis reconstruire.
2. **Wave et Orange Money** : faire un vrai paiement de faible montant avec chaque moyen, puis un export réel (Wave Business > Transactions > Télécharger ; Orange : format à vérifier) importé dans Administration > Paiements. Ces parcours n'ont jamais été essayés avec un vrai paiement.
3. **Webhook Wave** : si Wave vous fournit un avis de paiement automatique, le pointer vers `https://votre-domaine/api/payments/webhook/wave` avec l'en-tête `X-Webhook-Secret`.
4. **Resend** : vérifier le domaine d'envoi (SPF/DKIM), puis tester une réinitialisation de mot de passe.
5. **Relecture juridique** des conditions générales et de la politique de confidentialité.
6. **Assistant WhatsApp** : voir `WHATSAPP.md`, puis passer `WHATSAPP_PROVIDER=meta`.
7. **Surveillance** : une alerte gratuite (UptimeRobot, ou une alarme CloudWatch) sur `https://votre-domaine/api/health`.
8. **Retour arrière** : `PLANS_ENABLED=false` dans `docker-compose.prod.yml` (service `backend`) supprime toute limite et tout paiement ; redémarrer l'API.

## 9. Limites connues

- Vérification du numéro par SMS : non faite (reportée).
- Les photos des demandes supprimées restent sur le disque.
- Une seule machine : pas de reprise automatique si l'instance tombe (les sauvegardes et un instantané EBS permettent de remonter le service ailleurs).
