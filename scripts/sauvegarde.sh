#!/bin/sh
# Sauvegarde de la base PostgreSQL et des fichiers envoyés (production EC2) : ./scripts/sauvegarde.sh [dossier]
# Garde les 14 dernières sauvegardes. À planifier chaque nuit :  0 3 * * * /home/ubuntu/buildsen_v2/scripts/sauvegarde.sh
set -e
cd "$(dirname "$0")/.."
DEST="${1:-$HOME/sauvegardes-buildsen}"
D=$(date +%Y%m%d-%H%M)
mkdir -p "$DEST"
C="docker compose -f docker-compose.prod.yml --env-file .env.prod"
$C exec -T db pg_dump -U buildsen -Fc buildsen > "$DEST/base-$D.dump"
$C exec -T backend tar -C /data -cz uploads > "$DEST/fichiers-$D.tar.gz"
ls -1t "$DEST"/base-*.dump | tail -n +15 | xargs -r rm --
ls -1t "$DEST"/fichiers-*.tar.gz | tail -n +15 | xargs -r rm --
echo "Sauvegarde terminée : $DEST ($D)"
