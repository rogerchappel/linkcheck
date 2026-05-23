# Product Requirements Document — linkcheck

## Overview

**linkcheck** is a local-first TypeScript CLI that scans markdown and HTML files for broken internal links, missing images, and dead external URLs — without running a server or requiring a headless browser.

## Goals

1. **Local-first**: Scan files on disk without spinning up a server
2. **Zero dependencies on browsers**: No headless Chrome, no Puppeteer
3. **CI-friendly**: Exit non-zero when broken links are found
4. **Fast**: Regex-based parsing, no DOM construction
5. **Extensible**: Ignore patterns, base URL support, configurable timeouts

## Non-Goals

- Checking JavaScript-rendered pages (SPA routing)
- Form submission or link interaction
- Sitemap generation

## Target Users

- Documentation maintainers who want to catch broken links in CI
- Technical writers checking their Markdown before publishing
- DevOps engineers including link validation in build pipelines

## CLI Interface

### scan

```
linkcheck scan <path> [options]

Options:
  --check-external       Also check external URLs (off by default)
  --ignore <patterns...> URL/path patterns to skip
  --base-url <url>       Base URL for resolving root-relative links
  --timeout <ms>         Timeout for external URL checks (default: 15000)
  --format <format>      Output format: text or json
```

### report

```
linkcheck report [path] [options]

Options:
  --format <format>  Output format: text or json
```

### doctor

```
linkcheck doctor
```

Health check — verify installation and dependencies.

## Link Types Handled

| Type | Source | Validation |
|------|--------|-----------|
| Internal markdown links | `[text](./path.md)` | File existence check |
| Images | `![alt](./img.png)` | File existence check |
| Anchors | `#section` | Heading slug match in target |
| External URLs | `https://...` | HEAD request with timeout (opt-in) |
| HTML anchors | `<a href>` | File existence / URL check |
| HTML images | `<img src>` | File existence check |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Clean scan, no issues |
| 1 | Broken links found |
| 2 | Runtime error |

## Output Formats

### Text (default)

Human-readable report with file:line, link, status, and reason.

### JSON

Machine-readable, suitable for CI pipeline consumption.

## Dependencies

| Package | Purpose |
|---------|---------|
| commander | CLI framework |
| glob | File discovery |
| vitest | Test runner (dev) |
| tsx | TypeScript execution (dev) |
| typescript | Compiler (dev) |

## File Structure

```
src/
├── cli.ts                  # CLI entry point
├── types.ts                # TypeScript interfaces
├── link-parser.ts          # Markdown link extraction
├── html-parser.ts          # HTML link extraction
├── file-resolver.ts        # Relative path resolution
├── anchor-validator.ts     # Heading/anchor validation
├── external-checker.ts     # External URL checker
├── ignore-patterns.ts      # Pattern matching
├── report-generator.ts     # Output formatting
├── scanner.ts              # Scan orchestration
├── commands/
│   ├── scan.ts             # scan command
│   ├── report.ts           # report command
│   └── doctor.ts           # doctor command
└── fixtures/               # Test fixtures
test/
├── link-parser.test.ts
├── html-parser.test.ts
├── file-resolver.test.ts
├── anchor-validator.test.ts
├── ignore-patterns.test.ts
├── report-generator.test.ts
├── integration.test.ts
└── smoke.test.ts
```
