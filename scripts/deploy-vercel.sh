#!/usr/bin/env bash
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  cat <<'EOF'
用法:
  bash ./scripts/deploy-vercel.sh         # 预览部署
  bash ./scripts/deploy-vercel.sh --prod  # 生产部署
EOF
  exit 0
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "未找到 npx，请先安装 Node.js/npm。" >&2
  exit 1
fi

if [[ "${1:-}" == "--prod" ]]; then
  echo "Deploying production build to Vercel..."
  exec npx vercel deploy --prod --yes
fi

echo "Deploying preview build to Vercel..."
exec npx vercel deploy --yes
