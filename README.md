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
npx @rogerchappel/linkcheck scan ./docs
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

For a smaller sample-docs fixture with intentional failures:

```bash
bash demo/run-sample-docs-scan.sh
```

See `docs/tutorials/sample-docs-linkcheck.md` for the review workflow.

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

## Limitations

- External URL checks are opt-in and depend on the remote server accepting
  quick validation requests. Redirects, rate limits, bot protection, and
  temporary outages can make a healthy link look unavailable.
- Markdown and HTML extraction is intentionally lightweight. It is designed for
  documentation links, not arbitrary browser-rendered JavaScript applications.
- Anchor validation normalizes common heading shapes, but unusual generated
  heading ids may need an ignore pattern or a repository-specific fixture.

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
  run: npx @rogerchappel/linkcheck scan ./docs --format json
```

## Example Fixture

The `examples/sample-docs` directory contains a small documentation tree with
both healthy links and intentional failures. After building the package, run:

```bash
npm run build
node dist/cli.js scan examples/sample-docs --format json
```

The command should report the intentional missing page and missing anchor. It is
useful when checking release artifacts because it exercises the packaged CLI
against real files.

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
npm run package:smoke # Dry-run npm package contents
npm run release:check # Full release-candidate verification
npm run validate    # Full validation
```

## Package Contents

The npm package allowlist includes the built CLI/library files, sample fixture,
README, license, security policy, changelog, contribution guide, runnable demo
script, and tutorial referenced above. Run `npm run package:smoke` before
publishing to confirm the tarball still matches that release surface.

Before publishing or cutting a release candidate, run:

```bash
npm run release:check
npm run package:smoke
```

`release:check` runs type checking, tests, build, smoke coverage, and a dry-run
package check. The package also includes `LICENSE` and `SECURITY.md` so npm
consumers receive the same trust and reporting metadata as the repository.

## Technical Details

- **TypeScript** with strict mode
- **ESM** modules (NodeNext resolution)
- **Native fetch** — no external HTTP client
- **Regex-based parsing** — no DOM construction, no cheerio/jsdom
- **glob** for file discovery with built-in ignore support

## License

MIT

Release verification scripts not already covered above:

- `npm run lint` - echo 'lint OK'
- `npm run package:smoke` - npm pack --dry-run
- `npm run release:check` - npm run check && npm test && npm run build && npm run smoke && npm run package:smoke

## Release readiness

Run the release gate before tagging or publishing:

```sh
npm run release:check
npm pack --dry-run
```

The package smoke check prints the tarball contents so missing runtime files are caught before release.
