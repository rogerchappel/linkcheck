#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

npm run build

report_dir="${TMPDIR:-/tmp}/linkcheck-demo"
rm -rf "$report_dir"
mkdir -p "$report_dir"

set +e
node dist/cli.js scan src/fixtures/wiki --format json > "$report_dir/wiki-report.json"
scan_status=$?
set -e

if [[ "$scan_status" -ne 0 && "$scan_status" -ne 1 ]]; then
  echo "Unexpected linkcheck exit status: $scan_status" >&2
  exit "$scan_status"
fi

test -s "$report_dir/wiki-report.json"
grep -q '"filesScanned"' "$report_dir/wiki-report.json"

echo "JSON report: $report_dir/wiki-report.json"
echo "Scan exit status: $scan_status"
