# Release Docs Gate Brief

## Angle

Show `linkcheck` as a local release check that can fail fast on broken docs, but
also has a tiny all-green fixture for explaining the happy path.

## Demo CTA

```sh
bash demo/run-release-docs-gate.sh
```

## Short Posts

- Before publishing docs, run the same link gate locally that CI will run.
  `linkcheck` scans Markdown and HTML without launching a browser.
- The passing fixture is intentionally small: three Markdown pages, one anchor
  link, one image path, and a JSON report with zero issues.
- Pair the green release-docs gate with the sample-docs failure fixture when you
  want to show both sides of a docs review.

## Video Beats

1. Open `examples/release-docs/README.md`.
2. Show the links to `install.md`, `usage.md`, `usage.md#examples`, and the
   asset path.
3. Run `bash demo/run-release-docs-gate.sh`.
4. Open the printed JSON report.
5. Close by pointing to `demo/run-sample-docs-scan.sh` for intentional failure
   review.

## Guardrails

- External URL checks remain opt-in with `--check-external`.
- This fixture proves the CLI can pass a small local docs tree; it is not a
  benchmark.
