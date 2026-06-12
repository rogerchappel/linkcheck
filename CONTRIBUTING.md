# Contributing

Thanks for helping improve `linkcheck`.

## Local Setup

```bash
npm ci
npm run release:check
```

`npm run release:check` runs the type check, test suite, build, CLI smoke test, and package dry run.

## Pull Requests

- Keep changes small and focused.
- Add or update tests for parser, scanner, or CLI behavior changes.
- Update README examples when command behavior changes.
- Do not enable external URL checks in tests unless the network behavior is mocked or explicitly isolated.

