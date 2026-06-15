#!/bin/bash
set -e

echo "📦 Starting PostgreSQL backup..."

BACKUP_DIR="$(dirname "$0")/../../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/nyaysetu-backup-$TIMESTAMP.sql"

docker exec nyaysetu-db pg_dump \
  -U "${DB_USERNAME:-postgres}" \
  "${DB_NAME:-nyaysetu}" \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: $BACKUP_FILE"
else
    echo "❌ Backup failed"
    exit 1
fi