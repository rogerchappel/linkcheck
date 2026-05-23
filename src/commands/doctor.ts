/**
 * Doctor command — health check / verify installation
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function doctorCommand(): void {
  const checks: { name: string; ok: boolean; detail: string }[] = [];

  // Check Node version
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1), 10);
  checks.push({
    name: 'Node.js version',
    ok: major >= 20,
    detail: `${nodeVersion} (requires >= 20.0.0)`,
  });

  // Check package.json exists
  try {
    const pkgPath = resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    checks.push({
      name: 'package.json',
      ok: true,
      detail: `name: ${pkg.name}, version: ${pkg.version}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    checks.push({
      name: 'package.json',
      ok: false,
      detail: `Not found: ${message}`,
    });
  }

  // Check ESM type
  try {
    const pkgPath = resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    checks.push({
      name: 'ESM module',
      ok: pkg.type === 'module',
      detail: `type: ${pkg.type}`,
    });
  } catch {
    // Already reported above
  }

  // Report results
  const allOk = checks.every(c => c.ok);

  console.log('linkcheck doctor — Health Check');
  console.log('═'.repeat(40));

  for (const check of checks) {
    const symbol = check.ok ? '✓' : '✗';
    console.log(`  ${symbol} ${check.name}:${' '.repeat(Math.max(0, 20 - check.name.length))} ${check.detail}`);
  }

  console.log('═'.repeat(40));

  if (allOk) {
    console.log('  All checks passed! linkcheck is ready.');
    process.exit(0);
  } else {
    const failed = checks.filter(c => !c.ok);
    console.log(`  ${failed.length} check(s) failed.`);
    process.exit(1);
  }
}
