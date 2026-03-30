#!/usr/bin/env bash
# Run this on your Mac in Terminal (not in a sandboxed runner):
#   chmod +x scripts/setup-github-auth-and-push.sh
#   ./scripts/setup-github-auth-and-push.sh
#
# Installs GitHub CLI (if needed), runs interactive login, then pushes main.

set -e
cd "$(dirname "$0")/.."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Install it first: https://brew.sh"
  echo 'Then run: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Installing GitHub CLI..."
  brew install gh
fi

echo "Starting GitHub authentication (browser or token — follow the prompts)..."
gh auth login --git-protocol https --hostname github.com

echo "Checking auth..."
gh auth status

echo "Pushing to origin..."
git push -u origin main

echo "Done. Repo: https://github.com/connergreyson/BanksGroup"
