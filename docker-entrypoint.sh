#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "> Running Prisma migrations..."
  npx prisma migrate deploy
else
  echo "> DATABASE_URL is not set. Skipping Prisma migrations."
fi

exec "$@"
