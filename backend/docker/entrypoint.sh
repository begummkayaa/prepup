#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "prepup-api: prisma migrate deploy"
  npx prisma migrate deploy
fi

exec node dist/index.js
