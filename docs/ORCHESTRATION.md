# ORCHESTRATION.md

Orchestration metadata for the linkcheck build session.

## Build Summary

| Aspect | Detail |
|--------|--------|
| **Project** | linkcheck |
| **Type** | TypeScript CLI (ESM) |
| **Node** | 20+ |
| **Runtime** | Node native fetch (no browser) |
| **Test Framework** | vitest |
| **CLI Framework** | commander |
| **Dev Runtime** | tsx |

## Module Dependency Graph

```
cli.ts
├── commands/scan.ts
│   ├── scanner.ts
│   │   ├── link-parser.ts
│   │   ├── html-parser.ts
│   │   ├── file-resolver.ts
│   │   ├── anchor-validator.ts
│   │   ├── external-checker.ts
│   │   ├── ignore-patterns.ts
│   │   └── types.ts
│   └── report-generator.ts
├── commands/report.ts
├── commands/doctor.ts
└── package.json (version)
```

## Build Steps Executed

1. Git repo initialized
2. package.json + tsconfig created
3. Source modules scaffolded
4. Test fixtures created
5. Unit tests written and passing
6. Integration tests written and passing
7. Smoke tests verified
8. TypeScript strict mode compilation verified
9. dist/ build output confirmed
10. Full validation script created

## Key Decisions

- **Regex over DOM**: No cheererio/jsdom dependency; simple tag-extraction regexes are sufficient for the target use case
- **Native fetch**: Node 20+ includes native `fetch` — no node-fetch or axios needed
- **glob over recursive readdir**: glob handles ignore patterns and is well-maintained
- **Report caching to .linkcheck-cache/**: File-based, no database needed
- **Exit code 1 on issues**: Standard CI convention for "failure"
