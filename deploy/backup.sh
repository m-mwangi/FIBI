#!/bin/sh
# Nightly backup of the FIBI database and uploaded images.
#
#   ./deploy/backup.sh [destination-dir]     # default: /var/backups/fibi
#
# Install as a cron job (as the user that owns the stack):
#   crontab -e
#   15 3 * * * /opt/fibi/deploy/backup.sh >> /var/log/fibi-backup.log 2>&1
#
# The database dump and the uploads volume are BOTH required to restore the site.
# Project images live on the `backend_uploads` Docker volume, not in Postgres, so
# a database-only backup restores a catalogue full of broken images.
#
# These backups contain live user data. They are written 0600 and the directory
# 0700; keep them off any world-readable path, and copy them off this VPS —
# a backup that only exists on the machine it protects is not a backup.

set -eu

cd "$(dirname "$0")/.."

DEST="${1:-/var/backups/fibi}"
RETAIN_DAYS="${RETAIN_DAYS:-14}"
STAMP="$(date +%F-%H%M)"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $(pwd)." >&2
  exit 1
fi
# shellcheck disable=SC1091
. ./.env
: "${POSTGRES_USER:?}" "${POSTGRES_DB:?}"

mkdir -p "$DEST"
chmod 700 "$DEST"

DB_FILE="$DEST/db-$STAMP.sql.gz"
UP_FILE="$DEST/uploads-$STAMP.tar.gz"

echo "==> [$(date -Is)] Dumping database to $DB_FILE"
# Write to a .partial name first: a truncated dump that looks like a finished one
# is worse than no dump, because it is only discovered during a restore.
if docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
     | gzip > "$DB_FILE.partial"; then
  mv "$DB_FILE.partial" "$DB_FILE"
  chmod 600 "$DB_FILE"
else
  rm -f "$DB_FILE.partial"
  echo "ERROR: pg_dump failed." >&2
  exit 1
fi

echo "==> [$(date -Is)] Archiving uploads to $UP_FILE"
if docker run --rm -v fibi_backend_uploads:/data:ro alpine \
     tar czf - -C /data . > "$UP_FILE.partial"; then
  mv "$UP_FILE.partial" "$UP_FILE"
  chmod 600 "$UP_FILE"
else
  rm -f "$UP_FILE.partial"
  echo "ERROR: uploads archive failed." >&2
  exit 1
fi

# gzip of an empty dump is ~20 bytes; anything that small means the dump did not
# actually contain the database.
for f in "$DB_FILE" "$UP_FILE"; do
  size="$(wc -c < "$f")"
  if [ "$size" -lt 100 ]; then
    echo "ERROR: $f is only $size bytes — treat this backup as failed." >&2
    exit 1
  fi
done

echo "==> Pruning backups older than $RETAIN_DAYS days"
find "$DEST" -name 'db-*.sql.gz'      -mtime "+$RETAIN_DAYS" -delete
find "$DEST" -name 'uploads-*.tar.gz' -mtime "+$RETAIN_DAYS" -delete

echo "==> [$(date -Is)] Backup complete:"
ls -lh "$DB_FILE" "$UP_FILE"
