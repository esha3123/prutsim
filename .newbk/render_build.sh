#!/usr/bin/env bash
# Exit on error
set -o errexit

# Create required directories if they don't exist
mkdir -p instance
mkdir -p app/uploads

# Prepare database
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  flask db upgrade
else
  echo "No DATABASE_URL specified, skipping migrations"
  if [[ -f instance/production.sqlite3 ]]; then
    echo "Using existing SQLite database"
  else
    echo "Creating new SQLite database"
    touch instance/production.sqlite3
  fi
fi

echo "Render build script completed successfully!"
