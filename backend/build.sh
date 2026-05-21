#!/usr/bin/env bash
# Render build script: install deps, collect static, run migrations, seed, ensure superuser.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Seed sneakers/categories (idempotent: update_or_create).
python manage.py seed_products || true

# Auto-create superuser from env vars on first deploy. Skips silently if user exists.
if [[ -n "$DJANGO_SUPERUSER_USERNAME" && -n "$DJANGO_SUPERUSER_PASSWORD" ]]; then
    python manage.py createsuperuser --noinput || true
fi
