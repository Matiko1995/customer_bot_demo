#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_NAME="${SERVICE_NAME:-customer-bot}"
ENV_FILE="${ENV_FILE:-/srv/customer-bot/shared/.env}"
SHARED_DIR="${SHARED_DIR:-/srv/customer-bot/shared}"
RUN_INSTALL="${RUN_INSTALL:-1}"
RUN_TESTS="${RUN_TESTS:-1}"
RUN_BUILD="${RUN_BUILD:-1}"
RUN_RESTART="${RUN_RESTART:-0}"

cd "$ROOT_DIR"

echo "==> Customer Bot release start"
echo "ROOT_DIR=$ROOT_DIR"
echo "SERVICE_NAME=$SERVICE_NAME"

if [ -f "$ENV_FILE" ]; then
  echo "==> Loading env file: $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
else
  echo "==> Env file not found, continue with current shell env: $ENV_FILE"
fi

mkdir -p "$SHARED_DIR/.data"

if [ "$RUN_INSTALL" = "1" ]; then
  echo "==> npm install"
  npm install
fi

if [ "$RUN_TESTS" = "1" ]; then
  echo "==> npm test"
  npm test
fi

if [ "$RUN_BUILD" = "1" ]; then
  echo "==> npm run build"
  npm run build
fi

if [ ! -f "$ROOT_DIR/dist/customer-bot.js" ]; then
  echo "==> Missing widget artifact: $ROOT_DIR/dist/customer-bot.js"
  echo "==> Run npm run app:widget:build (or npm run build) before restarting services"
  exit 1
fi

if [ -f "$ROOT_DIR/dist/widget-version.json" ]; then
  export CUSTOMER_BOT_WIDGET_VERSION="$(node -e "const fs=require('fs'); const p='$ROOT_DIR/dist/widget-version.json'; const data=JSON.parse(fs.readFileSync(p,'utf8')); process.stdout.write(data.version||'')")"
  echo "==> Widget version: $CUSTOMER_BOT_WIDGET_VERSION"
fi

echo "==> Release artifacts ready"
echo "Widget: $ROOT_DIR/dist/customer-bot.js"
echo "Server: $ROOT_DIR/.output/server/index.mjs"

if [ "$RUN_RESTART" = "1" ]; then
  echo "==> Restart service: $SERVICE_NAME"
  sudo systemctl restart "$SERVICE_NAME"
  sudo systemctl status "$SERVICE_NAME" --no-pager
else
  echo "==> Skip service restart"
  echo "To restart manually:"
  echo "sudo systemctl restart $SERVICE_NAME"
fi

echo "==> Release finished"
