# validate.sh - Full validation for linkcheck
#!/usr/bin/env bash
set -e

echo "╔══════════════════════════════════════════════════╗"
echo "║  linkcheck — Full Validation                     ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  local desc="$1"
  shift
  echo -n "  Checking: $desc... "
  if "$@" > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC}"
    FAIL=$((FAIL + 1))
  fi
}

check_output() {
  local desc="$1"
  local expected="$2"
  shift 2
  echo -n "  Checking: $desc... "
  local output
  output=$("$@" 2>&1 || true)
  if echo "$output" | grep -q "$expected"; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} (expected '$expected')"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "── TypeScript ─────────────────────────────────────"
check "tsc --noEmit" npx tsc --noEmit

echo ""
echo "── Build ──────────────────────────────────────────"
check_output "Build produces dist/cli.js" "dist/cli.js" bash -c "npx tsc && ls dist/cli.js"
check "dist/ has files" bash -c "[ -d dist ] && [ \$(ls dist | wc -l) -gt 0 ]"

echo ""
echo "── Tests ──────────────────────────────────────────"
check_output "Unit tests pass (58+ tests)" "58 passed" npx vitest run

echo ""
echo "── CLI ────────────────────────────────────────────"
check_output "linkcheck doctor" "All checks passed" npx tsx src/cli.ts doctor

FIXTURES="src/fixtures/wiki"
# Clean cache before testing
rm -rf "$FIXTURES/.linkcheck-cache" 2>/dev/null || true

check_output "scan finds broken links" "Issues:" bash -c "npx tsx src/cli.ts scan $FIXTURES --ignore example.com 2>&1 || true"
check_output "scan with --format json" "issues" bash -c "npx tsx src/cli.ts scan $FIXTURES --ignore example.com --format json 2>&1 || true"
rm -rf "$FIXTURES/.linkcheck-cache" 2>/dev/null || true

echo ""
echo "── Smoke Tests ────────────────────────────────────"
check "Smoke tests" npx tsx test/smoke.test.ts

echo ""
echo "── Package ───────────────────────────────────────"
check "package.json is valid JSON" bash -c "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\",\"utf-8\"))'"
check_output "bin entry configured" "linkcheck" bash -c "node -e 'const p=JSON.parse(require(\"fs\").readFileSync(\"package.json\",\"utf-8\")); console.log(p.bin)'"
check_output "type is module" "module" bash -c "node -e 'const p=JSON.parse(require(\"fs\").readFileSync(\"package.json\",\"utf-8\")); console.log(p.type)'"

echo ""
echo "── Structure ──────────────────────────────────────"
check "src/ has parser files" bash -c "[ -f src/link-parser.ts ] && [ -f src/html-parser.ts ]"
check "src/ has scanner" bash -c "[ -f src/scanner.ts ]"
check "test/ has test files" bash -c "[ \$(ls test/*.test.ts 2>/dev/null | wc -l) -ge 5 ]"
check "fixtures exist" bash -c "[ -f src/fixtures/wiki/README.md ]"
check "docs exist" bash -c "[ -f docs/PRD.md ] && [ -f README.md ]"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Results: ${PASS} passed, ${FAIL} failed"
echo "═══════════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}Validation FAILED${NC}"
  exit 1
else
  echo -e "  ${GREEN}All validation checks passed!${NC}"
  exit 0
fi
