#!/bin/sh
set -e

mkdir -p "$LOOPER_DATA_DIR"

if [ ! -f "$LOOPER_DATA_DIR/hl-chamber.db" ]; then
  echo "→ First boot — seeding Chamber into $LOOPER_DATA_DIR"
  NODE_PATH=/app/node_modules node scripts/seed.mjs
  NODE_PATH=/app/node_modules node scripts/seed-chamber.mjs
fi

echo "→ Chamber starting on :${PORT:-3000} (data: $LOOPER_DATA_DIR)"
exec node server.js