import { execFileSync } from "node:child_process";

const requiredFiles = [
  "package/dist/cli.js",
  "package/dist/index.js",
  "package/demo/run-wiki-scan.sh",
  "package/docs/tutorials/scan-a-docs-wiki.md",
  "package/examples/sample-docs/README.md",
  "package/README.md",
  "package/LICENSE",
  "package/SECURITY.md",
  "package/CONTRIBUTING.md",
  "package/CHANGELOG.md"
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"]
});

const [packResult] = JSON.parse(output);
const included = new Set(packResult.files.map((file) => file.path));
const missing = requiredFiles.filter((file) => !included.has(file));

if (missing.length > 0) {
  console.error(`Package dry-run is missing expected files: ${missing.join(", ")}`);
  process.exitCode = 1;
}
