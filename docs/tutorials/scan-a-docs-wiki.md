# Scan a Small Docs Wiki

The repository ships a fixture wiki under `src/fixtures/wiki` with Markdown and
HTML pages. It is useful for showing the local link scan without touching a
network or production docs site.

## Run the scan

```bash
bash demo/run-wiki-scan.sh
```

The script builds the TypeScript CLI, scans the fixture wiki, and writes JSON to
a temporary report directory. The fixture includes known broken links, so an
exit status of `1` is an expected demonstration result.

## What to look for

- `README.md`, guide pages, API pages, and `index.html` are all scanned.
- Internal Markdown links, anchors, images, and HTML `href`/`src` references are
  checked locally.
- Missing files and anchors appear in the JSON report.
- External URL checks stay off unless `--check-external` is provided.

## Adapt the command

For a real docs tree, replace `src/fixtures/wiki` with the docs directory:

```bash
linkcheck scan ./docs --format json
```

Add `--check-external` only when network checks are expected in the environment.
