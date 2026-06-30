#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
report_dir="${TMPDIR:-/tmp}/linkcheck-release-docs"
report="$report_dir/release-docs-report.json"

cd "$repo_root"
rm -rf "$report_dir"
mkdir -p "$report_dir"

npm run build >/dev/null

node dist/cli.js scan examples/release-docs --format json > "$report"

test -s "$report"
grep -q '"filesScanned"' "$report"

node - "$report" <<'NODE'
const fs = require("node:fs");
const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (report.issues.length !== 0) {
  console.error(`Expected zero issues, found ${report.issues.length}`);
  process.exit(1);
}
console.log(`release docs gate: ${report.filesScanned} files, ${report.totalLinks} links, ${report.issues.length} issues`);
NODE

echo "JSON report: $report"
