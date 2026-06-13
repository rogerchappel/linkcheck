# Social Hooks

## Short posts

- Broken internal docs links are boring until they ship. `linkcheck scan ./docs`
  catches missing Markdown files, anchors, images, and HTML links locally.
- A docs link checker does not need a browser for the common cases. This one
  scans Markdown and HTML, skips external URLs by default, and exits nonzero
  when local references break.
- Demo angle: run the fixture wiki scan and open the JSON report to show the
  known missing files and anchors.

## Demo proof points

- Fixture wiki: `src/fixtures/wiki`
- Runnable script: `demo/run-wiki-scan.sh`
- CI-friendly output: `linkcheck scan <path> --format json`
