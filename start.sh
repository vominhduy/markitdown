#!/bin/bash

cd /home/duyvm/Documents/python/markitdown || exit 1

source /home/duyvm/Documents/python/venv/bin/activate

uvicorn app:app --host 127.0.0.1 --port 8000 &
SERVER_PID=$!

cleanup() {
    kill "$SERVER_PID" 2>/dev/null
}

trap cleanup EXIT

until curl -fs http://127.0.0.1:8000 >/dev/null; do
    sleep 0.2
done

/snap/bin/chromium \
    --app=http://127.0.0.1:8000 \
    --new-window \
    --user-data-dir=/tmp/markitdown-profile