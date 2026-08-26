#!/usr/bin/env bash
# Run the Refresh Listings Cache workflow from your machine (requires GitHub CLI).
# Usage: ./scripts/trigger-listings-refresh.sh [branch]
set -e
cd "$(dirname "$0")/.."
BRANCH="${1:-$(git branch --show-current 2>/dev/null || echo main)}"
if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  echo "Or use: GitHub → Actions → Refresh Listings Cache → Run workflow"
  exit 1
fi
gh workflow run "Refresh Listings Cache" --ref "$BRANCH"
echo "Queued. View: gh run list --workflow=refresh-listings.yml"
