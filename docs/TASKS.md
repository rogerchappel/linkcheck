# TASKS.md — Development Checklist

## Completed ✅

- [x] Git repo initialized with main branch
- [x] package.json configured (ESM, Commander, vitest, tsx)
- [x] tsconfig.json (strict, NodeNext module resolution)
- [x] TypeScript types (LinkIssue, LinkReference, ScanReport, etc.)
- [x] Markdown link parser with line numbers
- [x] Reference-style link support
- [x] HTML link parser (anchor + img tags)
- [x] File resolver with relative path resolution
- [x] Anchor/heading validator with slug generation
- [x] External URL checker with timeout + redirect following
- [x] Ignore pattern matching (glob, regex, substring)
- [x] Report generator (text + JSON)
- [x] CLI commands: scan, report, doctor
- [x] Scan orchestrator with caching
- [x] Test fixtures (markdown wiki + HTML)
- [x] Unit tests (58 tests, 7 test files)
- [x] Integration tests
- [x] Smoke tests (CLI invocation)
- [x] README
- [x] PRD.md
- [x] TASKS.md
- [x] validate.sh script

## Not Started

- [ ] Publish to npm
- [ ] Add configuration file support (.linkcheckrc)
- [ ] Add symlink follow/ignore option
- [ ] Add parallel scanning for large repos
- [ ] Add HTML output format
- [ ] GitHub Actions integration example
- [ ] Performance benchmarking with large doc sets
