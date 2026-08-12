#!/bin/sh
set -e

# Compose already gates startup on the Postgres healthcheck, but a restarting
# database (or an external one) can still refuse the first connection. Retrying
# here turns a crash-loop into a short wait.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  attempt=1
  max_attempts=10
  until npx prisma migrate deploy; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "FATAL: prisma migrate deploy failed after $max_attempts attempts." >&2
      echo "       Check DATABASE_URL and that the database is reachable." >&2
      exit 1
    fi
    echo "migrate deploy failed (attempt $attempt/$max_attempts); retrying in 5s..." >&2
    attempt=$((attempt + 1))
    sleep 5
  done
fi

exec "$@"
