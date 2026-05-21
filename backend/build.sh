#!/usr/bin/env bash
# Render build script: install deps, collect static, run migrations, seed, ensure superuser.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Seed sneakers/categories (idempotent: update_or_create).
python manage.py seed_products || true

# Ensure superuser exists with correct password from env vars (idempotent).
if [[ -n "$DJANGO_SUPERUSER_USERNAME" && -n "$DJANGO_SUPERUSER_PASSWORD" ]]; then
    python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import os
U = get_user_model()
username = os.environ['DJANGO_SUPERUSER_USERNAME']
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ['DJANGO_SUPERUSER_PASSWORD']
user, created = U.objects.get_or_create(
    username=username,
    defaults={'email': email, 'is_staff': True, 'is_superuser': True},
)
user.email = email
user.is_staff = True
user.is_superuser = True
user.set_password(password)
user.save()
print('Superuser created' if created else 'Superuser updated', '->', username)
EOF
fi
