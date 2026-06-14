#!/bin/sh

set -eu

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.RUNTIME_CONFIG = {
  VITE_CLERK_PUBLISHABLE_KEY: "${VITE_CLERK_PUBLISHABLE_KEY}",
  VITE_CLERK_JWT_TEMPLATE: "${VITE_CLERK_JWT_TEMPLATE}",
  VITE_SENTRY_DSN: "${VITE_SENTRY_DSN}"
};
EOF
