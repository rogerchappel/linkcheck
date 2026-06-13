# 🔍 linkcheck

> Local-first link checker for markdown documentation — catch broken links before your docs ship.

Scans your markdown and HTML files for broken internal links, missing images, and dead external URLs. No server. No headless browser. Just fast, reliable link validation you can run locally or in CI.

## Why?

You spent hours writing documentation. The last thing you want is a broken `![logo](./imagesogo.png)` typo or a link to a file you deleted three weeks ago. linkcheck finds these problems before your docs go live.

## Install

```bash
npm install -g @rogerchappel/linkcheck
```

Or use directly with npx:

```bash
npx tsx ./src/cli.ts scan ./docs
```

## Quick Start

```bash
# Scan a directory
linkcheck scan ./docs

# Also check external URLs
linkcheck scan ./docs --check-external

# Ignore noisy patterns
linkcheck scan ./docs --ignore localhost --ignore example.com

# JSON output for CI pipelines
linkcheck scan ./docs --format json
```

## Runnable Demo

Run the committed fixture wiki scan:

```bash
bash demo/run-wiki-scan.sh
```

The script builds the CLI, scans `src/fixtures/wiki`, and prints the generated
JSON report path. See `docs/tutorials/scan-a-docs-wiki.md` for the full recipe.

## CLI Reference

### `linkcheck scan <path>`

Scan files for broken links.

| Option | Description | Default |
|--------|-------------|---------|
| `<path>` | File or directory to scan | — |
| `--check-external` | Also check external URLs | `false` |
| `--ignore <patterns...>` | URL/path patterns to skip | `[]` |
| `--base-url <url>` | Base URL for root-relative links | — |
| `--timeout <ms>` | External URL check timeout | `15000` |
| `--format <format>` | Output format: `text` or `json` | `text` |

### `linkcheck report [path]`

Show the last cached scan report.

### `linkcheck doctor`

Health check — verify Node version, package integrity, and ESM configuration.

## What It Checks

- ✅ **Internal links**: `[guide](./docs/guide.md)` → file exists?
- ✅ **Images**: `![logo](./images/logo.png)` → file exists?
- ✅ **Anchors**: `[section](#installation)` → heading exists in target?
- ✅ **External URLs**: `https://example.com` → responds to HEAD request (opt-in)
- ✅ **HTML links**: `<a href>` and `<img src>` tags

## What It Skips (by default)

- External URLs (use `--check-external` to enable)
- `mailto:` and `tel:` links
- `node_modules/`, `.git/`, `dist/`, `coverage/`

## Ignore Patterns

Skip noisy or intentional broken links:

```bash
# Substring match
linkcheck scan ./docs --ignore localhost --ignore draft

# Glob pattern
linkcheck scan ./docs --ignore "**/node_modules/**"

# Regex pattern
linkcheck scan ./docs --ignore "/^https?://localhost/"
```

## CI Integration

linkcheck exits with code `1` when broken links are found, making it drop-in ready for CI:

```yaml
# GitHub Actions
- name: Check links
  run: npx linkcheck scan ./docs --format json
```

## Example Output

```
════════════════════════════════════════════════════════
  linkcheck — Scan Report
════════════════════════════════════════════════════════

  Files scanned: 5
  Total links:   23
  Healthy:       18
  Issues:        5

────────────────────────────────────────────────────────
  ISSUES
────────────────────────────────────────────────────────

  /project/docs/README.md:12
    internal    ./does-not-exist.md
    Status: missing_file
    Reason: File not found: /project/docs/does-not-exist.md

  /project/docs/README.md:18
    anchor      getting-started.md#no-such-section
    Status: missing_anchor
    Reason: Anchor "no-such-section" not found

────────────────────────────────────────────────────────
  SUMMARY
────────────────────────────────────────────────────────
  Broken files:     0
  Missing files:    3
  Missing anchors:  2
  Timeouts:         0
  Errors:           0

  Timestamp: 2025-01-15T10:30:00.000Z
  Base path: /project/docs
════════════════════════════════════════════════════════
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All links healthy |
| `1` | Broken links found |
| `2` | Runtime error |

## Development

```bash
npm install
npm run test        # Run tests
npm run check       # Type check
npm run build       # Compile to dist/
npm run smoke       # CLI smoke tests
npm run validate    # Full validation
```

## Technical Details

- **TypeScript** with strict mode
- **ESM** modules (NodeNext resolution)
- **Native fetch** — no external HTTP client
- **Regex-based parsing** — no DOM construction, no cheerio/jsdom
- **glob** for file discovery with built-in ignore support

## License

MIT
