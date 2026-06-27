#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
report_dir="${TMPDIR:-/tmp}/linkcheck-sample-docs"
report="$report_dir/sample-docs-report.json"

cd "$repo_root"
rm -rf "$report_dir"
mkdir -p "$report_dir"

npm run build >/dev/null

set +e
node dist/cli.js scan examples/sample-docs --format json > "$report"
scan_status=$?
set -e

if [[ "$scan_status" -ne 1 ]]; then
  echo "Expected sample-docs scan to exit 1 for intentional broken links, got $scan_status" >&2
  exit 1
fi

test -s "$report"
grep -q '"filesScanned"' "$report"
grep -q 'missing.md' "$report"
grep -q 'does-not-exist' "$report"

echo "JSON report: $report"
echo "Expected scan exit status: $scan_status"
