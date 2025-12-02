#!/bin/bash
set -e

# init-databases.sh - create multiple DBs if POSTGRES_MULTIPLE_DATABASES provided
# Usage: POSTGRES_MULTIPLE_DATABASES=db1,db2,... will create those DBs

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
  echo "Creating multiple databases: $POSTGRES_MULTIPLE_DATABASES"
  IFS=',' read -ra DBS <<< "$POSTGRES_MULTIPLE_DATABASES"
  for db in "${DBS[@]}"; do
    echo "Creating database: $db"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
      CREATE DATABASE $db;
EOSQL
  done
else
  echo "No POSTGRES_MULTIPLE_DATABASES provided"
fi
