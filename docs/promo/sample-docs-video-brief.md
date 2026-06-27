# Sample Docs Video Brief

## Hook

"A link checker demo is more useful when it shows both good links and known
failures."

## Demo beats

1. Open `examples/sample-docs/README.md`.
2. Point out the healthy install link, healthy anchor, missing page, and missing
   anchor.
3. Run `bash demo/run-sample-docs-scan.sh`.
4. Open the JSON report printed by the script.
5. Explain that exit status `1` is expected for this fixture and is the same
   behavior CI can rely on.

## Boundaries

- External URL checks are opt-in with `--check-external`.
- The fixture is intentionally small; use the wiki fixture for a larger docs
  tree demo.
