# Run a Release Docs Link Gate

Use this recipe when you want a small passing fixture that shows the CI shape
for `linkcheck`.

```sh
bash demo/run-release-docs-gate.sh
```

The script builds the CLI, scans `examples/release-docs`, writes a JSON report
under `${TMPDIR:-/tmp}/linkcheck-release-docs`, and fails if the report contains
any issues.

## What the fixture covers

- Relative Markdown links between `README.md`, `install.md`, and `usage.md`.
- A valid anchor link to `usage.md#examples`.
- An image path that resolves to `assets/release-badge.txt`.

Use `demo/run-sample-docs-scan.sh` when you need to demonstrate broken-link
review behavior. Use this gate when the promotion story is a passing docs
release check.
