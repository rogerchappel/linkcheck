# Sample Docs Link Check

Use this recipe when you want a tiny, reviewable linkcheck fixture that includes
both healthy links and intentional failures.

## Fixture

The fixture lives under `examples/sample-docs`:

- `README.md` links to `install.md` and an asset placeholder.
- `README.md` also includes an intentional missing page and missing anchor.
- `install.md` includes a heading used by the healthy anchor check.

## Run it

```sh
bash demo/run-sample-docs-scan.sh
```

The script builds the CLI, scans the fixture with JSON output, expects exit
status `1`, and verifies that the report mentions the intentional broken links.

## Manual command

```sh
npm run build
node dist/cli.js scan examples/sample-docs --format json > /tmp/sample-docs-report.json
```

An exit status of `1` is expected for this fixture because it deliberately
contains broken links. Use it to demonstrate CI behavior without editing real
project docs.
