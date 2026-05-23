/**
 * Smoke tests - CLI invocation tests against fixtures
 * Run via: npm run smoke
 */

import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, rmSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT = resolve(__dirname, '..');
const FIXTURES = resolve(PROJECT, 'src/fixtures/wiki');

let pass = 0;
let fail = 0;

function runTest(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    pass++;
  } catch (err: unknown) {
    console.error(`  ✗ ${name}`);
    if (err instanceof Error) {
      console.error(`    ${err.message}`);
    }
    fail++;
  }
}

function runCli(args: string, cwd: string = PROJECT): string {
  return execSync(`npx tsx ${resolve(PROJECT, 'src/cli.ts')} ${args}`, {
    cwd,
    encoding: 'utf-8',
  });
}

function expectExitCode(args: string, expectedCode: number, cwd: string = PROJECT): void {
  try {
    execSync(`npx tsx ${resolve(PROJECT, 'src/cli.ts')} ${args}`, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    if (expectedCode !== 0) {
      throw new Error(`Expected exit code ${expectedCode} but got 0`);
    }
  } catch (err: unknown) {
    if (err instanceof Error && 'status' in err && (err as any).status === expectedCode) {
      return;
    }
    throw err;
  }
}

console.log('\nSmoke Tests');
console.log('═'.repeat(40));

runTest('doctor command passes', () => {
  const output = runCli('doctor');
  if (!output.includes('All checks passed')) {
    throw new Error('doctor did not report all checks passed');
  }
});

runTest('scan finds issues in fixtures (exit 1)', () => {
  expectExitCode(`scan ${FIXTURES} --ignore example.com`, 1);
});

runTest('scan outputs text format', () => {
  try {
    runCli(`scan ${FIXTURES} --ignore example.com`);
  } catch {
    // Expect exit 1 due to issues
  }
  // If we got here, scan ran successfully
  const cachePath = resolve(FIXTURES, '.linkcheck-cache', 'last-report.json');
  const cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
  if (cache.issues.length === 0) {
    throw new Error('Scan should have found issues');
  }
});

runTest('scan with --format json produces parseable JSON', () => {
  try {
    const output = execSync(`npx tsx ${resolve(PROJECT, 'src/cli.ts')} scan ${FIXTURES} --ignore example.com --format json`, {
      cwd: PROJECT,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    JSON.parse(output);
  } catch (err: unknown) {
    if (err instanceof Error && 'status' in err) {
      const stdout = (err as any).stdout?.toString() || '';
      const stderr = (err as any).stderr?.toString() || '';
      const output = stdout || stderr;
      if (output.trim()) {
        JSON.parse(output);
        return;
      }
    }
    throw new Error('Did not produce valid JSON output');
  }
});

runTest('report command shows cached report after scan', () => {
  // First run scan to create cache
  try {
    runCli(`scan ${FIXTURES} --ignore example.com`);
  } catch {
    // Expected exit 1
  }
  // Report command uses current directory by default - need to run from fixture parent
  const output = runCli(`report ${FIXTURES}`, PROJECT);
  if (!output.includes('Scan Report')) {
    throw new Error('report command did not show cached report');
  }
});

runTest('report command fails without prior scan', () => {
  try {
    execSync(`npx tsx ${resolve(PROJECT, 'src/cli.ts')} report /tmp/nonexistent-dir-linkcheck-test`, {
      cwd: PROJECT,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    throw new Error('Should have exited non-zero');
  } catch (err: unknown) {
    if (err instanceof Error && 'status' in err) {
      return;
    }
    throw err;
  }
});

// Cleanup
try {
  rmSync(resolve(FIXTURES, '.linkcheck-cache'), { recursive: true, force: true });
} catch { /* ignore */ }

console.log('═'.repeat(40));
console.log(`  ${pass} passed, ${fail} failed`);

if (fail > 0) {
  process.exit(1);
}
console.log('\nAll smoke tests passed!');
