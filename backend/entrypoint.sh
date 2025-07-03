#!/bin/sh
set -e

echo "Esperando a la base de datos..."
while ! nc -z db 5432; do
  sleep 1
done

echo "Base de datos disponible. Ejecutando migraciones..."
python manage.py migrate

echo "Servidor listo. Ejecutando comando: $@"
exec "$@"
