#!/usr/bin/env bash
# Vercel Ignored Build Step.
# Exit 0 = skip deployment; exit 1 = proceed.
# Set in Vercel → Project Settings → Git → Ignored Build Step:
#   bash scripts/vercel-ignored-build.sh
set -euo pipefail

author="${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}"
message="${VERCEL_GIT_COMMIT_MESSAGE:-}"

# Skip preview builds from dependency bots (they still get GitHub CI).
if [[ "$author" == *"renovate"* || "$author" == *"dependabot"* ]]; then
	echo "Skipping Vercel build for dependency bot commit (author=$author)."
	exit 0
fi

if [[ "$message" == chore\(deps* || "$message" == fix\(deps* ]]; then
	echo "Skipping Vercel build for dependency commit: $message"
	exit 0
fi

exit 1
