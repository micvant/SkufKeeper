#!/bin/sh
set -e

# Persistent data directory (Railway volume mount at /data)
if [ -d "/data" ] && [ -w "/data" ]; then
  DATA_DIR="/data"
else
  DATA_DIR="${DATA_DIR:-$(pwd)/.data}"
fi

mkdir -p "$DATA_DIR/uploads"

export DATABASE_URL="${DATABASE_URL:-file:${DATA_DIR}/dev.db}"
export UPLOAD_DIR="${UPLOAD_DIR:-$DATA_DIR/uploads}"

echo "Using DATABASE_URL=$DATABASE_URL"
echo "Uploads: $UPLOAD_DIR"

npx prisma db push
node scripts/backfill-qr-tokens.mjs 2>/dev/null || true

exec next start -H 0.0.0.0 -p "${PORT:-3000}"
