#!/bin/bash
set -e

source /opt/venv/bin/activate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

RUN_PORT=${PORT:-8000}
RUN_HOST=${HOST:-0.0.0.0}

if [ "$DJANGO_ENV" == "development" ]; then
    echo "Starting Uvicorn in development mode..."
    exec uvicorn config.asgi:application \
        --host $RUN_HOST \
        --port $RUN_PORT \
        --reload
else
    echo "Starting Gunicorn in production mode..."
    exec gunicorn \
        -k uvicorn.workers.UvicornWorker \
        -b $RUN_HOST:$RUN_PORT \
        config.asgi:application
fi
