#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required"
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${BACKUP_DIR}/backup-${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

pg_dump "$DATABASE_URL" --no-owner --no-privileges --format=plain > "$OUT_FILE"

echo "Backup created at: $OUT_FILE"
