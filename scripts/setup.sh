#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Home Lending Chamber setup"
cd "$ROOT"
npm install
npm run seed
npm run build

echo "✓ Ready. Run: npm run dev  →  unlock 333333"