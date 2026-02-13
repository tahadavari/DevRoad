#!/bin/sh

echo "Running pre-start script for NextJS..."

# Ensure Prisma Client is generated
echo "> Generating Prisma Client..."
npx prisma generate || echo "Prisma generate failed, continuing..."

# run migrations
if [ -n "${DATABASE_URL:-}" ]; then
  echo "> Running Prisma migrations..."
  npx prisma migrate deploy || echo "Migration failed, but continuing..."

  echo "> Running Prisma seed..."
  npm run db:seed || echo "Seed failed or already executed, continuing..."
else
  echo "> DATABASE_URL is not set. Skipping Prisma migrations and seed."
fi

echo "Pre-start script for NextJS finished."
