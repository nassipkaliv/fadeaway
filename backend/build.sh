#!/usr/bin/env bash
# Render build script: install deps, collect static, run migrations, seed once.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Seed sneakers/categories on first deploy only (idempotent: update_or_create).
python manage.py seed_products || true
