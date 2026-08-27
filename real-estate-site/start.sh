#!/usr/bin/env bash
# Run The Banks Group website locally — no Netlify required.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"


# Pick a python3 that can actually execute on this machine. A Homebrew/Intel
# python3 earlier on PATH fails with "Bad CPU type" on Apple Silicon.
PY="${PYTHON:-}"
if [[ -z "$PY" ]]; then
  for candidate in python3 /usr/bin/python3 /opt/homebrew/bin/python3; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c '' >/dev/null 2>&1; then
      PY="$candidate"
      break
    fi
  done
fi
if [[ -z "$PY" ]]; then
  echo "Error: no working python3 found. Install python3 or set PYTHON=/path/to/python3." >&2
  exit 1
fi

if [[ -d content/blogs ]]; then
  echo "Building blogs.json..."
  "$PY" build-blogs.py
elif [[ -f blogs.json ]]; then
  echo "Using existing blogs.json (no content/blogs folder found)."
else
  echo "Warning: no blogs.json or content/blogs — blog pages may be empty."
fi

PORT="${PORT:-8000}"
echo ""
echo "Site running at http://localhost:$PORT"
echo "Press Ctrl+C to stop."
echo ""

"$PY" -m http.server "$PORT"
