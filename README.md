# buildsen_web

Site BUILDSEN (Next.js) et configuration de déploiement Docker (AWS EC2).

- L'API FastAPI est dans le dépôt **korka-dev/buildsen_api**, à cloner dans `./backend`.
- Déploiement complet : voir **DEPLOIEMENT-EC2.md** (`docker-compose.prod.yml`, `deploy/Caddyfile`, `.env.prod.example`, `scripts/sauvegarde.sh`).
- Développement : `npm ci && npm run dev` (copier `.env.example` en `.env.local`).
