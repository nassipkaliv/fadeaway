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
    python manage.py shell <<'PYEOF'
from django.contrib.auth import authenticate, get_user_model
import os

U = get_user_model()
username = os.environ['DJANGO_SUPERUSER_USERNAME'].strip()
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '').strip()
password = os.environ['DJANGO_SUPERUSER_PASSWORD']

user, created = U.objects.get_or_create(
    username=username,
    defaults={'email': email},
)
user.email = email
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.set_password(password)
user.save()

# Verify that the password actually authenticates
check = authenticate(username=username, password=password)
print('SUPERUSER:', 'created' if created else 'updated', '->', username)
print('SUPERUSER auth check:', 'OK' if check is not None else 'FAILED')
print('SUPERUSER is_staff:', user.is_staff, '| is_superuser:', user.is_superuser, '| is_active:', user.is_active)
PYEOF
fi
