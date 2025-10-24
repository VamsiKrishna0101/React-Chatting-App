#!/usr/bin/env bash
set -euo pipefail

export PYTHONUNBUFFERED=1
export UVICORN_WORKERS=${UVICORN_WORKERS:-1}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8000}

# Allow user to specify MODEL_WEIGHTS env var; default auto-download yolov8n-pose.pt

exec uvicorn app.main:app --host "$HOST" --port "$PORT" --workers "$UVICORN_WORKERS"
