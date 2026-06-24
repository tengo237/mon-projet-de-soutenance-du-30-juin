#!/bin/sh
set -e

echo "⏳ Attente de PostgreSQL..."
until python -c "import socket,os,sys; s=socket.socket(); s.settimeout(2); \
sys.exit(0) if s.connect_ex((os.environ.get('POSTGRES_HOST','db'), int(os.environ.get('POSTGRES_PORT','5432')))) == 0 else sys.exit(1)" 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL prêt."

python manage.py makemigrations accounts catalog booking --noinput
python manage.py migrate --noinput
python manage.py seed_demo

echo "🚀 Démarrage du serveur sur 0.0.0.0:8000"
exec python manage.py runserver 0.0.0.0:8000
