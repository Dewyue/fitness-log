#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Building..."
VITE_BASE_PATH=/fitness-log/ bun run build

echo "Deploying to gh-pages..."
rm -rf /tmp/fitness-log-pages
cp -R dist /tmp/fitness-log-pages
cd /tmp/fitness-log-pages
touch .nojekyll
git init -b gh-pages
git add -A
GIT_AUTHOR_NAME="小兑" GIT_AUTHOR_EMAIL="Dewyue@users.noreply.github.com" \
GIT_COMMITTER_NAME="小兑" GIT_COMMITTER_EMAIL="Dewyue@users.noreply.github.com" \
git commit -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f git@github.com:Dewyue/fitness-log.git gh-pages

echo "Requesting GitHub Pages rebuild..."
gh api repos/Dewyue/fitness-log/pages/builds -X POST >/dev/null

echo "Done. Site: https://dewyue.github.io/fitness-log/"
